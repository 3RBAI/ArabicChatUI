import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Chat Sessions Table
export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull().default("محادثة جديدة"),
  model: varchar("model", { length: 50 }).notNull().default("gpt-5"),
  mode: varchar("mode", { length: 20 }).notNull().default("chat"), // chat or agent
  isPinned: boolean("is_pinned").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Messages Table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => chatSessions.id, { onDelete: 'cascade' }),
  role: varchar("role", { length: 20 }).notNull(), // user, assistant, system
  content: text("content").notNull(),
  attachments: jsonb("attachments"), // Array of file attachments
  metadata: jsonb("metadata"), // Additional data like model used, tokens, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// File Attachments (stored temporarily for upload)
export const attachments = pgTable("attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  mimetype: text("mimetype").notNull(),
  size: text("size").notNull(),
  path: text("path").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod Schemas
export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true,
});

// Types
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;

// Additional TypeScript interfaces for frontend
export interface MessageContent {
  text: string;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  url?: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'deepseek';
  description?: string;
}

export const availableModels: AIModel[] = [
  { id: 'gpt-5', name: 'GPT-5', provider: 'openai', description: 'Latest OpenAI model' },
  { id: 'gpt-4o', name: 'GPT-4 Turbo', provider: 'openai', description: 'Fast and capable' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek', description: 'DeepSeek conversational model' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'deepseek', description: 'Specialized for coding tasks' },
];
