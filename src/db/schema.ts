import { pgTable, uuid, varchar, timestamp, pgEnum, text, boolean, primaryKey, integer } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

export const roleEnum = pgEnum("role", ["admin", "admin_se", "participant"]);

// FIX: Enum sekarang menggunakan hyphen (-)
export const compeTypeEnum = pgEnum("compe_type", ["physics-olympiad", "science-project", "industrial-case"]);

export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "pending", "verified", "rejected"]);
export const registrationPhaseEnum = pgEnum("registration_phase", ["early_bird", "normal", "late"]);
export const abstractStatusEnum = pgEnum("abstract_status", ["waiting", "passed", "failed"]); 

export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password"),
  institution: varchar("institution", { length: 255 }),
  educationLevel: varchar("education_level", { length: 50 }),
  identityNumber: varchar("identity_number", { length: 100 }),
  emailVerified: timestamp("emailVerified", { mode: "date" }), 
  image: text("image"), 
  role: roleEnum("role").default("participant").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(), 
  teamName: varchar("team_name", { length: 255 }).notNull(), 
  institutionName: varchar("institution_name", { length: 255 }).notNull(), 
  compeType: compeTypeEnum("compe_type").notNull(),
  registrationPhase: registrationPhaseEnum("registration_phase").notNull(),
  statusPayment: paymentStatusEnum("payment_status").default("unpaid").notNull(),
  abstractUrl: text("abstract_url"), 
  abstractStatus: abstractStatusEnum("abstract_status").default("waiting").notNull(),
  caseChoice: varchar("case_choice", { length: 100 }), 
  fullPaperUrl: text("full_paper_url"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
  participantNumber: varchar("participant_number", { length: 50 }),
  cbtPassword: varchar("cbt_password", { length: 50 }),
  verifiedBy: varchar("verified_by", { length: 255 }), 
});

export const teamMembers = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teams.id).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(), 
  phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
  grade: varchar("grade", { length: 50 }).notNull(),
  photoUrl: text("photo_url").notNull(),
  ktmUrl: text("ktm_url"), 
  proofFollowUrl: text("proof_follow_url"),
  proofShareUrl: text("proof_share_url"),
  proofStoryCompeUrl: text("proof_story_compe_url"),
  proofTwibbonUrl: text("proof_twibbon_url"),
  igAccountLink: text("ig_account_link").notNull(),
  isLeader: boolean("is_leader").default(false).notNull(), 
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teams.id).notNull(),
  urlIdentitas: text("url_identitas"), 
  urlPayment: text("url_payment"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

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

export const blockTypeEnum = pgEnum("block_type", ["link", "image", "text", "video"]);

export const sideEventBlocks = pgTable("side_event_blocks", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: blockTypeEnum("type").default("link").notNull(),
  title: text("title"),
  url: text("url"),
  iconUrl: text("icon_url"),
  isPrimary: boolean("is_primary").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  orderIndex: integer("order_index").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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