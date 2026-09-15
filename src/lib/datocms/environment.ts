/** Primary deste projeto (não se chama `primary`). */
export const DEFAULT_DATOCMS_ENVIRONMENT = "main";

/**
 * Ambiente CDA/CMA. `DATOCMS_ENVIRONMENT=develop` aponta ao sandbox;
 * vazio ou ausente → `main`.
 */
export function readDatoCmsEnvironment(): string {
  const raw = process.env.DATOCMS_ENVIRONMENT?.trim();
  return raw || DEFAULT_DATOCMS_ENVIRONMENT;
}
