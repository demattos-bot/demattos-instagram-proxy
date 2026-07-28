import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

// Browserless WebSocket
const BROWSERLESS = "wss://chrome.browserless.io?token=2Uy46nBJIUGLz49c47b23ab5164824f7ef7f12f3bb49ef70d";

// Helper: create a new page with proper user-agent
async function newPage() {
  const browser = await puppeteer.connect({ browserWSEndpoint: BROWSERLESS });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  );

  return { browser, page };
}

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Instagram Public Scraper v2 — No Login Needed" });
});

/* ============================================================
   SCRAPER PUBLIC — Profil complet
   ============================================================ */
app.get("/profile", async (req, res) => {
  try {
    const username = req.query.user || "demattos.art";

    const { browser, page } = await newPage();

    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "networkidle2",
    });

    await new Promise(r => setTimeout(r, 1500));

    const data = await page.evaluate(() => {
      const getText = (sel) => {
        const el = document.querySelector(sel);
        return el ? el.innerText.trim() : null;
      };

      const getAttr = (sel, attr) => {
        const el = document.querySelector(sel);
        return el ? el.getAttribute(attr) : null;
      };

      // Slogan (premier span du header)
      const slogan = getText("header section span");

      // Bio (h1 ou div)
      const bio = getText("header section h1") || getText("header section div");

      // Lien externe
      const link = getAttr("header section a[href^='http']", "href");

      // Stats
      const stats = [...document.querySelectorAll("header li span")].map(el =>
        el.innerText.replace(/\D/g, "")
      );

      const postsCount = stats[0] ? parseInt(stats[0]) : null;
      const followers = stats[1] ? parseInt(stats[1]) : null;
      const following = stats[2] ? parseInt(stats[2]) : null;

      // Photo de profil
      const profilePicture = getAttr("header img", "src");

      // Posts (images)
      const posts = [...document.querySelectorAll("article img")]
        .slice(0, 9)
        .map(img => ({
          image: img.src,
          alt: img.alt || null
        }));

      return {
        slogan,
        bio,
        link,
        postsCount,
        followers,
        following,
        profilePicture,
        latestPosts: posts
      };
    });

    await browser.close();
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   SCRAPER PUBLIC — Slogan uniquement
   ============================================================ */
app.get("/slogan", async (req, res) => {
  try {
    const username = req.query.user || "demattos.art";

    const { browser, page } = await newPage();

    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "networkidle2",
    });

    await new Promise(r => setTimeout(r, 800));

    const slogan = await page.evaluate(() => {
      const el = document.querySelector("header section span");
      return el ? el.innerText.trim() : null;
    });

    await browser.close();
    res.json({ slogan });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   SCRAPER PUBLIC — Followers uniquement
   ============================================================ */
app.get("/followers", async (req, res) => {
  try {
    const username = req.query.user || "demattos.art";

    const { browser, page } = await newPage();

    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "networkidle2",
    });

    await new Promise(r => setTimeout(r, 1200));

    const followers = await page.evaluate(() => {
      const el = document.querySelector("header li:nth-child(2) span");
      return el ? parseInt(el.innerText.replace(/\D/g, "")) : null;
    });

    await browser.close();
    res.json({ followers });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   LANCEMENT SERVEUR
   ============================================================ */
app.listen(3000, () => {
  console.log("Instagram Public Scraper v2 — Running on port 3000");
});
