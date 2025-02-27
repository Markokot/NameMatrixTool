import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertUserCategorySchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.get("/api/categories", async (_req, res) => {
    const categories = await storage.getUserCategories();
    res.json(categories);
  });

  app.post("/api/categories", async (req, res) => {
    const body = insertUserCategorySchema.parse(req.body);
    const category = await storage.updateUserCategory(body);
    res.json(category);
  });

  return createServer(app);
}
