import { notFound } from "next/navigation";
import Link from "next/link";
import { getItemById } from "@/actions/items";
import { prisma } from "@/lib/prisma";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import AdvanceStatusButton from "../advance-status-button";
import SaleDialog from "./sale-dialog";
import EditItemDialog from "./edit-item-dialog";
import ShipmentForm from "./shipment-form";

const CONDITION_LABELS: Record<string, string> = {
  neu: "Neu",
  sehr_gut: "Sehr gut",
  gut: "Gut",
  akzeptabel: "Akzeptabel",
};

const TYPE_LABELS: Record<string, string> = {
  stange: "Kleiderstange",
  regal: "Regal",
  box: "Box",
  versandzone: "Versandzone",
  sonstiges: "Sonstiges",
};

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, platforms, storageLocations, categories] = await Promise.all([
    getItemById(id),
    prisma.platform.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.storageLocation.findMany({ where: { isActive: true }, orderBy: { code: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!item) notFound();

  const canRecordSale = !item.sale && ["gelistet", "reserviert", "verkauft"].includes(item.status);

  const sale = item.sale;
  const margin =
    sale && Number(sale.salePrice) > 0
      ? ((Number(sale.profit) / Number(sale.salePrice)) * 100).toFixed(1)
      : null;

  return (
    <main className="px-8 py-8 space-y-8 max-w-4xl">
      {/* Back + Header */}
      <div className="space-y-4">
        <Link
          href="/items"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Zurück zur Liste
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold leading-tight">{item.title}</h1>
            {item.brand && (
              <p className="text-sm text-muted-foreground">
                {item.brand}{item.size ? ` · Größe ${item.size}` : ""}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${STATUS_COLORS[item.status]}`}>
              {STATUS_LABELS[item.status]}
            </span>
            <EditItemDialog
              item={item}
              platforms={platforms}
              storageLocations={storageLocations}
              categories={categories}
            />
            {canRecordSale && (
              <SaleDialog
                itemId={item.id}
                purchasePrice={Number(item.purchasePrice)}
                platforms={platforms}
                defaultPlatformId={item.platformId}
              />
            )}
            <AdvanceStatusButton itemId={item.id} currentStatus={item.status} />
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <InfoCard label="Kategorie" value={item.category} />
        <InfoCard label="Zustand" value={CONDITION_LABELS[item.condition] ?? item.condition} />
        <InfoCard label="Einkaufspreis" value={formatCurrency(Number(item.purchasePrice))} />
        <InfoCard
          label="Zielpreis"
          value={item.targetPrice ? formatCurrency(Number(item.targetPrice)) : "–"}
        />
        <InfoCard label="Plattform" value={item.platform?.name ?? "–"} />
        <InfoCard
          label="Lagerort"
          value={
            item.storageLocation
              ? `${item.storageLocation.code}${
                  item.storageLocation.description
                    ? ` – ${item.storageLocation.description}`
                    : ""
                }`
              : "–"
          }
        />
        {item.storageLocation && (
          <InfoCard
            label="Lagertyp"
            value={TYPE_LABELS[item.storageLocation.type] ?? item.storageLocation.type}
          />
        )}
        <InfoCard label="Erfasst am" value={formatDate(item.createdAt)} />
        <InfoCard label="Zuletzt geändert" value={formatDate(item.updatedAt)} />
      </div>

      {item.notes && (
        <div className="rounded-xl border border-border bg-background px-5 py-4 space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notizen</p>
          <p className="text-sm whitespace-pre-wrap">{item.notes}</p>
        </div>
      )}

      {/* Gewinnkalkulation */}
      {sale && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Gewinnkalkulation</h2>
          <div className="rounded-xl border border-border bg-background overflow-hidden">
            <div className="divide-y divide-border">
              <CalcRow label="Verkaufspreis" value={formatCurrency(Number(sale.salePrice))} />
              <CalcRow
                label={`Plattformgebühr (${sale.platform.name})`}
                value={`– ${formatCurrency(Number(sale.platformFee))}`}
                dim
              />
              <CalcRow
                label="Versandkosten"
                value={`– ${formatCurrency(Number(sale.shippingCost))}`}
                dim
              />
              {Number(sale.otherCosts) > 0 && (
                <CalcRow
                  label="Sonstige Kosten"
                  value={`– ${formatCurrency(Number(sale.otherCosts))}`}
                  dim
                />
              )}
              <CalcRow
                label="Einkaufspreis"
                value={`– ${formatCurrency(Number(item.purchasePrice))}`}
                dim
              />
              <div className="flex items-center justify-between px-5 py-3 bg-muted/30">
                <span className="text-sm font-semibold">Gewinn</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-600 tabular-nums">
                    {formatCurrency(Number(sale.profit))}
                  </span>
                  {margin && (
                    <span className="text-xs text-muted-foreground">{margin} % Marge</span>
                  )}
                </div>
              </div>
            </div>

            <ShipmentForm
              saleId={sale.id}
              itemId={item.id}
              shipment={sale.shipment}
            />
          </div>
        </div>
      )}

      {/* Status-Timeline */}
      {item.statusHistory.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Statushistorie</h2>
          <div className="relative pl-6 space-y-0">
            {item.statusHistory.map((entry, i) => {
              const isLast = i === item.statusHistory.length - 1;
              return (
                <div key={entry.id} className="relative flex gap-4">
                  {/* Line */}
                  {!isLast && (
                    <div className="absolute left-[-17px] top-5 bottom-0 w-px bg-border" />
                  )}
                  {/* Dot */}
                  <div
                    className={`absolute left-[-21px] top-1.5 size-2.5 rounded-full border-2 border-background ${
                      isLast ? "bg-foreground" : "bg-muted-foreground/50"
                    }`}
                  />
                  {/* Content */}
                  <div className="pb-5 space-y-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {entry.fromStatus && (
                        <>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              STATUS_COLORS[entry.fromStatus as keyof typeof STATUS_COLORS] ??
                              "bg-muted text-muted-foreground"
                            }`}
                          >
                            {STATUS_LABELS[entry.fromStatus as keyof typeof STATUS_LABELS] ??
                              entry.fromStatus}
                          </span>
                          <span className="text-xs text-muted-foreground">→</span>
                        </>
                      )}
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          STATUS_COLORS[entry.toStatus as keyof typeof STATUS_COLORS] ??
                          "bg-muted text-muted-foreground"
                        }`}
                      >
                        {STATUS_LABELS[entry.toStatus as keyof typeof STATUS_LABELS] ??
                          entry.toStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(entry.changedAt)}</span>
                      {entry.note && <span>· {entry.note}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3 space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function CalcRow({
  label,
  value,
  dim = false,
}: {
  label: string;
  value: string;
  dim?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-2.5">
      <span className={`text-sm ${dim ? "text-muted-foreground" : ""}`}>{label}</span>
      <span className={`text-sm tabular-nums ${dim ? "text-muted-foreground" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
}
