/* ============================================================
   SCRAPER — Slogan (DOM complet grâce au cookie)
   ============================================================ */

import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

const BROWSERLESS = "wss://chrome.browserless.io?token=2Uy46nBJIUGLz49c47b23ab5164824f7ef7f12f3bb49ef70d";

async function newPage() {
  const browser = await puppeteer.connect({ browserWSEndpoint: BROWSERLESS });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  );

  // 🔥 IMPORTANT : on remet le cookie sessionid
  await page.setCookie({
    name: "sessionid",
    value: process.env.INSTAGRAM_SESSIONID,
    domain: ".instagram.com"
  });

  return { browser, page };
}

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Instagram Scraper — Session Enabled" });
});

/* ============================================================
   SCRAPER — Slogan (DOM complet grâce au cookie)
   ============================================================ */
app.get("/slogan", async (req, res) => {
  try {
    const username = req.query.user || "demattos.art";

    const { browser, page } = await newPage();

    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "networkidle2",
    });

    await new Promise(r => setTimeout(r, 1200));

    const slogan = await page.evaluate(() => {
      const header = document.querySelector("header section");
      if (!header) return null;

      const spans = [...header.querySelectorAll("span")];

      const candidate = spans.find(el => {
        const t = el.innerText.trim();
        return t.length > 0 && t.length < 80;
      });

      return candidate ? candidate.innerText.trim() : null;
    });

    await browser.close();
    res.json({ slogan });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   SCRAPER — Profil complet
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

      const header = document.querySelector("header section");
      let slogan = null;

      if (header) {
        const spans = [...header.querySelectorAll("span")];
        const candidate = spans.find(el => {
          const t = el.innerText.trim();
          return t.length > 0 && t.length < 80;
        });
        slogan = candidate ? candidate.innerText.trim() : null;
      }

      const bio =
        getText("header section h1") ||
        getText("header section div") ||
        null;

      const link = getAttr("header section a[href^='http']", "href");

      const stats = [...document.querySelectorAll("header li span")].map(el =>
        el.innerText.replace(/\D/g, "")
      );

      const postsCount = stats[0] ? parseInt(stats[0]) : null;
      const followers = stats[1] ? parseInt(stats[1]) : null;
      const following = stats[2] ? parseInt(stats[2]) : null;

      const profilePicture = getAttr("header img", "src");

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
   LANCEMENT SERVEUR
   ============================================================ */
app.listen(3000, () => {
  console.log("Instagram Scraper — Session Enabled — Running on port 3000");
});
