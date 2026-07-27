"use server";

import { db } from "@/db";
import { sideEventBlocks } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addBlock(data: { type: "link" | "image" | "text" | "video", title: string, url: string, iconUrl: string, isPrimary: boolean }) {
  try {
    const allBlocks = await db.select().from(sideEventBlocks).orderBy(asc(sideEventBlocks.orderIndex));
    const newIndex = allBlocks.length > 0 ? (allBlocks[allBlocks.length - 1].orderIndex ?? 0) + 1 : 0;

    await db.insert(sideEventBlocks).values({
      type: data.type,
      title: data.title,
      url: data.url,
      iconUrl: data.iconUrl,
      isPrimary: data.isPrimary,
      isActive: true,
      orderIndex: newIndex,
    });
    revalidatePath("/mini-competition");
    revalidatePath("/adm-se");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create content block." };
  }
}

export async function deleteBlock(id: string) {
  try {
    await db.delete(sideEventBlocks).where(eq(sideEventBlocks.id, id));
    revalidatePath("/mini-competition");
    revalidatePath("/adm-se");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete block." };
  }
}

export async function toggleActiveStatus(id: string, currentStatus: boolean) {
  try {
    await db.update(sideEventBlocks).set({ isActive: !currentStatus }).where(eq(sideEventBlocks.id, id));
    revalidatePath("/mini-competition");
    revalidatePath("/adm-se");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update status." };
  }
}

export async function editBlock(id: string, data: { title: string, url: string, iconUrl: string, isPrimary: boolean }) {
  try {
    await db.update(sideEventBlocks).set({
      title: data.title,
      url: data.url,
      iconUrl: data.iconUrl,
      isPrimary: data.isPrimary,
    }).where(eq(sideEventBlocks.id, id));
    
    revalidatePath("/mini-competition");
    revalidatePath("/adm-se");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update block." };
  }
}

export async function moveBlock(id: string, direction: "up" | "down") {
  try {
    const allBlocks = await db.select().from(sideEventBlocks).orderBy(asc(sideEventBlocks.orderIndex));
    const currentIndex = allBlocks.findIndex(b => b.id === id);
    
    if (currentIndex === -1) return { error: "Block not found" };
    if (direction === "up" && currentIndex === 0) return { success: true };
    if (direction === "down" && currentIndex === allBlocks.length - 1) return { success: true };

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const currentBlock = allBlocks[currentIndex];
    const targetBlock = allBlocks[targetIndex];

    await db.update(sideEventBlocks).set({ orderIndex: targetBlock.orderIndex }).where(eq(sideEventBlocks.id, currentBlock.id));
    await db.update(sideEventBlocks).set({ orderIndex: currentBlock.orderIndex }).where(eq(sideEventBlocks.id, targetBlock.id));

    revalidatePath("/mini-competition");
    revalidatePath("/adm-se");
    return { success: true };
  } catch (error) {
    return { error: "Failed to move block." };
  }
}