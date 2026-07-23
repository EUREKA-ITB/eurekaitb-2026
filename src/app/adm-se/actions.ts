"use server";

import { db } from "@/db";
import { sideEventBlocks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addBlock(data: { type: "link" | "image" | "text" | "video", title: string, url: string, iconUrl: string, isPrimary: boolean }) {
  try {
    await db.insert(sideEventBlocks).values({
      type: data.type,
      title: data.title,
      url: data.url,
      iconUrl: data.iconUrl,
      isPrimary: data.isPrimary,
      isActive: true,
    });
    revalidatePath("/side-event");
    revalidatePath("/adm-se");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create content block." };
  }
}

export async function deleteBlock(id: string) {
  try {
    await db.delete(sideEventBlocks).where(eq(sideEventBlocks.id, id));
    revalidatePath("/side-event");
    revalidatePath("/adm-se");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete block." };
  }
}

export async function toggleActiveStatus(id: string, currentStatus: boolean) {
  try {
    await db.update(sideEventBlocks).set({ isActive: !currentStatus }).where(eq(sideEventBlocks.id, id));
    revalidatePath("/side-event");
    revalidatePath("/adm-se");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update status." };
  }
}

// ... (biarkan fungsi addBlock, deleteBlock, dan toggleActiveStatus yang sudah ada)

// TAMBAHKAN FUNGSI INI DI PALING BAWAH
export async function editBlock(id: string, data: { title: string, url: string, iconUrl: string, isPrimary: boolean }) {
  try {
    await db.update(sideEventBlocks).set({
      title: data.title,
      url: data.url,
      iconUrl: data.iconUrl,
      isPrimary: data.isPrimary,
    }).where(eq(sideEventBlocks.id, id));
    
    revalidatePath("/side-event");
    revalidatePath("/adm-se");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update block." };
  }
}