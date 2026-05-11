"use client";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      onClick={(event) => {
        const main = document.getElementById("main-content") as HTMLElement | null;
        if (!main) {
          return;
        }
        event.preventDefault();
        if (!main.hasAttribute("tabindex")) {
          main.setAttribute("tabindex", "-1");
        }
        window.location.hash = "main-content";
        window.requestAnimationFrame(() => {
          main.focus();
          main.scrollIntoView({ block: "start" });
        });
      }}
    >
      Skip to main content
    </a>
  );
}
