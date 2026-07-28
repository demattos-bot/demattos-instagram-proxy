import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

/* ============================================================
   FONCTION : Injecter la session Instagram 1.0
   ============================================================ */
async function injectInstagramSession(page) {
  await page.setCookie({
    name: "sessionid",
    value: process.env.INSTAGRAM_SESSIONID,
    domain: ".instagram.com"
  });
}

/* ============================================================
   SCRAPER FULL PROFILE Beta 3.0
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

    // 🔥 Injecter la session Instagram
    await injectInstagramSession(page);

    await page.goto("https://www.instagram.com/demattos.art/", {
      waitUntil: "networkidle2",
    });

    await new Promise((resolve) => setTimeout(resolve, 800));

    /* ------------------------------------------------------------
       Extraction des données
       ------------------------------------------------------------ */

    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.innerText.trim() : null;
      };

      const getAttr = (selector, attr) => {
        const el = document.querySelector(selector);
        return el ? el.getAttribute(attr) : null;
      };

      // Slogan / Bio courte
      const slogan = getText("span._ap3a._aaco._aacu._aacx._aad7._aade");

      // Bio longue
      const bio = getText("h1._ap3a._aaco._aacu._aacx._aad7._aade");

      // Lien externe
      const link = getAttr("a.x1i10hfl", "href");

      // Followers
      const followersRaw = getAttr("a span[title]", "title");
      const followers = followersRaw ? parseInt(followersRaw.replace(/\D/g, "")) : null;

      // Following
      const following = parseInt(getText("a[href$='/following/'] span") || "0");

      // Nombre de posts
      const postsCount = parseInt(getText("span._ac2a") || "0");

      // Photo de profil
      const profilePicture = getAttr("img._aadp", "src");

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
  console.log("Instagram Scraper Beta 3.0 — Running on port 3000");
});
