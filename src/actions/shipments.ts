"use server";

import { prisma } from "@/lib/prisma";
import { ShipmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createShipment(
  saleId: string,
  itemId: string,
  data: {
    carrier?: string;
    trackingNumber?: string;
    status: ShipmentStatus;
    shippedAt?: string;
    deliveredAt?: string;
  }
) {
  await prisma.shipment.create({
    data: {
      saleId,
      carrier: data.carrier || null,
      trackingNumber: data.trackingNumber || null,
      status: data.status,
      shippedAt: data.shippedAt ? new Date(data.shippedAt) : null,
      deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : null,
    },
  });

  revalidatePath(`/items/${itemId}`);
}

export async function updateShipment(
  shipmentId: string,
  itemId: string,
  data: {
    carrier?: string;
    trackingNumber?: string;
    status: ShipmentStatus;
    shippedAt?: string;
    deliveredAt?: string;
  }
) {
  await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      carrier: data.carrier || null,
      trackingNumber: data.trackingNumber || null,
      status: data.status,
      shippedAt: data.shippedAt ? new Date(data.shippedAt) : null,
      deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : null,
    },
  });

  revalidatePath(`/items/${itemId}`);
  revalidatePath("/finances");
}
