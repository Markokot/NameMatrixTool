import { type UserCategory, type InsertUserCategory } from "@shared/schema";

export interface IStorage {
  getUserCategories(): Promise<UserCategory[]>;
  updateUserCategory(category: InsertUserCategory): Promise<UserCategory>;
}

export class MemStorage implements IStorage {
  private categories: Map<string, UserCategory>;
  private currentId: number;

  constructor() {
    this.categories = new Map();
    this.currentId = 1;
  }

  async getUserCategories(): Promise<UserCategory[]> {
    return Array.from(this.categories.values());
  }

  async updateUserCategory(category: InsertUserCategory): Promise<UserCategory> {
    const key = `${category.username}-${category.category}`;
    const existing = this.categories.get(key);
    
    if (existing) {
      const updated = { ...existing, selected: category.selected };
      this.categories.set(key, updated);
      return updated;
    }

    const newCategory: UserCategory = {
      ...category,
      id: this.currentId++,
    };
    this.categories.set(key, newCategory);
    return newCategory;
  }
}

export const storage = new MemStorage();
