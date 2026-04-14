import { ItemStatus } from "@prisma/client";

export const STATUS_LABELS: Record<ItemStatus, string> = {
  neu_erfasst:       "Neu erfasst",
  zu_pruefen:        "Zu prüfen",
  zu_reinigen:       "Zu reinigen",
  ready_fuer_fotos:  "Bereit für Fotos",
  fotografiert:      "Fotografiert",
  gelistet:          "Gelistet",
  reserviert:        "Reserviert",
  verkauft:          "Verkauft",
  verpackt:          "Verpackt",
  versendet:         "Versendet",
  abgeschlossen:     "Abgeschlossen",
  bundle:            "Bundle",
  spende:            "Spende",
  entsorgt:          "Entsorgt",
};

export const STATUS_COLORS: Record<ItemStatus, string> = {
  neu_erfasst:       "bg-slate-100 text-slate-700",
  zu_pruefen:        "bg-yellow-100 text-yellow-800",
  zu_reinigen:       "bg-orange-100 text-orange-800",
  ready_fuer_fotos:  "bg-blue-100 text-blue-800",
  fotografiert:      "bg-indigo-100 text-indigo-800",
  gelistet:          "bg-violet-100 text-violet-800",
  reserviert:        "bg-pink-100 text-pink-800",
  verkauft:          "bg-emerald-100 text-emerald-800",
  verpackt:          "bg-teal-100 text-teal-800",
  versendet:         "bg-cyan-100 text-cyan-800",
  abgeschlossen:     "bg-green-100 text-green-800",
  bundle:            "bg-purple-100 text-purple-800",
  spende:            "bg-sky-100 text-sky-800",
  entsorgt:          "bg-red-100 text-red-800",
};

// Linearer Workflow für "Next Step"-Logik
export const STATUS_FLOW: Partial<Record<ItemStatus, ItemStatus>> = {
  neu_erfasst:      "zu_pruefen",
  zu_pruefen:       "zu_reinigen",
  zu_reinigen:      "ready_fuer_fotos",
  ready_fuer_fotos: "fotografiert",
  fotografiert:     "gelistet",
  gelistet:         "verkauft",
  verkauft:         "verpackt",
  verpackt:         "versendet",
  versendet:        "abgeschlossen",
};

export const WORKFLOW_COLUMNS: ItemStatus[] = [
  "neu_erfasst",
  "zu_pruefen",
  "zu_reinigen",
  "ready_fuer_fotos",
  "fotografiert",
  "gelistet",
  "reserviert",
  "verkauft",
  "verpackt",
  "versendet",
  "abgeschlossen",
];
