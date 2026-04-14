"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSale } from "@/actions/sales";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Platform = {
  id: string;
  name: string;
  defaultFeePct: unknown;
};

export default function SaleDialog({
  itemId,
  purchasePrice,
  platforms,
  defaultPlatformId,
}: {
  itemId: string;
  purchasePrice: number;
  platforms: Platform[];
  defaultPlatformId: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [platformId, setPlatformId] = useState(defaultPlatformId ?? platforms[0]?.id ?? "");
  const [salePrice, setSalePrice] = useState("");
  const [platformFee, setPlatformFee] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [otherCosts, setOtherCosts] = useState("");
  const [buyerNote, setBuyerNote] = useState("");
  const [feeAutoMode, setFeeAutoMode] = useState(true); // auto-calc fee from platform %

  const currentPlatform = platforms.find((p) => p.id === platformId);
  const feePct = currentPlatform ? Number(currentPlatform.defaultFeePct ?? 0) : 0;

  // Auto-calculate fee when salePrice or platform changes
  useEffect(() => {
    if (!feeAutoMode) return;
    const price = parseFloat(salePrice);
    if (!isNaN(price) && feePct > 0) {
      setPlatformFee(((price * feePct) / 100).toFixed(2));
    } else {
      setPlatformFee("");
    }
  }, [salePrice, platformId, feeAutoMode, feePct]);

  // Live profit preview
  const price = parseFloat(salePrice) || 0;
  const fee = parseFloat(platformFee) || 0;
  const shipping = parseFloat(shippingCost) || 0;
  const other = parseFloat(otherCosts) || 0;
  const profit = price - purchasePrice - fee - shipping - other;
  const margin = price > 0 ? (profit / price) * 100 : 0;

  function reset() {
    setPlatformId(defaultPlatformId ?? platforms[0]?.id ?? "");
    setSalePrice("");
    setPlatformFee("");
    setShippingCost("");
    setOtherCosts("");
    setBuyerNote("");
    setFeeAutoMode(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!platformId || !salePrice) return;

    startTransition(async () => {
      await createSale({
        itemId,
        platformId,
        salePrice: parseFloat(salePrice),
        platformFee: fee,
        shippingCost: shipping,
        otherCosts: other,
        buyerNote: buyerNote || undefined,
      });
      reset();
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Verkauf erfassen
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">Verkauf erfassen</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-xl leading-none text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Plattform */}
              <div>
                <label className={labelClass}>Plattform *</label>
                <select
                  value={platformId}
                  onChange={(e) => {
                    setPlatformId(e.target.value);
                    setFeeAutoMode(true);
                  }}
                  className={inputClass}
                  required
                >
                  {platforms.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Verkaufspreis */}
              <div>
                <label className={labelClass}>Verkaufspreis (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className={inputClass}
                  placeholder="0,00"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Plattformgebühr */}
                <div>
                  <label className={labelClass}>
                    Plattformgebühr (€)
                    {feePct > 0 && (
                      <span className="ml-1 text-muted-foreground font-normal">
                        · {feePct} %
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={platformFee}
                    onChange={(e) => {
                      setPlatformFee(e.target.value);
                      setFeeAutoMode(false);
                    }}
                    className={inputClass}
                    placeholder="0,00"
                  />
                </div>

                {/* Versandkosten */}
                <div>
                  <label className={labelClass}>Versandkosten (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    className={inputClass}
                    placeholder="0,00"
                  />
                </div>

                {/* Sonstige Kosten */}
                <div>
                  <label className={labelClass}>Sonstige Kosten (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={otherCosts}
                    onChange={(e) => setOtherCosts(e.target.value)}
                    className={inputClass}
                    placeholder="0,00"
                  />
                </div>

                {/* Notiz */}
                <div>
                  <label className={labelClass}>Käufer-Notiz</label>
                  <input
                    type="text"
                    value={buyerNote}
                    onChange={(e) => setBuyerNote(e.target.value)}
                    className={inputClass}
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Live Gewinnvorschau */}
              {price > 0 && (
                <div
                  className={cn(
                    "rounded-lg px-4 py-3 flex items-center justify-between text-sm",
                    profit >= 0 ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"
                  )}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Gewinnvorschau</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatCurrency(price)} VK</span>
                      <span>– {formatCurrency(purchasePrice)} EK</span>
                      {fee > 0 && <span>– {formatCurrency(fee)} Geb.</span>}
                      {shipping > 0 && <span>– {formatCurrency(shipping)} Vers.</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-base font-semibold tabular-nums", profit >= 0 ? "text-emerald-600" : "text-red-600")}>
                      {formatCurrency(profit)}
                    </p>
                    <p className="text-xs text-muted-foreground">{margin.toFixed(1)} % Marge</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => { reset(); setOpen(false); }}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={isPending || !salePrice || !platformId}>
                  {isPending ? "Speichern…" : "Verkauf speichern"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const labelClass = "block text-xs font-medium text-muted-foreground mb-1";
const inputClass =
  "w-full h-8 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50";
