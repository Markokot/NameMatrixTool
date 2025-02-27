import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  gender: text("gender").notNull().default("male"),
});

export const userCategories = pgTable("user_categories", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  categoryId: serial("category_id").references(() => categories.id),
  selected: boolean("selected").notNull().default(false),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  date: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  avatarUrl: true,
  gender: true,
});

export const insertUserCategorySchema = createInsertSchema(userCategories).pick({
  userId: true,
  categoryId: true,
  selected: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUserCategory = z.infer<typeof insertUserCategorySchema>;
export type UserCategory = typeof userCategories.$inferSelect;

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

// Default users that will be created initially
export const DEFAULT_USERS = [
  { name: "Андрей", gender: "male" },
  { name: "Аня", gender: "female" },
  { name: "Саша", gender: "male" },
  { name: "Вася", gender: "male" },
  { name: "Ира", gender: "female" },
  { name: "Лида", gender: "female" },
  { name: "Женя", gender: "male" },
  { name: "Виталя", gender: "male" },
] as const;