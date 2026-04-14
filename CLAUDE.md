# ResellOS – Projektkontext für Claude Code

## Was ist die App?
Ein internes Betriebssystem für Reselling. Abbildung des kompletten Item-Lifecycles – von der Erfassung im Keller bis zum gebuchten Gewinn.

**Kein** Marketplace, keine öffentliche Schnittstelle, kein Vinted-Klon.

---

## Tech-Stack
- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Datenbank:** PostgreSQL via Supabase
- **ORM:** Prisma
- **UI:** shadcn/ui + Tailwind CSS
- **Formulare:** React Hook Form + Zod
- **Tabellen:** TanStack Table
- **Kanban/DnD:** dnd-kit
- **Deployment:** Vercel

---

## Ordnerstruktur

```
resell-os/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard
│   │   ├── items/
│   │   │   ├── page.tsx          # Item-Liste
│   │   │   ├── [id]/page.tsx     # Item-Detail
│   │   │   └── new/page.tsx      # Neues Item
│   │   ├── workflow/page.tsx     # Kanban Board
│   │   ├── storage/page.tsx      # Lagerorte
│   │   ├── finances/page.tsx     # Gewinnübersicht
│   │   └── settings/page.tsx
│   ├── components/
│   │   ├── ui/                   # shadcn-Komponenten
│   │   ├── items/
│   │   │   ├── ItemTable.tsx
│   │   │   ├── ItemCard.tsx
│   │   │   ├── ItemForm.tsx
│   │   │   ├── ItemDetail.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── workflow/
│   │   │   ├── KanbanBoard.tsx
│   │   │   └── KanbanColumn.tsx
│   │   ├── dashboard/
│   │   │   ├── KpiCard.tsx
│   │   │   └── ActionList.tsx
│   │   └── shared/
│   │       ├── Sidebar.tsx
│   │       └── PageHeader.tsx
│   ├── lib/
│   │   ├── prisma.ts             # Prisma Client Singleton
│   │   ├── constants.ts          # Status-Definitionen, Farben
│   │   └── utils.ts              # Gewinnkalkulation, Formatierung
│   ├── actions/
│   │   ├── items.ts
│   │   ├── sales.ts
│   │   ├── shipments.ts
│   │   └── dashboard.ts
│   └── types/
│       └── index.ts
```

---

## Datenmodell (Prisma Schema)

### Item
```
id                  UUID (PK)
title               String
category            String
brand               String?
size                String?
condition           Enum: neu | sehr_gut | gut | akzeptabel
notes               String?
purchasePrice       Decimal
targetPrice         Decimal?
status              Enum (siehe Statusmodell)
storageLocationId   UUID (FK → StorageLocation)
platformId          UUID? (FK → Platform)
createdAt           DateTime
updatedAt           DateTime
```

### Sale
```
id            UUID (PK)
itemId        UUID (FK → Item, unique)
platformId    UUID (FK → Platform)
salePrice     Decimal
platformFee   Decimal
shippingCost  Decimal
otherCosts    Decimal?
profit        Decimal (berechnet)
soldAt        DateTime
buyerNote     String?
```

### Shipment
```
id              UUID (PK)
saleId          UUID (FK → Sale, unique)
trackingNumber  String?
carrier         String?
status          Enum: vorbereitet | versendet | zugestellt | problem
shippedAt       DateTime?
deliveredAt     DateTime?
```

### StorageLocation
```
id          UUID (PK)
code        String UNIQUE
description String?
type        Enum: stange | regal | box | versandzone | sonstiges
isActive    Boolean
```

### Platform
```
id            UUID (PK)
name          String UNIQUE
defaultFeePct Decimal?
url           String?
isActive      Boolean
```

### StatusHistory
```
id          UUID (PK)
itemId      UUID (FK → Item)
fromStatus  String
toStatus    String
note        String?
changedAt   DateTime
```

---

## Statusmodell (kompletter Lifecycle)

```
neu_erfasst       → Startpunkt
zu_pruefen        → Bewertung (Zustand, Wert)
zu_reinigen       → Waschen / Aufbereiten
ready_fuer_fotos  → Bereit für Fotos
fotografiert      → Fotos vorhanden
gelistet          → Aktiv auf Plattform
reserviert        → Käufer hat Interesse (Seitenpfad)
verkauft          → Kauf bestätigt, Sale wird angelegt
verpackt          → Physisch verpackt
versendet         → Tracking läuft
abgeschlossen     → Zugestellt, Gewinn gebucht (Endstatus)
bundle            → Mit anderem Item gebündelt (Seitenpfad)
spende            → Wird gespendet (Endstatus)
entsorgt          → Weggeworfen (Endstatus)
```

**Linearer Hauptflow:**
`neu_erfasst → zu_pruefen → zu_reinigen → ready_fuer_fotos → fotografiert → gelistet → verkauft → verpackt → versendet → abgeschlossen`

---

## Server Actions (bereits definiert)

### actions/items.ts
- `createItem(data)` → Item anlegen + StatusHistory-Eintrag
- `updateStatus(itemId, newStatus, note?)` → Status wechseln + History
- `advanceStatus(itemId)` → einen Schritt im linearen Flow weiter
- `getItems(filters?)` → gefilterte Item-Liste mit Relations
- `getItemById(id)` → Item mit Sale, Shipment, StatusHistory

### actions/sales.ts
- `createSale(data)` → Sale anlegen, Profit berechnen, Status → verkauft

### actions/dashboard.ts
- `getDashboardStats()` → KPIs: totalItems, listedItems, soldItems, pendingShipments, totalRevenue, totalProfit, actionItems

---

## UX-Konzept

### Navigation
- Sidebar (Desktop) / Bottom-Tabs (Mobile): Dashboard | Items | Workflow | Lager | Finanzen | Einstellungen

### Dashboard
- KPI-Cards: Aktive Items / Gelistet / Verkauft / Offene Sendungen / Gewinn gesamt
- „Was steht an?" – Items mit Handlungsbedarf (zu_pruefen, zu_reinigen, ready_fuer_fotos, verpackt)
- Letzte Aktivitäten (Statuswechsel letzte 7 Tage)

### Items – Liste
- Tabelle: ID, Titel, Marke, Status, Lagerort, Preis, Gewinn
- Statusbadge farbkodiert (rot = Handlungsbedarf, gelb = in Arbeit, grün = done)
- Filter: Status, Kategorie, Plattform, Lagerort
- Quick Actions: Status weiterschalten, Edit, Detail

### Workflow Board
- Kanban mit Spalten je Status
- Drag & Drop per dnd-kit
- Kompakte Karten: Titel, Marke, Lagerort

### Item Detail
- Alle Felder + Gewinnkalkulation
- Statushistorie als Timeline
- „Status weiterschalten"-Button

### Finanzen
- Gesamtgewinn, Umsatz, Durchschnitt je Item
- Aufschlüsselung nach Plattform
- Zeitraumfilter

---

## MVP-Scope (Version 1)

**Enthalten:**
- Item-CRUD mit Statusmodell
- Lagerortverwaltung
- Dashboard mit Live-KPIs
- Gewinn- und Umsatztracking
- Filter und Suche
- Kanban Workflow Board

**Bewusst nicht enthalten:**
- Foto-Upload
- KI-Features
- QR-/Barcode-Scanning
- Multi-User / Auth
- Native Mobile App
- API-Anbindung Vinted/eBay
