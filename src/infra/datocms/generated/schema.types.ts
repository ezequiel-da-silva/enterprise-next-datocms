export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BooleanType: { input: boolean; output: boolean; }
  CustomData: { input: Record<string, unknown>; output: Record<string, unknown>; }
  DateTime: { input: string; output: string; }
  FloatType: { input: number; output: number; }
  IntType: { input: number; output: number; }
  ItemId: { input: string; output: string; }
  JsonField: { input: unknown; output: unknown; }
  MetaTagAttributes: { input: Record<string, string>; output: Record<string, string>; }
  UploadId: { input: string; output: string; }
};

export type AuthorModelAuthorBioField = {
  __typename?: 'AuthorModelAuthorBioField';
  blocks: Array<Scalars['String']['output']>;
  inlineBlocks: Array<Scalars['String']['output']>;
  links: Array<Scalars['String']['output']>;
  value: Scalars['JsonField']['output'];
};

export type AuthorModelAuthorBioFieldMultiLocaleField = {
  __typename?: 'AuthorModelAuthorBioFieldMultiLocaleField';
  locale?: Maybe<SiteLocale>;
  value?: Maybe<AuthorModelAuthorBioField>;
};

export type AuthorModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<AuthorModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<AuthorModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _locales?: InputMaybe<LocalesFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  authorBio?: InputMaybe<StructuredTextFilter>;
  authorName?: InputMaybe<StringFilter>;
  authorRole?: InputMaybe<StringFilter>;
  authorSlug?: InputMaybe<SlugFilter>;
  id?: InputMaybe<ItemIdFilter>;
  seoAnalysis?: InputMaybe<JsonFilter>;
  seoSettingsSocial?: InputMaybe<SeoFilter>;
};

export type AuthorModelOrderBy =
  | '_createdAt_ASC'
  | '_createdAt_DESC'
  | '_firstPublishedAt_ASC'
  | '_firstPublishedAt_DESC'
  | '_isValid_ASC'
  | '_isValid_DESC'
  | '_publicationScheduledAt_ASC'
  | '_publicationScheduledAt_DESC'
  | '_publishedAt_ASC'
  | '_publishedAt_DESC'
  | '_status_ASC'
  | '_status_DESC'
  | '_unpublishingScheduledAt_ASC'
  | '_unpublishingScheduledAt_DESC'
  | '_updatedAt_ASC'
  | '_updatedAt_DESC'
  | 'authorName_ASC'
  | 'authorName_DESC'
  | 'authorRole_ASC'
  | 'authorRole_DESC'
  | 'id_ASC'
  | 'id_DESC';

export type AuthorRecord = RecordInterface & {
  __typename?: 'AuthorRecord';
  _allAuthorBioLocales?: Maybe<Array<AuthorModelAuthorBioFieldMultiLocaleField>>;
  _allAuthorSlugLocales?: Maybe<Array<StringMultiLocaleField>>;
  _allSeoAnalysisLocales?: Maybe<Array<JsonFieldMultiLocaleField>>;
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _locales: Array<SiteLocale>;
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  authorBio?: Maybe<AuthorModelAuthorBioField>;
  authorName?: Maybe<Scalars['String']['output']>;
  authorRole?: Maybe<Scalars['String']['output']>;
  authorSlug?: Maybe<Scalars['String']['output']>;
  authorSocialLinks: Array<SocialLinkRecord>;
  avatarBio?: Maybe<ImageBlockRecord>;
  id: Scalars['ItemId']['output'];
  seoAnalysis?: Maybe<Scalars['JsonField']['output']>;
  seoSettingsSocial?: Maybe<SeoField>;
};


export type AuthorRecord_AllAuthorBioLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type AuthorRecord_AllAuthorSlugLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type AuthorRecord_AllSeoAnalysisLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type AuthorRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


export type AuthorRecordAuthorBioArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type AuthorRecordAuthorSlugArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type AuthorRecordSeoAnalysisArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};

export type BannerImageBlockRecord = RecordInterface & {
  __typename?: 'BannerImageBlockRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  assetDesktop?: Maybe<FileField>;
  assetMobile?: Maybe<FileField>;
  id: Scalars['ItemId']['output'];
};


export type BannerImageBlockRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type BlogListingConfigRecord = RecordInterface & {
  __typename?: 'BlogListingConfigRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  allCategoriesLabel?: Maybe<Scalars['String']['output']>;
  fetchMode?: Maybe<Scalars['String']['output']>;
  filterDisplay?: Maybe<Scalars['String']['output']>;
  id: Scalars['ItemId']['output'];
  manualPosts: Array<PostRecord>;
  selectedCategories: Array<CategoryRecord>;
  showSortTabs: Scalars['BooleanType']['output'];
};


export type BlogListingConfigRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type BooleanFilter = {
  eq?: InputMaybe<Scalars['BooleanType']['input']>;
};

export type CardImageBlockRecord = RecordInterface & {
  __typename?: 'CardImageBlockRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  assetDesktop?: Maybe<FileField>;
  assetMobile?: Maybe<FileField>;
  id: Scalars['ItemId']['output'];
};


export type CardImageBlockRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type CardRecord = RecordInterface & {
  __typename?: 'CardRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  cardSource?: Maybe<Scalars['String']['output']>;
  descriptionCard?: Maybe<Scalars['String']['output']>;
  hasDescription: Scalars['BooleanType']['output'];
  hasIcon: Scalars['BooleanType']['output'];
  hasImage: Scalars['BooleanType']['output'];
  hasLink: Scalars['BooleanType']['output'];
  iconCard?: Maybe<Scalars['JsonField']['output']>;
  id: Scalars['ItemId']['output'];
  imageCard?: Maybe<CardImageBlockRecord>;
  linkCard?: Maybe<LinkRecord>;
  sourceCollection?: Maybe<CollectionPageRecord>;
  sourceProduct?: Maybe<ProductPageRecord>;
  titleCard?: Maybe<Scalars['String']['output']>;
};


export type CardRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type CarouselSettingRecord = RecordInterface & {
  __typename?: 'CarouselSettingRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  autoplay: Scalars['BooleanType']['output'];
  autoplayInterval?: Maybe<Scalars['IntType']['output']>;
  id: Scalars['ItemId']['output'];
  loop: Scalars['BooleanType']['output'];
  showArrows: Scalars['BooleanType']['output'];
  showDots: Scalars['BooleanType']['output'];
};


export type CarouselSettingRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type CategoryModelCategoryDescriptionField = {
  __typename?: 'CategoryModelCategoryDescriptionField';
  blocks: Array<Scalars['String']['output']>;
  inlineBlocks: Array<Scalars['String']['output']>;
  links: Array<Scalars['String']['output']>;
  value: Scalars['JsonField']['output'];
};

export type CategoryModelCategoryDescriptionFieldMultiLocaleField = {
  __typename?: 'CategoryModelCategoryDescriptionFieldMultiLocaleField';
  locale?: Maybe<SiteLocale>;
  value?: Maybe<CategoryModelCategoryDescriptionField>;
};

export type CategoryModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<CategoryModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<CategoryModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _locales?: InputMaybe<LocalesFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  categoryColor?: InputMaybe<ColorFilter>;
  categoryDescription?: InputMaybe<StructuredTextFilter>;
  categoryIcon?: InputMaybe<FileFilter>;
  categoryName?: InputMaybe<StringFilter>;
  categorySlug?: InputMaybe<SlugFilter>;
  id?: InputMaybe<ItemIdFilter>;
  seoAnalysis?: InputMaybe<JsonFilter>;
  seoSettingsSocial?: InputMaybe<SeoFilter>;
};

export type CategoryModelOrderBy =
  | '_createdAt_ASC'
  | '_createdAt_DESC'
  | '_firstPublishedAt_ASC'
  | '_firstPublishedAt_DESC'
  | '_isValid_ASC'
  | '_isValid_DESC'
  | '_publicationScheduledAt_ASC'
  | '_publicationScheduledAt_DESC'
  | '_publishedAt_ASC'
  | '_publishedAt_DESC'
  | '_status_ASC'
  | '_status_DESC'
  | '_unpublishingScheduledAt_ASC'
  | '_unpublishingScheduledAt_DESC'
  | '_updatedAt_ASC'
  | '_updatedAt_DESC'
  | 'categoryName_ASC'
  | 'categoryName_DESC'
  | 'id_ASC'
  | 'id_DESC';

export type CategoryRecord = RecordInterface & {
  __typename?: 'CategoryRecord';
  _allCategoryDescriptionLocales?: Maybe<Array<CategoryModelCategoryDescriptionFieldMultiLocaleField>>;
  _allCategoryNameLocales?: Maybe<Array<StringMultiLocaleField>>;
  _allCategorySlugLocales?: Maybe<Array<StringMultiLocaleField>>;
  _allSeoAnalysisLocales?: Maybe<Array<JsonFieldMultiLocaleField>>;
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _locales: Array<SiteLocale>;
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  categoryColor?: Maybe<ColorField>;
  categoryDescription?: Maybe<CategoryModelCategoryDescriptionField>;
  categoryIcon?: Maybe<FileField>;
  categoryName?: Maybe<Scalars['String']['output']>;
  categorySlug?: Maybe<Scalars['String']['output']>;
  id: Scalars['ItemId']['output'];
  seoAnalysis?: Maybe<Scalars['JsonField']['output']>;
  seoSettingsSocial?: Maybe<SeoField>;
};


export type CategoryRecord_AllCategoryDescriptionLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type CategoryRecord_AllCategoryNameLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type CategoryRecord_AllCategorySlugLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type CategoryRecord_AllSeoAnalysisLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type CategoryRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


export type CategoryRecordCategoryDescriptionArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type CategoryRecordCategoryNameArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type CategoryRecordCategorySlugArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type CategoryRecordSeoAnalysisArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};

export type CollectionMetadata = {
  __typename?: 'CollectionMetadata';
  count: Scalars['IntType']['output'];
};

export type CollectionPageModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<CollectionPageModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<CollectionPageModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _locales?: InputMaybe<LocalesFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  description?: InputMaybe<TextFilter>;
  id?: InputMaybe<ItemIdFilter>;
  seo?: InputMaybe<SeoFilter>;
  shopifyCollectionId?: InputMaybe<StringFilter>;
  shopifyHandle?: InputMaybe<SlugFilter>;
  title?: InputMaybe<StringFilter>;
};

export type CollectionPageModelOrderBy =
  | '_createdAt_ASC'
  | '_createdAt_DESC'
  | '_firstPublishedAt_ASC'
  | '_firstPublishedAt_DESC'
  | '_isValid_ASC'
  | '_isValid_DESC'
  | '_publicationScheduledAt_ASC'
  | '_publicationScheduledAt_DESC'
  | '_publishedAt_ASC'
  | '_publishedAt_DESC'
  | '_status_ASC'
  | '_status_DESC'
  | '_unpublishingScheduledAt_ASC'
  | '_unpublishingScheduledAt_DESC'
  | '_updatedAt_ASC'
  | '_updatedAt_DESC'
  | 'id_ASC'
  | 'id_DESC'
  | 'shopifyCollectionId_ASC'
  | 'shopifyCollectionId_DESC'
  | 'title_ASC'
  | 'title_DESC';

export type CollectionPageRecord = RecordInterface & {
  __typename?: 'CollectionPageRecord';
  _allDescriptionLocales?: Maybe<Array<StringMultiLocaleField>>;
  _allSeoLocales?: Maybe<Array<SeoFieldMultiLocaleField>>;
  _allTitleLocales?: Maybe<Array<StringMultiLocaleField>>;
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _locales: Array<SiteLocale>;
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ItemId']['output'];
  seo?: Maybe<SeoField>;
  shopifyCollectionId?: Maybe<Scalars['String']['output']>;
  shopifyHandle?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};


export type CollectionPageRecord_AllDescriptionLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  markdown?: InputMaybe<Scalars['Boolean']['input']>;
};


export type CollectionPageRecord_AllSeoLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type CollectionPageRecord_AllTitleLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type CollectionPageRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


export type CollectionPageRecordDescriptionArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
  markdown?: InputMaybe<Scalars['Boolean']['input']>;
};


export type CollectionPageRecordSeoArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type CollectionPageRecordTitleArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};

export type ColorBucketType =
  | 'black'
  | 'blue'
  | 'brown'
  | 'cyan'
  | 'green'
  | 'grey'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'white'
  | 'yellow';

export type ColorField = {
  __typename?: 'ColorField';
  alpha: Scalars['IntType']['output'];
  blue: Scalars['IntType']['output'];
  cssRgb: Scalars['String']['output'];
  green: Scalars['IntType']['output'];
  hex: Scalars['String']['output'];
  red: Scalars['IntType']['output'];
};

export type ColorFilter = {
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
};

export type ColorThemeRecord = RecordInterface & {
  __typename?: 'ColorThemeRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  colorNeutral?: Maybe<ColorField>;
  colorPrimary?: Maybe<ColorField>;
  colorSecondary?: Maybe<ColorField>;
  colorTertiary?: Maybe<ColorField>;
  id: Scalars['ItemId']['output'];
  paletteSelection?: Maybe<Scalars['String']['output']>;
};


export type ColorThemeRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type ContactFormSectionModelIntroField = {
  __typename?: 'ContactFormSectionModelIntroField';
  blocks: Array<Scalars['String']['output']>;
  inlineBlocks: Array<Scalars['String']['output']>;
  links: Array<PageRecord>;
  value: Scalars['JsonField']['output'];
};

export type ContactFormSectionRecord = RecordInterface & {
  __typename?: 'ContactFormSectionRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  hasTextHeader: Scalars['BooleanType']['output'];
  id: Scalars['ItemId']['output'];
  intro?: Maybe<ContactFormSectionModelIntroField>;
  privacyNote?: Maybe<Scalars['String']['output']>;
  successMessage?: Maybe<Scalars['String']['output']>;
  textHeaderSection: Array<TextHeaderRecord>;
};


export type ContactFormSectionRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type ContentListingSectionModelListingConfigField = BlogListingConfigRecord | ShopifyListingConfigRecord;

export type ContentListingSectionRecord = RecordInterface & {
  __typename?: 'ContentListingSectionRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  carouselOptions: Array<CarouselSettingRecord>;
  displayType?: Maybe<Scalars['String']['output']>;
  hasLimit: Scalars['BooleanType']['output'];
  id: Scalars['ItemId']['output'];
  initialCount?: Maybe<Scalars['IntType']['output']>;
  limit?: Maybe<Scalars['IntType']['output']>;
  listingConfig?: Maybe<ContentListingSectionModelListingConfigField>;
  loadMoreLabel?: Maybe<Scalars['String']['output']>;
  loadMoreStep?: Maybe<Scalars['IntType']['output']>;
  textHeaderSection: Array<TextHeaderRecord>;
};


export type ContentListingSectionRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type CreatedAtFilter = {
  eq?: InputMaybe<Scalars['DateTime']['input']>;
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  lte?: InputMaybe<Scalars['DateTime']['input']>;
  neq?: InputMaybe<Scalars['DateTime']['input']>;
};

export type CtaBannerRecord = RecordInterface & {
  __typename?: 'CtaBannerRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  advancedOptions: Scalars['BooleanType']['output'];
  bgTheme?: Maybe<Scalars['String']['output']>;
  buttons: Array<LinkRecord>;
  eyebrow?: Maybe<Scalars['String']['output']>;
  hasEyebrow: Scalars['BooleanType']['output'];
  hasImage: Scalars['BooleanType']['output'];
  id: Scalars['ItemId']['output'];
  imageBanner: Array<BannerImageBlockRecord>;
  textHeaderSection: Array<TextHeaderRecord>;
  variant?: Maybe<Scalars['String']['output']>;
};


export type CtaBannerRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type FaqGroupRecord = RecordInterface & {
  __typename?: 'FaqGroupRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  accordionMode?: Maybe<Scalars['String']['output']>;
  advancedOptions: Scalars['BooleanType']['output'];
  enableFaqSchema: Scalars['BooleanType']['output'];
  headerAlignment?: Maybe<Scalars['String']['output']>;
  id: Scalars['ItemId']['output'];
  openFirstItem: Scalars['BooleanType']['output'];
  questions: Array<FaqItemRecord>;
  textHeaderSection: Array<TextHeaderRecord>;
};


export type FaqGroupRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type FaqItemModelAnswerField = {
  __typename?: 'FaqItemModelAnswerField';
  blocks: Array<Scalars['String']['output']>;
  inlineBlocks: Array<Scalars['String']['output']>;
  links: Array<Scalars['String']['output']>;
  value: Scalars['JsonField']['output'];
};

export type FaqItemModelQuestionField = {
  __typename?: 'FaqItemModelQuestionField';
  blocks: Array<Scalars['String']['output']>;
  inlineBlocks: Array<Scalars['String']['output']>;
  links: Array<Scalars['String']['output']>;
  value: Scalars['JsonField']['output'];
};

export type FaqItemRecord = RecordInterface & {
  __typename?: 'FaqItemRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  answer?: Maybe<FaqItemModelAnswerField>;
  id: Scalars['ItemId']['output'];
  question?: Maybe<FaqItemModelQuestionField>;
};


export type FaqItemRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type FaviconType =
  | 'appleTouchIcon'
  | 'icon'
  | 'msApplication';

export type FeatureGridRecord = RecordInterface & {
  __typename?: 'FeatureGridRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  advancedOptions: Scalars['BooleanType']['output'];
  carouselOptions: Array<CarouselSettingRecord>;
  id: Scalars['ItemId']['output'];
  itemsFeatureGrid: Array<CardRecord>;
  textHeaderSection: Array<TextHeaderRecord>;
  variant?: Maybe<Scalars['String']['output']>;
};


export type FeatureGridRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type FileField = FileFieldInterface & {
  __typename?: 'FileField';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  alt?: Maybe<Scalars['String']['output']>;
  author?: Maybe<Scalars['String']['output']>;
  basename: Scalars['String']['output'];
  blurUpThumb?: Maybe<Scalars['String']['output']>;
  blurhash?: Maybe<Scalars['String']['output']>;
  colors: Array<ColorField>;
  copyright?: Maybe<Scalars['String']['output']>;
  customData: Scalars['CustomData']['output'];
  exifInfo: Scalars['CustomData']['output'];
  filename: Scalars['String']['output'];
  focalPoint?: Maybe<FocalPoint>;
  format: Scalars['String']['output'];
  height?: Maybe<Scalars['IntType']['output']>;
  id: Scalars['UploadId']['output'];
  md5: Scalars['String']['output'];
  mimeType: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  responsiveImage?: Maybe<ResponsiveImage>;
  size: Scalars['IntType']['output'];
  smartTags: Array<Scalars['String']['output']>;
  tags: Array<Scalars['String']['output']>;
  thumbhash?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
  video?: Maybe<UploadVideoField>;
  width?: Maybe<Scalars['IntType']['output']>;
};


export type FileFieldAltArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type FileFieldBlurUpThumbArgs = {
  imgixParams?: InputMaybe<ImgixParams>;
  punch?: InputMaybe<Scalars['Float']['input']>;
  quality?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


export type FileFieldCustomDataArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type FileFieldFocalPointArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type FileFieldResponsiveImageArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  imgixParams?: InputMaybe<ImgixParams>;
  locale?: InputMaybe<SiteLocale>;
  sizes?: InputMaybe<Scalars['String']['input']>;
};


export type FileFieldTitleArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type FileFieldUrlArgs = {
  imgixParams?: InputMaybe<ImgixParams>;
};

export type FileFieldInterface = {
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  alt?: Maybe<Scalars['String']['output']>;
  author?: Maybe<Scalars['String']['output']>;
  basename: Scalars['String']['output'];
  blurUpThumb?: Maybe<Scalars['String']['output']>;
  blurhash?: Maybe<Scalars['String']['output']>;
  colors: Array<ColorField>;
  copyright?: Maybe<Scalars['String']['output']>;
  customData: Scalars['CustomData']['output'];
  exifInfo: Scalars['CustomData']['output'];
  filename: Scalars['String']['output'];
  focalPoint?: Maybe<FocalPoint>;
  format: Scalars['String']['output'];
  height?: Maybe<Scalars['IntType']['output']>;
  id: Scalars['UploadId']['output'];
  md5: Scalars['String']['output'];
  mimeType: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  responsiveImage?: Maybe<ResponsiveImage>;
  size: Scalars['IntType']['output'];
  smartTags: Array<Scalars['String']['output']>;
  tags: Array<Scalars['String']['output']>;
  thumbhash?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
  video?: Maybe<UploadVideoField>;
  width?: Maybe<Scalars['IntType']['output']>;
};


export type FileFieldInterfaceAltArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type FileFieldInterfaceBlurUpThumbArgs = {
  imgixParams?: InputMaybe<ImgixParams>;
  punch?: InputMaybe<Scalars['Float']['input']>;
  quality?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


export type FileFieldInterfaceCustomDataArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type FileFieldInterfaceFocalPointArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type FileFieldInterfaceResponsiveImageArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  imgixParams?: InputMaybe<ImgixParams>;
  locale?: InputMaybe<SiteLocale>;
  sizes?: InputMaybe<Scalars['String']['input']>;
};


export type FileFieldInterfaceTitleArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type FileFieldInterfaceUrlArgs = {
  imgixParams?: InputMaybe<ImgixParams>;
};

export type FileFilter = {
  eq?: InputMaybe<Scalars['UploadId']['input']>;
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['UploadId']['input']>>>;
  neq?: InputMaybe<Scalars['UploadId']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['UploadId']['input']>>>;
};

export type FocalPoint = {
  __typename?: 'FocalPoint';
  x: Scalars['FloatType']['output'];
  y: Scalars['FloatType']['output'];
};

export type GlobalSeoField = {
  __typename?: 'GlobalSeoField';
  facebookPageUrl?: Maybe<Scalars['String']['output']>;
  fallbackSeo?: Maybe<SeoField>;
  siteName?: Maybe<Scalars['String']['output']>;
  titleSuffix?: Maybe<Scalars['String']['output']>;
  twitterAccount?: Maybe<Scalars['String']['output']>;
};

export type GlobalSettingModelDescription404Field = {
  __typename?: 'GlobalSettingModelDescription404Field';
  blocks: Array<Scalars['String']['output']>;
  inlineBlocks: Array<Scalars['String']['output']>;
  links: Array<Scalars['String']['output']>;
  value: Scalars['JsonField']['output'];
};

export type GlobalSettingModelDescription404FieldMultiLocaleField = {
  __typename?: 'GlobalSettingModelDescription404FieldMultiLocaleField';
  locale?: Maybe<SiteLocale>;
  value?: Maybe<GlobalSettingModelDescription404Field>;
};

export type GlobalSettingRecord = RecordInterface & {
  __typename?: 'GlobalSettingRecord';
  _allDescription404Locales?: Maybe<Array<GlobalSettingModelDescription404FieldMultiLocaleField>>;
  _allTitle404Locales?: Maybe<Array<StringMultiLocaleField>>;
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _locales: Array<SiteLocale>;
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  blogPage?: Maybe<PageRecord>;
  collectionsPage?: Maybe<PageRecord>;
  contactPage?: Maybe<PageRecord>;
  description404?: Maybe<GlobalSettingModelDescription404Field>;
  id: Scalars['ItemId']['output'];
  image404?: Maybe<ImageBlockRecord>;
  productsPage?: Maybe<PageRecord>;
  searchPage?: Maybe<PageRecord>;
  title404?: Maybe<Scalars['String']['output']>;
};


export type GlobalSettingRecord_AllDescription404LocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type GlobalSettingRecord_AllTitle404LocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type GlobalSettingRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


export type GlobalSettingRecordDescription404Args = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type GlobalSettingRecordTitle404Args = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};

export type HeroImageBlockRecord = RecordInterface & {
  __typename?: 'HeroImageBlockRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  assetDesktop?: Maybe<FileField>;
  assetMobile?: Maybe<FileField>;
  id: Scalars['ItemId']['output'];
};


export type HeroImageBlockRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type HeroSectionModelSubtitleHeroField = {
  __typename?: 'HeroSectionModelSubtitleHeroField';
  blocks: Array<Scalars['String']['output']>;
  inlineBlocks: Array<Scalars['String']['output']>;
  links: Array<Scalars['String']['output']>;
  value: Scalars['JsonField']['output'];
};

export type HeroSectionRecord = RecordInterface & {
  __typename?: 'HeroSectionRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  buttonHero: Array<LinkRecord>;
  id: Scalars['ItemId']['output'];
  imageHero?: Maybe<HeroImageBlockRecord>;
  imageOverlay?: Maybe<HeroImageBlockRecord>;
  layoutHero?: Maybe<Scalars['String']['output']>;
  showButton: Scalars['BooleanType']['output'];
  showImageHero: Scalars['BooleanType']['output'];
  showImageOverlay: Scalars['BooleanType']['output'];
  subtitleHero?: Maybe<HeroSectionModelSubtitleHeroField>;
  titleHero?: Maybe<Scalars['String']['output']>;
};


export type HeroSectionRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type HeroSectionRecordMultiLocaleField = {
  __typename?: 'HeroSectionRecordMultiLocaleField';
  locale?: Maybe<SiteLocale>;
  value?: Maybe<HeroSectionRecord>;
};

export type ImageBlockRecord = RecordInterface & {
  __typename?: 'ImageBlockRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  asset?: Maybe<FileField>;
  assetDesktop?: Maybe<FileField>;
  id: Scalars['ItemId']['output'];
};


export type ImageBlockRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type ImageGalleryBlockRecord = RecordInterface & {
  __typename?: 'ImageGalleryBlockRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  assets: Array<FileField>;
  id: Scalars['ItemId']['output'];
};


export type ImageGalleryBlockRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type ImgixParams = {
  ar?: InputMaybe<Scalars['String']['input']>;
  auto?: InputMaybe<Array<ImgixParamsAuto>>;
  bg?: InputMaybe<Scalars['String']['input']>;
  bgRemove?: InputMaybe<Scalars['BooleanType']['input']>;
  bgRemoveFallback?: InputMaybe<Scalars['BooleanType']['input']>;
  bgRemoveFgType?: InputMaybe<Array<ImgixParamsBgRemoveFgType>>;
  bgRemoveSemiTransparency?: InputMaybe<Scalars['BooleanType']['input']>;
  bgReplace?: InputMaybe<Scalars['String']['input']>;
  bgReplaceFallback?: InputMaybe<Scalars['BooleanType']['input']>;
  bgReplaceNegPrompt?: InputMaybe<Scalars['String']['input']>;
  blend?: InputMaybe<Scalars['String']['input']>;
  blendAlign?: InputMaybe<Array<ImgixParamsBlendAlign>>;
  blendAlpha?: InputMaybe<Scalars['IntType']['input']>;
  blendColor?: InputMaybe<Scalars['String']['input']>;
  blendCrop?: InputMaybe<Array<ImgixParamsBlendCrop>>;
  blendFit?: InputMaybe<ImgixParamsBlendFit>;
  blendH?: InputMaybe<Scalars['FloatType']['input']>;
  blendMode?: InputMaybe<ImgixParamsBlendMode>;
  blendPad?: InputMaybe<Scalars['IntType']['input']>;
  blendSize?: InputMaybe<ImgixParamsBlendSize>;
  blendW?: InputMaybe<Scalars['FloatType']['input']>;
  blendX?: InputMaybe<Scalars['IntType']['input']>;
  blendY?: InputMaybe<Scalars['IntType']['input']>;
  blur?: InputMaybe<Scalars['IntType']['input']>;
  border?: InputMaybe<Scalars['String']['input']>;
  borderBottom?: InputMaybe<Scalars['IntType']['input']>;
  borderLeft?: InputMaybe<Scalars['IntType']['input']>;
  borderRadius?: InputMaybe<Scalars['String']['input']>;
  borderRadiusInner?: InputMaybe<Scalars['String']['input']>;
  borderRight?: InputMaybe<Scalars['IntType']['input']>;
  borderTop?: InputMaybe<Scalars['IntType']['input']>;
  bri?: InputMaybe<Scalars['IntType']['input']>;
  ch?: InputMaybe<Array<ImgixParamsCh>>;
  chromasub?: InputMaybe<Scalars['IntType']['input']>;
  colorquant?: InputMaybe<Scalars['IntType']['input']>;
  colors?: InputMaybe<Scalars['IntType']['input']>;
  con?: InputMaybe<Scalars['IntType']['input']>;
  cornerRadius?: InputMaybe<Scalars['String']['input']>;
  crop?: InputMaybe<Array<ImgixParamsCrop>>;
  cs?: InputMaybe<ImgixParamsCs>;
  dl?: InputMaybe<Scalars['String']['input']>;
  dpi?: InputMaybe<Scalars['IntType']['input']>;
  dpr?: InputMaybe<Scalars['FloatType']['input']>;
  duotone?: InputMaybe<Scalars['String']['input']>;
  duotoneAlpha?: InputMaybe<Scalars['IntType']['input']>;
  exp?: InputMaybe<Scalars['IntType']['input']>;
  expires?: InputMaybe<Scalars['IntType']['input']>;
  faceBlur?: InputMaybe<Scalars['IntType']['input']>;
  facePixel?: InputMaybe<Scalars['IntType']['input']>;
  faceindex?: InputMaybe<Scalars['IntType']['input']>;
  facepad?: InputMaybe<Scalars['FloatType']['input']>;
  faces?: InputMaybe<Scalars['IntType']['input']>;
  fill?: InputMaybe<ImgixParamsFill>;
  fillColor?: InputMaybe<Scalars['String']['input']>;
  fillGenFallback?: InputMaybe<Scalars['BooleanType']['input']>;
  fillGenNegPrompt?: InputMaybe<Scalars['String']['input']>;
  fillGenPos?: InputMaybe<Array<ImgixParamsFillGenPos>>;
  fillGenPrompt?: InputMaybe<Scalars['String']['input']>;
  fillGenSeed?: InputMaybe<Scalars['IntType']['input']>;
  fillGradientCs?: InputMaybe<ImgixParamsFillGradientCs>;
  fillGradientLinear?: InputMaybe<Scalars['String']['input']>;
  fillGradientLinearDirection?: InputMaybe<Array<ImgixParamsFillGradientLinearDirection>>;
  fillGradientRadial?: InputMaybe<Scalars['String']['input']>;
  fillGradientRadialRadius?: InputMaybe<Scalars['String']['input']>;
  fillGradientRadialX?: InputMaybe<Scalars['FloatType']['input']>;
  fillGradientRadialY?: InputMaybe<Scalars['FloatType']['input']>;
  fillGradientType?: InputMaybe<ImgixParamsFillGradientType>;
  fit?: InputMaybe<ImgixParamsFit>;
  flip?: InputMaybe<ImgixParamsFlip>;
  fm?: InputMaybe<ImgixParamsFm>;
  fpDebug?: InputMaybe<Scalars['BooleanType']['input']>;
  fpX?: InputMaybe<Scalars['FloatType']['input']>;
  fpY?: InputMaybe<Scalars['FloatType']['input']>;
  fpZ?: InputMaybe<Scalars['FloatType']['input']>;
  fps?: InputMaybe<Scalars['IntType']['input']>;
  frame?: InputMaybe<Scalars['String']['input']>;
  gam?: InputMaybe<Scalars['IntType']['input']>;
  gifQ?: InputMaybe<Scalars['IntType']['input']>;
  gridColors?: InputMaybe<Scalars['String']['input']>;
  gridSize?: InputMaybe<Scalars['IntType']['input']>;
  h?: InputMaybe<Scalars['FloatType']['input']>;
  high?: InputMaybe<Scalars['IntType']['input']>;
  htn?: InputMaybe<Scalars['IntType']['input']>;
  hue?: InputMaybe<Scalars['IntType']['input']>;
  interval?: InputMaybe<Scalars['IntType']['input']>;
  invert?: InputMaybe<Scalars['BooleanType']['input']>;
  iptc?: InputMaybe<ImgixParamsIptc>;
  jpgProgressive?: InputMaybe<Scalars['BooleanType']['input']>;
  loop?: InputMaybe<Scalars['IntType']['input']>;
  lossless?: InputMaybe<Scalars['BooleanType']['input']>;
  lpBlur?: InputMaybe<Scalars['IntType']['input']>;
  mark?: InputMaybe<Scalars['String']['input']>;
  markAlign?: InputMaybe<Array<ImgixParamsMarkAlign>>;
  markAlpha?: InputMaybe<Scalars['IntType']['input']>;
  markBase?: InputMaybe<Scalars['String']['input']>;
  markFit?: InputMaybe<ImgixParamsMarkFit>;
  markH?: InputMaybe<Scalars['FloatType']['input']>;
  markIfMinHeight?: InputMaybe<Scalars['IntType']['input']>;
  markIfMinWidth?: InputMaybe<Scalars['IntType']['input']>;
  markPad?: InputMaybe<Scalars['IntType']['input']>;
  markRot?: InputMaybe<Scalars['FloatType']['input']>;
  markScale?: InputMaybe<Scalars['IntType']['input']>;
  markTile?: InputMaybe<ImgixParamsMarkTile>;
  markW?: InputMaybe<Scalars['FloatType']['input']>;
  markX?: InputMaybe<Scalars['IntType']['input']>;
  markY?: InputMaybe<Scalars['IntType']['input']>;
  mask?: InputMaybe<Scalars['String']['input']>;
  maskBg?: InputMaybe<Scalars['String']['input']>;
  maxH?: InputMaybe<Scalars['IntType']['input']>;
  maxW?: InputMaybe<Scalars['IntType']['input']>;
  minH?: InputMaybe<Scalars['IntType']['input']>;
  minW?: InputMaybe<Scalars['IntType']['input']>;
  monochrome?: InputMaybe<Scalars['String']['input']>;
  nr?: InputMaybe<Scalars['IntType']['input']>;
  nrs?: InputMaybe<Scalars['IntType']['input']>;
  objectRemovalNegativePrompt?: InputMaybe<Scalars['String']['input']>;
  objectRemovalPrompt?: InputMaybe<Scalars['String']['input']>;
  objectRemovalRect?: InputMaybe<Scalars['String']['input']>;
  objectRemovalSeed?: InputMaybe<Scalars['IntType']['input']>;
  orient?: InputMaybe<Scalars['IntType']['input']>;
  pad?: InputMaybe<Scalars['IntType']['input']>;
  padBottom?: InputMaybe<Scalars['IntType']['input']>;
  padLeft?: InputMaybe<Scalars['IntType']['input']>;
  padRight?: InputMaybe<Scalars['IntType']['input']>;
  padTop?: InputMaybe<Scalars['IntType']['input']>;
  page?: InputMaybe<Scalars['IntType']['input']>;
  palette?: InputMaybe<ImgixParamsPalette>;
  pdfAnnotation?: InputMaybe<Scalars['BooleanType']['input']>;
  prefix?: InputMaybe<Scalars['String']['input']>;
  px?: InputMaybe<Scalars['IntType']['input']>;
  q?: InputMaybe<Scalars['IntType']['input']>;
  rasterizeBypass?: InputMaybe<Scalars['BooleanType']['input']>;
  rect?: InputMaybe<Scalars['String']['input']>;
  reverse?: InputMaybe<Scalars['BooleanType']['input']>;
  rot?: InputMaybe<Scalars['FloatType']['input']>;
  rotType?: InputMaybe<ImgixParamsRotType>;
  sat?: InputMaybe<Scalars['IntType']['input']>;
  sepia?: InputMaybe<Scalars['IntType']['input']>;
  shad?: InputMaybe<Scalars['FloatType']['input']>;
  sharp?: InputMaybe<Scalars['FloatType']['input']>;
  skip?: InputMaybe<Scalars['IntType']['input']>;
  skipDefaultOptimizations?: InputMaybe<Scalars['BooleanType']['input']>;
  svgSanitize?: InputMaybe<Scalars['BooleanType']['input']>;
  transparency?: InputMaybe<ImgixParamsTransparency>;
  trim?: InputMaybe<ImgixParamsTrim>;
  trimAlpha?: InputMaybe<Scalars['FloatType']['input']>;
  trimColor?: InputMaybe<Scalars['String']['input']>;
  trimMd?: InputMaybe<Scalars['FloatType']['input']>;
  trimPad?: InputMaybe<Scalars['IntType']['input']>;
  trimSd?: InputMaybe<Scalars['FloatType']['input']>;
  trimTol?: InputMaybe<Scalars['FloatType']['input']>;
  txt?: InputMaybe<Scalars['String']['input']>;
  txtAlign?: InputMaybe<Array<ImgixParamsTxtAlign>>;
  txtClip?: InputMaybe<Array<ImgixParamsTxtClip>>;
  txtColor?: InputMaybe<Scalars['String']['input']>;
  txtFit?: InputMaybe<ImgixParamsTxtFit>;
  txtFont?: InputMaybe<Scalars['String']['input']>;
  txtLead?: InputMaybe<Scalars['IntType']['input']>;
  txtLine?: InputMaybe<Scalars['IntType']['input']>;
  txtLineColor?: InputMaybe<Scalars['String']['input']>;
  txtPad?: InputMaybe<Scalars['IntType']['input']>;
  txtShad?: InputMaybe<Scalars['FloatType']['input']>;
  txtSize?: InputMaybe<Scalars['IntType']['input']>;
  txtTrack?: InputMaybe<Scalars['IntType']['input']>;
  txtWidth?: InputMaybe<Scalars['IntType']['input']>;
  txtX?: InputMaybe<Scalars['IntType']['input']>;
  txtY?: InputMaybe<Scalars['IntType']['input']>;
  upscale?: InputMaybe<Scalars['BooleanType']['input']>;
  upscaleFallback?: InputMaybe<Scalars['BooleanType']['input']>;
  usm?: InputMaybe<Scalars['IntType']['input']>;
  usmrad?: InputMaybe<Scalars['FloatType']['input']>;
  vib?: InputMaybe<Scalars['IntType']['input']>;
  w?: InputMaybe<Scalars['FloatType']['input']>;
};

export type ImgixParamsAuto =
  | 'compress'
  | 'enhance'
  | 'format'
  | 'redeye';

export type ImgixParamsBgRemoveFgType =
  | 'auto'
  | 'car';

export type ImgixParamsBlendAlign =
  | 'bottom'
  | 'center'
  | 'left'
  | 'middle'
  | 'right'
  | 'top';

export type ImgixParamsBlendCrop =
  | 'bottom'
  | 'faces'
  | 'left'
  | 'right'
  | 'top';

export type ImgixParamsBlendFit =
  | 'clamp'
  | 'clip'
  | 'crop'
  | 'max'
  | 'scale';

export type ImgixParamsBlendMode =
  | 'burn'
  | 'color'
  | 'darken'
  | 'difference'
  | 'dodge'
  | 'exclusion'
  | 'hardlight'
  | 'hue'
  | 'lighten'
  | 'luminosity'
  | 'multiply'
  | 'normal'
  | 'overlay'
  | 'saturation'
  | 'screen'
  | 'softlight';

export type ImgixParamsBlendSize =
  | 'inherit';

export type ImgixParamsCh =
  | 'dpr'
  | 'saveData'
  | 'width';

export type ImgixParamsCrop =
  | 'bottom'
  | 'edges'
  | 'entropy'
  | 'faces'
  | 'focalpoint'
  | 'left'
  | 'right'
  | 'top';

export type ImgixParamsCs =
  | 'adobergb1998'
  | 'origin'
  | 'srgb'
  | 'strip'
  | 'tinysrgb';

export type ImgixParamsFill =
  | 'blur'
  | 'gen'
  | 'generative'
  | 'gradient'
  | 'solid';

export type ImgixParamsFillGenPos =
  | 'bottom'
  | 'center'
  | 'left'
  | 'middle'
  | 'right'
  | 'top';

export type ImgixParamsFillGradientCs =
  | 'hsl'
  | 'lch'
  | 'linear'
  | 'oklab'
  | 'srgb';

export type ImgixParamsFillGradientLinearDirection =
  | 'bottom'
  | 'left'
  | 'right'
  | 'top';

export type ImgixParamsFillGradientType =
  | 'linear'
  | 'radial';

export type ImgixParamsFit =
  | 'clamp'
  | 'clip'
  | 'crop'
  | 'facearea'
  | 'fill'
  | 'fillmax'
  | 'max'
  | 'min'
  | 'scale';

export type ImgixParamsFlip =
  | 'h'
  | 'hv'
  | 'v';

export type ImgixParamsFm =
  | 'avif'
  | 'blurhash'
  | 'gif'
  | 'jp2'
  | 'jpg'
  | 'json'
  | 'jxr'
  | 'mp4'
  | 'pjpg'
  | 'png'
  | 'png8'
  | 'png32'
  | 'webm'
  | 'webp';

export type ImgixParamsIptc =
  | 'allow'
  | 'block';

export type ImgixParamsMarkAlign =
  | 'bottom'
  | 'center'
  | 'left'
  | 'middle'
  | 'right'
  | 'top';

export type ImgixParamsMarkFit =
  | 'clip'
  | 'crop'
  | 'fill'
  | 'max'
  | 'scale';

export type ImgixParamsMarkTile =
  | 'grid';

export type ImgixParamsPalette =
  | 'css'
  | 'json';

export type ImgixParamsRotType =
  | 'pivot'
  | 'straighten';

export type ImgixParamsTransparency =
  | 'grid';

export type ImgixParamsTrim =
  | 'alpha'
  | 'auto'
  | 'color';

export type ImgixParamsTxtAlign =
  | 'bottom'
  | 'center'
  | 'left'
  | 'middle'
  | 'right'
  | 'top';

export type ImgixParamsTxtClip =
  | 'ellipsis'
  | 'end'
  | 'middle'
  | 'start';

export type ImgixParamsTxtFit =
  | 'max';

export type InUseFilter = {
  eq?: InputMaybe<Scalars['BooleanType']['input']>;
};

export type IntegerFilter = {
  eq?: InputMaybe<Scalars['IntType']['input']>;
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
  gt?: InputMaybe<Scalars['IntType']['input']>;
  gte?: InputMaybe<Scalars['IntType']['input']>;
  lt?: InputMaybe<Scalars['IntType']['input']>;
  lte?: InputMaybe<Scalars['IntType']['input']>;
  neq?: InputMaybe<Scalars['IntType']['input']>;
};

export type ItemIdFilter = {
  eq?: InputMaybe<Scalars['ItemId']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['ItemId']['input']>>>;
  neq?: InputMaybe<Scalars['ItemId']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['ItemId']['input']>>>;
};

export type ItemStatus =
  | 'draft'
  | 'published'
  | 'updated';

export type JsonFieldMultiLocaleField = {
  __typename?: 'JsonFieldMultiLocaleField';
  locale?: Maybe<SiteLocale>;
  value?: Maybe<Scalars['JsonField']['output']>;
};

export type JsonFilter = {
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
};

export type LegalPageModelContentField = {
  __typename?: 'LegalPageModelContentField';
  blocks: Array<Scalars['String']['output']>;
  inlineBlocks: Array<Scalars['String']['output']>;
  links: Array<LegalPageModelContentLinksField>;
  value: Scalars['JsonField']['output'];
};

export type LegalPageModelContentFieldMultiLocaleField = {
  __typename?: 'LegalPageModelContentFieldMultiLocaleField';
  locale?: Maybe<SiteLocale>;
  value?: Maybe<LegalPageModelContentField>;
};

export type LegalPageModelContentLinksField = LegalPageRecord | PageRecord;

export type LegalPageModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<LegalPageModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<LegalPageModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _locales?: InputMaybe<LocalesFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  content?: InputMaybe<StructuredTextFilter>;
  id?: InputMaybe<ItemIdFilter>;
  seoAnalysis?: InputMaybe<JsonFilter>;
  seoSettingsSocial?: InputMaybe<SeoFilter>;
  slug?: InputMaybe<SlugFilter>;
  title?: InputMaybe<StringFilter>;
};

export type LegalPageModelOrderBy =
  | '_createdAt_ASC'
  | '_createdAt_DESC'
  | '_firstPublishedAt_ASC'
  | '_firstPublishedAt_DESC'
  | '_isValid_ASC'
  | '_isValid_DESC'
  | '_publicationScheduledAt_ASC'
  | '_publicationScheduledAt_DESC'
  | '_publishedAt_ASC'
  | '_publishedAt_DESC'
  | '_status_ASC'
  | '_status_DESC'
  | '_unpublishingScheduledAt_ASC'
  | '_unpublishingScheduledAt_DESC'
  | '_updatedAt_ASC'
  | '_updatedAt_DESC'
  | 'id_ASC'
  | 'id_DESC'
  | 'title_ASC'
  | 'title_DESC';

export type LegalPageRecord = RecordInterface & {
  __typename?: 'LegalPageRecord';
  _allContentLocales?: Maybe<Array<LegalPageModelContentFieldMultiLocaleField>>;
  _allSeoAnalysisLocales?: Maybe<Array<JsonFieldMultiLocaleField>>;
  _allSeoSettingsSocialLocales?: Maybe<Array<SeoFieldMultiLocaleField>>;
  _allTitleLocales?: Maybe<Array<StringMultiLocaleField>>;
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _locales: Array<SiteLocale>;
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  content?: Maybe<LegalPageModelContentField>;
  id: Scalars['ItemId']['output'];
  seoAnalysis?: Maybe<Scalars['JsonField']['output']>;
  seoSettingsSocial?: Maybe<SeoField>;
  slug?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};


export type LegalPageRecord_AllContentLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type LegalPageRecord_AllSeoAnalysisLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type LegalPageRecord_AllSeoSettingsSocialLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type LegalPageRecord_AllTitleLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type LegalPageRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


export type LegalPageRecordContentArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type LegalPageRecordSeoAnalysisArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type LegalPageRecordSeoSettingsSocialArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type LegalPageRecordTitleArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};

export type LinkFilter = {
  eq?: InputMaybe<Scalars['ItemId']['input']>;
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['ItemId']['input']>>>;
  neq?: InputMaybe<Scalars['ItemId']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['ItemId']['input']>>>;
};

export type LinkRecord = RecordInterface & {
  __typename?: 'LinkRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  ctaLabel?: Maybe<Scalars['String']['output']>;
  ctaLinkAria?: Maybe<Scalars['String']['output']>;
  externalLink?: Maybe<Scalars['String']['output']>;
  id: Scalars['ItemId']['output'];
  internalLinkAuthor?: Maybe<AuthorRecord>;
  internalLinkCategory?: Maybe<CategoryRecord>;
  internalLinkCollection?: Maybe<CollectionPageRecord>;
  internalLinkPage?: Maybe<PageRecord>;
  internalLinkPost?: Maybe<PostRecord>;
  internalLinkProduct?: Maybe<ProductPageRecord>;
  openInNewTab: Scalars['BooleanType']['output'];
  typeContent?: Maybe<Scalars['String']['output']>;
};


export type LinkRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type LinksFilter = {
  allIn?: InputMaybe<Array<InputMaybe<Scalars['ItemId']['input']>>>;
  anyIn?: InputMaybe<Array<InputMaybe<Scalars['ItemId']['input']>>>;
  eq?: InputMaybe<Array<InputMaybe<Scalars['ItemId']['input']>>>;
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['ItemId']['input']>>>;
};

export type LocalesFilter = {
  allIn?: InputMaybe<Array<SiteLocale>>;
  anyIn?: InputMaybe<Array<SiteLocale>>;
  notIn?: InputMaybe<Array<SiteLocale>>;
};

export type LogoGridRecord = RecordInterface & {
  __typename?: 'LogoGridRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  grayscale: Scalars['BooleanType']['output'];
  id: Scalars['ItemId']['output'];
  layoutStyle?: Maybe<Scalars['String']['output']>;
  logos: Array<ImageBlockRecord>;
  textHeaderSection: Array<TextHeaderRecord>;
};


export type LogoGridRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type MuxThumbnailFitMode =
  | 'crop'
  | 'pad'
  | 'preserve'
  | 'smartcrop'
  | 'stretch';

export type MuxThumbnailFormatType =
  | 'gif'
  | 'jpg'
  | 'png';

export type MuxThumbnailRotation =
  | 'ROTATE_90'
  | 'ROTATE_180'
  | 'ROTATE_270';

export type NavItemModularRecord = RecordInterface & {
  __typename?: 'NavItemModularRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  id: Scalars['ItemId']['output'];
  navItemLabel?: Maybe<Scalars['String']['output']>;
  navItemLink?: Maybe<Scalars['String']['output']>;
  navItemLinkAria?: Maybe<Scalars['String']['output']>;
  openInNewTab: Scalars['BooleanType']['output'];
  submenu: Array<NavItemModularRecord>;
};


export type NavItemModularRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type NavItemModularRecordListListNonNullMultiLocaleField = {
  __typename?: 'NavItemModularRecordListListNonNullMultiLocaleField';
  locale?: Maybe<SiteLocale>;
  value: Array<NavItemModularRecord>;
};

export type NavItemSimpleRecord = RecordInterface & {
  __typename?: 'NavItemSimpleRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  id: Scalars['ItemId']['output'];
  navItemLabel?: Maybe<Scalars['String']['output']>;
  navItemLink?: Maybe<Scalars['String']['output']>;
  navItemLinkAria?: Maybe<Scalars['String']['output']>;
  openInNewTab: Scalars['BooleanType']['output'];
  submenu: Array<NavItemModularRecord>;
};


export type NavItemSimpleRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type NavItemSimpleRecordListListNonNullMultiLocaleField = {
  __typename?: 'NavItemSimpleRecordListListNonNullMultiLocaleField';
  locale?: Maybe<SiteLocale>;
  value: Array<NavItemSimpleRecord>;
};

export type NavigationModelCopyrightTextField = {
  __typename?: 'NavigationModelCopyrightTextField';
  blocks: Array<Scalars['String']['output']>;
  inlineBlocks: Array<Scalars['String']['output']>;
  links: Array<Scalars['String']['output']>;
  value: Scalars['JsonField']['output'];
};

export type NavigationModelCopyrightTextFieldMultiLocaleField = {
  __typename?: 'NavigationModelCopyrightTextFieldMultiLocaleField';
  locale?: Maybe<SiteLocale>;
  value?: Maybe<NavigationModelCopyrightTextField>;
};

export type NavigationRecord = RecordInterface & {
  __typename?: 'NavigationRecord';
  _allCopyrightTextLocales?: Maybe<Array<NavigationModelCopyrightTextFieldMultiLocaleField>>;
  _allFooterMenuLocales?: Maybe<Array<NavItemModularRecordListListNonNullMultiLocaleField>>;
  _allHeaderSearchPlaceholderLocales?: Maybe<Array<StringMultiLocaleField>>;
  _allHeaderSearchSubmitLabelLocales?: Maybe<Array<StringMultiLocaleField>>;
  _allLegalLinksLocales?: Maybe<Array<NavItemSimpleRecordListListNonNullMultiLocaleField>>;
  _allMenuLinksLocales?: Maybe<Array<NavItemModularRecordListListNonNullMultiLocaleField>>;
  _allSocialLinksLocales?: Maybe<Array<SocialLinkRecordListListNonNullMultiLocaleField>>;
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _locales: Array<SiteLocale>;
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  copyrightText?: Maybe<NavigationModelCopyrightTextField>;
  defaultTheme?: Maybe<Scalars['String']['output']>;
  footerLogo?: Maybe<FileField>;
  footerMenu: Array<NavItemModularRecord>;
  headerSearchPlaceholder?: Maybe<Scalars['String']['output']>;
  headerSearchSubmitLabel?: Maybe<Scalars['String']['output']>;
  id: Scalars['ItemId']['output'];
  legalLinks: Array<NavItemSimpleRecord>;
  logo?: Maybe<FileField>;
  menuLinks: Array<NavItemModularRecord>;
  showHeaderSearch: Scalars['BooleanType']['output'];
  showThemeToggle: Scalars['BooleanType']['output'];
  socialLinks: Array<SocialLinkRecord>;
};


export type NavigationRecord_AllCopyrightTextLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type NavigationRecord_AllFooterMenuLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type NavigationRecord_AllHeaderSearchPlaceholderLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type NavigationRecord_AllHeaderSearchSubmitLabelLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type NavigationRecord_AllLegalLinksLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type NavigationRecord_AllMenuLinksLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type NavigationRecord_AllSocialLinksLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type NavigationRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


export type NavigationRecordCopyrightTextArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type NavigationRecordFooterMenuArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type NavigationRecordHeaderSearchPlaceholderArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type NavigationRecordHeaderSearchSubmitLabelArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type NavigationRecordLegalLinksArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type NavigationRecordMenuLinksArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type NavigationRecordSocialLinksArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};

export type OrientationFilter = {
  eq?: InputMaybe<UploadOrientation>;
  neq?: InputMaybe<UploadOrientation>;
};

export type PageModelContentPageField = ContactFormSectionRecord | ContentListingSectionRecord | CtaBannerRecord | FaqGroupRecord | FeatureGridRecord | LogoGridRecord | PricingSectionRecord | ReviewsSectionRecord | SearchSectionRecord | StatsSectionRecord | StepsSectionRecord | TabsSectionRecord | TeamSectionRecord | TextSectionRecord;

export type PageModelContentPageFieldListListNonNullMultiLocaleField = {
  __typename?: 'PageModelContentPageFieldListListNonNullMultiLocaleField';
  locale?: Maybe<SiteLocale>;
  value: Array<PageModelContentPageField>;
};

export type PageModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<PageModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<PageModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _locales?: InputMaybe<LocalesFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  id?: InputMaybe<ItemIdFilter>;
  seoAnalysis?: InputMaybe<JsonFilter>;
  seoSettingsSocial?: InputMaybe<SeoFilter>;
  slug?: InputMaybe<SlugFilter>;
  title?: InputMaybe<StringFilter>;
};

export type PageModelOrderBy =
  | '_createdAt_ASC'
  | '_createdAt_DESC'
  | '_firstPublishedAt_ASC'
  | '_firstPublishedAt_DESC'
  | '_isValid_ASC'
  | '_isValid_DESC'
  | '_publicationScheduledAt_ASC'
  | '_publicationScheduledAt_DESC'
  | '_publishedAt_ASC'
  | '_publishedAt_DESC'
  | '_status_ASC'
  | '_status_DESC'
  | '_unpublishingScheduledAt_ASC'
  | '_unpublishingScheduledAt_DESC'
  | '_updatedAt_ASC'
  | '_updatedAt_DESC'
  | 'id_ASC'
  | 'id_DESC'
  | 'title_ASC'
  | 'title_DESC';

export type PageRecord = RecordInterface & {
  __typename?: 'PageRecord';
  _allContentPageLocales?: Maybe<Array<PageModelContentPageFieldListListNonNullMultiLocaleField>>;
  _allHeroPageLocales?: Maybe<Array<HeroSectionRecordMultiLocaleField>>;
  _allSeoAnalysisLocales?: Maybe<Array<JsonFieldMultiLocaleField>>;
  _allSeoSettingsSocialLocales?: Maybe<Array<SeoFieldMultiLocaleField>>;
  _allSlugLocales?: Maybe<Array<StringMultiLocaleField>>;
  _allTitleLocales?: Maybe<Array<StringMultiLocaleField>>;
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _locales: Array<SiteLocale>;
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  contentPage: Array<PageModelContentPageField>;
  heroPage?: Maybe<HeroSectionRecord>;
  id: Scalars['ItemId']['output'];
  seoAnalysis?: Maybe<Scalars['JsonField']['output']>;
  seoSettingsSocial?: Maybe<SeoField>;
  slug?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};


export type PageRecord_AllContentPageLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type PageRecord_AllHeroPageLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type PageRecord_AllSeoAnalysisLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type PageRecord_AllSeoSettingsSocialLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type PageRecord_AllSlugLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type PageRecord_AllTitleLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type PageRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


export type PageRecordContentPageArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type PageRecordHeroPageArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type PageRecordSeoAnalysisArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type PageRecordSeoSettingsSocialArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type PageRecordSlugArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type PageRecordTitleArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};

export type PostModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<PostModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<PostModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _locales?: InputMaybe<LocalesFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  excerpt?: InputMaybe<TextFilter>;
  id?: InputMaybe<ItemIdFilter>;
  postAuthor?: InputMaybe<LinkFilter>;
  postCategory?: InputMaybe<LinksFilter>;
  postContent?: InputMaybe<StructuredTextFilter>;
  postSlug?: InputMaybe<SlugFilter>;
  postTitle?: InputMaybe<StringFilter>;
  seoAnalysis?: InputMaybe<JsonFilter>;
  seoSettingsSocial?: InputMaybe<SeoFilter>;
};

export type PostModelOrderBy =
  | '_createdAt_ASC'
  | '_createdAt_DESC'
  | '_firstPublishedAt_ASC'
  | '_firstPublishedAt_DESC'
  | '_isValid_ASC'
  | '_isValid_DESC'
  | '_publicationScheduledAt_ASC'
  | '_publicationScheduledAt_DESC'
  | '_publishedAt_ASC'
  | '_publishedAt_DESC'
  | '_status_ASC'
  | '_status_DESC'
  | '_unpublishingScheduledAt_ASC'
  | '_unpublishingScheduledAt_DESC'
  | '_updatedAt_ASC'
  | '_updatedAt_DESC'
  | 'id_ASC'
  | 'id_DESC'
  | 'postTitle_ASC'
  | 'postTitle_DESC';

export type PostModelPostContentBlocksField = ContentListingSectionRecord | ImageBlockRecord | ImageGalleryBlockRecord | VideoBlockRecord;

export type PostModelPostContentField = {
  __typename?: 'PostModelPostContentField';
  blocks: Array<PostModelPostContentBlocksField>;
  inlineBlocks: Array<Scalars['String']['output']>;
  links: Array<PageRecord>;
  value: Scalars['JsonField']['output'];
};

export type PostModelPostContentFieldMultiLocaleField = {
  __typename?: 'PostModelPostContentFieldMultiLocaleField';
  locale?: Maybe<SiteLocale>;
  value?: Maybe<PostModelPostContentField>;
};

export type PostRecord = RecordInterface & {
  __typename?: 'PostRecord';
  _allExcerptLocales?: Maybe<Array<StringMultiLocaleField>>;
  _allPostContentLocales?: Maybe<Array<PostModelPostContentFieldMultiLocaleField>>;
  _allPostSlugLocales?: Maybe<Array<StringMultiLocaleField>>;
  _allPostTitleLocales?: Maybe<Array<StringMultiLocaleField>>;
  _allSeoAnalysisLocales?: Maybe<Array<JsonFieldMultiLocaleField>>;
  _allSeoSettingsSocialLocales?: Maybe<Array<SeoFieldMultiLocaleField>>;
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _locales: Array<SiteLocale>;
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  coverImage?: Maybe<CardImageBlockRecord>;
  excerpt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ItemId']['output'];
  postAuthor?: Maybe<AuthorRecord>;
  postCategory: Array<CategoryRecord>;
  postContent?: Maybe<PostModelPostContentField>;
  postSlug?: Maybe<Scalars['String']['output']>;
  postTitle?: Maybe<Scalars['String']['output']>;
  seoAnalysis?: Maybe<Scalars['JsonField']['output']>;
  seoSettingsSocial?: Maybe<SeoField>;
};


export type PostRecord_AllExcerptLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  markdown?: InputMaybe<Scalars['Boolean']['input']>;
};


export type PostRecord_AllPostContentLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type PostRecord_AllPostSlugLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type PostRecord_AllPostTitleLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type PostRecord_AllSeoAnalysisLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type PostRecord_AllSeoSettingsSocialLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type PostRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


export type PostRecordExcerptArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
  markdown?: InputMaybe<Scalars['Boolean']['input']>;
};


export type PostRecordPostContentArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type PostRecordPostSlugArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type PostRecordPostTitleArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type PostRecordSeoAnalysisArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type PostRecordSeoSettingsSocialArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};

export type PricingCardRecord = RecordInterface & {
  __typename?: 'PricingCardRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  amount?: Maybe<Scalars['FloatType']['output']>;
  billingPeriod?: Maybe<Scalars['String']['output']>;
  ctaButton: Array<LinkRecord>;
  currency?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  features?: Maybe<Scalars['String']['output']>;
  hasButton: Scalars['BooleanType']['output'];
  hasDescription: Scalars['BooleanType']['output'];
  id: Scalars['ItemId']['output'];
  isPopular: Scalars['BooleanType']['output'];
  name?: Maybe<Scalars['String']['output']>;
  priceType?: Maybe<Scalars['String']['output']>;
};


export type PricingCardRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


export type PricingCardRecordFeaturesArgs = {
  markdown?: InputMaybe<Scalars['Boolean']['input']>;
};

export type PricingSectionRecord = RecordInterface & {
  __typename?: 'PricingSectionRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  id: Scalars['ItemId']['output'];
  plans: Array<PricingCardRecord>;
  textHeaderSection: Array<TextHeaderRecord>;
};


export type PricingSectionRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type ProductPageModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<ProductPageModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ProductPageModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _locales?: InputMaybe<LocalesFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  description?: InputMaybe<TextFilter>;
  id?: InputMaybe<ItemIdFilter>;
  seo?: InputMaybe<SeoFilter>;
  shopifyHandle?: InputMaybe<SlugFilter>;
  shopifyProductId?: InputMaybe<StringFilter>;
  title?: InputMaybe<StringFilter>;
};

export type ProductPageModelOrderBy =
  | '_createdAt_ASC'
  | '_createdAt_DESC'
  | '_firstPublishedAt_ASC'
  | '_firstPublishedAt_DESC'
  | '_isValid_ASC'
  | '_isValid_DESC'
  | '_publicationScheduledAt_ASC'
  | '_publicationScheduledAt_DESC'
  | '_publishedAt_ASC'
  | '_publishedAt_DESC'
  | '_status_ASC'
  | '_status_DESC'
  | '_unpublishingScheduledAt_ASC'
  | '_unpublishingScheduledAt_DESC'
  | '_updatedAt_ASC'
  | '_updatedAt_DESC'
  | 'id_ASC'
  | 'id_DESC'
  | 'shopifyProductId_ASC'
  | 'shopifyProductId_DESC'
  | 'title_ASC'
  | 'title_DESC';

export type ProductPageRecord = RecordInterface & {
  __typename?: 'ProductPageRecord';
  _allDescriptionLocales?: Maybe<Array<StringMultiLocaleField>>;
  _allSeoLocales?: Maybe<Array<SeoFieldMultiLocaleField>>;
  _allTitleLocales?: Maybe<Array<StringMultiLocaleField>>;
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _locales: Array<SiteLocale>;
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ItemId']['output'];
  seo?: Maybe<SeoField>;
  shopifyHandle?: Maybe<Scalars['String']['output']>;
  shopifyProductId?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};


export type ProductPageRecord_AllDescriptionLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  markdown?: InputMaybe<Scalars['Boolean']['input']>;
};


export type ProductPageRecord_AllSeoLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type ProductPageRecord_AllTitleLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type ProductPageRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


export type ProductPageRecordDescriptionArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
  markdown?: InputMaybe<Scalars['Boolean']['input']>;
};


export type ProductPageRecordSeoArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type ProductPageRecordTitleArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};

export type PublishedAtFilter = {
  eq?: InputMaybe<Scalars['DateTime']['input']>;
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  lte?: InputMaybe<Scalars['DateTime']['input']>;
  neq?: InputMaybe<Scalars['DateTime']['input']>;
};

export type Query = {
  __typename?: 'Query';
  _allAuthorsMeta: CollectionMetadata;
  _allCategoriesMeta: CollectionMetadata;
  _allCollectionPagesMeta: CollectionMetadata;
  _allLegalPagesMeta: CollectionMetadata;
  _allPagesMeta: CollectionMetadata;
  _allPostsMeta: CollectionMetadata;
  _allProductPagesMeta: CollectionMetadata;
  _allRedirectsMeta: CollectionMetadata;
  _allSchemaMigrationsMeta: CollectionMetadata;
  _allUploadsMeta: CollectionMetadata;
  _allUserReviewsMeta: CollectionMetadata;
  _site: Site;
  allAuthors: Array<AuthorRecord>;
  allCategories: Array<CategoryRecord>;
  allCollectionPages: Array<CollectionPageRecord>;
  allLegalPages: Array<LegalPageRecord>;
  allPages: Array<PageRecord>;
  allPosts: Array<PostRecord>;
  allProductPages: Array<ProductPageRecord>;
  allRedirects: Array<RedirectRecord>;
  allSchemaMigrations: Array<SchemaMigrationRecord>;
  allUploads: Array<FileField>;
  allUserReviews: Array<UserReviewRecord>;
  author?: Maybe<AuthorRecord>;
  category?: Maybe<CategoryRecord>;
  collectionPage?: Maybe<CollectionPageRecord>;
  globalSetting?: Maybe<GlobalSettingRecord>;
  legalPage?: Maybe<LegalPageRecord>;
  navigation?: Maybe<NavigationRecord>;
  page?: Maybe<PageRecord>;
  post?: Maybe<PostRecord>;
  productPage?: Maybe<ProductPageRecord>;
  redirect?: Maybe<RedirectRecord>;
  schemaMigration?: Maybe<SchemaMigrationRecord>;
  upload?: Maybe<FileField>;
  userReview?: Maybe<UserReviewRecord>;
};


export type Query_AllAuthorsMetaArgs = {
  filter?: InputMaybe<AuthorModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


export type Query_AllCategoriesMetaArgs = {
  filter?: InputMaybe<CategoryModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


export type Query_AllCollectionPagesMetaArgs = {
  filter?: InputMaybe<CollectionPageModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


export type Query_AllLegalPagesMetaArgs = {
  filter?: InputMaybe<LegalPageModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


export type Query_AllPagesMetaArgs = {
  filter?: InputMaybe<PageModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


export type Query_AllPostsMetaArgs = {
  filter?: InputMaybe<PostModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


export type Query_AllProductPagesMetaArgs = {
  filter?: InputMaybe<ProductPageModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


export type Query_AllRedirectsMetaArgs = {
  filter?: InputMaybe<RedirectModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


export type Query_AllSchemaMigrationsMetaArgs = {
  filter?: InputMaybe<SchemaMigrationModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


export type Query_AllUploadsMetaArgs = {
  filter?: InputMaybe<UploadFilter>;
  locale?: InputMaybe<SiteLocale>;
};


export type Query_AllUserReviewsMetaArgs = {
  filter?: InputMaybe<UserReviewModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


export type Query_SiteArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type QueryAllAuthorsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<AuthorModelFilter>;
  first?: InputMaybe<Scalars['IntType']['input']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<AuthorModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']['input']>;
};


export type QueryAllCategoriesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<CategoryModelFilter>;
  first?: InputMaybe<Scalars['IntType']['input']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<CategoryModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']['input']>;
};


export type QueryAllCollectionPagesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<CollectionPageModelFilter>;
  first?: InputMaybe<Scalars['IntType']['input']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<CollectionPageModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']['input']>;
};


export type QueryAllLegalPagesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<LegalPageModelFilter>;
  first?: InputMaybe<Scalars['IntType']['input']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<LegalPageModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']['input']>;
};


export type QueryAllPagesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<PageModelFilter>;
  first?: InputMaybe<Scalars['IntType']['input']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<PageModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']['input']>;
};


export type QueryAllPostsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<PostModelFilter>;
  first?: InputMaybe<Scalars['IntType']['input']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<PostModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']['input']>;
};


export type QueryAllProductPagesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ProductPageModelFilter>;
  first?: InputMaybe<Scalars['IntType']['input']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<ProductPageModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']['input']>;
};


export type QueryAllRedirectsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<RedirectModelFilter>;
  first?: InputMaybe<Scalars['IntType']['input']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<RedirectModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']['input']>;
};


export type QueryAllSchemaMigrationsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<SchemaMigrationModelFilter>;
  first?: InputMaybe<Scalars['IntType']['input']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<SchemaMigrationModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']['input']>;
};


export type QueryAllUploadsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<UploadFilter>;
  first?: InputMaybe<Scalars['IntType']['input']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<UploadOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']['input']>;
};


export type QueryAllUserReviewsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<UserReviewModelFilter>;
  first?: InputMaybe<Scalars['IntType']['input']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<UserReviewModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']['input']>;
};


export type QueryAuthorArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<AuthorModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<AuthorModelOrderBy>>>;
};


export type QueryCategoryArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<CategoryModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<CategoryModelOrderBy>>>;
};


export type QueryCollectionPageArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<CollectionPageModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<CollectionPageModelOrderBy>>>;
};


export type QueryGlobalSettingArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type QueryLegalPageArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<LegalPageModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<LegalPageModelOrderBy>>>;
};


export type QueryNavigationArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type QueryPageArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<PageModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<PageModelOrderBy>>>;
};


export type QueryPostArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<PostModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<PostModelOrderBy>>>;
};


export type QueryProductPageArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ProductPageModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<ProductPageModelOrderBy>>>;
};


export type QueryRedirectArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<RedirectModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<RedirectModelOrderBy>>>;
};


export type QuerySchemaMigrationArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<SchemaMigrationModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<SchemaMigrationModelOrderBy>>>;
};


export type QueryUploadArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<UploadFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<UploadOrderBy>>>;
};


export type QueryUserReviewArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<UserReviewModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<UserReviewModelOrderBy>>>;
};

export type RecordInterface = {
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  id: Scalars['ItemId']['output'];
};


export type RecordInterface_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type RedirectModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<RedirectModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<RedirectModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  fromPathRedirect?: InputMaybe<StringFilter>;
  id?: InputMaybe<ItemIdFilter>;
  statusRedirect?: InputMaybe<StringFilter>;
  toPathRedirect?: InputMaybe<StringFilter>;
};

export type RedirectModelOrderBy =
  | '_createdAt_ASC'
  | '_createdAt_DESC'
  | '_firstPublishedAt_ASC'
  | '_firstPublishedAt_DESC'
  | '_isValid_ASC'
  | '_isValid_DESC'
  | '_publicationScheduledAt_ASC'
  | '_publicationScheduledAt_DESC'
  | '_publishedAt_ASC'
  | '_publishedAt_DESC'
  | '_status_ASC'
  | '_status_DESC'
  | '_unpublishingScheduledAt_ASC'
  | '_unpublishingScheduledAt_DESC'
  | '_updatedAt_ASC'
  | '_updatedAt_DESC'
  | 'fromPathRedirect_ASC'
  | 'fromPathRedirect_DESC'
  | 'id_ASC'
  | 'id_DESC'
  | 'statusRedirect_ASC'
  | 'statusRedirect_DESC'
  | 'toPathRedirect_ASC'
  | 'toPathRedirect_DESC';

export type RedirectRecord = RecordInterface & {
  __typename?: 'RedirectRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  fromPathRedirect?: Maybe<Scalars['String']['output']>;
  id: Scalars['ItemId']['output'];
  statusRedirect?: Maybe<Scalars['String']['output']>;
  toPathRedirect?: Maybe<Scalars['String']['output']>;
};


export type RedirectRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type ResolutionFilter = {
  eq?: InputMaybe<ResolutionType>;
  in?: InputMaybe<Array<InputMaybe<ResolutionType>>>;
  neq?: InputMaybe<ResolutionType>;
  notIn?: InputMaybe<Array<InputMaybe<ResolutionType>>>;
};

export type ResolutionType =
  | 'icon'
  | 'large'
  | 'medium'
  | 'small';

export type ResponsiveImage = {
  __typename?: 'ResponsiveImage';
  alt?: Maybe<Scalars['String']['output']>;
  aspectRatio: Scalars['FloatType']['output'];
  base64?: Maybe<Scalars['String']['output']>;
  bgColor?: Maybe<Scalars['String']['output']>;
  height: Scalars['IntType']['output'];
  sizes: Scalars['String']['output'];
  src: Scalars['String']['output'];
  srcSet: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
  webpSrcSet: Scalars['String']['output'];
  width: Scalars['IntType']['output'];
};

export type ReviewsSectionRecord = RecordInterface & {
  __typename?: 'ReviewsSectionRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  allowSubmissions: Scalars['BooleanType']['output'];
  id: Scalars['ItemId']['output'];
  reviews: Array<UserReviewRecord>;
  textHeaderSection: Array<TextHeaderRecord>;
};


export type ReviewsSectionRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type SchemaMigrationModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<SchemaMigrationModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<SchemaMigrationModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  id?: InputMaybe<ItemIdFilter>;
  name?: InputMaybe<StringFilter>;
};

export type SchemaMigrationModelOrderBy =
  | '_createdAt_ASC'
  | '_createdAt_DESC'
  | '_firstPublishedAt_ASC'
  | '_firstPublishedAt_DESC'
  | '_isValid_ASC'
  | '_isValid_DESC'
  | '_publicationScheduledAt_ASC'
  | '_publicationScheduledAt_DESC'
  | '_publishedAt_ASC'
  | '_publishedAt_DESC'
  | '_status_ASC'
  | '_status_DESC'
  | '_unpublishingScheduledAt_ASC'
  | '_unpublishingScheduledAt_DESC'
  | '_updatedAt_ASC'
  | '_updatedAt_DESC'
  | 'id_ASC'
  | 'id_DESC'
  | 'name_ASC'
  | 'name_DESC';

export type SchemaMigrationRecord = RecordInterface & {
  __typename?: 'SchemaMigrationRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  id: Scalars['ItemId']['output'];
  name?: Maybe<Scalars['String']['output']>;
};


export type SchemaMigrationRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type SearchSectionModelIntroField = {
  __typename?: 'SearchSectionModelIntroField';
  blocks: Array<Scalars['String']['output']>;
  inlineBlocks: Array<Scalars['String']['output']>;
  links: Array<PageRecord>;
  value: Scalars['JsonField']['output'];
};

export type SearchSectionRecord = RecordInterface & {
  __typename?: 'SearchSectionRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  emptyHint?: Maybe<Scalars['String']['output']>;
  hasTextHeader: Scalars['BooleanType']['output'];
  id: Scalars['ItemId']['output'];
  intro?: Maybe<SearchSectionModelIntroField>;
  noResults?: Maybe<Scalars['String']['output']>;
  placeholder?: Maybe<Scalars['String']['output']>;
  submitLabel?: Maybe<Scalars['String']['output']>;
  textHeaderSection: Array<TextHeaderRecord>;
};


export type SearchSectionRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type SeoField = {
  __typename?: 'SeoField';
  description?: Maybe<Scalars['String']['output']>;
  image?: Maybe<FileField>;
  noIndex?: Maybe<Scalars['BooleanType']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  twitterCard?: Maybe<Scalars['String']['output']>;
};

export type SeoFieldMultiLocaleField = {
  __typename?: 'SeoFieldMultiLocaleField';
  locale?: Maybe<SiteLocale>;
  value?: Maybe<SeoField>;
};

export type SeoFilter = {
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
};

export type ShopifyListingConfigRecord = RecordInterface & {
  __typename?: 'ShopifyListingConfigRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  collectionFilter?: Maybe<Scalars['String']['output']>;
  fetchMode?: Maybe<Scalars['String']['output']>;
  id: Scalars['ItemId']['output'];
  selectedProducts: Array<ProductPageRecord>;
  sourceCollection?: Maybe<CollectionPageRecord>;
};


export type ShopifyListingConfigRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type Site = {
  __typename?: 'Site';
  favicon?: Maybe<FileField>;
  faviconMetaTags: Array<Tag>;
  globalSeo?: Maybe<GlobalSeoField>;
  locales: Array<SiteLocale>;
  noIndex?: Maybe<Scalars['BooleanType']['output']>;
};


export type SiteFaviconMetaTagsArgs = {
  variants?: InputMaybe<Array<InputMaybe<FaviconType>>>;
};


export type SiteGlobalSeoArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};

export type SiteLocale =
  | 'en'
  | 'es'
  | 'pt_BR';

export type SlugFilter = {
  eq?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  neq?: InputMaybe<Scalars['String']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type SocialLinkRecord = RecordInterface & {
  __typename?: 'SocialLinkRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  id: Scalars['ItemId']['output'];
  image?: Maybe<FileField>;
  linkAria?: Maybe<Scalars['String']['output']>;
  openInNewTab: Scalars['BooleanType']['output'];
  plataforma?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};


export type SocialLinkRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type SocialLinkRecordListListNonNullMultiLocaleField = {
  __typename?: 'SocialLinkRecordListListNonNullMultiLocaleField';
  locale?: Maybe<SiteLocale>;
  value: Array<SocialLinkRecord>;
};

export type StatCardRecord = RecordInterface & {
  __typename?: 'StatCardRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  hasDescription: Scalars['BooleanType']['output'];
  id: Scalars['ItemId']['output'];
  label?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};


export type StatCardRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type StatsSectionRecord = RecordInterface & {
  __typename?: 'StatsSectionRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  id: Scalars['ItemId']['output'];
  stats: Array<StatCardRecord>;
  textHeaderSection: Array<TextHeaderRecord>;
};


export type StatsSectionRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type StatusFilter = {
  eq?: InputMaybe<ItemStatus>;
  in?: InputMaybe<Array<InputMaybe<ItemStatus>>>;
  neq?: InputMaybe<ItemStatus>;
  notIn?: InputMaybe<Array<InputMaybe<ItemStatus>>>;
};

export type StepCardRecord = RecordInterface & {
  __typename?: 'StepCardRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  hasDescription: Scalars['BooleanType']['output'];
  hasImage: Scalars['BooleanType']['output'];
  id: Scalars['ItemId']['output'];
  mediaImage: Array<CardImageBlockRecord>;
  title?: Maybe<Scalars['String']['output']>;
};


export type StepCardRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


export type StepCardRecordDescriptionArgs = {
  markdown?: InputMaybe<Scalars['Boolean']['input']>;
};

export type StepsSectionRecord = RecordInterface & {
  __typename?: 'StepsSectionRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  id: Scalars['ItemId']['output'];
  steps: Array<StepCardRecord>;
  textHeaderSection: Array<TextHeaderRecord>;
};


export type StepsSectionRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type StringFilter = {
  eq?: InputMaybe<Scalars['String']['input']>;
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isBlank?: InputMaybe<Scalars['BooleanType']['input']>;
  isPresent?: InputMaybe<Scalars['BooleanType']['input']>;
  matches?: InputMaybe<StringMatchesFilter>;
  neq?: InputMaybe<Scalars['String']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  notMatches?: InputMaybe<StringMatchesFilter>;
};

export type StringMatchesFilter = {
  caseSensitive?: InputMaybe<Scalars['BooleanType']['input']>;
  pattern: Scalars['String']['input'];
  regexp?: InputMaybe<Scalars['BooleanType']['input']>;
};

export type StringMultiLocaleField = {
  __typename?: 'StringMultiLocaleField';
  locale?: Maybe<SiteLocale>;
  value?: Maybe<Scalars['String']['output']>;
};

export type StructuredTextFilter = {
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
  isBlank?: InputMaybe<Scalars['BooleanType']['input']>;
  isPresent?: InputMaybe<Scalars['BooleanType']['input']>;
  matches?: InputMaybe<StringMatchesFilter>;
  notMatches?: InputMaybe<StringMatchesFilter>;
};

export type TabItemRecord = RecordInterface & {
  __typename?: 'TabItemRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  ctaLink?: Maybe<LinkRecord>;
  description?: Maybe<Scalars['String']['output']>;
  hasDescription: Scalars['BooleanType']['output'];
  hasImage: Scalars['BooleanType']['output'];
  hasLink: Scalars['BooleanType']['output'];
  id: Scalars['ItemId']['output'];
  labelTab?: Maybe<Scalars['String']['output']>;
  mediaImage?: Maybe<CardImageBlockRecord>;
  title?: Maybe<Scalars['String']['output']>;
};


export type TabItemRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


export type TabItemRecordDescriptionArgs = {
  markdown?: InputMaybe<Scalars['Boolean']['input']>;
};

export type TabsSectionRecord = RecordInterface & {
  __typename?: 'TabsSectionRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  id: Scalars['ItemId']['output'];
  tabs: Array<TabItemRecord>;
  textHeaderSection: Array<TextHeaderRecord>;
};


export type TabsSectionRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type Tag = {
  __typename?: 'Tag';
  attributes?: Maybe<Scalars['MetaTagAttributes']['output']>;
  content?: Maybe<Scalars['String']['output']>;
  tag: Scalars['String']['output'];
};

export type TeamSectionRecord = RecordInterface & {
  __typename?: 'TeamSectionRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  id: Scalars['ItemId']['output'];
  members: Array<AuthorRecord>;
  textHeaderSection: Array<TextHeaderRecord>;
};


export type TeamSectionRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type TextFilter = {
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
  isBlank?: InputMaybe<Scalars['BooleanType']['input']>;
  isPresent?: InputMaybe<Scalars['BooleanType']['input']>;
  matches?: InputMaybe<StringMatchesFilter>;
  notMatches?: InputMaybe<StringMatchesFilter>;
};

export type TextHeaderRecord = RecordInterface & {
  __typename?: 'TextHeaderRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  hasDescription: Scalars['BooleanType']['output'];
  hasSectionId: Scalars['BooleanType']['output'];
  id: Scalars['ItemId']['output'];
  sectionId?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};


export type TextHeaderRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type TextSectionModelBodyBlocksField = ImageBlockRecord | ImageGalleryBlockRecord | VideoBlockRecord;

export type TextSectionModelBodyField = {
  __typename?: 'TextSectionModelBodyField';
  blocks: Array<TextSectionModelBodyBlocksField>;
  inlineBlocks: Array<Scalars['String']['output']>;
  links: Array<PageRecord>;
  value: Scalars['JsonField']['output'];
};

export type TextSectionRecord = RecordInterface & {
  __typename?: 'TextSectionRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  body?: Maybe<TextSectionModelBodyField>;
  hasTextHeader: Scalars['BooleanType']['output'];
  id: Scalars['ItemId']['output'];
  textHeaderSection: Array<TextHeaderRecord>;
};


export type TextSectionRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type TypeFilter = {
  eq?: InputMaybe<UploadType>;
  in?: InputMaybe<Array<InputMaybe<UploadType>>>;
  neq?: InputMaybe<UploadType>;
  notIn?: InputMaybe<Array<InputMaybe<UploadType>>>;
};

export type UpdatedAtFilter = {
  eq?: InputMaybe<Scalars['DateTime']['input']>;
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  lte?: InputMaybe<Scalars['DateTime']['input']>;
  neq?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UploadAltFilter = {
  eq?: InputMaybe<Scalars['String']['input']>;
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  matches?: InputMaybe<StringMatchesFilter>;
  neq?: InputMaybe<Scalars['String']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  notMatches?: InputMaybe<StringMatchesFilter>;
};

export type UploadAuthorFilter = {
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
  matches?: InputMaybe<StringMatchesFilter>;
  notMatches?: InputMaybe<StringMatchesFilter>;
};

export type UploadBasenameFilter = {
  matches?: InputMaybe<StringMatchesFilter>;
  notMatches?: InputMaybe<StringMatchesFilter>;
};

export type UploadColorsFilter = {
  allIn?: InputMaybe<Array<InputMaybe<ColorBucketType>>>;
  anyIn?: InputMaybe<Array<InputMaybe<ColorBucketType>>>;
  contains?: InputMaybe<ColorBucketType>;
  eq?: InputMaybe<Array<InputMaybe<ColorBucketType>>>;
  notIn?: InputMaybe<Array<InputMaybe<ColorBucketType>>>;
};

export type UploadCopyrightFilter = {
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
  matches?: InputMaybe<StringMatchesFilter>;
  notMatches?: InputMaybe<StringMatchesFilter>;
};

export type UploadCreatedAtFilter = {
  eq?: InputMaybe<Scalars['DateTime']['input']>;
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  lte?: InputMaybe<Scalars['DateTime']['input']>;
  neq?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UploadFilenameFilter = {
  matches?: InputMaybe<StringMatchesFilter>;
  notMatches?: InputMaybe<StringMatchesFilter>;
};

export type UploadFilter = {
  AND?: InputMaybe<Array<InputMaybe<UploadFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<UploadFilter>>>;
  _createdAt?: InputMaybe<UploadCreatedAtFilter>;
  _updatedAt?: InputMaybe<UploadUpdatedAtFilter>;
  alt?: InputMaybe<UploadAltFilter>;
  author?: InputMaybe<UploadAuthorFilter>;
  basename?: InputMaybe<UploadBasenameFilter>;
  colors?: InputMaybe<UploadColorsFilter>;
  copyright?: InputMaybe<UploadCopyrightFilter>;
  filename?: InputMaybe<UploadFilenameFilter>;
  format?: InputMaybe<UploadFormatFilter>;
  height?: InputMaybe<UploadHeightFilter>;
  id?: InputMaybe<UploadIdFilter>;
  inUse?: InputMaybe<InUseFilter>;
  md5?: InputMaybe<UploadMd5Filter>;
  mimeType?: InputMaybe<UploadMimeTypeFilter>;
  notes?: InputMaybe<UploadNotesFilter>;
  orientation?: InputMaybe<OrientationFilter>;
  path?: InputMaybe<UploadPathFilter>;
  resolution?: InputMaybe<ResolutionFilter>;
  size?: InputMaybe<UploadSizeFilter>;
  smartTags?: InputMaybe<UploadTagsFilter>;
  tags?: InputMaybe<UploadTagsFilter>;
  title?: InputMaybe<UploadTitleFilter>;
  type?: InputMaybe<TypeFilter>;
  width?: InputMaybe<UploadWidthFilter>;
};

export type UploadFormatFilter = {
  eq?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  neq?: InputMaybe<Scalars['String']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UploadHeightFilter = {
  eq?: InputMaybe<Scalars['IntType']['input']>;
  gt?: InputMaybe<Scalars['IntType']['input']>;
  gte?: InputMaybe<Scalars['IntType']['input']>;
  lt?: InputMaybe<Scalars['IntType']['input']>;
  lte?: InputMaybe<Scalars['IntType']['input']>;
  neq?: InputMaybe<Scalars['IntType']['input']>;
};

export type UploadIdFilter = {
  eq?: InputMaybe<Scalars['UploadId']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['UploadId']['input']>>>;
  neq?: InputMaybe<Scalars['UploadId']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['UploadId']['input']>>>;
};

export type UploadMd5Filter = {
  eq?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  neq?: InputMaybe<Scalars['String']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UploadMimeTypeFilter = {
  eq?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  matches?: InputMaybe<StringMatchesFilter>;
  neq?: InputMaybe<Scalars['String']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  notMatches?: InputMaybe<StringMatchesFilter>;
};

export type UploadNotesFilter = {
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
  matches?: InputMaybe<StringMatchesFilter>;
  notMatches?: InputMaybe<StringMatchesFilter>;
};

export type UploadOrderBy =
  | '_createdAt_ASC'
  | '_createdAt_DESC'
  | '_updatedAt_ASC'
  | '_updatedAt_DESC'
  | 'basename_ASC'
  | 'basename_DESC'
  | 'filename_ASC'
  | 'filename_DESC'
  | 'format_ASC'
  | 'format_DESC'
  | 'id_ASC'
  | 'id_DESC'
  | 'mimeType_ASC'
  | 'mimeType_DESC'
  | 'resolution_ASC'
  | 'resolution_DESC'
  | 'size_ASC'
  | 'size_DESC';

export type UploadOrientation =
  | 'landscape'
  | 'portrait'
  | 'square';

export type UploadPathFilter = {
  eq?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  neq?: InputMaybe<Scalars['String']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UploadSizeFilter = {
  eq?: InputMaybe<Scalars['IntType']['input']>;
  gt?: InputMaybe<Scalars['IntType']['input']>;
  gte?: InputMaybe<Scalars['IntType']['input']>;
  lt?: InputMaybe<Scalars['IntType']['input']>;
  lte?: InputMaybe<Scalars['IntType']['input']>;
  neq?: InputMaybe<Scalars['IntType']['input']>;
};

export type UploadTagsFilter = {
  allIn?: InputMaybe<Array<Scalars['String']['input']>>;
  anyIn?: InputMaybe<Array<Scalars['String']['input']>>;
  contains?: InputMaybe<Scalars['String']['input']>;
  eq?: InputMaybe<Array<Scalars['String']['input']>>;
  notIn?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UploadTitleFilter = {
  eq?: InputMaybe<Scalars['String']['input']>;
  exists?: InputMaybe<Scalars['BooleanType']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  matches?: InputMaybe<StringMatchesFilter>;
  neq?: InputMaybe<Scalars['String']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  notMatches?: InputMaybe<StringMatchesFilter>;
};

export type UploadType =
  | 'archive'
  | 'audio'
  | 'image'
  | 'pdfdocument'
  | 'presentation'
  | 'richtext'
  | 'spreadsheet'
  | 'video';

export type UploadUpdatedAtFilter = {
  eq?: InputMaybe<Scalars['DateTime']['input']>;
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  lte?: InputMaybe<Scalars['DateTime']['input']>;
  neq?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UploadVideoField = {
  __typename?: 'UploadVideoField';
  alt?: Maybe<Scalars['String']['output']>;
  blurUpThumb?: Maybe<Scalars['String']['output']>;
  blurhash?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['Int']['output']>;
  framerate?: Maybe<Scalars['Int']['output']>;
  height: Scalars['IntType']['output'];
  mp4Url?: Maybe<Scalars['String']['output']>;
  muxAssetId: Scalars['String']['output'];
  muxPlaybackId: Scalars['String']['output'];
  posterTime?: Maybe<Scalars['Float']['output']>;
  streamingUrl: Scalars['String']['output'];
  thumbhash?: Maybe<Scalars['String']['output']>;
  thumbnailUrl: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
  width: Scalars['IntType']['output'];
};


export type UploadVideoFieldAltArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type UploadVideoFieldBlurUpThumbArgs = {
  imgixParams?: InputMaybe<ImgixParams>;
  punch?: InputMaybe<Scalars['Float']['input']>;
  quality?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


export type UploadVideoFieldMp4UrlArgs = {
  exactRes?: InputMaybe<VideoMp4Res>;
  res?: InputMaybe<VideoMp4Res>;
};


export type UploadVideoFieldThumbnailUrlArgs = {
  fitMode?: InputMaybe<MuxThumbnailFitMode>;
  flipH?: InputMaybe<Scalars['Boolean']['input']>;
  flipV?: InputMaybe<Scalars['Boolean']['input']>;
  format?: InputMaybe<MuxThumbnailFormatType>;
  height?: InputMaybe<Scalars['Int']['input']>;
  rotate?: InputMaybe<MuxThumbnailRotation>;
  time?: InputMaybe<Scalars['Float']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};


export type UploadVideoFieldTitleArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};

export type UploadWidthFilter = {
  eq?: InputMaybe<Scalars['IntType']['input']>;
  gt?: InputMaybe<Scalars['IntType']['input']>;
  gte?: InputMaybe<Scalars['IntType']['input']>;
  lt?: InputMaybe<Scalars['IntType']['input']>;
  lte?: InputMaybe<Scalars['IntType']['input']>;
  neq?: InputMaybe<Scalars['IntType']['input']>;
};

export type UserReviewModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<UserReviewModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<UserReviewModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _locales?: InputMaybe<LocalesFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  authorAvatar?: InputMaybe<FileFilter>;
  authorEmail?: InputMaybe<StringFilter>;
  authorName?: InputMaybe<StringFilter>;
  comment?: InputMaybe<TextFilter>;
  id?: InputMaybe<ItemIdFilter>;
  rating?: InputMaybe<IntegerFilter>;
};

export type UserReviewModelOrderBy =
  | '_createdAt_ASC'
  | '_createdAt_DESC'
  | '_firstPublishedAt_ASC'
  | '_firstPublishedAt_DESC'
  | '_isValid_ASC'
  | '_isValid_DESC'
  | '_publicationScheduledAt_ASC'
  | '_publicationScheduledAt_DESC'
  | '_publishedAt_ASC'
  | '_publishedAt_DESC'
  | '_status_ASC'
  | '_status_DESC'
  | '_unpublishingScheduledAt_ASC'
  | '_unpublishingScheduledAt_DESC'
  | '_updatedAt_ASC'
  | '_updatedAt_DESC'
  | 'authorEmail_ASC'
  | 'authorEmail_DESC'
  | 'authorName_ASC'
  | 'authorName_DESC'
  | 'id_ASC'
  | 'id_DESC'
  | 'rating_ASC'
  | 'rating_DESC';

export type UserReviewRecord = RecordInterface & {
  __typename?: 'UserReviewRecord';
  _allAuthorNameLocales?: Maybe<Array<StringMultiLocaleField>>;
  _allCommentLocales?: Maybe<Array<StringMultiLocaleField>>;
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _locales: Array<SiteLocale>;
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  authorAvatar?: Maybe<FileField>;
  authorEmail?: Maybe<Scalars['String']['output']>;
  authorName?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  id: Scalars['ItemId']['output'];
  rating?: Maybe<Scalars['IntType']['output']>;
};


export type UserReviewRecord_AllAuthorNameLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
};


export type UserReviewRecord_AllCommentLocalesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  markdown?: InputMaybe<Scalars['Boolean']['input']>;
};


export type UserReviewRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


export type UserReviewRecordAuthorNameArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


export type UserReviewRecordCommentArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
  markdown?: InputMaybe<Scalars['Boolean']['input']>;
};

export type VideoBlockRecord = RecordInterface & {
  __typename?: 'VideoBlockRecord';
  _createdAt: Scalars['DateTime']['output'];
  _editingUrl?: Maybe<Scalars['String']['output']>;
  _firstPublishedAt: Scalars['DateTime']['output'];
  _isValid: Scalars['BooleanType']['output'];
  _modelApiKey: Scalars['String']['output'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _publishedAt: Scalars['DateTime']['output'];
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  _updatedAt: Scalars['DateTime']['output'];
  asset?: Maybe<FileField>;
  id: Scalars['ItemId']['output'];
};


export type VideoBlockRecord_SeoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

export type VideoMp4Res =
  | 'high'
  | 'low'
  | 'medium';
