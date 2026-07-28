import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

/* ============================================================
   ENDPOINT DE TEST avec connect Insta
   ============================================================ */
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Scraper Instagram v3.0" });
});

/* ============================================================
   FONCTION : Charger la session Instagram via cookie
   ============================================================ */
async function injectInstagramSession(page) {
  await page.setCookie({
    name: "sessionid",
    value: process.env.INSTAGRAM_SESSIONID, // 🔥 Cookie stocké dans Railway
    domain: ".instagram.com"
  });
}

/* ============================================================
   SCRAPER DU SLOGAN
   ============================================================ */
app.get("/slogan", async (req, res) => {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint:
        "wss://chrome.browserless.io?token=2Uy46nBJIUGLz49c47b23ab5164824f7ef7f12f3bb49ef70d",
    });

    const page = await browser.newPage();

    // User-Agent moderne
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    // 🔥 Injecter la session Instagram
    await injectInstagramSession(page);

    // Charger la page
    await page.goto("https://www.instagram.com/demattos.art/", {
      waitUntil: "networkidle2",
    });

    // Pause pour que le DOM se mette à jour
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Attendre le slogan
    await page.waitForSelector(
      "span._ap3a._aaco._aacu._aacx._aad7._aade",
      { timeout: 8000 }
    );

    // Extraire le slogan
    const slogan = await page.evaluate(() => {
      const el = document.querySelector(
        "span._ap3a._aaco._aacu._aacx._aad7._aade"
      );
      return el ? el.innerText.trim() : null;
    });

    await browser.close();
    res.json({ slogan });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   SCRAPER DES FOLLOWERS
   ============================================================ */
app.get("/followers", async (req, res) => {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint:
        "wss://chrome.browserless.io?token=2Uy46nBJIUGLz49c47b23ab5164824f7ef7f12f3bb49ef70d",
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    // 🔥 Injecter la session Instagram
    await injectInstagramSession(page);

    await page.goto("https://www.instagram.com/demattos.art/", {
      waitUntil: "networkidle2",
    });

    await new Promise((resolve) => setTimeout(resolve, 800));

    // Extraire les followers
    const followers = await page.evaluate(() => {
      const el = document.querySelector("a span[title]");
      if (!el) return null;
      const raw = el.getAttribute("title");
      return raw ? parseInt(raw.replace(/\D/g, "")) : null;
    });

    await browser.close();
    res.json({ followers });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   LANCEMENT DU SERVEUR
   ============================================================ */
app.listen(3000, () => console.log("Scraper Instagram v3.0 prêt sur Railway"));
