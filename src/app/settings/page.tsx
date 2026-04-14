import { prisma } from "@/lib/prisma";
import {
  createPlatform,
  deletePlatform,
  togglePlatform,
  createStorageLocation,
  deleteStorageLocation,
  toggleStorageLocation,
  createCategory,
  deleteCategory,
} from "@/actions/settings";

const TYPE_OPTIONS = [
  { value: "stange", label: "Kleiderstange" },
  { value: "regal", label: "Regal" },
  { value: "box", label: "Box" },
  { value: "versandzone", label: "Versandzone" },
  { value: "sonstiges", label: "Sonstiges" },
];

export default async function SettingsPage() {
  const [platforms, storageLocations, categories] = await Promise.all([
    prisma.platform.findMany({ orderBy: { name: "asc" } }),
    prisma.storageLocation.findMany({ orderBy: { code: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="px-8 py-8 space-y-12 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">Einstellungen</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Plattformen und Lagerorte verwalten
        </p>
      </div>

      {/* ── Plattformen ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">Plattformen</h2>

        {/* Existing */}
        <div className="rounded-xl border border-border bg-background overflow-hidden">
          {platforms.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">Keine Plattformen.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Name</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Gebühr</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">URL</th>
                  <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Aktiv</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {platforms.map((p) => (
                  <tr key={p.id} className={p.isActive ? "" : "opacity-50"}>
                    <td className="px-4 py-2.5 font-medium">{p.name}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      {p.defaultFeePct !== null ? `${Number(p.defaultFeePct).toFixed(1)} %` : "–"}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs truncate max-w-[160px]">
                      {p.url ?? "–"}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <form
                        action={async () => {
                          "use server";
                          await togglePlatform(p.id, !p.isActive);
                        }}
                      >
                        <button
                          type="submit"
                          className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                            p.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-muted text-muted-foreground hover:bg-muted/70"
                          }`}
                        >
                          {p.isActive ? "Aktiv" : "Inaktiv"}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <form
                        action={async () => {
                          "use server";
                          await deletePlatform(p.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          Löschen
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add form */}
        <form action={createPlatform} className="rounded-xl border border-dashed border-border p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Neue Plattform
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Name *</label>
              <input name="name" required className={inputClass} placeholder="z.B. Vinted" />
            </div>
            <div>
              <label className={labelClass}>Gebühr %</label>
              <input
                name="defaultFeePct"
                type="number"
                step="0.1"
                min="0"
                max="100"
                className={inputClass}
                placeholder="z.B. 5.0"
              />
            </div>
            <div>
              <label className={labelClass}>URL</label>
              <input name="url" type="url" className={inputClass} placeholder="https://…" />
            </div>
          </div>
          <button type="submit" className={submitClass}>
            + Plattform hinzufügen
          </button>
        </form>
      </section>

      {/* ── Lagerorte ────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">Lagerorte</h2>

        {/* Existing */}
        <div className="rounded-xl border border-border bg-background overflow-hidden">
          {storageLocations.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">Keine Lagerorte.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Code</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Typ</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Beschreibung</th>
                  <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Aktiv</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {storageLocations.map((s) => (
                  <tr key={s.id} className={s.isActive ? "" : "opacity-50"}>
                    <td className="px-4 py-2.5 font-mono font-medium">{s.code}</td>
                    <td className="px-4 py-2.5 text-muted-foreground capitalize">{s.type}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{s.description ?? "–"}</td>
                    <td className="px-4 py-2.5 text-center">
                      <form
                        action={async () => {
                          "use server";
                          await toggleStorageLocation(s.id, !s.isActive);
                        }}
                      >
                        <button
                          type="submit"
                          className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                            s.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-muted text-muted-foreground hover:bg-muted/70"
                          }`}
                        >
                          {s.isActive ? "Aktiv" : "Inaktiv"}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <form
                        action={async () => {
                          "use server";
                          await deleteStorageLocation(s.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          Löschen
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add form */}
        <form
          action={createStorageLocation}
          className="rounded-xl border border-dashed border-border p-4 space-y-3"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Neuer Lagerort
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Code *</label>
              <input
                name="code"
                required
                className={inputClass}
                placeholder="z.B. ST-02"
              />
            </div>
            <div>
              <label className={labelClass}>Typ</label>
              <select name="type" className={inputClass}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Beschreibung</label>
              <input
                name="description"
                className={inputClass}
                placeholder="z.B. Regal Mitte"
              />
            </div>
          </div>
          <button type="submit" className={submitClass}>
            + Lagerort hinzufügen
          </button>
        </form>
      </section>

      {/* ── Kategorien ───────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">Kategorien</h2>

        <div className="rounded-xl border border-border bg-background overflow-hidden">
          {categories.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">Keine Kategorien.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-2.5 font-medium">{c.name}</td>
                    <td className="px-4 py-2.5 text-right">
                      <form
                        action={async () => {
                          "use server";
                          await deleteCategory(c.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          Löschen
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form action={createCategory} className="rounded-xl border border-dashed border-border p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Neue Kategorie
          </p>
          <div className="flex gap-3">
            <input
              name="name"
              required
              className={inputClass}
              placeholder="z.B. Schuhe"
            />
            <button type="submit" className={submitClass}>
              + Hinzufügen
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

const labelClass = "block text-xs font-medium text-muted-foreground mb-1";
const inputClass =
  "w-full h-8 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50";
const submitClass =
  "h-8 px-3 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/80 transition-colors";
