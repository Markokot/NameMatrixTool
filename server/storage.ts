import { 
  type Category, 
  type InsertCategory,
  type User,
  type InsertUser,
  type UserCategory, 
  type InsertUserCategory,
  DEFAULT_CATEGORIES,
  DEFAULT_USERS
} from "@shared/schema";

export interface IStorage {
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: InsertCategory): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: InsertUser): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getUserCategories(): Promise<UserCategory[]>;
  updateUserCategory(category: InsertUserCategory): Promise<UserCategory>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private users: Map<number, User>;
  private userCategories: Map<string, UserCategory>;
  private currentCategoryId: number;
  private currentUserId: number;
  private currentUserCategoryId: number;

  constructor() {
    this.categories = new Map();
    this.users = new Map();
    this.userCategories = new Map();
    this.currentCategoryId = 1;
    this.currentUserId = 1;
    this.currentUserCategoryId = 1;

    // Initialize with default categories
    DEFAULT_CATEGORIES.forEach(cat => {
      this.createCategory(cat);
    });

    // Initialize with default users
    DEFAULT_USERS.forEach(user => {
      this.createUser(user);
    });
  }

  async getCategories(): Promise<Category[]> {
    const categories = Array.from(this.categories.values());
    // Sort by date
    return categories.sort((a, b) => {
      const [dayA, monthA] = a.date.split('.');
      const [dayB, monthB] = b.date.split('.');
      const dateA = new Date(2024, parseInt(monthA) - 1, parseInt(dayA));
      const dateB = new Date(2024, parseInt(monthB) - 1, parseInt(dayB));
      return dateA.getTime() - dateB.getTime();
    });
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: InsertCategory): Promise<Category> {
    const existing = this.categories.get(id);
    if (!existing) {
      throw new Error(`Category with id ${id} not found`);
    }
    const updated = { ...existing, ...category };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    this.categories.delete(id);
    // Remove all user categories associated with this category
    for (const [key, userCategory] of this.userCategories.entries()) {
      if (userCategory.categoryId === id) {
        this.userCategories.delete(key);
      }
    }
  }

  async getUsers(): Promise<User[]> {
    const users = Array.from(this.users.values());
    // Sort by name
    return users.sort((a, b) => a.name.localeCompare(b.name));
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, user: InsertUser): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) {
      throw new Error(`User with id ${id} not found`);
    }
    const updated = { ...existing, ...user };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
    // Remove all user categories associated with this user
    for (const [key, userCategory] of this.userCategories.entries()) {
      if (userCategory.userId === id) {
        this.userCategories.delete(key);
      }
    }
  }

  async getUserCategories(): Promise<UserCategory[]> {
    return Array.from(this.userCategories.values());
  }

  async updateUserCategory(category: InsertUserCategory): Promise<UserCategory> {
    const key = `${category.userId}-${category.categoryId}`;
    const existing = this.userCategories.get(key);

    if (existing) {
      const updated = { ...existing, selected: category.selected };
      this.userCategories.set(key, updated);
      return updated;
    }

    const newCategory: UserCategory = {
      ...category,
      id: this.currentUserCategoryId++,
    };
    this.userCategories.set(key, newCategory);
    return newCategory;
  }
}

export const storage = new MemStorage();