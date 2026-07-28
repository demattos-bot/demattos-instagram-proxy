import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

/* ============================================================
   FONCTION : Injecter la session Instagram (cookie Railway) -kakakaka
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
  res.json({ status: "ok", message: "Instagram Scraper + Login Test v5.0" });
});

/* ============================================================
   TEST : Vérifier si Puppeteer voit les champs email/pass
   ============================================================ */
app.get("/login-field-test", async (req, res) => {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint:
        "wss://chrome.browserless.io?token=2Uy46nBJIUGLz49c47b23ab5164824f7ef7f12f3bb49ef70d",
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    await page.goto("https://www.instagram.com/accounts/login/", {
      waitUntil: "networkidle2",
    });

    await new Promise(r => setTimeout(r, 2000));

    const result = await page.evaluate(() => {
      const emailField = document.querySelector("input[name='email']");
      const passField = document.querySelector("input[name='pass']");
      const pageText = document.body.innerText.slice(0, 300);

      return {
        emailField: !!emailField,
        passField: !!passField,
        pageText
      };
    });

    await browser.close();
    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   LOGIN TEST (si les champs existent)
   ============================================================ */
app.get("/login-test", async (req, res) => {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint:
        "wss://chrome.browserless.io?token=2Uy46nBJIUGLz49c47b23ab5164824f7ef7f12f3bb49ef70d",
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    await page.goto("https://www.instagram.com/accounts/login/", {
      waitUntil: "networkidle2",
    });

    await new Promise(r => setTimeout(r, 2000));

    const fields = await page.evaluate(() => {
      return {
        emailField: !!document.querySelector("input[name='email']"),
        passField: !!document.querySelector("input[name='pass']")
      };
    });

    if (!fields.emailField || !fields.passField) {
      await browser.close();
      return res.json({ status: "blocked_or_hidden_fields" });
    }

    await page.type("input[name='email']", process.env.INSTAGRAM_USER, { delay: 80 });
    await page.type("input[name='pass']", process.env.INSTAGRAM_PASS, { delay: 80 });

    await page.click("button[type='submit']");

    await new Promise(r => setTimeout(r, 4000));

    const result = await page.evaluate(() => {
      const bodyText = document.body.innerText.toLowerCase();

      if (bodyText.includes("sms") || bodyText.includes("code")) {
        return { status: "sms_required" };
      }

      if (bodyText.includes("suspicious") || bodyText.includes("unusual")) {
        return { status: "blocked" };
      }

      if (bodyText.includes("incorrect") || bodyText.includes("wrong")) {
        return { status: "bad_credentials" };
      }

      const homeNav = document.querySelector("nav");
      if (homeNav) {
        return { status: "ok" };
      }

      return { status: "unknown" };
    });

    await browser.close();
    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

    const slogan = await page.evaluate(() => {
      const el = document.querySelector("header section span:nth-of-type(1)");
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

    await new Promise(resolve => setTimeout(resolve, 1200));

    const followers = await page.evaluate(() => {
      const el = document.querySelector("header li:nth-child(2) span");
      if (!el) return null;
      return parseInt(el.innerText.replace(/\D/g, ""));
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

      const slogan = getText("header section span:nth-of-type(1)");
      const bio = getText("header section h1");
      const link = getAttr("header section a[href^='http']", "href");

      const followers = getText("header li:nth-child(2) span")?.replace(/\D/g, "");
      const following = getText("header li:nth-child(3) span")?.replace(/\D/g, "");
      const postsCount = getText("header li:nth-child(1) span")?.replace(/\D/g, "");

      const profilePicture = getAttr("header img", "src");

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
  console.log("Instagram Scraper + Login Test v5.0 — Running on port 3000");
});
