/**
 * A minimal, zero-dependency HTML sanitizer that uses the browser's DOMParser.
 * It strips dangerous tags and attributes to prevent XSS while preserving formatting.
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") {
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const ALLOWED_TAGS = [
    "P", "B", "I", "EM", "STRONG", "A", "UL", "OL", "LI", "BR",
    "H1", "H2", "H3", "H4", "H5", "H6", "DIV", "SPAN", "BLOCKQUOTE",
    "PRE", "CODE", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD", "HR"
  ];

  const ALLOWED_ATTRS = ["HREF", "TITLE", "TARGET", "CLASS"];

  const traverse = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tagName = el.tagName.toUpperCase();

      if (!ALLOWED_TAGS.includes(tagName)) {
        // If the tag is not allowed, we move its children out and remove the tag itself
        while (el.firstChild) {
          el.parentNode?.insertBefore(el.firstChild, el);
        }
        el.parentNode?.removeChild(el);
        return;
      }

      // Remove dangerous or non-allowed attributes
      const attrs = Array.from(el.attributes);
      for (const attr of attrs) {
        const attrName = attr.name.toUpperCase();
        const attrValue = attr.value.trim().toLowerCase();

        const isAllowedAttr = ALLOWED_ATTRS.includes(attrName);
        const isJavaScriptUri = attrValue.startsWith("javascript:") || attrValue.startsWith("data:") || attrValue.startsWith("vbscript:");
        const isEventHandler = attr.name.toLowerCase().startsWith("on");

        if (!isAllowedAttr || isJavaScriptUri || isEventHandler) {
          el.removeAttribute(attr.name);
        }
      }
    }

    const children = Array.from(node.childNodes);
    for (const child of children) {
      traverse(child);
    }
  };

  traverse(doc.body);

  return doc.body.innerHTML;
}
