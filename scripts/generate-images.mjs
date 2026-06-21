import fs from "fs";
import path from "path";

const outDir = path.join(process.cwd(), "public", "products");
fs.mkdirSync(outDir, { recursive: true });

const products = [
  { file: "dior-sauvage-edp.jpg", brand: "Dior", name: "Sauvage EDP", color: "#1a1a2e", accent: "#4a90d9" },
  { file: "creed-aventus.jpg", brand: "Creed", name: "Aventus", color: "#1c1c1c", accent: "#c9a96e" },
  { file: "bleu-de-chanel-edp.jpg", brand: "Chanel", name: "Bleu de Chanel", color: "#0d1b2a", accent: "#1b4965" },
  { file: "baccarat-rouge-540-edp.jpg", brand: "MFK", name: "Baccarat Rouge 540", color: "#2d0a0a", accent: "#c41e3a" },
  { file: "tom-ford-ombre-leather.jpg", brand: "Tom Ford", name: "Ombré Leather", color: "#1a1410", accent: "#8b6914" },
  { file: "ysl-y-edp.jpg", brand: "YSL", name: "Y Eau de Parfum", color: "#0a1628", accent: "#2563eb" },
  { file: "acqua-di-gio-profondo-edp.jpg", brand: "Armani", name: "Acqua di Giò Profondo", color: "#0a1f2e", accent: "#0077b6" },
  { file: "parfums-de-marly-layton.jpg", brand: "PdM", name: "Layton", color: "#1a1520", accent: "#7c3aed" },
  { file: "le-male-le-parfum.jpg", brand: "JPG", name: "Le Male Le Parfum", color: "#1a0f28", accent: "#d4a017" },
  { file: "xerjoff-naxos.jpg", brand: "Xerjoff", name: "Naxos", color: "#1f1508", accent: "#b8860b" },
];

for (const p of products) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${p.color}"/>
      <stop offset="100%" style="stop-color:${p.accent};stop-opacity:0.3"/>
    </linearGradient>
    <linearGradient id="bottle" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${p.accent};stop-opacity:0.9"/>
      <stop offset="100%" style="stop-color:${p.color}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="800" fill="url(#bg)"/>
  <rect x="220" y="120" width="160" height="40" rx="8" fill="url(#bottle)" opacity="0.8"/>
  <rect x="200" y="160" width="200" height="420" rx="20" fill="url(#bottle)" opacity="0.85"/>
  <rect x="230" y="580" width="140" height="30" rx="5" fill="${p.accent}" opacity="0.6"/>
  <text x="300" y="680" text-anchor="middle" fill="#f8f5f0" font-family="Georgia,serif" font-size="22" font-weight="600">${p.brand}</text>
  <text x="300" y="715" text-anchor="middle" fill="#c9a96e" font-family="Georgia,serif" font-size="16">${p.name}</text>
  <text x="300" y="750" text-anchor="middle" fill="#f8f5f080" font-family="sans-serif" font-size="11" letter-spacing="4">LUMIÈRE</text>
</svg>`;

  const dest = path.join(outDir, p.file.replace(".jpg", ".svg"));
  fs.writeFileSync(dest, svg);
  console.log(`Created ${dest}`);
}

console.log("Done generating product images.");
