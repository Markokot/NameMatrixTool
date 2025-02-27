import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertUserCategorySchema, insertCategorySchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.get("/api/categories", async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.post("/api/categories", async (req, res) => {
    const body = insertCategorySchema.parse(req.body);
    const category = await storage.createCategory(body);
    res.json(category);
  });

  app.put("/api/categories/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const body = insertCategorySchema.parse(req.body);
    const category = await storage.updateCategory(id, body);
    res.json(category);
  });

  app.delete("/api/categories/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteCategory(id);
    res.json({ success: true });
  });

  app.get("/api/users", async (_req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.post("/api/users", async (req, res) => {
    const body = insertUserSchema.parse(req.body);
    const user = await storage.createUser(body);
    res.json(user);
  });

  app.put("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const body = insertUserSchema.parse(req.body);
    const user = await storage.updateUser(id, body);
    res.json(user);
  });

  app.delete("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteUser(id);
    res.json({ success: true });
  });

  app.get("/api/user-categories", async (_req, res) => {
    const categories = await storage.getUserCategories();
    res.json(categories);
  });

  app.post("/api/user-categories", async (req, res) => {
    const body = insertUserCategorySchema.parse(req.body);
    const category = await storage.updateUserCategory(body);
    res.json(category);
  });

  return createServer(app);
}