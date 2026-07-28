import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

/* ============================================================
   FONCTION : Injecter la session Instagram (cookie Railway) 2.01
   ============================================================ */
async function injectInstagramSession(page) {
  await page.setCookie({
    name: "sessionid",
    value: process.env.INSTAGRAM_SESSIONID,
    domain: ".instagram.com"
  });
}

/* ============================================================
   ENDPOINT DE TEST
   ============================================================ */
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Instagram Scraper v3.x" });
});

/* ============================================================
   SCRAPER DU SLOGAN
   ============================================================ */
app.get("/slogan", async (req, res) => {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint:
        "wss://chrome.browserless.io?token=2Uy46nBJIUGLz49c47b23ab5164824f7ef7f12f3bb49ef70d"
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    await injectInstagramSession(page);

    await page.goto("https://www.instagram.com/demattos.art/", {
      waitUntil: "networkidle2"
    });

    await new Promise(resolve => setTimeout(resolve, 800));

    await page.waitForSelector(
      "span._ap3a._aaco._aacu._aacx._aad7._aade",
      { timeout: 8000 }
    );

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
        "wss://chrome.browserless.io?token=2Uy46nBJIUGLz49c47b23ab5164824f7ef7f12f3bb49ef70d"
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    await injectInstagramSession(page);

    await page.goto("https://www.instagram.com/demattos.art/", {
      waitUntil: "networkidle2"
    });

    await new Promise(resolve => setTimeout(resolve, 800));

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
   SCRAPER FULL PROFILE
   ============================================================ */
app.get("/full-profile", async (req, res) => {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint:
        "wss://chrome.browserless.io?token=2Uy46nBJIUGLz49c47b23ab5164824f7ef7f12f3bb49ef70d",
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    await injectInstagramSession(page);

    await page.goto("https://www.instagram.com/demattos.art/", {
      waitUntil: "networkidle2",
    });

    await new Promise(resolve => setTimeout(resolve, 1200));

    // Scroll pour charger les posts
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(resolve => setTimeout(resolve, 1200));

    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.innerText.trim() : null;
      };

      const getAttr = (selector, attr) => {
        const el = document.querySelector(selector);
        return el ? el.getAttribute(attr) : null;
      };

      // ⭐ Slogan (premier span du header)
      const slogan = getText("header section span:nth-of-type(1)");

      // ⭐ Bio longue
      const bio = getText("header section h1");

      // Lien externe
      const link = getAttr("header section a[href^='http']", "href");

      // Followers
      const followers = getText("header li:nth-child(2) span")?.replace(/\D/g, "");

      // Following
      const following = getText("header li:nth-child(3) span")?.replace(/\D/g, "");

      // Nombre de posts
      const postsCount = getText("header li:nth-child(1) span")?.replace(/\D/g, "");

      // Photo de profil
      const profilePicture = getAttr("header img", "src");

      // Derniers posts
      const posts = [...document.querySelectorAll("article img")]
        .slice(0, 3)
        .map(img => ({
          image: img.src,
          alt: img.alt || null
        }));

      return {
        slogan,
        bio,
        link,
        followers: followers ? parseInt(followers) : null,
        following: following ? parseInt(following) : null,
        postsCount: postsCount ? parseInt(postsCount) : null,
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
   LANCEMENT DU SERVEUR
   ============================================================ */
app.listen(3000, () => {
  console.log("Instagram Scraper v3.x — Running on port 3000");
});
