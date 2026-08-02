/**
 * Campos do bloco DatoCMS `faq_group`. API keys snake_case; CDA expõe camelCase.
 *
 * | Campo                         | API key            | Default (faq_configuration=false) |
 * |-------------------------------|--------------------|-----------------------------------|
 * | Personalizar comportamento?   | advanced_options   | — usa defaults abaixo             |
 * | Accordion mode                | accordion_mode       | single                            |
 * | Open first item               | open_first_item      | false                             |
 * | Enable FAQ schema             | enable_faq_schema    | true                              |
 * | Header alignment              | header_alignment     | left (left | center | right)      |
 */

export type FaqAccordionMode = "single" | "multiple";
export type FaqHeaderAlignment = "left" | "center" | "right";

export type FaqGroupOptions = {
  accordionMode: FaqAccordionMode;
  openFirstItem: boolean;
  enableFaqSchema: boolean;
  headerAlignment: FaqHeaderAlignment;
};

export type FaqGroupItem = {
  id: string;
  question: string;
  answer: string;
};

/** Valores quando `advanced_options` está desligado ou ausente. */
export const FAQ_GROUP_DEFAULTS: FaqGroupOptions = {
  accordionMode: "single",
  openFirstItem: false,
  enableFaqSchema: true,
  headerAlignment: "left",
};

function parseAccordionMode(raw: string): FaqAccordionMode {
  const v = raw.trim().toLowerCase();
  return v === "multiple" ? "multiple" : "single";
}

function parseAlignment(raw: string): FaqHeaderAlignment {
  const v = raw.trim().toLowerCase();
  if (v === "center" || v === "centro" || v === "centralizado") return "center";
  if (v === "right" || v === "direita") return "right";
  return "left";
}

function readOptionalBool(record: Record<string, unknown>, camel: string, snake: string): boolean | undefined {
  const raw = record[camel] ?? record[snake];
  if (raw === true) return true;
  if (raw === false) return false;
  return undefined;
}

function readOptionalString(record: Record<string, unknown>, camel: string, snake: string): string | undefined {
  const raw = record[camel] ?? record[snake];
  return typeof raw === "string" && raw.trim() !== "" ? raw.trim() : undefined;
}

function isAdvancedOptionsEnabled(record: Record<string, unknown>): boolean {
  return (
    readOptionalBool(record, "advancedOptions", "advanced_options") === true ||
    readOptionalBool(record, "faqConfiguration", "faq_configuration") === true
  );
}

/** Resolve opções do bloco FAQ: defaults globais ou campos CMS quando opções avançadas estão ativas. */
export function resolveFaqGroupOptions(record: Record<string, unknown>): FaqGroupOptions {
  if (!isAdvancedOptionsEnabled(record)) {
    return { ...FAQ_GROUP_DEFAULTS };
  }

  const accordionRaw = readOptionalString(record, "accordionMode", "accordion_mode");
  const alignmentRaw = readOptionalString(record, "headerAlignment", "header_alignment");
  const openFirst = readOptionalBool(record, "openFirstItem", "open_first_item");
  const enableSchema = readOptionalBool(record, "enableFaqSchema", "enable_faq_schema");

  return {
    accordionMode: accordionRaw ? parseAccordionMode(accordionRaw) : FAQ_GROUP_DEFAULTS.accordionMode,
    openFirstItem: openFirst ?? FAQ_GROUP_DEFAULTS.openFirstItem,
    enableFaqSchema: enableSchema ?? FAQ_GROUP_DEFAULTS.enableFaqSchema,
    headerAlignment: alignmentRaw ? parseAlignment(alignmentRaw) : FAQ_GROUP_DEFAULTS.headerAlignment,
  };
}
