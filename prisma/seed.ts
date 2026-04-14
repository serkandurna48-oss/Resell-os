import { PrismaClient, ItemStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding...");

  // Cleanup
  await prisma.statusHistory.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.item.deleteMany();
  await prisma.storageLocation.deleteMany();
  await prisma.platform.deleteMany();

  // ── Plattformen ────────────────────────────────────────────────
  const [vinted, ebay, kleinanzeigen] = await Promise.all([
    prisma.platform.create({
      data: { name: "Vinted", defaultFeePct: 5.0, url: "https://vinted.de", isActive: true },
    }),
    prisma.platform.create({
      data: { name: "eBay", defaultFeePct: 12.9, url: "https://ebay.de", isActive: true },
    }),
    prisma.platform.create({
      data: { name: "Kleinanzeigen", defaultFeePct: 0.0, url: "https://kleinanzeigen.de", isActive: true },
    }),
  ]);

  // ── Lagerorte ──────────────────────────────────────────────────
  const [stange1, regal1, boxSommer, versandzone] = await Promise.all([
    prisma.storageLocation.create({
      data: { code: "ST-01", description: "Kleiderstange links", type: "stange" },
    }),
    prisma.storageLocation.create({
      data: { code: "RE-01", description: "Regal oben", type: "regal" },
    }),
    prisma.storageLocation.create({
      data: { code: "BX-01", description: "Box Sommersachen", type: "box" },
    }),
    prisma.storageLocation.create({
      data: { code: "VZ-01", description: "Versandzone", type: "versandzone" },
    }),
  ]);

  // ── Items ──────────────────────────────────────────────────────
  const itemsData: Array<{
    title: string;
    category: string;
    brand?: string;
    size?: string;
    condition: "neu" | "sehr_gut" | "gut" | "akzeptabel";
    purchasePrice: number;
    targetPrice?: number;
    status: ItemStatus;
    storageLocationId?: string;
    platformId?: string;
    notes?: string;
  }> = [
    {
      title: "Nike Air Max 90 Weiß",
      category: "Schuhe",
      brand: "Nike",
      size: "43",
      condition: "sehr_gut",
      purchasePrice: 12.0,
      targetPrice: 55.0,
      status: "gelistet",
      storageLocationId: regal1.id,
      platformId: vinted.id,
    },
    {
      title: "Levi's 501 Jeans Blau",
      category: "Hosen",
      brand: "Levi's",
      size: "32/32",
      condition: "gut",
      purchasePrice: 8.0,
      targetPrice: 35.0,
      status: "fotografiert",
      storageLocationId: stange1.id,
    },
    {
      title: "Adidas Originals Hoodie Schwarz",
      category: "Oberteile",
      brand: "Adidas",
      size: "L",
      condition: "sehr_gut",
      purchasePrice: 6.0,
      targetPrice: 28.0,
      status: "gelistet",
      storageLocationId: stange1.id,
      platformId: vinted.id,
    },
    {
      title: "Ralph Lauren Poloshirt Weiß",
      category: "Oberteile",
      brand: "Ralph Lauren",
      size: "M",
      condition: "neu",
      purchasePrice: 15.0,
      targetPrice: 45.0,
      status: "gelistet",
      storageLocationId: stange1.id,
      platformId: ebay.id,
    },
    {
      title: "Zara Winterjacke Beige",
      category: "Jacken",
      brand: "Zara",
      size: "S",
      condition: "gut",
      purchasePrice: 10.0,
      targetPrice: 30.0,
      status: "ready_fuer_fotos",
      storageLocationId: stange1.id,
    },
    {
      title: "Puma Sneaker Grau",
      category: "Schuhe",
      brand: "Puma",
      size: "42",
      condition: "akzeptabel",
      purchasePrice: 4.0,
      targetPrice: 18.0,
      status: "zu_reinigen",
      storageLocationId: boxSommer.id,
      notes: "Sohle hat leichte Verfärbung",
    },
    {
      title: "Tommy Hilfiger Gürtel Leder",
      category: "Accessoires",
      brand: "Tommy Hilfiger",
      condition: "sehr_gut",
      purchasePrice: 3.0,
      targetPrice: 20.0,
      status: "zu_pruefen",
    },
    {
      title: "H&M Leinenhemd Hellblau",
      category: "Oberteile",
      brand: "H&M",
      size: "XL",
      condition: "gut",
      purchasePrice: 2.0,
      targetPrice: 12.0,
      status: "neu_erfasst",
    },
    {
      title: "New Balance 574 Navy",
      category: "Schuhe",
      brand: "New Balance",
      size: "41",
      condition: "sehr_gut",
      purchasePrice: 18.0,
      targetPrice: 60.0,
      status: "verpackt",
      storageLocationId: versandzone.id,
      platformId: kleinanzeigen.id,
    },
    {
      title: "Fjällräven Rucksack Grün",
      category: "Taschen",
      brand: "Fjällräven",
      condition: "sehr_gut",
      purchasePrice: 20.0,
      targetPrice: 75.0,
      status: "gelistet",
      storageLocationId: regal1.id,
      platformId: ebay.id,
    },
    {
      title: "Esprit Sommerjacke Rosa",
      category: "Jacken",
      brand: "Esprit",
      size: "M",
      condition: "gut",
      purchasePrice: 5.0,
      targetPrice: 22.0,
      status: "neu_erfasst",
      storageLocationId: boxSommer.id,
    },
    {
      title: "Calvin Klein T-Shirt 3er Pack",
      category: "Oberteile",
      brand: "Calvin Klein",
      size: "M",
      condition: "neu",
      purchasePrice: 9.0,
      targetPrice: 32.0,
      status: "fotografiert",
      storageLocationId: stange1.id,
    },
    // ── Sales-Items (werden unten mit Sale verknüpft) ────────────
    {
      title: "Converse Chuck Taylor High Weiß",
      category: "Schuhe",
      brand: "Converse",
      size: "39",
      condition: "gut",
      purchasePrice: 7.0,
      status: "abgeschlossen",
      storageLocationId: versandzone.id,
      platformId: vinted.id,
    },
    {
      title: "Carhartt WIP Beanie Schwarz",
      category: "Accessoires",
      brand: "Carhartt",
      condition: "sehr_gut",
      purchasePrice: 4.0,
      status: "abgeschlossen",
      platformId: vinted.id,
    },
    {
      title: "Uniqlo Ultralight Jacke Blau",
      category: "Jacken",
      brand: "Uniqlo",
      size: "L",
      condition: "sehr_gut",
      purchasePrice: 14.0,
      status: "versendet",
      storageLocationId: versandzone.id,
      platformId: ebay.id,
    },
  ];

  const items = await Promise.all(
    itemsData.map((data) =>
      prisma.item.create({
        data: {
          title: data.title,
          category: data.category,
          brand: data.brand,
          size: data.size,
          condition: data.condition,
          purchasePrice: data.purchasePrice,
          targetPrice: data.targetPrice,
          status: data.status,
          notes: data.notes,
          ...(data.storageLocationId && { storageLocationId: data.storageLocationId }),
          ...(data.platformId && { platformId: data.platformId }),
        },
      })
    )
  );

  console.log(`${items.length} Items erstellt.`);

  // ── StatusHistory für alle Items ───────────────────────────────
  await Promise.all(
    items.map((item) =>
      prisma.statusHistory.create({
        data: {
          itemId: item.id,
          fromStatus: "",
          toStatus: "neu_erfasst",
          note: "Seed",
        },
      })
    )
  );

  // ── Sales für abgeschlossene Items ─────────────────────────────
  const converseItem = items.find((i) => i.title.includes("Converse"))!;
  const carharttItem = items.find((i) => i.title.includes("Carhartt"))!;
  const uniqloItem = items.find((i) => i.title.includes("Uniqlo"))!;

  // Sale 1: Converse auf Vinted — 28 € Verkauf, 5% Fee, 4.20 Versand
  const sale1 = await prisma.sale.create({
    data: {
      itemId: converseItem.id,
      platformId: vinted.id,
      salePrice: 28.0,
      platformFee: 1.4,   // 5% von 28
      shippingCost: 4.2,
      otherCosts: 0,
      profit: 28.0 - 7.0 - 1.4 - 4.2, // 15.40
      soldAt: new Date("2024-11-15"),
    },
  });

  await prisma.shipment.create({
    data: {
      saleId: sale1.id,
      trackingNumber: "1234567890DE",
      carrier: "DHL",
      status: "zugestellt",
      shippedAt: new Date("2024-11-16"),
      deliveredAt: new Date("2024-11-18"),
    },
  });

  // Sale 2: Carhartt Beanie auf Vinted — 18 € Verkauf, 5% Fee, 2.90 Versand
  const sale2 = await prisma.sale.create({
    data: {
      itemId: carharttItem.id,
      platformId: vinted.id,
      salePrice: 18.0,
      platformFee: 0.9,   // 5% von 18
      shippingCost: 2.9,
      otherCosts: 0,
      profit: 18.0 - 4.0 - 0.9 - 2.9, // 10.20
      soldAt: new Date("2024-12-03"),
    },
  });

  await prisma.shipment.create({
    data: {
      saleId: sale2.id,
      trackingNumber: "9876543210DE",
      carrier: "Hermes",
      status: "zugestellt",
      shippedAt: new Date("2024-12-04"),
      deliveredAt: new Date("2024-12-06"),
    },
  });

  // Sale 3: Uniqlo auf eBay — 42 € Verkauf, 12.9% Fee, 4.99 Versand — noch unterwegs
  const sale3 = await prisma.sale.create({
    data: {
      itemId: uniqloItem.id,
      platformId: ebay.id,
      salePrice: 42.0,
      platformFee: 5.42,  // 12.9% von 42
      shippingCost: 4.99,
      otherCosts: 0,
      profit: 42.0 - 14.0 - 5.42 - 4.99, // 17.59
      soldAt: new Date("2025-01-08"),
    },
  });

  await prisma.shipment.create({
    data: {
      saleId: sale3.id,
      trackingNumber: "5555666677DE",
      carrier: "DHL",
      status: "versendet",
      shippedAt: new Date("2025-01-09"),
    },
  });

  const totalProfit =
    (28.0 - 7.0 - 1.4 - 4.2) +
    (18.0 - 4.0 - 0.9 - 2.9) +
    (42.0 - 14.0 - 5.42 - 4.99);

  console.log(`3 Sales erstellt. Gesamtgewinn: ${totalProfit.toFixed(2)} €`);
  console.log("Seed abgeschlossen.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
