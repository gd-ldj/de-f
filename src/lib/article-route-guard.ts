import { fetchArticle } from '@/api/articles';
import { fetchPodcastDetail } from '@/api/podcasts';
import { buildArticleUrl } from '@/lib/language-utils';
import type { ApiArticle, Locale, SourceLanguage, TranslationLanguage } from '@/types';

interface ResolveArticleRouteGuardParams {
  category: string;
  slug: string;
  locale: Locale;
  userId?: string;
  sourceLanguage: SourceLanguage;
  translationLanguage: TranslationLanguage | null;
}

interface ResolveArticleRouteGuardResult {
  baseArticle: ApiArticle | null;
  redirectPath?: string;
  notFound?: boolean;
}

const VALID_ARTICLE_CATEGORIES = new Set(['insights', 'news', 'research', 'voices', 'podcasts']);
const USER_AUTHOR_ROLES = new Set(['Authors', 'Author', 'User']);

function getActualSlug(slug: string): string {
  const slugParts = slug.split('-');
  if (slugParts.length <= 1) {
    return slug;
  }

  const lastPart = slugParts[slugParts.length - 1];
  if (lastPart && lastPart.length >= 5) {
    return slugParts.slice(0, -1).join('-');
  }

  return slug;
}

function inferUserId(article: ApiArticle): string | undefined {
  if (article.user_id) {
    return article.user_id;
  }

  if (article.author?.id && article.author?.role && USER_AUTHOR_ROLES.has(article.author.role)) {
    return article.author.id;
  }

  return undefined;
}

export async function resolveArticleRouteGuard(
  params: ResolveArticleRouteGuardParams,
): Promise<ResolveArticleRouteGuardResult> {
  const { category, slug, locale, userId, sourceLanguage, translationLanguage } = params;
  const normalizedCategory = category.toLowerCase();

  if (!VALID_ARTICLE_CATEGORIES.has(normalizedCategory)) {
    return { baseArticle: null, notFound: true };
  }

  const actualSlug = getActualSlug(slug);
  const isPodcast = normalizedCategory === 'podcasts';
  const baseArticle = isPodcast
    ? await fetchPodcastDetail(actualSlug)
    : await fetchArticle(actualSlug, locale, category, userId);

  if (!baseArticle) {
    return { baseArticle: null, notFound: true };
  }

  const inferredUserId = inferUserId(baseArticle);

  if (!userId && inferredUserId && !baseArticle.is_promoted) {
    return { baseArticle, notFound: true };
  }

  if (userId && baseArticle.is_promoted) {
    return {
      baseArticle,
      redirectPath: buildArticleUrl(
        category,
        actualSlug,
        sourceLanguage,
        translationLanguage,
        undefined,
        true,
      ),
    };
  }

  return { baseArticle };
}
