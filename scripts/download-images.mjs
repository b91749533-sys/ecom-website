import fs from "fs";
import path from "path";
import https from "https";

const outDir = path.join(process.cwd(), "public", "products");
fs.mkdirSync(outDir, { recursive: true });

const images = {
  "dior-sauvage-edp.jpg": "https://www.sephora.com/productimages/sku/s2038123-main-zoom.jpg",
  "creed-aventus.jpg": "https://fimgs.net/mdimg/frag/thumbs/375_375/0t0m0t152409.jpg",
  "bleu-de-chanel-edp.jpg": "https://www.sephora.com/productimages/sku/s1696034-main-zoom.jpg",
  "baccarat-rouge-540-edp.jpg": "https://fimgs.net/mdimg/frag/thumbs/375_375/1t1m1t152409.jpg",
  "tom-ford-ombre-leather.jpg": "https://www.sephora.com/productimages/sku/s2036915-main-zoom.jpg",
  "ysl-y-edp.jpg": "https://www.sephora.com/productimages/sku/s2265005-main-zoom.jpg",
  "acqua-di-gio-profondo-edp.jpg": "https://www.sephora.com/productimages/sku/s2345678-main-zoom.jpg",
  "parfums-de-marly-layton.jpg": "https://fimgs.net/mdimg/frag/thumbs/375_375/2t2m2t152409.jpg",
  "le-male-le-parfum.jpg": "https://www.sephora.com/productimages/sku/s2581247-main-zoom.jpg",
  "xerjoff-naxos.jpg": "https://fimgs.net/mdimg/frag/thumbs/375_375/3t3m3t152409.jpg",
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } }, (res) => {
        if ([301, 302].includes(res.statusCode) && res.headers.location) {
          file.close();
          if (fs.existsSync(dest)) fs.unlinkSync(dest);
          return download(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          if (fs.existsSync(dest)) fs.unlinkSync(dest);
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on("finish", () => { file.close(); resolve(); });
      })
      .on("error", reject);
  });
}

async function main() {
  for (const [filename, url] of Object.entries(images)) {
    const dest = path.join(outDir, filename);
    try {
      console.log(`Downloading ${filename}...`);
      await download(url, dest);
      const size = fs.statSync(dest).size;
      console.log(size > 1000 ? `  OK (${size} bytes)` : `  Warning: small file (${size} bytes)`);
    } catch (err) {
      console.error(`  Failed: ${err.message}`);
    }
  }
}

main();
