"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ItemCondition } from "@prisma/client";
import { createItem } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(1, "Pflichtfeld"),
  category: z.string().min(1, "Pflichtfeld"),
  brand: z.string().optional(),
  size: z.string().optional(),
  condition: z.enum(["neu", "sehr_gut", "gut", "akzeptabel"]),
  purchasePrice: z.string().min(1, "Pflichtfeld"),
  targetPrice: z.string().optional(),
  storageLocationId: z.string().optional(),
  platformId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Platform = { id: string; name: string };
type StorageLocation = { id: string; code: string; description: string | null };

export default function NewItemDialog({
  platforms,
  storageLocations,
}: {
  platforms: Platform[];
  storageLocations: StorageLocation[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { condition: "gut" },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      await createItem({
        title: values.title,
        category: values.category,
        brand: values.brand || undefined,
        size: values.size || undefined,
        condition: values.condition as ItemCondition,
        purchasePrice: parseFloat(values.purchasePrice),
        targetPrice: values.targetPrice ? parseFloat(values.targetPrice) : undefined,
        storageLocationId: values.storageLocationId || undefined,
        platformId: values.platformId || undefined,
      });
      reset();
      setOpen(false);
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Neues Item</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">Neues Item</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-xl leading-none text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Titel */}
                <div className="col-span-2">
                  <label className={labelClass}>Titel *</label>
                  <input
                    {...register("title")}
                    className={inputClass(!!errors.title)}
                    placeholder="z.B. Nike Air Max 90"
                  />
                  {errors.title && <p className={errorClass}>{errors.title.message}</p>}
                </div>

                {/* Kategorie */}
                <div>
                  <label className={labelClass}>Kategorie *</label>
                  <input
                    {...register("category")}
                    className={inputClass(!!errors.category)}
                    placeholder="z.B. Schuhe"
                  />
                  {errors.category && <p className={errorClass}>{errors.category.message}</p>}
                </div>

                {/* Marke */}
                <div>
                  <label className={labelClass}>Marke</label>
                  <input
                    {...register("brand")}
                    className={inputClass()}
                    placeholder="z.B. Nike"
                  />
                </div>

                {/* Größe */}
                <div>
                  <label className={labelClass}>Größe</label>
                  <input
                    {...register("size")}
                    className={inputClass()}
                    placeholder="z.B. 42 / M / XL"
                  />
                </div>

                {/* Zustand */}
                <div>
                  <label className={labelClass}>Zustand *</label>
                  <select {...register("condition")} className={inputClass()}>
                    <option value="neu">Neu</option>
                    <option value="sehr_gut">Sehr gut</option>
                    <option value="gut">Gut</option>
                    <option value="akzeptabel">Akzeptabel</option>
                  </select>
                </div>

                {/* Einkaufspreis */}
                <div>
                  <label className={labelClass}>Einkaufspreis (€) *</label>
                  <input
                    {...register("purchasePrice")}
                    type="number"
                    step="0.01"
                    min="0"
                    className={inputClass(!!errors.purchasePrice)}
                    placeholder="0,00"
                  />
                  {errors.purchasePrice && <p className={errorClass}>{errors.purchasePrice.message}</p>}
                </div>

                {/* Zielpreis */}
                <div>
                  <label className={labelClass}>Zielpreis (€)</label>
                  <input
                    {...register("targetPrice")}
                    type="number"
                    step="0.01"
                    min="0"
                    className={inputClass()}
                    placeholder="0,00"
                  />
                </div>

                {/* Plattform */}
                <div>
                  <label className={labelClass}>Plattform</label>
                  <select {...register("platformId")} className={inputClass()}>
                    <option value="">– keine –</option>
                    {platforms.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Lagerort */}
                <div>
                  <label className={labelClass}>Lagerort</label>
                  <select {...register("storageLocationId")} className={inputClass()}>
                    <option value="">– kein –</option>
                    {storageLocations.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code}{s.description ? ` – ${s.description}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { reset(); setOpen(false); }}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Speichern…" : "Item anlegen"}
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
const errorClass = "mt-1 text-xs text-destructive";

function inputClass(error?: boolean) {
  return cn(
    "w-full h-8 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50",
    error ? "border-destructive" : "border-border"
  );
}
