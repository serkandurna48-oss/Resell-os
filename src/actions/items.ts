"use server";

import { prisma } from "@/lib/prisma";
import { ItemStatus, ItemCondition } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { calculateProfit, getNextStatus } from "@/lib/utils";
import { z } from "zod";

const ItemFormSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  brand: z.string().optional(),
  size: z.string().optional(),
  condition: z.nativeEnum(ItemCondition),
  notes: z.string().optional(),
  purchasePrice: z.coerce.number().min(0),
  targetPrice: z.coerce.number().min(0).optional(),
  storageLocationId: z.string().optional(),
  platformId: z.string().optional(),
});

export async function createItem(formData: z.infer<typeof ItemFormSchema>) {
  const validated = ItemFormSchema.parse(formData);

  const item = await prisma.item.create({
    data: {
      ...validated,
      status: "neu_erfasst",
    },
  });

  await prisma.statusHistory.create({
    data: {
      itemId: item.id,
      fromStatus: "",
      toStatus: "neu_erfasst",
      note: "Item erstellt",
    },
  });

  revalidatePath("/items");
  revalidatePath("/workflow");
  revalidatePath("/");
  return { id: item.id };
}

export async function updateStatus(
  itemId: string,
  newStatus: ItemStatus,
  note?: string
) {
  const item = await prisma.item.findUniqueOrThrow({ where: { id: itemId } });

  await prisma.item.update({
    where: { id: itemId },
    data: { status: newStatus },
  });

  await prisma.statusHistory.create({
    data: {
      itemId,
      fromStatus: item.status,
      toStatus: newStatus,
      note: note ?? null,
    },
  });

  revalidatePath("/items");
  revalidatePath(`/items/${itemId}`);
  revalidatePath("/workflow");
  revalidatePath("/");
}

export async function advanceStatus(itemId: string) {
  const item = await prisma.item.findUniqueOrThrow({ where: { id: itemId } });
  const next = getNextStatus(item.status);
  if (!next) return;
  return updateStatus(itemId, next);
}

export async function getItems(filters?: {
  status?: ItemStatus;
  category?: string;
  platformId?: string;
  storageLocationId?: string;
  search?: string;
}) {
  return prisma.item.findMany({
    where: {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.platformId && { platformId: filters.platformId }),
      ...(filters?.storageLocationId && {
        storageLocationId: filters.storageLocationId,
      }),
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search, mode: "insensitive" } },
          { brand: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      storageLocation: true,
      platform: true,
      sale: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateItem(
  id: string,
  formData: z.infer<typeof ItemFormSchema> & { notes?: string }
) {
  const validated = ItemFormSchema.parse(formData);

  const updated = await prisma.item.update({
    where: { id },
    data: {
      ...validated,
      notes: formData.notes || null,
    },
  });

  revalidatePath("/items");
  revalidatePath(`/items/${id}`);
  revalidatePath("/workflow");
}

export async function getItemById(id: string) {
  return prisma.item.findUnique({
    where: { id },
    include: {
      storageLocation: true,
      platform: true,
      sale: { include: { shipment: true, platform: true } },
      statusHistory: { orderBy: { changedAt: "asc" } },
    },
  });
}

export async function deleteItem(id: string) {
  const item = await prisma.item.findUnique({
    where: { id },
    include: { sale: { include: { shipment: true } } },
  });
  if (!item) return;

  await prisma.statusHistory.deleteMany({ where: { itemId: id } });

  if (item.sale) {
    if (item.sale.shipment) {
      await prisma.shipment.delete({ where: { id: item.sale.shipment.id } });
    }
    await prisma.sale.delete({ where: { id: item.sale.id } });
  }

  await prisma.item.delete({ where: { id } });

  revalidatePath("/items");
  revalidatePath("/workflow");
  revalidatePath("/");
}
