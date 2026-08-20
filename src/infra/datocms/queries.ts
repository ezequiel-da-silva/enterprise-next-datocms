/** Fragmento injetado em `SEARCH_SITE` — não é documento GraphQL válido isolado. */
const SEARCH_MATCH = `pattern: $q, regexp: false, caseSensitive: false`;

/**
 * Busca em Page (título), Post (título por locale) e Author (nome).
 * O CDA não expõe `query` dentro de `PageModelFilter` — usa-se `matches` em campos string.
 */
export const SEARCH_SITE = /* GraphQL */ `
  query SearchSite($q: String!) {
    pages: allPages(
      first: 15
      filter: {
        OR: [{ title: { matches: { ${SEARCH_MATCH} } } }, { slug: { eq: $q } }]
      }
      orderBy: _updatedAt_DESC
    ) {
      id
      title
      slug
    }
    postsEn: allPosts(
      locale: en
      first: 12
      filter: {
        OR: [{ postTitle: { matches: { ${SEARCH_MATCH} } } }, { postSlug: { eq: $q } }]
      }
      orderBy: _updatedAt_DESC
    ) {
      id
      postTitle
      postSlug
    }
    postsPtBR: allPosts(
      locale: pt_BR
      first: 12
      filter: {
        OR: [{ postTitle: { matches: { ${SEARCH_MATCH} } } }, { postSlug: { eq: $q } }]
      }
      orderBy: _updatedAt_DESC
    ) {
      id
      postTitle
      postSlug
    }
    postsEs: allPosts(
      locale: es
      first: 12
      filter: {
        OR: [{ postTitle: { matches: { ${SEARCH_MATCH} } } }, { postSlug: { eq: $q } }]
      }
      orderBy: _updatedAt_DESC
    ) {
      id
      postTitle
      postSlug
    }
    authors: allAuthors(
      first: 10
      filter: {
        OR: [{ authorName: { matches: { ${SEARCH_MATCH} } } }, { authorSlug: { eq: $q } }]
      }
      orderBy: _updatedAt_DESC
    ) {
      id
      authorName
      authorSlug
    }
  }
`;

/** Slugs e `_updatedAt` para sitemap (páginas CMS, posts e autores por locale). */
export const SITEMAP_SOURCES = /* GraphQL */ `
  query SitemapSources {
    pagesEn: allPages(locale: en, first: 200, orderBy: _updatedAt_DESC) {
      slug
      _updatedAt
      seoSettingsSocial {
        noIndex
      }
    }
    pagesPtBR: allPages(locale: pt_BR, first: 200, orderBy: _updatedAt_DESC) {
      slug
      _updatedAt
      seoSettingsSocial {
        noIndex
      }
    }
    pagesEs: allPages(locale: es, first: 200, orderBy: _updatedAt_DESC) {
      slug
      _updatedAt
      seoSettingsSocial {
        noIndex
      }
    }
    postsEn: allPosts(locale: en, first: 200, orderBy: _updatedAt_DESC) {
      postSlug
      _updatedAt
      seoSettingsSocial {
        noIndex
      }
    }
    postsPtBR: allPosts(locale: pt_BR, first: 200, orderBy: _updatedAt_DESC) {
      postSlug
      _updatedAt
      seoSettingsSocial {
        noIndex
      }
    }
    postsEs: allPosts(locale: es, first: 200, orderBy: _updatedAt_DESC) {
      postSlug
      _updatedAt
      seoSettingsSocial {
        noIndex
      }
    }
    authorsEn: allAuthors(locale: en, first: 100, orderBy: _updatedAt_DESC) {
      authorSlug
      _updatedAt
      seoSettingsSocial {
        noIndex
      }
    }
    authorsPtBR: allAuthors(locale: pt_BR, first: 100, orderBy: _updatedAt_DESC) {
      authorSlug
      _updatedAt
      seoSettingsSocial {
        noIndex
      }
    }
    authorsEs: allAuthors(locale: es, first: 100, orderBy: _updatedAt_DESC) {
      authorSlug
      _updatedAt
      seoSettingsSocial {
        noIndex
      }
    }
    categoriesEn: allCategories(locale: en, first: 200, orderBy: _updatedAt_DESC) {
      categorySlug
      _updatedAt
      seoSettingsSocial {
        noIndex
      }
    }
    categoriesPtBR: allCategories(locale: pt_BR, first: 200, orderBy: _updatedAt_DESC) {
      categorySlug
      _updatedAt
      seoSettingsSocial {
        noIndex
      }
    }
    categoriesEs: allCategories(locale: es, first: 200, orderBy: _updatedAt_DESC) {
      categorySlug
      _updatedAt
      seoSettingsSocial {
        noIndex
      }
    }
  }
`;

export const HOME_HIGHLIGHT = /* GraphQL */ `
  query HomeHighlight {
    _site {
      locales
    }
  }
`;

const IMAGE_BLOCK_RESPONSIVE = `
  id
  asset {
    url
    alt
    width
    height
  }
  assetDesktop {
    url
    alt
    width
    height
  }
`;

/** Blocos de média no ST (sem Feature GRID aninhado — evita recursão GraphQL). */
const ST_BLOCKS_MEDIA_ONLY = `
  __typename
  ... on RecordInterface {
    id
  }
  ... on ImageBlockRecord {
    ${IMAGE_BLOCK_RESPONSIVE}
  }
  ... on ImageGalleryBlockRecord {
    id
    assets {
      url
      alt
      width
      height
    }
  }
  ... on VideoBlockRecord {
    id
    asset {
      url
      title
      width
      height
      # O Dato bloqueia a URL bruta ("Serving raw videos is disabled"): usar Mux.
      video {
        muxPlaybackId
        streamingUrl
        mp4Url(res: high)
        # width limitado: o poster nativo (ex. 2732px) desperdiça bytes e atrasa o CLS.
        thumbnailUrl(width: 640)
        width
        height
        duration
      }
    }
    # CMS follow-up: add file field "captions" on video_block, then query captions { url title }
  }
`;

/** FAQ group — bloco AEO; campos alinhados ao schema Dato (`FaqGroupRecord`). */
const FAQ_GROUP_BLOCK = `
  ... on FaqGroupRecord {
    id
    title
    subtitle
    hasSubtitle
    advancedOptions
    accordionMode
    openFirstItem
    enableFaqSchema
    headerAlignment
    questions {
      id
      question {
        value
      }
      answer {
        value
      }
    }
  }
`;

/** Posts e ST aninhados (hero subtitle, etc.): só média. */
const STRUCTURED_TEXT_BLOCKS = ST_BLOCKS_MEDIA_ONLY;

const LINK_HERO_CTA_FIELDS = `
  __typename
  id
  ctaLabel
  typeContent
  externalLink
  openInNewTab
  ctaLinkAria
  internalLinkPage {
    __typename
    slug
  }
  internalLinkPost {
    __typename
    postSlug
  }
  internalLinkCategory {
    __typename
    categorySlug
  }
  internalLinkAuthor {
    __typename
    authorSlug
  }
`;

/** CTA Banner — bloco de chamada para ação (`CtaBannerRecord`). */
const CTA_BANNER_BLOCK = `
  ... on CtaBannerRecord {
    id
    title
    hasEyebrow
    eyebrow
    hasDescription
    description
    advancedOptions
    variant
    bgTheme
    sectionId
    hasImage
    buttons {
      ${LINK_HERO_CTA_FIELDS}
    }
    imageBanner {
      ${IMAGE_BLOCK_RESPONSIVE}
    }
  }
`;

/**
 * Links do Structured Text em **Page.structuredText** e **Post.postContent** (CDA deste projeto):
 * o schema expõe `links: Array<PageRecord>` — não há `PostRecord` / `CategoryRecord` / `AuthorRecord` aqui.
 */
const ST_RECORD_LINKS_PAGE_ST = `
  __typename
  ... on PageRecord {
    id
    title
    slug
  }
`;

/** ST de bio/descrição (Author, Category): `links` / `blocks` são escalares (IDs), como em `GET_GLOBAL_SETTINGS`. */
const STRUCTURED_TEXT_SCALAR_FIELDS = `
  value
  links
  blocks
  inlineBlocks
`;

/** Logo GRID — grelha / marquee de logos (`LogoGridRecord`). @see fragments/logo-grid.graphql */
const LOGO_GRID_BLOCK = `
  ... on LogoGridRecord {
    id
    title
    subtitle
    grayscale
    layoutStyle
    logos {
      __typename
      ... on ImageBlockRecord {
        ${IMAGE_BLOCK_RESPONSIVE}
      }
    }
  }
`;

/** Reviews Section — depoimentos (`ReviewsSectionRecord`). @see fragments/reviews-section.graphql */
const REVIEWS_SECTION_BLOCK = `
  ... on ReviewsSectionRecord {
    id
    title
    subtitle
    allowSubmissions
    reviews {
      id
      authorName
      rating
      comment
      authorAvatar {
        url
        alt
        width
        height
      }
    }
  }
`;

/**
 * ST da **Page**: média + FAQ + Feature GRID + CTA + Logo GRID + Reviews.
 * **Post.postContent** usa só `STRUCTURED_TEXT_BLOCKS` (media) — Feature Grid / FAQ não entram no schema do Post.
 */
const PAGE_STRUCTURED_TEXT_BLOCKS = `
  ${ST_BLOCKS_MEDIA_ONLY}
  ${FAQ_GROUP_BLOCK}
  ${CTA_BANNER_BLOCK}
  ${LOGO_GRID_BLOCK}
  ${REVIEWS_SECTION_BLOCK}
  ... on FeatureGridRecord {
    id
    titleFeatureGrid
    itemsFeatureGrid {
      __typename
      ... on CardRecord {
        id
        iconCard
        titleCard
        descriptionCard
        hasImage
        imageCard {
          ${IMAGE_BLOCK_RESPONSIVE}
        }
        hasLink
        linkCard {
          ${LINK_HERO_CTA_FIELDS}
        }
      }
    }
  }
`;

const HERO_PAGE_FIELDS = `
      heroPage {
        __typename
        ... on HeroSectionRecord {
          id
          layoutHero
          titleHero
          subtitleHero {
            value
            blocks
            links
            inlineBlocks
          }
          showButton
          buttonHero {
            ${LINK_HERO_CTA_FIELDS}
          }
          showImageHero
          imageHero {
            ${IMAGE_BLOCK_RESPONSIVE}
          }
          showImageOverlay
          imageOverlay {
            ${IMAGE_BLOCK_RESPONSIVE}
          }
        }
      }
`;

/**
 * Page por slug.
 *
 * - Blocos do Structured Text: nomes gerados pelo Dato a partir dos modelos de bloco
 *   (ex.: `Image` → `ImageBlockRecord`, campo `asset` tipo FileField — não `ImageRecord`/`image`).
 * - `inlineBlocks` neste projeto é lista de strings (IDs), não union GraphQL: só pedir o scalar.
 * - `structuredText.links` no CDA: apenas **`PageRecord`** (não pedir `PostRecord` / `CategoryRecord` / `AuthorRecord`).
 * - Hero da página vem do campo modular `heroPage` (bloco **Hero section**), não do ST.
 * - `subtitleHero` no modelo Hero deste projeto expõe `blocks`/`links`/`inlineBlocks` como listas de **strings**
 *   (IDs), não unions de blocos — não abrir sub-seleção GraphQL nesses campos.
 */
export const PAGE_BY_SLUG = /* GraphQL */ `
  query PageBySlug($slug: String!, $locale: SiteLocale!) {
    page(locale: $locale, fallbackLocales: [en, pt_BR, es], filter: { slug: { eq: $slug } }) {
      id
      title
      slug
      ${HERO_PAGE_FIELDS}
      structuredText {
        value
        links {
          ${ST_RECORD_LINKS_PAGE_ST}
        }
        blocks {
          ${PAGE_STRUCTURED_TEXT_BLOCKS}
        }
        inlineBlocks
      }
      seoSettingsSocial {
        title
        description
        twitterCard
        noIndex
        image {
          url
          alt
          width
          height
        }
      }
      _seoMetaTags {
        tag
        attributes
        content
      }
      _allSlugLocales {
        locale
        value
      }
    }
    _site {
      faviconMetaTags {
        tag
        attributes
        content
      }
    }
  }
`;

const SEO_SETTINGS_SOCIAL = `
  title
  description
  twitterCard
  noIndex
  image {
    url
    alt
    width
    height
  }
`;

const SEO_META_TAGS = `
  tag
  attributes
  content
`;

const POST_CARD_FIELDS = `
  id
  _firstPublishedAt
  postTitle
  postSlug
  postAuthor {
    authorName
  }
  postCategory {
    id
    categoryName
    categorySlug
    categoryColor {
      hex
    }
  }
  coverImage {
    ${IMAGE_BLOCK_RESPONSIVE}
  }
`;

/** Listagem de posts (cartão) para o índice do blog. */
export const GET_ALL_POSTS = /* GraphQL */ `
  query GetAllPosts($locale: SiteLocale!) {
    allPosts(locale: $locale, orderBy: _firstPublishedAt_DESC, first: 100) {
      ${POST_CARD_FIELDS}
    }
    _site {
      faviconMetaTags {
        ${SEO_META_TAGS}
      }
    }
  }
`;

/** Artigo completo + SEO + autor (para `AuthorSection`). */
export const GET_POST_BY_SLUG = /* GraphQL */ `
  query GetPostBySlug($locale: SiteLocale!, $slug: String!) {
    post(locale: $locale, filter: { postSlug: { eq: $slug } }) {
      id
      _firstPublishedAt
      _updatedAt
      postTitle
      postSlug
      postCategory {
        id
        categoryName
        categorySlug
        categoryColor {
          hex
        }
      }
      postContent {
        value
        links {
          ${ST_RECORD_LINKS_PAGE_ST}
        }
        blocks {
          ${STRUCTURED_TEXT_BLOCKS}
        }
        inlineBlocks
      }
      coverImage {
        ${IMAGE_BLOCK_RESPONSIVE}
      }
      postAuthor {
        id
        authorName
        authorSlug
        authorBio {
          ${STRUCTURED_TEXT_SCALAR_FIELDS}
        }
        avatarBio {
          ${IMAGE_BLOCK_RESPONSIVE}
        }
        authorSocialLinks {
          id
          plataforma
          url
        }
      }
      seoSettingsSocial {
        ${SEO_SETTINGS_SOCIAL}
      }
      _seoMetaTags {
        ${SEO_META_TAGS}
      }
      _allPostSlugLocales {
        locale
        value
      }
    }
    _site {
      faviconMetaTags {
        ${SEO_META_TAGS}
      }
    }
  }
`;

/** Perfil do autor (metadados + bio). Os artigos são pedidos em `GET_POSTS_BY_AUTHOR`. */
export const GET_AUTHOR_BY_SLUG = /* GraphQL */ `
  query GetAuthorBySlug($locale: SiteLocale!, $slug: String!) {
    author(locale: $locale, filter: { authorSlug: { eq: $slug } }) {
      id
      authorName
      authorSlug
      authorBio {
        ${STRUCTURED_TEXT_SCALAR_FIELDS}
      }
      avatarBio {
        ${IMAGE_BLOCK_RESPONSIVE}
      }
      authorSocialLinks {
        id
        plataforma
        url
      }
      seoSettingsSocial {
        ${SEO_SETTINGS_SOCIAL}
      }
      _seoMetaTags {
        ${SEO_META_TAGS}
      }
      _allAuthorSlugLocales {
        locale
        value
      }
    }
    _site {
      faviconMetaTags {
        ${SEO_META_TAGS}
      }
    }
  }
`;

export const GET_POSTS_BY_AUTHOR = /* GraphQL */ `
  query GetPostsByAuthor($locale: SiteLocale!, $authorId: ItemId!) {
    allPosts(
      locale: $locale
      filter: { postAuthor: { eq: $authorId } }
      orderBy: _firstPublishedAt_DESC
      first: 100
    ) {
      ${POST_CARD_FIELDS}
    }
  }
`;

/** Resolve a categoria visível no locale atual (slug localizado). */
export const GET_CATEGORY_BY_SLUG = /* GraphQL */ `
  query GetCategoryBySlug($locale: SiteLocale!, $slug: String!) {
    category(locale: $locale, filter: { categorySlug: { eq: $slug } }) {
      id
      categoryName
      categorySlug
      categoryDescription {
        ${STRUCTURED_TEXT_SCALAR_FIELDS}
      }
      categoryColor {
        hex
      }
      categoryIcon {
        url
        alt
        width
        height
      }
      seoSettingsSocial {
        ${SEO_SETTINGS_SOCIAL}
      }
      _seoMetaTags {
        ${SEO_META_TAGS}
      }
      _allCategorySlugLocales {
        locale
        value
      }
    }
    _site {
      faviconMetaTags {
        ${SEO_META_TAGS}
      }
    }
  }
`;

/** Posts filtrados por categoria (usa o `id` devolvido por `GET_CATEGORY_BY_SLUG`). */
export const GET_POSTS_BY_CATEGORY = /* GraphQL */ `
  query GetPostsByCategory($locale: SiteLocale!, $categoryId: ItemId!) {
    allPosts(
      locale: $locale
      filter: { postCategory: { anyIn: [$categoryId] } }
      orderBy: _firstPublishedAt_DESC
      first: 100
    ) {
      ${POST_CARD_FIELDS}
    }
  }
`;

/**
 * Single instance `global_setting` — 404 (título, structured text, bloco Image).
 * Em `description404`, `blocks`/`links`/`inlineBlocks` no CDA são escalares (IDs), não unions
 * como em `Page.structuredText`; pedir subcampos em `links`/`blocks` invalida a query.
 */
export const GET_GLOBAL_SETTINGS = /* GraphQL */ `
  query GetGlobalSettings($locale: SiteLocale!) {
    globalSetting(locale: $locale, fallbackLocales: [en, pt_BR, es]) {
      title404
      description404 {
        value
        blocks
        links
        inlineBlocks
      }
      image404 {
        ${IMAGE_BLOCK_RESPONSIVE}
      }
    }
  }
`;

/** Slugs de categorias por locale (pré-renderização). */
export const LIST_CATEGORY_SLUGS = /* GraphQL */ `
  query ListCategorySlugs($locale: SiteLocale!) {
    allCategories(locale: $locale, first: 200) {
      categorySlug
    }
  }
`;

/** Slugs de autores por locale (pré-renderização). */
export const LIST_AUTHOR_SLUGS = /* GraphQL */ `
  query ListAuthorSlugs($locale: SiteLocale!) {
    allAuthors(locale: $locale, first: 200) {
      authorSlug
    }
  }
`;
