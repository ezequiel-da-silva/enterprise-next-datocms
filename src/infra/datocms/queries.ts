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

const FILE_ASSET_FIELDS = `
    url
    alt
    width
    height
    blurUpThumb
`;

const IMAGE_BLOCK_RESPONSIVE = `
  id
  asset {
    ${FILE_ASSET_FIELDS}
  }
  assetDesktop {
    ${FILE_ASSET_FIELDS}
  }
`;

/** Hero Image (`hero_image_block`): mobile 4:5/1:1 + desktop 16:9. */
const HERO_IMAGE_BLOCK_FIELDS = `
  __typename
  ... on HeroImageBlockRecord {
    id
    assetMobile {
      ${FILE_ASSET_FIELDS}
    }
    assetDesktop {
      ${FILE_ASSET_FIELDS}
    }
  }
`;

/** Card Image (`card_image_block`): mobile + desktop, 4:3–16:9. */
const CARD_IMAGE_BLOCK_FIELDS = `
  __typename
  ... on CardImageBlockRecord {
    id
    assetMobile {
      ${FILE_ASSET_FIELDS}
    }
    assetDesktop {
      ${FILE_ASSET_FIELDS}
    }
  }
`;

/** Banner Image (`banner_image_block`): mobile + desktop, 21:9–3:1. */
const BANNER_IMAGE_BLOCK_FIELDS = `
  __typename
  ... on BannerImageBlockRecord {
    id
    assetMobile {
      ${FILE_ASSET_FIELDS}
    }
    assetDesktop {
      ${FILE_ASSET_FIELDS}
    }
  }
`;

const CAROUSEL_SETTING_FIELDS = `
  __typename
  id
  autoplay
  autoplayInterval
  showArrows
  showDots
  loop
`;

/** Text header — bloco `text_header` aninhado (`textHeaderSection`). @see fragments/text-header.graphql */
const TEXT_HEADER_FIELDS = `
  __typename
  id
  title
  hasDescription
  description
  hasSectionId
  sectionId
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
      blurUpThumb
    }
  }
  ... on VideoBlockRecord {
    id
    # O CDA exige o header X-Base-Editing-Url para resolver _editingUrl: pedir só em draft.
    _editingUrl @include(if: $withEditingUrl)
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
    textHeaderSection {
      ${TEXT_HEADER_FIELDS}
    }
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
    textHeaderSection {
      ${TEXT_HEADER_FIELDS}
    }
    hasEyebrow
    eyebrow
    advancedOptions
    variant
    bgTheme
    hasImage
    buttons {
      ${LINK_HERO_CTA_FIELDS}
    }
    imageBanner {
      ${BANNER_IMAGE_BLOCK_FIELDS}
    }
  }
`;

/**
 * Links do Structured Text em **Post.postContent** (CDA deste projeto):
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
    textHeaderSection {
      ${TEXT_HEADER_FIELDS}
    }
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

/** Tabs Section — abas de conteúdo (`TabsSectionRecord`). @see fragments/tabs-section.graphql */
const TABS_SECTION_BLOCK = `
  ... on TabsSectionRecord {
    id
    textHeaderSection {
      ${TEXT_HEADER_FIELDS}
    }
    tabs {
      __typename
      ... on TabItemRecord {
        id
        labelTab
        title
        hasDescription
        description
        hasLink
        hasImage
        ctaLink {
          ... on LinkRecord {
            ${LINK_HERO_CTA_FIELDS}
          }
        }
        mediaImage {
          ${CARD_IMAGE_BLOCK_FIELDS}
        }
      }
    }
  }
`;

/** Feature GRID — carrossel de cards (`FeatureGridRecord`). @see fragments/feature-grid.graphql */
const FEATURE_GRID_BLOCK = `
  ... on FeatureGridRecord {
    id
    textHeaderSection {
      ${TEXT_HEADER_FIELDS}
    }
    advancedOptions
    variant
    carouselOptions {
      ${CAROUSEL_SETTING_FIELDS}
    }
    itemsFeatureGrid {
      __typename
      ... on CardRecord {
        id
        titleCard
        hasIcon
        iconCard
        hasDescription
        descriptionCard
        hasImage
        imageCard {
          ${CARD_IMAGE_BLOCK_FIELDS}
        }
        hasLink
        linkCard {
          ${LINK_HERO_CTA_FIELDS}
        }
      }
    }
  }
`;

/** Steps Section — timeline de etapas (`StepsSectionRecord`). @see fragments/steps-section.graphql */
const STEPS_SECTION_BLOCK = `
  ... on StepsSectionRecord {
    id
    textHeaderSection {
      ${TEXT_HEADER_FIELDS}
    }
    steps {
      __typename
      ... on StepCardRecord {
        id
        title
        hasDescription
        description
        hasImage
        mediaImage {
          ${CARD_IMAGE_BLOCK_FIELDS}
        }
      }
    }
  }
`;

/** Campos Author no card da Team Section (e alinhados ao perfil). @see fragments/author.graphql */
const AUTHOR_CARD_FIELDS = `
  id
  authorName
  authorSlug
  authorRole
  avatarBio {
    ${IMAGE_BLOCK_RESPONSIVE}
  }
  authorSocialLinks {
    id
    plataforma
    url
    image {
      url
      alt
      width
      height
    }
    openInNewTab
    linkAria
  }
`;

/** Team Section — membros (links para Author). @see fragments/team-section.graphql */
const TEAM_SECTION_BLOCK = `
  ... on TeamSectionRecord {
    id
    textHeaderSection {
      ${TEXT_HEADER_FIELDS}
    }
    members {
      ${AUTHOR_CARD_FIELDS}
    }
  }
`;

const POST_CARD_FIELDS = `
  id
  _firstPublishedAt
  _updatedAt
  postTitle
  postSlug
  excerpt
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
    ${CARD_IMAGE_BLOCK_FIELDS}
  }
`;

/** Blog posts section — listagem filtrável (`BlogPostsSectionRecord`). @see fragments/blog-posts-section.graphql */
const BLOG_POSTS_SECTION_BLOCK = `
  ... on BlogPostsSectionRecord {
    id
    textHeaderSection {
      ${TEXT_HEADER_FIELDS}
    }
    fetchMode
    allCategoriesLabel
    categoryDisplay
    showSortTabs
    hasLimit
    limit
    displayType
    initialCount
    loadMoreStep
    loadMoreLabel
    carouselOptions {
      ${CAROUSEL_SETTING_FIELDS}
    }
    selectedCategories {
      id
      categoryName
      categorySlug
      categoryColor {
        hex
      }
    }
    manualPosts {
      ${POST_CARD_FIELDS}
    }
  }
`;

/** Stats Section — métricas (`StatsSectionRecord`). @see fragments/stats-section.graphql */
const STATS_SECTION_BLOCK = `
  ... on StatsSectionRecord {
    id
    textHeaderSection {
      ${TEXT_HEADER_FIELDS}
    }
    stats {
      __typename
      ... on StatCardRecord {
        id
        value
        label
        hasDescription
        description
      }
    }
  }
`;

/** Pricing Section — tabela de planos (`PricingSectionRecord`). @see fragments/pricing-section.graphql */
const PRICING_SECTION_BLOCK = `
  ... on PricingSectionRecord {
    id
    textHeaderSection {
      ${TEXT_HEADER_FIELDS}
    }
    plans {
      __typename
      ... on PricingCardRecord {
        id
        name
        hasDescription
        description
        priceType
        currency
        amount
        billingPeriod
        isPopular
        features
        hasButton
        ctaButton {
          ${LINK_HERO_CTA_FIELDS}
        }
      }
    }
  }
`;

/** Reviews Section — depoimentos (`ReviewsSectionRecord`). @see fragments/reviews-section.graphql */
const REVIEWS_SECTION_BLOCK = `
  ... on ReviewsSectionRecord {
    id
    textHeaderSection {
      ${TEXT_HEADER_FIELDS}
    }
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

/** Text section — prosa Structured Text no Modular Content da Page. @see fragments/text-section.graphql */
const TEXT_SECTION_BLOCK = `
  ... on TextSectionRecord {
    id
    hasTextHeader
    textHeaderSection {
      ${TEXT_HEADER_FIELDS}
    }
    body {
      value
      links {
        ${ST_RECORD_LINKS_PAGE_ST}
      }
      blocks {
        ${ST_BLOCKS_MEDIA_ONLY}
      }
      inlineBlocks
    }
  }
`;

/**
 * Modular Content **Page.contentPage**: secções de landing.
 * Image / Gallery / Video no Post e no corpo da Text section (`ST_BLOCKS_MEDIA_ONLY`).
 */
const PAGE_CONTENT_BLOCKS = `
  __typename
  ... on RecordInterface {
    id
  }
  ${FAQ_GROUP_BLOCK}
  ${CTA_BANNER_BLOCK}
  ${LOGO_GRID_BLOCK}
  ${REVIEWS_SECTION_BLOCK}
  ${PRICING_SECTION_BLOCK}
  ${STATS_SECTION_BLOCK}
  ${STEPS_SECTION_BLOCK}
  ${TABS_SECTION_BLOCK}
  ${FEATURE_GRID_BLOCK}
  ${TEAM_SECTION_BLOCK}
  ${BLOG_POSTS_SECTION_BLOCK}
  ${TEXT_SECTION_BLOCK}
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
            ${HERO_IMAGE_BLOCK_FIELDS}
          }
          showImageOverlay
          imageOverlay {
            ${HERO_IMAGE_BLOCK_FIELDS}
          }
        }
      }
`;

/**
 * Page por slug.
 *
 * - Corpo: Modular Content `contentPage` (lista de secções).
 * - Hero da página vem do campo modular `heroPage` (bloco **Hero section**), não do contentor de secções.
 * - `subtitleHero` no modelo Hero deste projeto expõe `blocks`/`links`/`inlineBlocks` como listas de **strings**
 *   (IDs), não unions de blocos — não abrir sub-seleção GraphQL nesses campos.
 */
export const PAGE_BY_SLUG = /* GraphQL */ `
  query PageBySlug($slug: String!, $locale: SiteLocale!, $withEditingUrl: Boolean!) {
    page(locale: $locale, fallbackLocales: [en, pt_BR, es], filter: { slug: { eq: $slug } }) {
      id
      title
      slug
      ${HERO_PAGE_FIELDS}
      contentPage {
        ${PAGE_CONTENT_BLOCKS}
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

/** Categorias para chips da Latest posts section (modo auto / categoryDisplay=all). */
export const GET_ALL_CATEGORIES = /* GraphQL */ `
  query GetAllCategories($locale: SiteLocale!) {
    allCategories(locale: $locale, orderBy: categoryName_ASC, first: 100) {
      id
      categoryName
      categorySlug
      categoryColor {
        hex
      }
    }
  }
`;

/** Artigo completo + SEO + autor (para `AuthorSection`). */
export const GET_POST_BY_SLUG = /* GraphQL */ `
  query GetPostBySlug($locale: SiteLocale!, $slug: String!, $withEditingUrl: Boolean!) {
    post(locale: $locale, filter: { postSlug: { eq: $slug } }) {
      id
      _firstPublishedAt
      _updatedAt
      postTitle
      postSlug
      excerpt
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
        ${CARD_IMAGE_BLOCK_FIELDS}
      }
      postAuthor {
        id
        authorName
        authorSlug
        authorRole
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
          image {
            url
            alt
            width
            height
          }
          openInNewTab
          linkAria
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
      authorRole
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
        image {
          url
          alt
          width
          height
        }
        openInNewTab
        linkAria
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
        blurUpThumb
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
 * Preferências de SEO do projecto (`_site.globalSeo`).
 */
export const GET_SITE_SEO = /* GraphQL */ `
  query GetSiteSeo($locale: SiteLocale!) {
    _site {
      globalSeo(locale: $locale, fallbackLocales: [en, pt_BR, es]) {
        siteName
        titleSuffix
        facebookPageUrl
        twitterAccount
        fallbackSeo {
          title
          description
          image {
            url
            alt
            width
            height
          }
        }
      }
    }
  }
`;

/**
 * Single instance `global_setting` — 404 (título, structured text, bloco Image).
 * Em `description404`, `blocks`/`links`/`inlineBlocks` no CDA são escalares (IDs), não unions
 * como em campos ST escalares (bio, 404); pedir subcampos em `links`/`blocks` invalida a query.
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

/**
 * Page escolhida como índice editorial do blog. Consulta separada para que a
 * aplicação continue com fallback `/blog` antes de a migration ser aplicada.
 */
export const GET_BLOG_INDEX_PAGE = /* GraphQL */ `
  query GetBlogIndexPage($locale: SiteLocale!) {
    globalSetting(locale: $locale, fallbackLocales: [en, pt_BR, es]) {
      blogPage {
        id
        title
        slug
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
