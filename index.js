import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

/* ============================================================
   ENDPOINT DE TEST
   Permet de vérifier que Railway + Express fonctionnent
   ============================================================ */
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Serveur Express fonctionne sur Railway" });
});

/* ============================================================
   SCRAPER DU SLOGAN INSTAGRAM - KULAAAA
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
       2) Définir une vraie taille d'écran
          IMPORTANT : Browserless utilise 800x600 par défaut,
          ce qui fait que ton clic tombe DANS l’overlay.
          On force 1920x1080 pour reproduire ton navigateur.
       ------------------------------------------------------------ */
    await page.setViewport({ width: 1920, height: 1080 });

    /* ------------------------------------------------------------
       3) User-Agent moderne pour éviter la version "light"
       ------------------------------------------------------------ */
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    /* ------------------------------------------------------------
       4) Charger la page Instagram
       ------------------------------------------------------------ */
    await page.goto("https://www.instagram.com/demattos.art/", {
      waitUntil: "networkidle2",
    });

    /* ------------------------------------------------------------
       5) Clic dans la zone BASSE de l'écran
          C’est la SEULE zone non recouverte par l’overlay login.
          (Tu l’as remarqué toi-même : proche de la barre de défilement)
       ------------------------------------------------------------ */
    await page.mouse.click(500, 1000);

    /* ------------------------------------------------------------
       6) Pause universelle (compatible toutes versions Puppeteer)
       ------------------------------------------------------------ */
    await new Promise((resolve) => setTimeout(resolve, 800));

    /* ------------------------------------------------------------
       7) Attendre que le slogan apparaisse dans le DOM
          (Maintenant que l’overlay est fermé)
       ------------------------------------------------------------ */
    await page.waitForSelector(
      "span._ap3a._aaco._aacu._aacx._aad7._aade",
      { timeout: 8000 }
    );

    /* ------------------------------------------------------------
       8) Extraction du slogan
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
   SCRAPER DU NOMBRE DE FOLLOWERS
   ============================================================ */
app.get("/followers", async (req, res) => {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint:
        "wss://chrome.browserless.io?token=2Uy46nBJIUGLz49c47b23ab5164824f7ef7f12f3bb49ef70d",
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    await page.goto("https://www.instagram.com/demattos.art/", {
      waitUntil: "networkidle2",
    });

    /* ------------------------------------------------------------
       Même clic que pour le slogan : on ferme l’overlay
       ------------------------------------------------------------ */
    await page.mouse.click(500, 1000);
    await new Promise((resolve) => setTimeout(resolve, 800));

    /* ------------------------------------------------------------
       Extraction du nombre de followers
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
