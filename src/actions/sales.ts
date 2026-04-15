"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { calculateProfit } from "@/lib/utils";
import { z } from "zod";

const SaleSchema = z.object({
  itemId: z.string().uuid(),
  platformId: z.string().uuid(),
  salePrice: z.coerce.number().min(0),
  platformFee: z.coerce.number().min(0).default(0),
  shippingCost: z.coerce.number().min(0).default(0),
  otherCosts: z.coerce.number().min(0).default(0),
  buyerNote: z.string().optional(),
});

export async function createSale(data: z.infer<typeof SaleSchema>) {
  const validated = SaleSchema.parse(data);

  const item = await prisma.item.findUniqueOrThrow({
    where: { id: validated.itemId },
  });

  const profit = calculateProfit(
    validated.salePrice,
    Number(item.purchasePrice),
    validated.platformFee,
    validated.shippingCost,
    validated.otherCosts
  );

  const sale = await prisma.sale.create({
    data: { ...validated, profit },
  });

  await prisma.item.update({
    where: { id: validated.itemId },
    data: { status: "verkauft" },
  });

  await prisma.statusHistory.create({
    data: {
      itemId: validated.itemId,
      fromStatus: item.status,
      toStatus: "verkauft",
      note: `Verkauft für ${validated.salePrice} €`,
    },
  });

  revalidatePath("/items");
  revalidatePath("/finances");
  revalidatePath("/workflow");
  revalidatePath("/");
  revalidatePath(`/items/${validated.itemId}`);
  return { id: sale.id };
}
