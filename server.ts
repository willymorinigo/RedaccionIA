import express from "express";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || "newsroom-secret-key";

// Google Sheets Auth
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// Helper with timeout
async function fetchWithTimeout(url: string, options: any = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Helper to get users from sheet proxy or fallback to demo
async function getUsers() {
  const PROXY_URL = process.env.SHEET_PROXY_URL;
  
  if (!PROXY_URL) {
    return [{
      username: "admin",
      password: "admin",
      dailyLimit: 999,
      usage: 0,
      lastReset: new Date().toISOString().split('T')[0],
      newsroom: "Admin"
    }];
  }

  try {
    const response = await fetchWithTimeout(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getUsers", _t: Date.now() }),
      redirect: "follow"
    });
    
    const text = await response.text();
    if (text.startsWith("<!DOCTYPE")) {
      console.error("DEBUG: Google Script returned an HTML error instead of JSON for 'getUsers'.");
      return [];
    }

    try {
      const rows = JSON.parse(text);
      if (!Array.isArray(rows)) return [];
      return rows.map((row: any) => ({
        username: String(row[0] || "").trim(),
        password: String(row[1] || "").trim(),
        dailyLimit: parseInt(row[2] || "0"),
        usage: parseInt(row[3] || "0"),
        lastReset: row[4],
        newsroom: String(row[5] || "").trim()
      }));
    } catch (e) {
      console.error("DEBUG: Failed to parse users JSON.");
      return [];
    }
  } catch (error) {
    console.error("DEBUG: Network error or timeout fetching users:", error);
    return [];
  }
}

// Helper to get newsroom settings
async function getNewsrooms() {
  const PROXY_URL = process.env.SHEET_PROXY_URL;
  if (!PROXY_URL) return [];

  try {
    const response = await fetchWithTimeout(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getNewsrooms", _t: Date.now() }),
      redirect: "follow"
    });
    
    const text = await response.text();
    if (text.startsWith("<!DOCTYPE")) {
      console.error("DEBUG: Google Script returned an HTML error for 'getNewsrooms'.");
      return [];
    }

    try {
      const rows = JSON.parse(text);
      if (!Array.isArray(rows)) return [];
      return rows.map((row: any) => ({
        name: String(row[0] || "").trim(),
        logoUrl: String(row[1] || "").trim(),
        primaryColor: String(row[2] || "").trim(),
        bgColor: String(row[3] || "").trim()
      }));
    } catch (e) {
      return [];
    }
  } catch (error) {
    console.error("DEBUG: Network error or timeout fetching newsrooms:", error);
    return [];
  }
}

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// API Routes
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const users = await getUsers();
  const newsrooms = await getNewsrooms();

  const user = users.find((u) => {
    const uName = String(u.username).toLowerCase().trim();
    const inputName = String(username).toLowerCase().trim();
    const uPass = String(u.password).trim();
    const inputPass = String(password).trim();
    return uName === inputName && uPass === inputPass;
  });

  if (user) {
    const branding = newsrooms.find(n => 
      String(n.name).toLowerCase().trim() === String(user.newsroom).toLowerCase().trim()
    ) || {};
    
    console.log(`DEBUG: User ${user.username} logged in. Newsroom: ${user.newsroom}. Branding found: ${JSON.stringify(branding)}`);
    
    // Log login activity in background
    const PROXY_URL = process.env.SHEET_PROXY_URL;
    if (PROXY_URL) {
      fetchWithTimeout(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "trackActivity", 
          username: user.username, 
          newUsage: user.usage,
          section: "Login",
          creditsUsed: user.usage,
          creditsRemaining: user.dailyLimit - user.usage,
          timestamp: new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })
        }),
        redirect: "follow"
      }).catch(err => console.error("Error logging login:", err));
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.json({ 
      username: user.username, 
      dailyLimit: user.dailyLimit, 
      usage: user.usage,
      newsroom: user.newsroom,
      branding
    });
  } else {
    res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.json({ success: true });
});

app.get("/api/me", authenticateToken, async (req: any, res) => {
  const users = await getUsers();
  const newsrooms = await getNewsrooms();
  const user = users.find((u) => u.username === req.user.username);
  
  if (user) {
    const branding = newsrooms.find(n => 
      String(n.name).toLowerCase().trim() === String(user.newsroom).toLowerCase().trim()
    ) || {};
    
    res.json({ 
      username: user.username, 
      dailyLimit: user.dailyLimit, 
      usage: user.usage,
      newsroom: user.newsroom,
      branding
    });
  } else {
    res.status(404).json({ error: "Usuario no encontrado" });
  }
});

app.post("/api/request-access", async (req, res) => {
  const { name, email, reason } = req.body;
  console.log(`Access request from ${name} (${email}): ${reason}`);
  res.json({ success: true, message: "Solicitud enviada correctamente. Te contactaremos pronto." });
});

// Update usage and log activity via proxy
app.post("/api/track-usage", authenticateToken, async (req: any, res) => {
  const PROXY_URL = process.env.SHEET_PROXY_URL;
  if (!PROXY_URL) return res.json({ success: true, usage: 0 });

  const { section } = req.body;

  try {
    const users = await getUsers();
    const user = users.find((u) => u.username === req.user.username);
    
    if (!user) return res.status(404).json({ error: "User not found" });

    const newUsage = user.usage + 1;
    const remaining = user.dailyLimit - newUsage;
    
    // Send both update usage and log activity to proxy
    const response = await fetchWithTimeout(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        action: "trackActivity", 
        username: user.username, 
        newUsage,
        section: section || "General",
        creditsUsed: newUsage,
        creditsRemaining: remaining,
        timestamp: new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })
      }),
      redirect: "follow"
    });

    const responseText = await response.text();
    console.log(`DEBUG: Proxy trackActivity response: ${responseText}`);

    res.json({ success: true, usage: newUsage, remaining });
  } catch (error) {
    console.error("Error tracking activity:", error);
    res.status(500).json({ error: "Error tracking activity" });
  }
});

// Admin Routes
app.get("/api/admin/users", authenticateToken, async (req: any, res) => {
  const isAdmin = req.user.username === "willy" || req.user.username === "admin";
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });
  
  const users = await getUsers();
  res.json(users);
});

app.post("/api/admin/users", authenticateToken, async (req: any, res) => {
  const isAdmin = req.user.username === "willy" || req.user.username === "admin";
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });
  
  const PROXY_URL = process.env.SHEET_PROXY_URL;
  if (!PROXY_URL) return res.status(500).json({ error: "Sheet not configured" });

  try {
    const response = await fetchWithTimeout(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        action: "saveUser", 
        ...req.body
      }),
      redirect: "follow"
    });
    
    const text = await response.text();
    if (text.includes("Success")) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: `Error de planilla: ${text.substring(0, 50)}` });
    }
  } catch (error) {
    res.status(500).json({ error: "Error de red al guardar usuario" });
  }
});

app.get("/api/admin/newsrooms", authenticateToken, async (req: any, res) => {
  const isAdmin = req.user.username === "willy" || req.user.username === "admin";
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });
  
  console.log("DEBUG: Admin fetching newsrooms list...");
  const users = await getUsers();
  const existingConfigs = await getNewsrooms();
  
  console.log(`DEBUG: Found ${users.length} users and ${existingConfigs.length} existing configs.`);
  
  // Get unique newsroom names from both users and existing configs
  const newsroomNamesFromUsers = users.map(u => u.newsroom).filter(Boolean);
  const newsroomNamesFromConfigs = existingConfigs.map(c => c.name);
  
  const allNames = [...new Set([...newsroomNamesFromUsers, ...newsroomNamesFromConfigs])];
  
  console.log(`DEBUG: All unique newsroom names: ${JSON.stringify(allNames)}`);
  
  // Merge with existing configs
  const mergedNewsrooms = allNames.map(name => {
    const config = existingConfigs.find(c => c.name === name);
    return config || { name, logoUrl: "", primaryColor: "#1c1917", bgColor: "#fafaf9" };
  });

  console.log(`DEBUG: Returning ${mergedNewsrooms.length} merged newsrooms to admin.`);
  res.json(mergedNewsrooms);
});

app.post("/api/admin/newsrooms", authenticateToken, async (req: any, res) => {
  const isAdmin = req.user.username === "willy" || req.user.username === "admin";
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });
  const PROXY_URL = process.env.SHEET_PROXY_URL;
  if (!PROXY_URL) {
    console.error("DEBUG: SHEET_PROXY_URL is missing in environment variables.");
    return res.status(500).json({ error: "Sheet not configured" });
  }

  console.log(`DEBUG: Admin saving newsroom. Payload: ${JSON.stringify(req.body)}`);
  try {
    const response = await fetchWithTimeout(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        action: "saveNewsroom", 
        ...req.body
      }),
      redirect: "follow"
    });
    
    const text = await response.text();
    console.log(`DEBUG: Proxy response for saveNewsroom: ${text.substring(0, 500)}`);
    
    if (text.includes("Success")) {
      res.json({ success: true });
    } else if (text.startsWith("<!DOCTYPE")) {
      console.error("DEBUG: Google Script returned HTML error during save. Check script logs.");
      res.status(500).json({ error: "Error de Google Script (HTML)" });
    } else {
      console.error(`DEBUG: Save failed. Proxy returned: ${text}`);
      res.status(500).json({ error: `Error de planilla: ${text.substring(0, 50)}` });
    }
  } catch (error) {
    console.error("DEBUG: Network error saving newsroom:", error);
    res.status(500).json({ error: "Error de red al conectar con Google" });
  }
});


async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
