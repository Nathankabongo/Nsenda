import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import apiRoutes from "./routes/api";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Dossier de téléversement temporaire
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares de sécurité et parsing
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Montage des routes de l'API REST SENDA
app.use("/api", apiRoutes);

// Route racine informative
app.get("/", (req, res) => {
  res.json({
    project: "SENDA — Marketplace décentralisée de l'artisanat congolais",
    status: "API REST opérationnelle",
    version: "1.0.0",
    docs: "/api/health",
  });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🇨🇩 Serveur Backend SENDA actif sur : http://localhost:${PORT}`);
  console.log(`🛡️  Endpoint de santé : http://localhost:${PORT}/api/health`);
  console.log(`📦 Catalogue REST : http://localhost:${PORT}/api/artworks`);
  console.log(`=================================================`);
});

export default app;
