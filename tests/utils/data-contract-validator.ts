/**
 * Data contract validator for API responses.
 * Validates that backend data meets the minimum contract required for frontend rendering.
 */

interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

interface ValidationResult {
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

const URL_PATTERN = /^https?:\/\/.+/;
const SLUG_PATTERN = /^[a-zA-Z0-9\-_]+$/;

/**
 * Validate a single article against the frontend rendering contract.
 */
export function validateArticleContract(article: Record<string, unknown>, index: number): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const prefix = `articles[${index}]`;

  // Required string fields
  const requiredStrings: Array<{ field: string; maxLength?: number }> = [
    { field: 'entry_id' },
    { field: 'title', maxLength: 500 },
    { field: 'author_name' },
  ];

  for (const { field, maxLength } of requiredStrings) {
    const value = article[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push({ field: `${prefix}.${field}`, message: 'must be a non-empty string', value });
    } else if (maxLength && value.length > maxLength) {
      errors.push({ field: `${prefix}.${field}`, message: `must be <= ${maxLength} chars`, value: value.length });
    }
  }

  // slug: non-empty, URL-safe
  const slug = article.slug;
  if (typeof slug !== 'string' || slug.trim().length === 0) {
    errors.push({ field: `${prefix}.slug`, message: 'must be a non-empty string', value: slug });
  } else if (!SLUG_PATTERN.test(slug)) {
    warnings.push({ field: `${prefix}.slug`, message: 'contains non-URL-safe characters', value: slug });
  }

  // created_at: parseable date, after 2020, not far in the future
  const createdAt = article.created_at;
  if (typeof createdAt !== 'string' || createdAt.trim().length === 0) {
    errors.push({ field: `${prefix}.created_at`, message: 'must be a non-empty string', value: createdAt });
  } else {
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) {
      errors.push({ field: `${prefix}.created_at`, message: 'must be a parseable date', value: createdAt });
    } else {
      if (date.getFullYear() < 2020) {
        errors.push({ field: `${prefix}.created_at`, message: 'date is before 2020', value: createdAt });
      }
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (date > tomorrow) {
        warnings.push({ field: `${prefix}.created_at`, message: 'date is in the future (>24h)', value: createdAt });
      }
    }
  }

  // category_names: non-empty array of non-empty strings
  const categoryNames = article.category_names;
  if (!Array.isArray(categoryNames) || categoryNames.length === 0) {
    errors.push({ field: `${prefix}.category_names`, message: 'must be a non-empty array', value: categoryNames });
  } else {
    for (let i = 0; i < categoryNames.length; i++) {
      if (typeof categoryNames[i] !== 'string' || (categoryNames[i] as string).trim().length === 0) {
        errors.push({
          field: `${prefix}.category_names[${i}]`,
          message: 'must be a non-empty string',
          value: categoryNames[i],
        });
      }
    }
  }

  // Optional URL fields
  const optionalUrls: string[] = ['img_url', 'author_avatar'];
  for (const field of optionalUrls) {
    const value = article[field];
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value !== 'string' || !URL_PATTERN.test(value)) {
        errors.push({ field: `${prefix}.${field}`, message: 'must be a valid http(s) URL', value });
      }
    }
  }

  // sub_title length check
  const subTitle = article.sub_title;
  if (subTitle !== undefined && subTitle !== null && typeof subTitle === 'string') {
    if (subTitle.length > 1000) {
      warnings.push({ field: `${prefix}.sub_title`, message: 'exceeds 1000 chars', value: subTitle.length });
    }
  }

  // Data quality: title != sub_title
  if (
    typeof article.title === 'string' &&
    typeof article.sub_title === 'string' &&
    article.title.trim() === article.sub_title.trim() &&
    article.title.trim().length > 0
  ) {
    warnings.push({ field: `${prefix}.title`, message: 'title equals sub_title (possible duplicate)' });
  }

  // tags: if present, all non-empty strings
  const tags = article.tags;
  if (Array.isArray(tags)) {
    for (let i = 0; i < tags.length; i++) {
      if (typeof tags[i] !== 'string' || (tags[i] as string).trim().length === 0) {
        warnings.push({ field: `${prefix}.tags[${i}]`, message: 'must be a non-empty string', value: tags[i] });
      }
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Format validation results into a human-readable report.
 */
export function formatValidationReport(results: ValidationResult[]): string {
  const allErrors = results.flatMap((r) => r.errors);
  const allWarnings = results.flatMap((r) => r.warnings);

  const lines: string[] = [];

  if (allErrors.length > 0) {
    lines.push(`ERRORS (${allErrors.length}):`);
    for (const e of allErrors) {
      lines.push(`  ✗ ${e.field}: ${e.message}${e.value !== undefined ? ` (got: ${JSON.stringify(e.value)})` : ''}`);
    }
  }

  if (allWarnings.length > 0) {
    lines.push(`WARNINGS (${allWarnings.length}):`);
    for (const w of allWarnings) {
      lines.push(`  ⚠ ${w.field}: ${w.message}${w.value !== undefined ? ` (got: ${JSON.stringify(w.value)})` : ''}`);
    }
  }

  return lines.join('\n');
}
