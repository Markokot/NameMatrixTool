import { pgTable, text, serial, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: date("date").notNull(),
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
  { name: "ММ", date: new Date("2024-03-01") },
  { name: "МПМ", date: new Date("2024-03-02") },
  { name: "БН", date: new Date("2024-03-03") },
  { name: "RunIT", date: new Date("2024-03-04") },
  { name: "КМ", date: new Date("2024-03-05") },
  { name: "OGr", date: new Date("2024-03-06") },
  { name: "Vgr", date: new Date("2024-03-07") },
] as const;