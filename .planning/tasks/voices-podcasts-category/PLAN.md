# Execution Plan: Voices Podcasts Category

Sequential steps for autonomous execution. Each step includes exact files, changes, and verification.

---

## Step 1: Extend type definitions

**File**: `src/types/index.ts`

Locate the `ApiArticle` interface. Append the following optional fields (group them with a comment):

```ts
// Podcast-specific optional fields (present when business_type_name === 'Podcasts')
youtube_video_id?: string;
youtube_url?: string;
youtube_channel_id?: string;
youtube_channel_url?: string;
youtube_view_count?: number;
transcript?: string;
```

**Verify**: `pnpm type-check`

---

## Step 2: Register Podcasts business type

**File**: `src/config/article-taxonomy.ts`

In `BUSINESS_TYPE_MAP` add after `Tutorials`:

```ts
Podcasts: { id: '7', labels: { en: 'Podcasts', zh: '播客', ja: 'ポッドキャスト' } },
```

**Note**: `id: '7'` is a placeholder. Confirm with backend before release. This does not break the frontend if the backend later uses a different id — labels are keyed by name, not id.

**Verify**: `pnpm type-check`

---

## Step 3: Create YoutubeEmbed component

**File (new)**: `src/components/article/react/YoutubeEmbed.tsx`

```tsx
interface YoutubeEmbedProps {
  videoId: string;
  title?: string;
}

export default function YoutubeEmbed({ videoId, title }: YoutubeEmbedProps) {
  if (!videoId) return null;
  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted my-6">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
        title={title ?? 'YouTube video'}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}
```

**Verify**: `pnpm type-check`

---

## Step 4: Create PodcastAuthorCard component

**File (new)**: `src/components/article/react/PodcastAuthorCard.tsx`

Base the layout on `src/components/article/react/AuthorSection.tsx` (read it first for exact class names and layout). Key differences:

- Wrap avatar + name in an `<a>` with `href={youtube_channel_url}`, `target="_blank"`, `rel="noopener noreferrer"`
- Right-side action area: keep existing X / mail icon buttons if author has those fields
- Replace Follow button with a Subscribe button:
  - Label: `t('podcast.subscribe')` (use existing i18n helper pattern from AuthorSection)
  - `href={`${youtube_channel_url}?sub_confirmation=1`}`
  - Same primary CTA classes as the existing Follow button (copy verbatim)
  - Leading `+` icon preserved

Props interface:
```ts
interface PodcastAuthorCardProps {
  author: ApiArticle['author'];           // reuse existing author shape
  authorName?: string;                     // fallback to article.author_name
  youtubeChannelUrl: string;
  locale: Locale;
}
```

**Verify**: `pnpm type-check`

---

## Step 5: Create PodcastContent.astro

**File (new)**: `src/components/article/astro/PodcastContent.astro`

Copy `src/components/article/astro/ArticleContent.astro` as the starting point. Modifications:

1. **Remove**: any imports/renders of `TokenInfoCard`, `BonusDistribution`, `BonusHunters`, `PoolInfo` (podcast pages don't need monetization widgets)

2. **Breadcrumb**: ensure it renders `Voices / Podcasts` — use `getBusinessTypeLabel('Podcasts', sourceLanguage)` for the label, and link `/voices` for the Voices parent. If current breadcrumb logic only shows business_type, add a two-level rendering just for Podcasts.

3. **Header right area**: after the title/subtitle block, add a flex container with:
   - Left: existing tag + date + author row
   - Right: Views block
     ```astro
     {article.youtube_view_count != null && (
       <div class="flex flex-col items-end shrink-0">
         <span class="text-3xl font-semibold text-foreground leading-none">
           {new Intl.NumberFormat(locale).format(article.youtube_view_count)}
         </span>
         <span class="text-sm text-muted-foreground flex items-center gap-1 mt-1">
           {t('podcast.views')}
         </span>
       </div>
     )}
     ```

4. **Video embed**: after the header meta row, insert:
   ```astro
   {article.youtube_video_id && (
     <YoutubeEmbed client:visible videoId={article.youtube_video_id} title={article.title} />
   )}
   ```
   Import: `import YoutubeEmbed from '@/components/article/react/YoutubeEmbed'`

5. **Transcript**: replace the existing `<div class="prose" set:html={article.body}>` with:
   ```astro
   {article.transcript && (
     <div class="prose prose-detake max-w-none">
       {article.transcript.split(/\n\n+/).map((para) => (
         <p>{para}</p>
       ))}
     </div>
   )}
   ```
   Keep the same `.prose` wrapper classes used elsewhere in the file (inspect ArticleContent for the exact class list).

6. **Author section**: replace `AuthorSection` usage with `PodcastAuthorCard`:
   ```astro
   <PodcastAuthorCard
     client:visible
     author={article.author}
     authorName={article.author_name}
     youtubeChannelUrl={article.youtube_channel_url ?? '#'}
     locale={locale}
   />
   ```

7. **JSON-LD VideoObject**: add near the top (inside `<article>` or as a sibling `<script>`):
   ```astro
   {article.youtube_video_id && (
     <script type="application/ld+json" set:html={JSON.stringify({
       '@context': 'https://schema.org',
       '@type': 'VideoObject',
       name: article.title,
       description: article.sub_title,
       thumbnailUrl: `https://img.youtube.com/vi/${article.youtube_video_id}/maxresdefault.jpg`,
       uploadDate: article.created_at,
       embedUrl: `https://www.youtube.com/embed/${article.youtube_video_id}`,
     })} />
   )}
   ```

**Verify**: `pnpm type-check`

---

## Step 6: Wire PodcastContent into BaseArticlePage

**File**: `src/components/article/astro/BaseArticlePage.astro`

1. Locate `const validCategories = ['insights', 'news', 'research', 'voices']` and add `'podcasts'`:
   ```ts
   const validCategories = ['insights', 'news', 'research', 'voices', 'podcasts']
   ```

2. Import `PodcastContent`:
   ```ts
   import PodcastContent from '@/components/article/astro/PodcastContent.astro'
   ```

3. Find the `<ArticleContent ... />` render block. Wrap it in a conditional:
   ```astro
   {category.toLowerCase() === 'podcasts' ? (
     <PodcastContent
       article={article}
       locale={locale}
       category={categoryDisplayName}
       slugWithPromote={slugWithPromote}
       articleLang={articleLang}
       userId={userId}
     />
   ) : (
     <ArticleContent ... />  {/* existing props */}
   )}
   ```

**Verify**: `pnpm type-check`, `pnpm build` should still pass for non-podcast pages.

---

## Step 7: Create Podcasts list page

**File (new)**: `src/pages/voices/podcasts/index.astro`

Copy `src/pages/voices/index.astro` verbatim. Modify:

1. `const categoryDisplayName = 'Podcasts'` (was `'Voices'`)
2. `seoContent` — update title/description for Podcasts (all three locales):
   - en: `'Podcasts | DeTake'` / podcast-focused description
   - zh: `'播客 - DeTake'` / 中文描述
   - ja: `'ポッドキャスト | DeTake'` / 日本語説明
3. No other changes; `CategoryPage` uses `category` prop which drives `business_type_name` filter.

**Verify**: `pnpm dev`, navigate to `/us/voices/podcasts`, confirm list renders (empty is OK if backend has no data yet).

---

## Step 8: Add i18n keys

**Files**: `src/locales/en/**`, `src/locales/zh/**`, `src/locales/ja/**`

First inspect locale file structure (likely `common.json` / `article.json` or nested). Then add:

**Namespace `voices.podcasts` (or existing voices namespace):**
- `title`: "Podcasts | DeTake" / "播客 - DeTake" / "ポッドキャスト | DeTake"
- `description`: short category description in each language

**Namespace `podcast`:**
- `views`: "Views" / "播放量" / "再生回数"
- `subscribe`: "Subscribe" / "订阅" / "登録"
- `transcript`: "Transcript" / "字幕" / "文字起こし"
- `breadcrumb`: "Podcasts" / "播客" / "ポッドキャスト"

If the project uses a flat key structure, adapt accordingly.

**Verify**: `pnpm type-check`, search for any missed references.

---

## Step 9: Add Podcasts to Header Voices dropdown

**Files**: `src/components/common/react/header/**`

1. Scout the Header component (likely `Header.tsx` or `DesktopNav.tsx`) to find how Voices is currently rendered
2. If Voices is a simple link, convert it to a dropdown/menu trigger following any existing dropdown pattern in the project (there may already be one for other categories — check first)
3. Dropdown items:
   - "Voices" → `/voices` (all voices)
   - "Podcasts" → `/voices/podcasts`
4. Apply the same change to the mobile sidebar (`MobileSidebar.tsx` or equivalent) — add Podcasts under Voices in the collapsible menu

**Constraint**: if converting Voices to a dropdown is non-trivial, fall back to adding Podcasts as a sibling item next to Voices with a subtle visual indent. Document the decision in the commit.

**Verify**: `pnpm dev`, open homepage, click Voices in header, confirm Podcasts item appears and navigates correctly.

---

## Step 10: Type check + build

```bash
pnpm type-check
pnpm build
```

Fix any type errors. Do not proceed until both pass.

---

## Step 11: UI verification (MANDATORY per CLAUDE.md)

Start dev server and verify with Playwright or browser tool:

1. `pnpm dev`
2. Navigate to `http://localhost:4321/us/voices` — screenshot
3. Navigate to `http://localhost:4321/us/voices/podcasts` — screenshot
4. **Compare side by side**: layout, max-width, card grid, filter bar, pagination must be identical
5. If backend has a real podcast record, navigate to its detail page; otherwise mock one locally:
   - Temporarily hardcode a mock `ApiArticle` with `business_type_name: 'Podcasts'` and the 6 YouTube fields populated in `fetchArticle` for testing
6. Screenshot detail page and verify:
   - Breadcrumb: Voices / Podcasts ✓
   - Title + subtitle ✓
   - Right-side Views block aligned ✓
   - YouTube iframe 16:9 ratio, no overflow ✓
   - Transcript paragraphs render with `.prose` spacing ✓
   - PodcastAuthorCard Subscribe button uses primary green ✓
   - Click author avatar → opens YouTube channel in new tab ✓
7. Compare PodcastAuthorCard against AuthorSection on an existing Voices article — spacing, font sizes, button height must match
8. Header: click Voices, screenshot dropdown showing Podcasts entry
9. **Mobile viewport**: resize to 375px, verify list + detail + sidebar all render correctly

Fix any visual inconsistencies on the spot. Remove any mock data before committing.

---

## Step 12: Commit

```bash
git add src/types/index.ts \
        src/config/article-taxonomy.ts \
        src/components/article/react/YoutubeEmbed.tsx \
        src/components/article/react/PodcastAuthorCard.tsx \
        src/components/article/astro/PodcastContent.astro \
        src/components/article/astro/BaseArticlePage.astro \
        src/pages/voices/podcasts/index.astro \
        src/components/common/react/header/ \
        src/locales/
./dev-commit.sh feat "add Podcasts category under Voices with YouTube embed and transcript"
```

---

## Rollback Plan

If anything breaks production:
1. Revert the BaseArticlePage.astro whitelist change (single-line revert)
2. Remove `/voices/podcasts/index.astro`
3. Remove the Podcasts entry from Header dropdown

Non-podcast pages are unaffected because all type fields are optional and PodcastContent is conditionally rendered.
