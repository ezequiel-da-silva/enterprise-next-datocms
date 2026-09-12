# Changelog

## [0.17.0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.16.0...next-dato-v0.17.0) (2026-09-12)


### Features

* **search:** implement search functionality with dedicated page and components; add search section block for structured search results; enhance search query handling and metadata integration; update documentation in DATOCMS.md for search setup and usage ([aedafa7](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/aedafa784c6059d7468c896059b93aaa159a5453))

## [0.16.0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.15.0...next-dato-v0.16.0) (2026-09-12)


### Features

* **datocms:** add contact page functionality; implement contact form section with migration for CMS integration; update GraphQL queries and types for contact page retrieval; enhance DATOCMS.md documentation for contact page setup and usage; refactor components to support new contact form structure ([93a007e](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/93a007e7dc05c3dacb6c0181f32b4fa9cd3fad07))

## [0.15.0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.14.0...next-dato-v0.15.0) (2026-09-11)


### Features

* **datocms:** implement blog index page configuration; add migration to link global settings to blog page; update GraphQL queries and types for blog index retrieval; enhance documentation in DATOCMS.md for blog page setup and usage; refactor blog-related components to utilize new blog index structure ([339b973](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/339b97308857c728926f9d58f48e57a141997c0d))

## [0.14.0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.13.3...next-dato-v0.14.0) (2026-09-11)


### Features

* **datocms:** introduce Text section with structured text support; add migrations for text header and body fields; update GraphQL queries and types to integrate new TextSectionRecord; enhance DATOCMS.md documentation for clarity on new section functionality ([d7445ff](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/d7445fffa5430b63648c090261de634e09777a7f))


### CI

* **next:** fail lighthouse smoke on noindex pages ([2b2b5ea](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/2b2b5ea15566bc76e2775fde6e19be5941ea6a96))

## [0.13.3](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.13.2...next-dato-v0.13.3) (2026-09-11)


### Bug Fixes

* **next.config:** adjust output configuration for standalone builds based on Vercel environment; add comment for clarity on Next.js behavior in production ([3664ce9](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/3664ce9626eeb94debcb0c03e19dce6e29f43849))


### Chores

* **datocms:** update .env.example with detailed DatoCMS configuration instructions; add datocms.config.json for CLI integration; enhance documentation in AGENTS.md, README.md, and DATOCMS.md for clarity on CDA and CMA token usage ([58d89c8](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/58d89c820f7c84d6fb3c8b24daf7c478b27d75fc))
* **dependencies:** update Next.js to version 16.3.4 and sharp to version 0.35.4 in package.json and package-lock.json; update eslint-config-next to version 16.3.4 for improved linting support ([e99dfc6](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/e99dfc6d33a2058251d78ac0bb50c562fd443e46))

## [0.13.2](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.13.1...next-dato-v0.13.2) (2026-09-07)


### Refactoring

* **components:** streamline section landmark properties in FAQ and CTA banner components ([527da5c](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/527da5c49515877e3ecf6dd407b173908343b2f6))
* **components:** streamline section landmark properties in FAQ and CTA banner components; ensure consistent header accessibility attributes and improve code readability ([2c68c70](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/2c68c70b3a44edce1bb3510e7cadb897cfdc318d))

## [0.13.1](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.13.0...next-dato-v0.13.1) (2026-09-07)


### Refactoring

* **components:** introduce SectionTextHeader for consistent header rendering across various sections; update components to utilize new header structure, enhancing readability and maintainability; modify GraphQL queries to support text header fields ([421abec](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/421abec792881e02f18f357129767212daca6134))

## [0.13.0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.12.2...next-dato-v0.13.0) (2026-09-06)


### Features

* **carousel:** introduce reusable carousel configuration and components; implement BlogPostsCarousel and BlogPostsInteractive for enhanced blog post display; update GraphQL queries and types to support carousel settings; refactor existing components to utilize new carousel functionality ([e3c6c3b](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/e3c6c3b5e427f5c684e9fa798d9c44cf6cf7c61f))

## [0.12.2](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.12.1...next-dato-v0.12.2) (2026-09-03)


### Refactoring

* **blog-posts:** rename LatestPostsSection to BlogPostsSection across components and types ([1ec69c8](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/1ec69c8e5c0eda97d997687d0ad0753f2a826c8d))
* **blog-posts:** rename LatestPostsSection to BlogPostsSection across components and types; update GraphQL queries and fragments to reflect new naming conventions; enhance type definitions for improved clarity and consistency ([e476b40](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/e476b403cb7456f3afb5da666404f89da05e5a6d))

## [0.12.1](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.12.0...next-dato-v0.12.1) (2026-09-02)


### Refactoring

* **latest-posts:** optimize latest posts catalog handling by removing unnecessary await in loadLatestPostsCatalog calls; update type definitions to support both resolved and promise states for latestPostsCatalog across components; enhance LatestPostsSectionBlock with a fallback UI during data loading ([e5d52a0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/e5d52a01e5c025e970fa605a8431480f38558afb))

## [0.12.0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.11.0...next-dato-v0.12.0) (2026-09-02)


### Features

* **blog-excerpt:** introduce excerpt handling for blog posts; add functions for reading and formatting excerpts, update JSON-LD generation to include excerpts, and enhance GraphQL queries and types to support excerpt data ([e39dd13](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/e39dd13a18e23a89a4e843205c8abdc741d92ee1))
* **latest-posts-section:** implement Latest Posts section with interactive filtering and sorting; add GraphQL queries and types for fetching posts and categories, enhance components for displaying posts, and integrate with existing content structure ([57098ec](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/57098ec18094e8dbddce9ffff88c31bf836083c5))


### Chores

* **dependencies:** update fast-uri to version 3.1.7 in package-lock.json; ensure chalk dependency remains consistent in package.json ([12fd451](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/12fd45196805285be9cf42ccdb0e5585a230034f))

## [0.11.0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.10.0...next-dato-v0.11.0) (2026-09-02)


### Features

* **content-modularity:** refactor page content handling by introducing `PageContentBlocks` component; update `CmsPageArticle` to utilize modular content structure, enhancing rendering logic and GraphQL queries for improved content management ([bd6305c](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/bd6305c185b4e4588660782ceca2d946141edf72))

## [0.10.0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.9.0...next-dato-v0.10.0) (2026-08-31)


### Features

* **redirects:** implement DatoCMS redirects functionality; add GraphQL queries and types for managing redirects, enhance proxy logic to handle redirects with security headers, and update tests for redirect matching and handling ([af92b74](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/af92b746dddb93a1e7375772d61b7e16ce94fead))

## [0.9.0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.8.0...next-dato-v0.9.0) (2026-08-31)


### Features

* **content-link:** enhance content link handling in Structured Text and various components; implement boundary and group attributes for better CMS integration; update GraphQL queries and types for editing URLs; improve documentation for DatoCMS integration ([afd2676](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/afd267690c82d7920d670a4d9c8da29508998459))
* **datocms-editing-url:** update GraphQL queries and types to include `withEditingUrl` for proper handling of `_editingUrl`; enhance documentation for Structured Text and CMS blocks to ensure correct usage and prevent errors in published reads ([3337145](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/333714526081b5f45784193884219a15c8706345))


### Refactoring

* **global-header:** add keys to theme toggle and locale switcher components for improved rendering performance and to prevent potential React warnings ([86207aa](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/86207aa945b7d40ade117933a59411d73e3913a3))

## [0.8.0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.7.0...next-dato-v0.8.0) (2026-08-31)


### Features

* **datocms-integration:** add DatoCMS skills and references for CDA; implement new skills for querying and managing content delivery, enhance documentation for filtering, caching, and environment targeting ([7cd2558](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/7cd2558369ffaebf782e09512b5f513ba1bafcc9))
* **datocms-revalidation:** implement DatoCMS webhook for on-demand cache revalidation; add necessary environment variables and update documentation for integration; enhance security measures for API access ([dcf348c](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/dcf348c20dec8923baa22cc857473f5c908c1c2f))

## [0.7.0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.6.0...next-dato-v0.7.0) (2026-08-28)


### Features

* **feature-grid:** implement Feature Grid block with carousel functionality; add GraphQL integration and update types for card handling ([aeb24c4](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/aeb24c47b2f43802140c4c9d0467e63e885d0d75))
* **feature-grid:** implement Feature Grid block with carousel functionality; add GraphQL integration and update types for card handling; introduce new components for card display and enhance styling for improved user experience ([4271422](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/4271422bb3b53240077f4fd584796c66012871a4))

## [0.6.0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.5.0...next-dato-v0.6.0) (2026-08-27)


### Features

* **tabs-section:** implement Tabs Section block with interactive tab functionality; add GraphQL integration and update types for tab handling in structured text ([7b2a70e](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/7b2a70e687704d470980e171c2af534da449fb7a))

## [0.5.0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.4.0...next-dato-v0.5.0) (2026-08-27)


### Features

* **zod:** introduce jitless configuration for Zod to enhance CSP compliance; update package.json with browserslist support and import jitless module in contact and user review entities ([d66d538](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/d66d53874dcbb2f47c7c3fa084b15100274c0db3))

## [0.4.0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.3.1...next-dato-v0.4.0) (2026-08-26)


### Features

* **reviews:** enhance user review submission process with localized messages and error handling ([0a17407](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/0a1740748a98f59158d90da3b5dcc48dcd9dbb0d))
* **reviews:** enhance user review submission process with localized messages and error handling; refactor review form and section components for improved accessibility and user experience ([f3f2417](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/f3f2417a760a04d2163b02fd16975467955dc7bd))

## [0.3.1](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.3.0...next-dato-v0.3.1) (2026-08-23)


### Refactoring

* **global-header:** update logo rendering to improve responsiveness and accessibility; adjust home CMS skeleton styling for better layout ([2ec8cf2](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/2ec8cf2426a9879d43d4ba171703f717be84794d))

## [0.3.0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.2.1...next-dato-v0.3.0) (2026-08-23)


### Features

* **pricing-section:** implement Pricing Section block with PricingCard component; add GraphQL integration for pricing plans and enhance styling for better presentation ([48c0d38](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/48c0d38e55dd0a96e4dd5d88c8e6945fdc3ec45b))

## [0.2.1](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.2.0...next-dato-v0.2.1) (2026-08-22)


### Documentation

* update documentation to include GitHub settings and references ([645bc5c](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/645bc5c8f9dac06a963636d54eaa91fe581f041d))
* update documentation to include GitHub settings and references; enhance clarity on CI requirements and Git conventions ([aa86c82](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/aa86c82df6243ebd7d632c0baa42402f3bd90d88))

## [0.2.0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/compare/next-dato-v0.1.0...next-dato-v0.2.0) (2026-08-22)


### Features

* **config:** enhance Next.js configuration with production-specific caching headers and improve image handling; update global styles for theme toggle icons and responsive design; refactor image loading logic for better performance and layout consistency ([ded34c7](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/ded34c7520979c67828f74922e51273ec7971761))
* **container:** introduce a new  component for consistent layout management across the application; update various components to utilize  for improved responsiveness and structure ([81aee26](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/81aee26a39e3c159d20bb826dd1167ff9219e897))
* **datocms:** enhance block attributes handling by integrating cmsBlockAttrs for improved DOM identification across multiple components ([270ca69](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/270ca6914440ea9bf1e6d63f65089252c1dae277))
* **enterprise-next-datocms:** Add initial project structure with Docker support, environment configuration, and essential files for Next.js and DatoCMS integration. Includes .dockerignore, .env.example, Dockerfile, and setup scripts. Introduces ESLint and Vitest configurations, along with Tailwind CSS setup and various project rules for architecture, security, and testing. ([8218f81](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/8218f81eed222b6535ec88f61a72a69003871b6a))
* **lighthouse:** integrate Lighthouse CI for performance monitoring; add Lighthouse configuration file and GitHub Actions workflow; update ESLint rules to restrict imports in core and component directories; enhance contact form handling and improve SEO metadata generation across various pages. ([17cb839](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/17cb839477d9525892a66445d665167748c42bfa))
* **lighthouse:** introduce stable paths for Lighthouse CI and update configuration to dynamically fetch URLs; enhance GitHub Actions workflow with smoke tests for HTTP 200 responses ([6105386](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/6105386621c1b6afa226f3d5fa2bdbfd3e043892))
* **lighthouse:** update Lighthouse CI configuration to support multiple devices, increase number of runs, and adjust performance thresholds; add .lighthouseci to .gitignore and update nanoid dependency ([951df13](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/951df13cad63897a91fe73552f87384e18f9b292))
* **locale:** update routing and metadata handling to support locale-based URLs ([a553d6d](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/a553d6df22a395183d1bf0a179bef9ada38896b2))
* **locale:** update routing and metadata handling to support locale-based URLs; enhance Lighthouse configuration for improved testing; add global error handling and new components for better user experience ([6192b62](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/6192b625ff90cfa9b2d83ffd06ca442356f94c2f))
* **logo-grid:** add Logo Grid block component with marquee and grid layout options; implement styles and GraphQL integration for logos; enhance structured text handling to support new block type ([e9075fe](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/e9075fe49040a561177162dc90a029476a34a2a0))
* **logo-grid:** enhance marquee functionality and layout; add temporary cursor ignore to .gitignore; improve logo rendering logic for better responsiveness ([3a073f8](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/3a073f8b6f3040653aaf8941bcc772b2995ae5ec))
* **proxy:** implement security headers in proxy responses and add unit tests for locale redirection and header validation ([f018f7f](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/f018f7fdd45aa8a5166457ae108b2c4961d20b53))
* **release:** add release configuration and manifest files; introduce new markdown rules for DatoCMS and Git conventions ([45434a0](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/45434a0188c3ae61ef3fe8e8846e99a6177b9cfb))
* **reviews-section:** add Reviews Section block with GraphQL integration; update types and queries to support user reviews; enhance ESLint configuration for component imports ([58c4055](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/58c4055762688fe9ab32149f9813ba9f094377fa))
* **seo:** enhance SEO and image handling by introducing locale-based metadata generation ([6a2427d](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/6a2427d7de779e608de4b13fc4952ecf1c7e5199))
* **seo:** enhance SEO and image handling by introducing locale-based metadata generation; update image sizes for better responsiveness and performance; improve fallback alt text for images across various components ([7ed051f](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/7ed051fd682b8c5e46dc72e6d97ef71999769102))
* **seo:** enhance SEO metadata handling by introducing fallback titles and updating hreflang path generation ([a284a72](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/a284a720cdcd10bddd4d9993613bf19aac340a8f))
* **seo:** enhance SEO metadata handling by introducing fallback titles and updating hreflang path generation; add support for video captions in structured text and improve image loading with responsive srcSets ([afa7303](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/afa730382eb058af49f160b729e258ce32f98070))
* **seo:** implement site SEO integration with DatoCMS- [#19](https://github.com/ezequiel-da-silva/enterprise-next-datocms/issues/19) ([91599b8](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/91599b8fd0723102cbac2e27b9ffafd0a2a747d2))
* **seo:** implement site SEO integration with DatoCMS; add new getSiteSeo function and update components to utilize site metadata for improved SEO handling ([5a3618a](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/5a3618a3b8a9f7484aa60599e2baf2fb5b294beb))
* **styles:** enhance typography for structured text and improve logo grid rendering ([5f02ef3](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/5f02ef3f97eec741b4bdb6713fb351430b3f8838))
* **styles:** enhance typography for structured text and improve logo grid rendering; add lazy loading for review form component; update global styles for better accessibility and responsiveness ([73e603d](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/73e603df8a5595fc325fa259711da575dc5e51ac))
* **video:** implement video source resolution using Mux for enhanced video handling ([5b5ddca](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/5b5ddca8d3b2b866cc22b5dccbef27496192cf0d))
* **video:** implement video source resolution using Mux for enhanced video handling; update structured text block to utilize new video resolution logic and improve CSP for media sources ([efca020](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/efca0205eb7cb12ee3e68c57948b7e92119a44c3))


### Bug Fixes

* **ci:** update package-lock.json to align ajv and eslint dependencies ([8fdef11](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/8fdef113c0608ac8ec47f7409532d4cbf3d74df3))
* **lighthouse:** disable eslint rule for require imports in lighthouse-paths and lighthouserc configuration files to improve compatibility with CommonJS modules ([382e2f7](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/382e2f778d6876a5f6ea7b6845019d0d9220c397))
* **security:** scoped NODE_ENV to start server step so devDependencies install properly ([1729a93](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/1729a93190ec2cae31148de6fb3682e6b43c3f49))
* **video:** Improve video loading performance by adding aspect ratio styling to prevent layout shifts ([14b1855](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/14b1855d501a9b0824347b6f07d2fa5fde81c465))
* **video:** improve video loading performance by adding aspect ratio styling to prevent layout shifts; limit thumbnail width to optimize loading and reduce CLS impact ([0a5b50d](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/0a5b50d28290ebcb33db0b7b3878bef8e54cb21f))


### Refactoring

* **contact:** remove unused export of ContactActionState; add spacing for improved readability in submitContact function ([5f5bf44](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/5f5bf446a99033412a2cd0389d39dd6525a2422f))
* **locale-switcher:** implement locale switcher component with dropdown menu ([faa0999](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/faa09999114394a7a9bb4cb1f0e93e45a0f67d6e))
* **locale-switcher:** implement locale switcher component with dropdown menu; enhance global header and navigation for improved accessibility and user experience; update ESLint configuration and various components to support new locale handling ([7a511e9](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/7a511e9984fd9ea2e60b2c400c686e3b555fa84f))
* **logo-grid:** improve LogoCell component accessibility and styling; update alt text for logos and enhance layout responsiveness ([91fe297](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/91fe2974ee854f7bb7cde5ffefe771e0d0057cec))


### Chores

* **dependencies:** update tmp to version 0.2.7 and uuid to version 11.1.1 in package.json; remove unused tmp and os-tmpdir modules from package-lock.json ([048d0ac](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/048d0ac05d7ff7ff27b95c85dba906823be875ca))
* **enterprise-next-datocms:** enhance code generation configuration by adding scalar mappings and fixing import paths in generated TypeScript files; update package dependencies and scripts for improved functionality ([64a8543](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/64a8543c3e803c9dd6007c124a05dadf0e3689a2))
* **enterprise-next-datocms:** update dependencies in package.json and package-lock.json ([208f411](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/208f4110377f5086826585ebf02f39f97a4277ae))
* **enterprise-next-datocms:** update dependencies in package.json and package-lock.json, including @graphql-codegen/typescript-operations to version 6.1.2 and various Babel packages to version 7.29.7 ([5e33a69](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/5e33a69559459e494cb1f086e668cffd582c97bb))
* **env:** organize sections and add comments for SEO, DatoCMS, CI/CD, and Security configurations in .env.example ([2ce0e75](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/2ce0e75d3d975ac89d87b2e28deda622bad474a6))
* **env:** organize sections and add comments for SEO, DatoCMS, CI/CD, and Security configurations in .env.example ([eca8911](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/eca89113855482174d8bc893c851b4a0dab141dd))
* **husky:** add husky and lint-staged for pre-commit and pre-push hooks ([6d5fe38](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/6d5fe38af3bb33a52b8fe46f3108ae9af3b1de07))
* **husky:** add husky and lint-staged for pre-commit and pre-push hooks; update package dependencies in package.json and package-lock.json ([e8d4c4c](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/e8d4c4c661a77d33d931752f7d59034130fc90eb))
* **playwright:** add Playwright for end-to-end testing ([aa910dd](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/aa910dd6e58ec84a58fe7daea4d4e459848f04de))
* **playwright:** add Playwright for end-to-end testing; update .gitignore to exclude test results and reports; enhance documentation with E2E testing instructions and CI workflow updates ([eeb7ede](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/eeb7ede820f8aaaba029a3a41ffe3e75d70b6e8d))
* **scripts:** add standalone server script to package.json and update Playwright configuration to use it; enhance smoke test for contact page honeypot accessibility ([765709c](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/765709c64597d4b521233bc2dabc2e10588c60c6))
* **security:** update security audit scripts to omit devDependencies for production checks; add new script for full audit including devDependencies; enhance documentation for clarity on audit processes ([63b7d61](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/63b7d61910fbabf6780b5cef7ba10237856fc075))
* **workflows:** include 'develop' branch in push and pull request triggers ([9976f93](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/9976f93583c1d54ff02fc793ec7d0c21dc144930))
* **workflows:** update CI, E2E, Lighthouse, and Security workflows to include 'develop' branch in push and pull request triggers ([d2fe140](https://github.com/ezequiel-da-silva/enterprise-next-datocms/commit/d2fe140ed271ce4fd6f87a7ecad5acfc5b00c08d))
