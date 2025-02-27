import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userCategories = pgTable("user_categories", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  category: text("category").notNull(),
  selected: boolean("selected").notNull().default(false),
});

export const insertUserCategorySchema = createInsertSchema(userCategories).pick({
  username: true,
  category: true,
  selected: true,
});

export type InsertUserCategory = z.infer<typeof insertUserCategorySchema>;
export type UserCategory = typeof userCategories.$inferSelect;

export const USERNAMES = [
  "Андрей",
  "Аня",
  "Саша",
  "Вася",
  "Ира",
  "Лида",
  "Женя",
  "Виталя",
] as const;

export const CATEGORIES = [
  "ММ",
  "МПМ",
  "БН",
  "RunIT",
  "КМ",
  "OGr",
  "Vgr",
] as const;
