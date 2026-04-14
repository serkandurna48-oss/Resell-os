"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const [
    totalItems,
    listedItems,
    soldItems,
    pendingShipments,
    salesAggregate,
    actionItems,
  ] = await Promise.all([
    prisma.item.count(),
    prisma.item.count({ where: { status: "gelistet" } }),
    prisma.item.count({ where: { status: "abgeschlossen" } }),
    prisma.shipment.count({
      where: { status: { in: ["vorbereitet", "versendet"] } },
    }),
    prisma.sale.aggregate({
      _sum: { salePrice: true, profit: true },
    }),
    prisma.item.findMany({
      where: {
        status: {
          in: ["zu_pruefen", "zu_reinigen", "ready_fuer_fotos", "verpackt"],
        },
      },
      select: { id: true, title: true, status: true },
      take: 10,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return {
    totalItems,
    listedItems,
    soldItems,
    pendingShipments,
    totalRevenue: Number(salesAggregate._sum.salePrice ?? 0),
    totalProfit: Number(salesAggregate._sum.profit ?? 0),
    actionItems,
  };
}
