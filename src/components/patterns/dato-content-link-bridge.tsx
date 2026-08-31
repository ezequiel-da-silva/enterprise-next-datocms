"use client";

import { ContentLink } from "react-datocms/content-link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Visual Editing (Content Link) — bundle same-origin; não injeta `<script>` externos.
 * Com CSP estrita, evite iframes sem `frame-ancestors` para `plugins-cdn.datocms.com` (ver middleware).
 */
export function DatoContentLinkBridge() {
  const pathname = usePathname();
  const router = useRouter();
  const base = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;
  const [documentLoaded, setDocumentLoaded] = useState(false);

  useEffect(() => {
    const scheduleMount = () => window.setTimeout(() => setDocumentLoaded(true), 500);

    if (document.readyState === "complete") {
      const timeout = scheduleMount();
      return () => window.clearTimeout(timeout);
    }

    let timeout: number | undefined;
    const handleLoad = () => {
      timeout = scheduleMount();
    };
    window.addEventListener("load", handleLoad, { once: true });
    return () => {
      window.removeEventListener("load", handleLoad);
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, []);

  if (!base || !documentLoaded) {
    return null;
  }

  return (
    <ContentLink
      enableClickToEdit
      currentPath={pathname ?? "/"}
      onNavigateTo={(path) => router.push(path)}
    />
  );
}
