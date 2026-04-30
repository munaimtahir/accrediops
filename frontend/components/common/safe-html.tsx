"use client";

import { useEffect, useState } from "react";
import { sanitizeHtml } from "@/utils/sanitize";

interface SafeHTMLProps {
  html: string;
  className?: string;
}

/**
 * A React component that safely renders HTML content after sanitization.
 * It handles client-side rendering to avoid hydration mismatches when using DOMParser.
 */
export function SafeHTML({ html, className }: SafeHTMLProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState<string>("");

  useEffect(() => {
    setSanitizedHtml(sanitizeHtml(html));
  }, [html]);

  // Fallback for SSR or before sanitization completes
  if (!sanitizedHtml) {
    return (
      <div className={`${className} whitespace-pre-wrap`}>
        {html}
      </div>
    );
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
