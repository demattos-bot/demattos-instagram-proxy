import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

// Endpoint de test
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Express fonctionne sur Railway" });
});

// Endpoint followers
app.get("/followers", async (req, res) => {
  try {
    // Connexion à Browserless
    const browser = await puppeteer.connect({
      browserWSEndpoint: "wss://chrome.browserless.io?token=TON_TOKEN_BROWSERLESS_ICI"
    });

    const page = await browser.newPage();

    // Va sur ton Instagram
    await page.goto("https://www.instagram.com/demattos.be/", {
      waitUntil: "networkidle2"
    });

    // Extraction du nombre de followers
    const followers = await page.evaluate(() => {
      const el = document.querySelector('a[href$="/followers/"] span');
      return el ? el.innerText : null;
    });

    await browser.close();

    res.json({ followers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lancement du serveur
app.listen(3000, () => console.log("Serveur Express OK sur Railway"));
