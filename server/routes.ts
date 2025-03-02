import express, { type Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertUserCategorySchema, insertCategorySchema, insertUserSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Создаем переменные __filename и __dirname для модулей ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Настройка multer для загрузки аватаров
const avatarsDir = path.resolve(dirname(__filename), "..", "uploads", "avatars");
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage_config });

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

  // Маршрут для загрузки аватара пользователя
  app.post("/api/users/:id/avatar", upload.single('avatar'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "Файл не загружен" });
      }
      
      // Обновляем поле avatarUrl у пользователя
      const avatarUrl = `/api/avatars/${file.filename}`;
      await storage.updateUserAvatar(id, avatarUrl);
      
      res.json({ success: true, avatarUrl });
    } catch (error) {
      console.error("Ошибка загрузки аватара:", error);
      res.status(500).json({ message: "Ошибка загрузки аватара" });
    }
  });

  // Маршрут для получения аватара пользователя
  app.get("/api/avatars/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(avatarsDir, filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "Аватар не найден" });
    }
  });

  // Статический маршрут для директории с аватарами
  app.use('/uploads/avatars', express.static(avatarsDir));

  return createServer(app);
}