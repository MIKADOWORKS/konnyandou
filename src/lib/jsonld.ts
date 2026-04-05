import { SITE_NAME, SITE_URL } from './constants';

/**
 * WebSite 構造化データ（サイト全体）
 * Google にサイト名・URLを認識させる
 */
export function getWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'AIフレンド・ノアとツキのタロット占い。あなたの毎日にヒントをお届け。',
    inLanguage: 'ja',
  };
}

/**
 * Organization 構造化データ（運営者情報）
 */
export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MIKADO WORKS',
    url: SITE_URL,
    logo: `${SITE_URL}/images/noa-avatar.png`,
    sameAs: [
      'https://x.com/konnyandou',
    ],
  };
}

/**
 * WebPage 構造化データ（個別ページ用）
 */
export function getWebPageJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    inLanguage: 'ja',
  };
}

/**
 * JSON-LD を <script> タグとして埋め込むためのコンポーネント用データ
 */
export function jsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data);
}
