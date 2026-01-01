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
  updateCategoryLogo(id: number, logoUrl: string): Promise<Category>; // Added
  deleteCategory(id: number): Promise<void>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: InsertUser): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getUserCategories(): Promise<UserCategory[]>;
  updateUserCategory(category: InsertUserCategory): Promise<UserCategory>;
  updateUserAvatar(id: number, avatarUrl: string): Promise<User>;
}

import fs from 'fs';
import path from 'path';

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private users: Map<number, User>;
  private userCategories: Map<string, UserCategory>;
  private currentCategoryId: number;
  private currentUserId: number;
  private currentUserCategoryId: number;
  private dataFile: string;

  constructor() {
    this.dataFile = path.join(process.cwd(), 'data.json');
    this.categories = new Map();
    this.users = new Map();
    this.userCategories = new Map();
    this.currentCategoryId = 1;
    this.currentUserId = 1;
    this.currentUserCategoryId = 1;

    // Try to load data from file
    this.loadFromFile();

    // If no data was loaded, initialize with defaults
    if (this.categories.size === 0) {
      // Initialize with default categories
      DEFAULT_CATEGORIES.forEach(cat => {
        this.createCategory(cat);
      });
    }

    if (this.users.size === 0) {
      // Initialize with default users
      DEFAULT_USERS.forEach(user => {
        this.createUser(user);
      });
    }
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));

        // Load categories
        if (data.categories) {
          data.categories.forEach((cat: Category) => {
            this.categories.set(cat.id, cat);
            if (cat.id >= this.currentCategoryId) {
              this.currentCategoryId = cat.id + 1;
            }
          });
        }

        // Load users
        if (data.users) {
          data.users.forEach((user: User) => {
            this.users.set(user.id, user);
            if (user.id >= this.currentUserId) {
              this.currentUserId = user.id + 1;
            }
          });
        }

        // Load user categories
        if (data.userCategories) {
          data.userCategories.forEach((uc: UserCategory) => {
            const key = `${uc.userId}-${uc.categoryId}`;
            this.userCategories.set(key, uc);
            if (uc.id >= this.currentUserCategoryId) {
              this.currentUserCategoryId = uc.id + 1;
            }
          });
        }
      }
    } catch (error) {
      console.error('Error loading data from file:', error);
    }
  }

  private saveToFile() {
    try {
      const data = {
        categories: Array.from(this.categories.values()),
        users: Array.from(this.users.values()),
        userCategories: Array.from(this.userCategories.values())
      };
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving data to file:', error);
    }
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
    this.saveToFile();
    return newCategory;
  }

  async updateCategory(id: number, category: InsertCategory): Promise<Category> {
    const existing = this.categories.get(id);
    if (!existing) {
      throw new Error(`Category with id ${id} not found`);
    }
    const updated = { ...existing, ...category };
    this.categories.set(id, updated);
    this.saveToFile();
    return updated;
  }

  async updateCategoryLogo(id: number, logoUrl: string): Promise<Category> {
    const category = this.categories.get(id);
    if (!category) {
      throw new Error(`Забег с ID ${id} не найден`);
    }
    category.logoUrl = logoUrl;
    this.categories.set(id, category);
    this.saveToFile();
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    this.categories.delete(id);
    // Remove all user categories associated with this category
    for (const [key, userCategory] of this.userCategories.entries()) {
      if (userCategory.categoryId === id) {
        this.userCategories.delete(key);
      }
    }
    this.saveToFile();
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
    this.saveToFile();
    return newUser;
  }

  async updateUser(id: number, user: InsertUser): Promise<User> {
    const existingUser = this.users.get(id);

    // Сохраняем avatarUrl, если он существует в текущем пользователе
    if (existingUser && existingUser.avatarUrl && !user.avatarUrl) {
      user.avatarUrl = existingUser.avatarUrl;
    }

    this.users.set(id, { ...user, id });
    this.saveToFile();
    return { ...user, id };
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
    // Remove all user categories associated with this user
    for (const [key, userCategory] of this.userCategories.entries()) {
      if (userCategory.userId === id) {
        this.userCategories.delete(key);
      }
    }
    this.saveToFile();
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
      this.saveToFile();
      return updated;
    }

    const newCategory: UserCategory = {
      ...category,
      id: this.currentUserCategoryId++,
    };
    this.userCategories.set(key, newCategory);
    this.saveToFile();
    return newCategory;
  }

  async updateUserAvatar(id: number, avatarUrl: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`Пользователь с ID ${id} не найден`);
    }
    user.avatarUrl = avatarUrl;
    this.users.set(id, user);
    this.saveToFile();
    return user;
  }
}

export const storage = new MemStorage();