import { DatoContentLinkBridge } from "@/components/patterns/dato-content-link-bridge";
import { draftMode } from "next/headers";
import Link from "next/link";

export async function DraftChrome() {
  const draft = await draftMode();
  if (!draft.isEnabled) {
    return null;
  }

  return (
    <>
      <div className="border-b border-amber-600/40 bg-amber-950/90 px-4 py-2 text-center text-sm text-amber-50 backdrop-blur">
        <span className="font-medium">Draft Mode ativo</span>
        {" · "}
        <Link className="underline underline-offset-2 hover:text-white" href="/api/disable-draft?redirect=/">
          Sair do preview
        </Link>
      </div>
      <DatoContentLinkBridge />
    </>
  );
}
