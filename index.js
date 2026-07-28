import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Express fonctionne sur Railway" });
});

app.get("/followers", async (req, res) => {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: "wss://chrome.browserless.io?token=2Uy46nBJIUGLz49c47b23ab5164824f7ef7f12f3bb49ef70d"
    });

    const page = await browser.newPage();

    await page.goto("https://www.instagram.com/demattos.art/", {
      waitUntil: "networkidle2"
    });

    // 🔥 Simuler un clic dans la zone extérieure pour fermer la fenêtre login
    await page.mouse.click(10, 10);

    // 🔥 Scraper le nombre de followers (ton HTML réel)
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
