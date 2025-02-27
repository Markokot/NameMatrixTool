import { pgTable, text, serial, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
});

export const userCategories = pgTable("user_categories", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  categoryId: serial("category_id").references(() => categories.id),
  selected: boolean("selected").notNull().default(false),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  date: true,
});

export const insertUserCategorySchema = createInsertSchema(userCategories).pick({
  username: true,
  categoryId: true,
  selected: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
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

// Default categories that will be created initially
export const DEFAULT_CATEGORIES = [
  { name: "ММ", date: "01.03" },
  { name: "МПМ", date: "02.03" },
  { name: "БН", date: "03.03" },
  { name: "RunIT", date: "04.03" },
  { name: "КМ", date: "05.03" },
  { name: "OGr", date: "06.03" },
  { name: "Vgr", date: "07.03" },
] as const;