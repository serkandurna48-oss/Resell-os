"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { ItemStatus } from "@prisma/client";
import { STATUS_LABELS } from "@/lib/constants";

const QUICK_FILTERS: Array<{ value: ItemStatus | ""; label: string }> = [
  { value: "", label: "Alle" },
  { value: "neu_erfasst", label: "Neu erfasst" },
  { value: "zu_pruefen", label: "Zu prüfen" },
  { value: "zu_reinigen", label: "Zu reinigen" },
  { value: "ready_fuer_fotos", label: "Bereit für Fotos" },
  { value: "fotografiert", label: "Fotografiert" },
  { value: "gelistet", label: "Gelistet" },
  { value: "verkauft", label: "Verkauft" },
  { value: "verpackt", label: "Verpackt" },
  { value: "versendet", label: "Versendet" },
  { value: "abgeschlossen", label: "Abgeschlossen" },
];

export default function ItemsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "";
  const currentSearch = searchParams.get("search") ?? "";
  const [searchValue, setSearchValue] = useState(currentSearch);

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Titel oder Marke suchen…"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && setParam("search", searchValue)}
        onBlur={() => setParam("search", searchValue)}
        className="h-8 w-full max-w-xs rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
      />
      <div className="flex gap-1.5 flex-wrap">
        {QUICK_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setParam("status", value)}
            className={`h-6 px-2.5 rounded-full text-xs font-medium transition-colors ${
              currentStatus === value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
