import { ContactForm } from "@/components/patterns/contact-form";
import { JsonLdScript } from "@/components/patterns/seo-manager";
import { buildMetadata } from "@/lib/seo";
import { buildStaticPageJsonLd } from "@/lib/seo/build-static-page-jsonld";
import type { Metadata } from "next";

const contactDescription =
  "Formulário seguro com React Hook Form, Zod, honeypot e Server Actions.";

export const metadata: Metadata = buildMetadata({
  title: "Contato",
  description: contactDescription,
  path: "/contato",
});

export default function ContatoPage() {
  const contactLd = buildStaticPageJsonLd("ContactPage", "Contato", "/contato", contactDescription);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12">
      <JsonLdScript graph={contactLd} />
      <header className="max-w-2xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Contato</h1>
        <p className="text-sm text-muted-foreground">
          Validação em camadas: Zod no núcleo, Honeypot na Server Action e UX acessível com
          Radix-friendly patterns.
        </p>
      </header>
      <ContactForm />
    </div>
  );
}
