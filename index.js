import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

/* ============================================================
   FONCTION : Injecter la session Instagram (cookie depuis Railway)
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
      const safe = (sel) => {
        const el = document.querySelector(sel);
        return el ? el.innerText.trim() : null;
      };

      const safeAttr = (sel, attr) => {
        const el = document.querySelector(sel);
        return el ? el.getAttribute(attr) : null;
      };

      // Slogan
      const slogan = safe("header section span");

      // Bio longue
      const bio = safe("header section h1");

      // Lien externe
      const link = safeAttr("header section a[href^='http']", "href");

      // Followers
      const followers = safe("header li:nth-child(2) span")?.replace(/\D/g, "");

      // Following
      const following = safe("header li:nth-child(3) span")?.replace(/\D/g, "");

      // Nombre de posts
      const postsCount = safe("header li:nth-child(1) span")?.replace(/\D/g, "");

      // Photo de profil
      const profilePicture = safeAttr("header img", "src");

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

    await new Promise((resolve) => setTimeout(resolve, 800));

    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.innerText.trim() : null;
      };

      const getAttr = (selector, attr) => {
        const el = document.querySelector(selector);
        return el ? el.getAttribute(attr) : null;
      };

      const slogan = getText("span._ap3a._aaco._aacu._aacx._aad7._aade");
      const bio = getText("h1._ap3a._aaco._aacu._aacx._aad7._aade");
      const link = getAttr("a.x1i10hfl", "href");

      const followersRaw = getAttr("a span[title]", "title");
      const followers = followersRaw ? parseInt(followersRaw.replace(/\D/g, "")) : null;

      const following = parseInt(getText("a[href$='/following/'] span") || "0");
      const postsCount = parseInt(getText("span._ac2a") || "0");

      const profilePicture = getAttr("img._aadp", "src");

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
        followers,
        following,
        postsCount,
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
