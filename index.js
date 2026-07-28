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

    await page.goto("https://www.instagram.com/demattos.be/", {
      waitUntil: "networkidle2"
    });

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

app.listen(3000, () => console.log("Serveur Express OK sur Railway"));
