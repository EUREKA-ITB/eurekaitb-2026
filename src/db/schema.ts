import { pgTable, uuid, varchar, timestamp, pgEnum, text, boolean, primaryKey, integer } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

// ==============================================================================
// 1. ENUMS
// ==============================================================================
export const roleEnum = pgEnum("role", ["admin", "participant"]);
export const compeTypeEnum = pgEnum("compe_type", [
  "physics_olympiad",  
  "science_project",   
  "industrial_case"    
]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "pending", "verified", "rejected"]);
export const registrationPhaseEnum = pgEnum("registration_phase", ["early_bird", "normal", "late"]);

// ==============================================================================
// 2. USERS (Nama tabel diubah jadi "user" agar dibaca NextAuth)
// ==============================================================================
export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password"),
  emailVerified: timestamp("emailVerified", { mode: "date" }), 
  image: text("image"), 
  role: roleEnum("role").default("participant").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==============================================================================
// 3. TEAMS
// ==============================================================================
export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(), 
  teamName: varchar("team_name", { length: 255 }).notNull(), 
  institutionName: varchar("institution_name", { length: 255 }).notNull(), 
  compeType: compeTypeEnum("compe_type").notNull(),
  registrationPhase: registrationPhaseEnum("registration_phase").notNull(),
  statusPayment: paymentStatusEnum("payment_status").default("unpaid").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  participantNumber: varchar("participant_number", { length: 50 }),
  cbtPassword: varchar("cbt_password", { length: 50 }),
});

// ==============================================================================
// 4. TEAM MEMBERS (Diperbarui dengan Kelas & Pas Foto)
// ==============================================================================
export const teamMembers = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teams.id).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(), 
  phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
  grade: varchar("grade", { length: 50 }).notNull(), // Kelas di SMA atau Semester di Kampus
  photoUrl: text("photo_url").notNull(), // Link dari Cloudinary untuk Pas Foto 3x4
  ktmUrl: text("ktm_url"), 
  proofFollowUrl: text("proof_follow_url"),
  proofShareUrl: text("proof_share_url"),
  igAccountLink: text("ig_account_link").notNull(),
  isLeader: boolean("is_leader").default(false).notNull(), 
});

// ==============================================================================
// 5. DOCUMENTS 
// ==============================================================================
export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teams.id).notNull(),
  urlIdentitas: text("url_identitas"), 
  urlPayment: text("url_payment"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// ==============================================================================
// 6. NEXTAUTH TABEL WAJIB (Diubah jadi singular: account, session, verificationToken)
// ==============================================================================
export const accounts = pgTable("account", {
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<AdapterAccount["type"]>().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));