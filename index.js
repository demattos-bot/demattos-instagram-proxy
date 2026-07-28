app.get("/followers", async (req, res) => {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: "wss://chrome.browserless.io?token=2Uy46nBJIUGLz49c47b23ab5164824f7ef7f12f3bb49ef70d"
    });

    const page = await browser.newPage();

    await page.goto("https://www.instagram.com/demattos.be/", {
      waitUntil: "networkidle2"
    });

    // Nouveau sélecteur Instagram 2026
    const followers = await page.evaluate(() => {
      const el = document.querySelector('span[title][class*="x1lliihq"]');
      if (!el) return null;

      // Le nombre est dans l'attribut title
      const raw = el.getAttribute("title");

      if (!raw) return null;

      // Nettoyage : enlever les espaces, les caractères spéciaux
      return parseInt(raw.replace(/\D/g, ""));
    });

    await browser.close();

    res.json({ followers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
