import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

// Endpoint de test
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Serveur Express fonctionne sur Railway" });
});

// =========================
// SCRAPER DU SLOGAN
// =========================
app.get("/slogan", async (req, res) => {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: "wss://chrome.browserless.io?token=2Uy46nBJIUGLz49c47b23ab5164824f7ef7f12f3bb49ef70d"
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    await page.goto("https://www.instagram.com/demattos.art/", {
      waitUntil: "networkidle2"
    });

    // 🔥 Simuler un clic extérieur pour fermer la fenêtre login
    await page.mouse.click(10, 10);

    // 🔥 Pause compatible Browserless
    await new Promise(resolve => setTimeout(resolve, 500));

    // 🔥 Attendre que le slogan soit visible
    await page.waitForSelector('span._ap3a._aaco._aacu._aacx._aad7._aade', {
      timeout: 5000
    });

    // 🔥 Scraper ton slogan
    const slogan = await page.evaluate(() => {
      const el = document.querySelector('span._ap3a._aaco._aacu._aacx._aad7._aade');
      return el ? el.innerText.trim() : null;
    });

    await browser.close();

    res.json({ slogan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// SCRAPER DES FOLLOWERS
// =========================
app.get("/followers", async (req, res) => {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: "wss://chrome.browserless.io?token=2Uy46nBJIUGLz49c47b23ab5164824f7ef7f12f3bb49ef70d"
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    await page.goto("https://www.instagram.com/demattos.art/", {
      waitUntil: "networkidle2"
    });

    // 🔥 Simuler un clic extérieur pour fermer la fenêtre login
    await page.mouse.click(10, 10);

    // 🔥 Pause compatible Browserless
    await new Promise(resolve => setTimeout(resolve, 500));

    // 🔥 Scraper les followers
    const followers = await page.evaluate(() => {
      const el = document.querySelector('a span[title]');
      if (!el) return null;

      const raw = el.getAttribute("title");
      if (!raw) return null;

      return parseInt(raw.replace(/\D/g, ""));
    });

    await browser.close();

    res.json({ followers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Serveur Express OK sur Railway"));
