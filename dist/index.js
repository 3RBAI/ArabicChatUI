// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import multer from "multer";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  sessions;
  messages;
  attachments;
  constructor() {
    this.sessions = /* @__PURE__ */ new Map();
    this.messages = /* @__PURE__ */ new Map();
    this.attachments = /* @__PURE__ */ new Map();
  }
  // Sessions
  async getSessions() {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
  async getSession(id) {
    return this.sessions.get(id);
  }
  async createSession(insertSession) {
    const id = randomUUID();
    const now = /* @__PURE__ */ new Date();
    const session = {
      id,
      ...insertSession,
      createdAt: now,
      updatedAt: now
    };
    this.sessions.set(id, session);
    return session;
  }
  async updateSession(id, data) {
    const session = this.sessions.get(id);
    if (!session) return void 0;
    const updated = {
      ...session,
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.sessions.set(id, updated);
    return updated;
  }
  async deleteSession(id) {
    const messagesToDelete = Array.from(this.messages.values()).filter((msg) => msg.sessionId === id).map((msg) => msg.id);
    messagesToDelete.forEach((msgId) => this.messages.delete(msgId));
    return this.sessions.delete(id);
  }
  // Messages
  async getMessages(sessionId) {
    return Array.from(this.messages.values()).filter((msg) => msg.sessionId === sessionId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  async getMessage(id) {
    return this.messages.get(id);
  }
  async createMessage(insertMessage) {
    const id = randomUUID();
    const message = {
      id,
      ...insertMessage,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.messages.set(id, message);
    const session = this.sessions.get(insertMessage.sessionId);
    if (session) {
      this.sessions.set(session.id, { ...session, updatedAt: /* @__PURE__ */ new Date() });
    }
    return message;
  }
  async deleteMessage(id) {
    return this.messages.delete(id);
  }
  // Attachments
  async createAttachment(insertAttachment) {
    const id = randomUUID();
    const attachment = {
      id,
      ...insertAttachment,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.attachments.set(id, attachment);
    return attachment;
  }
  async getAttachment(id) {
    return this.attachments.get(id);
  }
};
var storage = new MemStorage();

// server/ai.ts
import OpenAI from "openai";
import axios from "axios";
var openai = null;
function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is required. Please set OPENAI_API_KEY environment variable.");
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}
async function sendToOpenAI(messages2, model = "gpt-5") {
  try {
    const client = getOpenAI();
    const response = await client.chat.completions.create({
      model,
      messages: messages2,
      max_completion_tokens: 8192
    });
    return {
      content: response.choices[0].message.content || "",
      model: response.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      }
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error(`OpenAI Error: ${error.message}`);
  }
}
async function sendToDeepSeek(messages2, model = "deepseek-chat") {
  try {
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model,
        messages: messages2,
        max_tokens: 8192,
        temperature: 0.7
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );
    return {
      content: response.data.choices[0].message.content || "",
      model: response.data.model,
      usage: {
        promptTokens: response.data.usage?.prompt_tokens || 0,
        completionTokens: response.data.usage?.completion_tokens || 0,
        totalTokens: response.data.usage?.total_tokens || 0
      }
    };
  } catch (error) {
    console.error("DeepSeek API Error:", error);
    throw new Error(`DeepSeek Error: ${error.response?.data?.error?.message || error.message}`);
  }
}
async function sendMessage(messages2, model) {
  if (model.startsWith("gpt-") || model.startsWith("o1-")) {
    return sendToOpenAI(messages2, model);
  } else if (model.startsWith("deepseek-")) {
    return sendToDeepSeek(messages2, model);
  } else {
    throw new Error(`Unknown model: ${model}`);
  }
}

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull().default("\u0645\u062D\u0627\u062F\u062B\u0629 \u062C\u062F\u064A\u062F\u0629"),
  model: varchar("model", { length: 50 }).notNull().default("gpt-5"),
  mode: varchar("mode", { length: 20 }).notNull().default("chat"),
  // chat or agent
  isPinned: boolean("is_pinned").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(),
  // user, assistant, system
  content: text("content").notNull(),
  attachments: jsonb("attachments"),
  // Array of file attachments
  metadata: jsonb("metadata"),
  // Additional data like model used, tokens, etc.
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var attachments = pgTable("attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  mimetype: text("mimetype").notNull(),
  size: text("size").notNull(),
  path: text("path").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true
});
var insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true
});

// server/routes.ts
var upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }
  // 10MB limit
});
async function registerRoutes(app2) {
  app2.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/sessions", async (req, res) => {
    try {
      const validated = insertChatSessionSchema.parse(req.body);
      const session = await storage.createSession(validated);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.patch("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.updateSession(req.params.id, req.body);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/sessions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSession(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/sessions/:sessionId/messages", async (req, res) => {
    try {
      const messages2 = await storage.getMessages(req.params.sessionId);
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/sessions/:sessionId/messages", async (req, res) => {
    try {
      const { content, model = "gpt-5", attachmentIds = [] } = req.body;
      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Content is required" });
      }
      const session = await storage.getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      let attachmentsData = null;
      if (attachmentIds.length > 0) {
        const attachments2 = await Promise.all(
          attachmentIds.map((id) => storage.getAttachment(id))
        );
        attachmentsData = attachments2.filter(Boolean);
      }
      const userMessage = await storage.createMessage({
        sessionId: req.params.sessionId,
        role: "user",
        content,
        attachments: attachmentsData,
        metadata: null
      });
      const history = await storage.getMessages(req.params.sessionId);
      const chatMessages = history.map((msg) => ({
        role: msg.role,
        content: msg.content
      }));
      const aiResponse = await sendMessage(chatMessages, model);
      const aiMessage = await storage.createMessage({
        sessionId: req.params.sessionId,
        role: "assistant",
        content: aiResponse.content,
        attachments: null,
        metadata: {
          model: aiResponse.model,
          usage: aiResponse.usage
        }
      });
      res.json({
        userMessage,
        aiMessage
      });
    } catch (error) {
      console.error("Message send error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/messages/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteMessage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/upload", upload.array("files", 5), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ error: "No files uploaded" });
      }
      const attachments2 = await Promise.all(
        req.files.map(
          (file) => storage.createAttachment({
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size.toString(),
            path: file.path
          })
        )
      );
      res.json(attachments2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        process.cwd(),
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const possiblePaths = [
    path2.resolve(process.cwd(), "dist", "public"),
    path2.resolve(process.cwd(), "public"),
    path2.join(process.cwd(), "dist", "public"),
    path2.join(process.cwd(), "public")
  ];
  let distPath = null;
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      distPath = testPath;
      break;
    }
  }
  if (!distPath) {
    throw new Error(
      `Could not find the build directory. Tried: ${possiblePaths.join(", ")}. Make sure to build the client first.`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
