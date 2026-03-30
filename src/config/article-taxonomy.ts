/**
 * Static dictionary maps for article categories, subcategories, and tags.
 * Provides localized labels (en/zh/ja) for each taxonomy item.
 *
 * Keys are the English `name` values returned by the API, which match
 * the `category_names`, `subcategory_names`, and `tags` fields in article data.
 */

import type { SourceLanguage } from '../types';

interface TaxonomyItem {
  id: string;
  labels: Record<SourceLanguage, string>;
}

interface CategoryItem extends TaxonomyItem {
  businessTypeName: string;
}

interface SubcategoryItem extends TaxonomyItem {
  parentCategoryId: string;
  parentCategoryName: string;
}

// ---------------------------------------------------------------------------
// Categories (20)
// ---------------------------------------------------------------------------

export const CATEGORY_MAP: Record<string, CategoryItem> = {
  Adoption: {
    id: '30',
    businessTypeName: 'Insights',
    labels: { en: 'Adoption', zh: '应用落地', ja: '導入事例' },
  },
  Benchmarks: {
    id: '24',
    businessTypeName: 'Research',
    labels: { en: 'Benchmarks', zh: '基准测试', ja: 'ベンチマーク' },
  },
  Blogs: {
    id: '34',
    businessTypeName: 'Voices',
    labels: { en: 'Blogs', zh: '博客', ja: 'ブログ' },
  },
  Breakthroughs: {
    id: '25',
    businessTypeName: 'Research',
    labels: { en: 'Breakthroughs', zh: '技术突破', ja: 'ブレイクスルー' },
  },
  Business: {
    id: '20',
    businessTypeName: 'News',
    labels: { en: 'Business', zh: '商业', ja: 'ビジネス' },
  },
  Competition: {
    id: '29',
    businessTypeName: 'Insights',
    labels: { en: 'Competition', zh: '竞争格局', ja: '競争動向' },
  },
  Context: {
    id: '26',
    businessTypeName: 'Research',
    labels: { en: 'Context', zh: '背景解读', ja: 'コンテキスト' },
  },
  Glossary: {
    id: '35',
    businessTypeName: 'Tutorials',
    labels: { en: 'Glossary', zh: '术语表', ja: '用語集' },
  },
  Hardware: {
    id: '21',
    businessTypeName: 'News',
    labels: { en: 'Hardware', zh: '硬件', ja: 'ハードウェア' },
  },
  Labs: {
    id: '28',
    businessTypeName: 'Research',
    labels: { en: 'Labs', zh: '实验室', ja: 'ラボ' },
  },
  'New Players': {
    id: '31',
    businessTypeName: 'Insights',
    labels: { en: 'New Players', zh: '新兴力量', ja: '新規参入' },
  },
  Playbooks: {
    id: '37',
    businessTypeName: 'Tutorials',
    labels: { en: 'Playbooks', zh: '实战手册', ja: 'プレイブック' },
  },
  Policy: {
    id: '19',
    businessTypeName: 'News',
    labels: { en: 'Policy', zh: '政策', ja: '政策' },
  },
  Prompting: {
    id: '36',
    businessTypeName: 'Tutorials',
    labels: { en: 'Prompting', zh: '提示工程', ja: 'プロンプト' },
  },
  RAG: {
    id: '27',
    businessTypeName: 'Research',
    labels: { en: 'RAG', zh: 'RAG', ja: 'RAG' },
  },
  Talks: {
    id: '33',
    businessTypeName: 'Voices',
    labels: { en: 'Talks', zh: '演讲', ja: 'トーク' },
  },
  Technology: {
    id: '23',
    businessTypeName: 'News',
    labels: { en: 'Technology', zh: '技术', ja: 'テクノロジー' },
  },
  'Trend Watch': {
    id: '32',
    businessTypeName: 'Insights',
    labels: { en: 'Trend Watch', zh: '趋势观察', ja: 'トレンド' },
  },
  'Vibe Coding': {
    id: '39',
    businessTypeName: 'Tutorials',
    labels: { en: 'Vibe Coding', zh: 'Vibe Coding', ja: 'Vibe Coding' },
  },
  Workflows: {
    id: '38',
    businessTypeName: 'Tutorials',
    labels: { en: 'Workflows', zh: '工作流', ja: 'ワークフロー' },
  },
};

// ---------------------------------------------------------------------------
// Subcategories (18)
// ---------------------------------------------------------------------------

export const SUBCATEGORY_MAP: Record<string, SubcategoryItem> = {
  // -- Business --
  'Enterprise Adoption': {
    id: '10',
    parentCategoryId: '20',
    parentCategoryName: 'Business',
    labels: { en: 'Enterprise Adoption', zh: '企业应用', ja: 'エンタープライズ導入' },
  },
  Funding: {
    id: '8',
    parentCategoryId: '20',
    parentCategoryName: 'Business',
    labels: { en: 'Funding', zh: '融资', ja: '資金調達' },
  },
  'Press Release': {
    id: '7',
    parentCategoryId: '20',
    parentCategoryName: 'Business',
    labels: { en: 'Press Release', zh: '新闻稿', ja: 'プレスリリース' },
  },
  Reports: {
    id: '9',
    parentCategoryId: '20',
    parentCategoryName: 'Business',
    labels: { en: 'Reports', zh: '报告', ja: 'レポート' },
  },

  // -- Hardware --
  Chips: {
    id: '11',
    parentCategoryId: '21',
    parentCategoryName: 'Hardware',
    labels: { en: 'Chips', zh: '芯片', ja: 'チップ' },
  },
  Drone: {
    id: '14',
    parentCategoryId: '21',
    parentCategoryName: 'Hardware',
    labels: { en: 'Drone', zh: '无人机', ja: 'ドローン' },
  },
  Energy: {
    id: '15',
    parentCategoryId: '21',
    parentCategoryName: 'Hardware',
    labels: { en: 'Energy', zh: '能源', ja: 'エネルギー' },
  },
  Military: {
    id: '12',
    parentCategoryId: '21',
    parentCategoryName: 'Hardware',
    labels: { en: 'Military', zh: '军事', ja: '軍事' },
  },
  Robotics: {
    id: '13',
    parentCategoryId: '21',
    parentCategoryName: 'Hardware',
    labels: { en: 'Robotics', zh: '机器人', ja: 'ロボティクス' },
  },

  // -- Policy --
  Geopolitics: {
    id: '18',
    parentCategoryId: '19',
    parentCategoryName: 'Policy',
    labels: { en: 'Geopolitics', zh: '地缘政治', ja: '地政学' },
  },
  Regulation: {
    id: '16',
    parentCategoryId: '19',
    parentCategoryName: 'Policy',
    labels: { en: 'Regulation', zh: '监管', ja: '規制' },
  },
  'Safety & Ethics': {
    id: '17',
    parentCategoryId: '19',
    parentCategoryName: 'Policy',
    labels: { en: 'Safety & Ethics', zh: '安全与伦理', ja: '安全性と倫理' },
  },

  // -- Technology --
  Agents: {
    id: '4',
    parentCategoryId: '23',
    parentCategoryName: 'Technology',
    labels: { en: 'Agents', zh: '智能体', ja: 'エージェント' },
  },
  'Feature Updates': {
    id: '2',
    parentCategoryId: '23',
    parentCategoryName: 'Technology',
    labels: { en: 'Feature Updates', zh: '功能更新', ja: '機能アップデート' },
  },
  Models: {
    id: '3',
    parentCategoryId: '23',
    parentCategoryName: 'Technology',
    labels: { en: 'Models', zh: '模型', ja: 'モデル' },
  },
  'New Releases': {
    id: '1',
    parentCategoryId: '23',
    parentCategoryName: 'Technology',
    labels: { en: 'New Releases', zh: '新品发布', ja: '新リリース' },
  },
  Skills: {
    id: '6',
    parentCategoryId: '23',
    parentCategoryName: 'Technology',
    labels: { en: 'Skills', zh: '技能', ja: 'スキル' },
  },
  Tools: {
    id: '5',
    parentCategoryId: '23',
    parentCategoryName: 'Technology',
    labels: { en: 'Tools', zh: '工具', ja: 'ツール' },
  },
};

// ---------------------------------------------------------------------------
// Tags (28)
// ---------------------------------------------------------------------------

export const TAG_MAP: Record<string, TaxonomyItem> = {
  Agents: {
    id: '29',
    labels: { en: 'Agents', zh: '智能体', ja: 'エージェント' },
  },
  'Artificial Intelligence': {
    id: '45',
    labels: { en: 'Artificial Intelligence', zh: '人工智能', ja: '人工知能' },
  },
  Blockchain: {
    id: '47',
    labels: { en: 'Blockchain', zh: '区块链', ja: 'ブロックチェーン' },
  },
  Chips: {
    id: '36',
    labels: { en: 'Chips', zh: '芯片', ja: 'チップ' },
  },
  Commodities: {
    id: '51',
    labels: { en: 'Commodities', zh: '大宗商品', ja: 'コモディティ' },
  },
  Crypto: {
    id: '50',
    labels: { en: 'Crypto', zh: '加密货币', ja: '暗号資産' },
  },
  Cybersecurity: {
    id: '46',
    labels: { en: 'Cybersecurity', zh: '网络安全', ja: 'サイバーセキュリティ' },
  },
  Drone: {
    id: '39',
    labels: { en: 'Drone', zh: '无人机', ja: 'ドローン' },
  },
  'Energy (Nuclear, Grid, Sustainability)': {
    id: '40',
    labels: {
      en: 'Energy (Nuclear, Grid, Sustainability)',
      zh: '能源（核能、电网、可持续发展）',
      ja: 'エネルギー（原子力・送電網・持続可能性）',
    },
  },
  'Enterprise Adoption': {
    id: '35',
    labels: { en: 'Enterprise Adoption', zh: '企业应用', ja: 'エンタープライズ導入' },
  },
  Environment: {
    id: '44',
    labels: { en: 'Environment', zh: '环境', ja: '環境' },
  },
  'Feature Updates': {
    id: '27',
    labels: { en: 'Feature Updates', zh: '功能更新', ja: '機能アップデート' },
  },
  Forex: {
    id: '52',
    labels: { en: 'Forex', zh: '外汇', ja: '外国為替' },
  },
  Funding: {
    id: '33',
    labels: { en: 'Funding', zh: '融资', ja: '資金調達' },
  },
  Geopolitics: {
    id: '43',
    labels: { en: 'Geopolitics', zh: '地缘政治', ja: '地政学' },
  },
  Innovation: {
    id: '48',
    labels: { en: 'Innovation', zh: '创新', ja: 'イノベーション' },
  },
  Investment: {
    id: '53',
    labels: { en: 'Investment', zh: '投资', ja: '投資' },
  },
  Military: {
    id: '37',
    labels: { en: 'Military', zh: '军事', ja: '軍事' },
  },
  Models: {
    id: '28',
    labels: { en: 'Models', zh: '模型', ja: 'モデル' },
  },
  'New Releases': {
    id: '26',
    labels: { en: 'New Releases', zh: '新品发布', ja: '新リリース' },
  },
  'Press Release': {
    id: '32',
    labels: { en: 'Press Release', zh: '新闻稿', ja: 'プレスリリース' },
  },
  Regulation: {
    id: '41',
    labels: { en: 'Regulation', zh: '监管', ja: '規制' },
  },
  Reports: {
    id: '34',
    labels: { en: 'Reports', zh: '报告', ja: 'レポート' },
  },
  Robotics: {
    id: '38',
    labels: { en: 'Robotics', zh: '机器人', ja: 'ロボティクス' },
  },
  'Safety & Ethics': {
    id: '42',
    labels: { en: 'Safety & Ethics', zh: '安全与伦理', ja: '安全性と倫理' },
  },
  Skills: {
    id: '31',
    labels: { en: 'Skills', zh: '技能', ja: 'スキル' },
  },
  Stocks: {
    id: '49',
    labels: { en: 'Stocks', zh: '股票', ja: '株式' },
  },
  'Tools (Image, Video, Audio gen)': {
    id: '30',
    labels: {
      en: 'Tools (Image, Video, Audio gen)',
      zh: '工具（图像、视频、音频生成）',
      ja: 'ツール（画像・動画・音声生成）',
    },
  },
};

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Get the localized label for a category.
 * Falls back to the English name if no match is found.
 */
export function getCategoryLabel(name: string, lang: SourceLanguage): string {
  return CATEGORY_MAP[name]?.labels[lang] ?? name;
}

/**
 * Get the localized label for a subcategory.
 * Falls back to the English name if no match is found.
 */
export function getSubcategoryLabel(name: string, lang: SourceLanguage): string {
  return SUBCATEGORY_MAP[name]?.labels[lang] ?? name;
}

/**
 * Get the localized label for a tag.
 * Falls back to the English name if no match is found.
 */
export function getTagLabel(name: string, lang: SourceLanguage): string {
  return TAG_MAP[name]?.labels[lang] ?? name;
}
