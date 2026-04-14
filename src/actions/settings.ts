"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ── Plattformen ────────────────────────────────────────────────────────────

export async function createPlatform(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const feePct = formData.get("defaultFeePct") as string;
  const url = (formData.get("url") as string).trim();

  if (!name) return;

  await prisma.platform.create({
    data: {
      name,
      defaultFeePct: feePct ? parseFloat(feePct) : null,
      url: url || null,
    },
  });
  revalidatePath("/settings");
}

export async function togglePlatform(id: string, isActive: boolean) {
  await prisma.platform.update({ where: { id }, data: { isActive } });
  revalidatePath("/settings");
}

export async function deletePlatform(id: string) {
  await prisma.platform.delete({ where: { id } });
  revalidatePath("/settings");
}

// ── Lagerorte ──────────────────────────────────────────────────────────────

export async function createStorageLocation(formData: FormData) {
  const code = (formData.get("code") as string).trim().toUpperCase();
  const description = (formData.get("description") as string).trim();
  const type = formData.get("type") as string;

  if (!code) return;

  await prisma.storageLocation.create({
    data: {
      code,
      description: description || null,
      type: type as Parameters<typeof prisma.storageLocation.create>[0]["data"]["type"],
    },
  });
  revalidatePath("/settings");
  revalidatePath("/storage");
}

export async function toggleStorageLocation(id: string, isActive: boolean) {
  await prisma.storageLocation.update({ where: { id }, data: { isActive } });
  revalidatePath("/settings");
}

export async function deleteStorageLocation(id: string) {
  await prisma.storageLocation.delete({ where: { id } });
  revalidatePath("/settings");
  revalidatePath("/storage");
}

// ── Kategorien ─────────────────────────────────────────────────────────────

export async function createCategory(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  if (!name) return;

  await prisma.category.upsert({
    where: { name },
    update: {},
    create: { name },
  });
  revalidatePath("/settings");
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/settings");
}
