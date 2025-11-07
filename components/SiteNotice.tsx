"use client";
import React from "react";

export default function SiteNotice() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      const seen = typeof window !== 'undefined' && localStorage.getItem("k2on.site.notice.dismissed");
      setVisible(!seen);
    } catch {}
  }, []);

  function dismiss() {
    try { localStorage.setItem("k2on.site.notice.dismissed", "1"); } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="w-full">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="my-3 rounded-md border bg-blue-50 text-blue-900 dark:bg-blue-900/15 dark:text-blue-100">
          <div className="flex items-center justify-center gap-3 px-4 py-2 text-sm">
            <div className="shrink-0" aria-hidden>🚧</div>
            <div className="text-center">
              Este site está com áreas em desenvolvimento. Alguns dados podem não estar disponíveis.
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="ml-2 inline-flex items-center rounded-md border border-blue-300 bg-white px-2 py-1 text-xs font-medium text-blue-900 hover:bg-blue-50 dark:border-blue-800 dark:bg-transparent dark:text-blue-100 dark:hover:bg-blue-800/40"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

