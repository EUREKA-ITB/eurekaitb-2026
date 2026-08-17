export type Phase = "early_bird" | "normal" | "late";
export type CompeType = "physics-olympiad" | "science-project" | "industrial-case";

// --- JEMBATAN KE DATABASE (POSTGRES ENUM PAKAI UNDERSCORE) ---
export type CompeDBType = "physics_olympiad" | "science_project" | "industrial_case";

export const slugToDB: Record<CompeType, CompeDBType> = {
  "physics-olympiad": "physics_olympiad",
  "science-project": "science_project",
  "industrial-case": "industrial_case",
};

export const dbToSlug: Record<CompeDBType, CompeType> = {
  "physics_olympiad": "physics-olympiad",
  "science_project": "science-project",
  "industrial_case": "industrial-case",
};
// -------------------------------------------------------------

export const PHASE_NAMES: Record<Phase, string> = {
  early_bird: "Wave 1",
  normal: "Wave 2",
  late: "Wave 3"
};

export const COMPETITION_PRICING: Record<CompeType, Record<Phase, number>> = {
  "physics-olympiad": { early_bird: 75000, normal: 100000, late: 125000 },
  "science-project": { early_bird: 90000, normal: 120000, late: 150000 },
  "industrial-case": { early_bird: 90000, normal: 120000, late: 150000 },
};

export function getCurrentPhase(): Phase {
  const now = new Date();
  
  const phase2Start = new Date("2026-08-30T00:00:00+07:00");
  const phase3Start = new Date("2026-09-20T00:00:00+07:00");

  if (now >= phase3Start) return "late";
  if (now >= phase2Start) return "normal";
  return "early_bird"; 
}

export function getPrice(compeType: CompeType, phase: Phase): number {
  return COMPETITION_PRICING[compeType][phase];
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("en-ID", { 
    style: "currency", 
    currency: "IDR", 
    minimumFractionDigits: 0 
  }).format(amount);
}