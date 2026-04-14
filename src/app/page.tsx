import { getDashboardStats } from "@/actions/dashboard";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const kpis = [
    {
      label: "Gesamt Items",
      value: stats.totalItems,
      sub: "erfasst",
    },
    {
      label: "Gelistet",
      value: stats.listedItems,
      sub: "aktiv im Verkauf",
    },
    {
      label: "Verkauft",
      value: stats.soldItems,
      sub: "abgeschlossen",
    },
    {
      label: "Offene Sendungen",
      value: stats.pendingShipments,
      sub: "vorbereitet / versendet",
    },
    {
      label: "Umsatz",
      value: formatCurrency(stats.totalRevenue),
      sub: "gesamt",
      money: true,
    },
    {
      label: "Gewinn",
      value: formatCurrency(stats.totalProfit),
      sub: "nach Kosten",
      money: true,
      highlight: stats.totalProfit > 0,
    },
  ];

  return (
    <main className="px-8 py-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Überblick über dein Resell-Business</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-border bg-background px-5 py-4 space-y-1"
          >
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {kpi.label}
            </p>
            <p
              className={`text-2xl font-semibold tabular-nums ${
                kpi.highlight ? "text-emerald-600" : ""
              }`}
            >
              {kpi.value}
            </p>
            <p className="text-xs text-muted-foreground">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Action Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Handlungsbedarf</h2>
          <Link href="/workflow" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
            Alle im Workflow →
          </Link>
        </div>

        {stats.actionItems.length === 0 ? (
          <div className="rounded-xl border border-border bg-background px-5 py-8 text-center text-sm text-muted-foreground">
            Kein Handlungsbedarf — alles erledigt.
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-background divide-y divide-border">
            {stats.actionItems.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-medium truncate mr-4">{item.title}</span>
                <span
                  className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                    STATUS_COLORS[item.status]
                  }`}
                >
                  {STATUS_LABELS[item.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
