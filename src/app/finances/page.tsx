import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function FinancesPage() {
  const sales = await prisma.sale.findMany({
    include: {
      item: { select: { title: true, brand: true, purchasePrice: true } },
      platform: { select: { name: true } },
      shipment: { select: { status: true, trackingNumber: true } },
    },
    orderBy: { soldAt: "desc" },
  });

  // ── Aggregates ──────────────────────────────────────────────────
  const totalRevenue = sales.reduce((s, r) => s + Number(r.salePrice), 0);
  const totalFees = sales.reduce((s, r) => s + Number(r.platformFee), 0);
  const totalShipping = sales.reduce((s, r) => s + Number(r.shippingCost), 0);
  const totalOther = sales.reduce((s, r) => s + Number(r.otherCosts), 0);
  const totalCosts = totalFees + totalShipping + totalOther;
  const totalProfit = sales.reduce((s, r) => s + Number(r.profit), 0);
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // ── Per-platform breakdown ──────────────────────────────────────
  const platformMap = new Map<
    string,
    { revenue: number; profit: number; fees: number; count: number }
  >();
  for (const sale of sales) {
    const name = sale.platform.name;
    const prev = platformMap.get(name) ?? { revenue: 0, profit: 0, fees: 0, count: 0 };
    platformMap.set(name, {
      revenue: prev.revenue + Number(sale.salePrice),
      profit: prev.profit + Number(sale.profit),
      fees: prev.fees + Number(sale.platformFee),
      count: prev.count + 1,
    });
  }
  const platforms = [...platformMap.entries()].sort((a, b) => b[1].profit - a[1].profit);

  const kpis = [
    { label: "Umsatz", value: formatCurrency(totalRevenue), sub: `${sales.length} Verkäufe` },
    { label: "Kosten", value: formatCurrency(totalCosts), sub: "Gebühren + Versand" },
    {
      label: "Gewinn",
      value: formatCurrency(totalProfit),
      sub: `Ø ${avgMargin.toFixed(1)} % Marge`,
      positive: true,
    },
  ];

  const shipmentLabels: Record<string, string> = {
    vorbereitet: "Vorbereitet",
    versendet: "Versendet",
    zugestellt: "Zugestellt",
    problem: "Problem",
  };

  const shipmentColors: Record<string, string> = {
    vorbereitet: "bg-slate-100 text-slate-700",
    versendet: "bg-blue-100 text-blue-800",
    zugestellt: "bg-green-100 text-green-800",
    problem: "bg-red-100 text-red-800",
  };

  return (
    <main className="px-8 py-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Finanzen</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Alle Verkäufe und Gewinne</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-border bg-background px-5 py-4 space-y-1"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {kpi.label}
            </p>
            <p className={`text-2xl font-semibold tabular-nums ${kpi.positive ? "text-emerald-600" : ""}`}>
              {kpi.value}
            </p>
            <p className="text-xs text-muted-foreground">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Kostenaufschlüsselung */}
      <div className="rounded-xl border border-border bg-background px-5 py-4 space-y-3">
        <h2 className="text-sm font-semibold">Kostenaufschlüsselung</h2>
        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Plattformgebühren</p>
            <p className="tabular-nums font-medium">{formatCurrency(totalFees)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Versandkosten</p>
            <p className="tabular-nums font-medium">{formatCurrency(totalShipping)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Sonstiges</p>
            <p className="tabular-nums font-medium">{formatCurrency(totalOther)}</p>
          </div>
        </div>
      </div>

      {/* Plattform-Breakdown */}
      {platforms.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Nach Plattform</h2>
          <div className="rounded-xl border border-border bg-background overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Plattform</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Verkäufe</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Umsatz</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Gebühren</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Gewinn</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Marge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {platforms.map(([name, data]) => (
                  <tr key={name} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{name}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{data.count}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(data.revenue)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {formatCurrency(data.fees)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-emerald-600 font-medium">
                      {formatCurrency(data.profit)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : "0.0"} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sales-Tabelle */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Alle Verkäufe</h2>

        {sales.length === 0 ? (
          <div className="rounded-xl border border-border bg-background px-5 py-12 text-center text-sm text-muted-foreground">
            Noch keine Verkäufe erfasst.
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-background overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Item</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Plattform</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">EK</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">VK</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Gebühr</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Versand</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Gewinn</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Sendung</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sales.map((sale) => {
                  const margin =
                    Number(sale.salePrice) > 0
                      ? ((Number(sale.profit) / Number(sale.salePrice)) * 100).toFixed(0)
                      : "0";
                  return (
                    <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="font-medium truncate">{sale.item.title}</div>
                        {sale.item.brand && (
                          <div className="text-xs text-muted-foreground">{sale.item.brand}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {sale.platform.name}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground whitespace-nowrap">
                        {formatCurrency(Number(sale.item.purchasePrice))}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                        {formatCurrency(Number(sale.salePrice))}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground whitespace-nowrap">
                        {formatCurrency(Number(sale.platformFee))}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground whitespace-nowrap">
                        {formatCurrency(Number(sale.shippingCost))}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="tabular-nums font-medium text-emerald-600">
                          {formatCurrency(Number(sale.profit))}
                        </span>
                        <span className="ml-1.5 text-xs text-muted-foreground">{margin}%</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {sale.shipment ? (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              shipmentColors[sale.shipment.status] ?? "bg-muted text-muted-foreground"
                            }`}
                          >
                            {shipmentLabels[sale.shipment.status] ?? sale.shipment.status}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">–</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(sale.soldAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Footer totals */}
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/20 font-medium">
                  <td className="px-4 py-3 text-muted-foreground" colSpan={2}>
                    Gesamt
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">–</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(totalRevenue)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {formatCurrency(totalFees)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {formatCurrency(totalShipping)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-emerald-600">
                    {formatCurrency(totalProfit)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
