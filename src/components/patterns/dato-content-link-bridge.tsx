"use client";

import { ContentLink } from "react-datocms/content-link";
import { usePathname, useRouter } from "next/navigation";

/**
 * Visual Editing (Content Link) — bundle same-origin; não injeta `<script>` externos.
 * Com CSP estrita, evite iframes sem `frame-ancestors` para `plugins-cdn.datocms.com` (ver middleware).
 */
export function DatoContentLinkBridge() {
  const pathname = usePathname();
  const router = useRouter();
  const base = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;

  if (!base) {
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
