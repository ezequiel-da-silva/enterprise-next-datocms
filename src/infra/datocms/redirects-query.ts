/**
 * Collection `redirect` (published only no runtime).
 * CDA camelCase: from_path_redirect → fromPathRedirect, etc.
 */
export const GET_ALL_REDIRECTS = /* GraphQL */ `
  query AllRedirects {
    allRedirects(first: 100, orderBy: _updatedAt_DESC) {
      id
      fromPathRedirect
      toPathRedirect
      statusRedirect
    }
  }
`;
