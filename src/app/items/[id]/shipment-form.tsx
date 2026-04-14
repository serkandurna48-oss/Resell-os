"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShipmentStatus } from "@prisma/client";
import { createShipment, updateShipment } from "@/actions/shipments";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: ShipmentStatus; label: string }[] = [
  { value: "vorbereitet", label: "Vorbereitet" },
  { value: "versendet", label: "Versendet" },
  { value: "zugestellt", label: "Zugestellt" },
  { value: "problem", label: "Problem" },
];

const STATUS_COLORS: Record<ShipmentStatus, string> = {
  vorbereitet: "bg-slate-100 text-slate-700",
  versendet: "bg-blue-100 text-blue-800",
  zugestellt: "bg-green-100 text-green-800",
  problem: "bg-red-100 text-red-800",
};

type Shipment = {
  id: string;
  status: ShipmentStatus;
  carrier: string | null;
  trackingNumber: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
};

function toDateInput(d: Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export default function ShipmentForm({
  saleId,
  itemId,
  shipment,
}: {
  saleId: string;
  itemId: string;
  shipment: Shipment | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  const [status, setStatus] = useState<ShipmentStatus>(shipment?.status ?? "vorbereitet");
  const [carrier, setCarrier] = useState(shipment?.carrier ?? "");
  const [trackingNumber, setTrackingNumber] = useState(shipment?.trackingNumber ?? "");
  const [shippedAt, setShippedAt] = useState(toDateInput(shipment?.shippedAt ?? null));
  const [deliveredAt, setDeliveredAt] = useState(toDateInput(shipment?.deliveredAt ?? null));

  function handleSave() {
    const data = { carrier, trackingNumber, status, shippedAt, deliveredAt };
    startTransition(async () => {
      if (shipment) {
        await updateShipment(shipment.id, itemId, data);
      } else {
        await createShipment(saleId, itemId, data);
      }
      setEditing(false);
      router.refresh();
    });
  }

  // ── Read-only view ────────────────────────────────────────────
  if (!editing) {
    return (
      <div className="border-t border-border px-5 py-3">
        {shipment ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className={`font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[shipment.status]}`}>
                {STATUS_OPTIONS.find((s) => s.value === shipment.status)?.label}
              </span>
              {shipment.carrier && (
                <span>Carrier: <span className="text-foreground">{shipment.carrier}</span></span>
              )}
              {shipment.trackingNumber && (
                <span>Tracking: <span className="font-mono text-foreground">{shipment.trackingNumber}</span></span>
              )}
              {shipment.shippedAt && (
                <span>Versendet: <span className="text-foreground">{new Date(shipment.shippedAt).toLocaleDateString("de-DE")}</span></span>
              )}
              {shipment.deliveredAt && (
                <span>Zugestellt: <span className="text-foreground">{new Date(shipment.deliveredAt).toLocaleDateString("de-DE")}</span></span>
              )}
            </div>
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 shrink-0"
            >
              Bearbeiten
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Noch keine Sendung erfasst</span>
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              + Sendung anlegen
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Edit form ────────────────────────────────────────────────
  return (
    <div className="border-t border-border px-5 py-4 space-y-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {shipment ? "Sendung bearbeiten" : "Sendung anlegen"}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Status */}
        <div className="col-span-2 sm:col-span-1">
          <label className={labelClass}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Carrier */}
        <div>
          <label className={labelClass}>Carrier</label>
          <input
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className={inputClass}
            placeholder="z.B. DHL, Hermes"
          />
        </div>

        {/* Tracking */}
        <div className="col-span-2">
          <label className={labelClass}>Trackingnummer</label>
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className={cn(inputClass, "font-mono")}
            placeholder="Trackingnummer eingeben"
          />
        </div>

        {/* Versanddatum */}
        <div>
          <label className={labelClass}>Versanddatum</label>
          <input
            type="date"
            value={shippedAt}
            onChange={(e) => setShippedAt(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Zustelldatum */}
        <div>
          <label className={labelClass}>Zustelldatum</label>
          <input
            type="date"
            value={deliveredAt}
            onChange={(e) => setDeliveredAt(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "Speichern…" : "Speichern"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
          Abbrechen
        </Button>
      </div>
    </div>
  );
}

const labelClass = "block text-xs font-medium text-muted-foreground mb-1";
const inputClass =
  "w-full h-8 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50";
