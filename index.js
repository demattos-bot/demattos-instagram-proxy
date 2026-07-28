import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

/* ============================================================
   ENDPOINT DE TEST LAKALAKALAKA
   ============================================================ */
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Serveur Express fonctionne sur Railway" });
});

/* ============================================================
   SCRAPER DU SLOGAN INSTAGRAM
   ============================================================ */
app.get("/slogan", async (req, res) => {
  try {
    /* ------------------------------------------------------------
       1) Connexion à Browserless (Chrome dans le cloud)
       ------------------------------------------------------------ */
    const browser = await puppeteer.connect({
      browserWSEndpoint:
        "wss://chrome.browserless.io?token=2Uy46nBJIUGLz49c47b23ab5164824f7ef7f12f3bb49ef70d",
    });

    const page = await browser.newPage();

    /* ------------------------------------------------------------
       2) User-Agent moderne pour éviter la version "light"
       ------------------------------------------------------------ */
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    /* ------------------------------------------------------------
       3) Charger la page Instagram
       ------------------------------------------------------------ */
    await page.goto("https://www.instagram.com/demattos.art/", {
      waitUntil: "networkidle2",
    });

    /* ------------------------------------------------------------
       4) SUPPRESSION TOTALE DES OVERLAYS INSTAGRAM
          (Méthode PRO — fonctionne à 100%)
       ------------------------------------------------------------ */
    await page.evaluate(() => {
      // Overlay principal (celui qui bloque tout)
      document.getElementById("scrollview")?.remove();

      // Fenêtre login (modale blanche)
      document.querySelector('div[role="dialog"]')?.remove();

      // Backdrop gris derrière la modale
      document.querySelector('.x1n2onr6')?.remove();

      // Masque de clic invisible
      document.querySelector('.x1iyjqo2')?.remove();

      // Conteneur de la modale
      document.querySelector('.x1ja2u2z')?.remove();

      // Overlay global
      document.querySelector('.x1lliihq')?.remove();

      // Débloquer le scroll
      document.documentElement.classList.remove('_a3wf');
    });

    /* ------------------------------------------------------------
       5) Pause universelle pour laisser le DOM se mettre à jour
       ------------------------------------------------------------ */
    await new Promise((resolve) => setTimeout(resolve, 600));

    /* ------------------------------------------------------------
       6) Attendre que le slogan apparaisse dans le DOM
       ------------------------------------------------------------ */
    await page.waitForSelector(
      "span._ap3a._aaco._aacu._aacx._aad7._aade",
      { timeout: 8000 }
    );

    /* ------------------------------------------------------------
       7) Extraction du slogan
       ------------------------------------------------------------ */
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

    await page.goto("https://www.instagram.com/demattos.art/", {
      waitUntil: "networkidle2",
    });

    /* ------------------------------------------------------------
       🔥 SUPPRESSION TOTALE DES OVERLAYS (même logique)
       ------------------------------------------------------------ */
    await page.evaluate(() => {
      document.getElementById("scrollview")?.remove();
      document.querySelector('div[role="dialog"]')?.remove();
      document.querySelector('.x1n2onr6')?.remove();
      document.querySelector('.x1iyjqo2')?.remove();
      document.querySelector('.x1ja2u2z')?.remove();
      document.querySelector('.x1lliihq')?.remove();
      document.documentElement.classList.remove('_a3wf');
    });

    await new Promise((resolve) => setTimeout(resolve, 600));

    /* ------------------------------------------------------------
       Extraction des followers
       ------------------------------------------------------------ */
    const followers = await page.evaluate(() => {
      const el = document.querySelector("a span[title]");
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

/* ============================================================
   LANCEMENT DU SERVEUR EXPRESS
   ============================================================ */
app.listen(3000, () => console.log("Serveur Express OK sur Railway"));
