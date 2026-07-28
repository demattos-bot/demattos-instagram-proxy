import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

const BROWSERLESS = "wss://chrome.browserless.io?token=2Uy46nBJIUGLz49c47b23ab5164824f7ef7f12f3bb49ef70d";

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function newPage() {
  const browser = await puppeteer.connect({ browserWSEndpoint: BROWSERLESS });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  );

  // Inject ALL cookies using EXACT Railway variable names
  const cookies = [
    { name: "csrftoken", value: process.env.IG_CSRFTOKEN, domain: ".instagram.com" },
    { name: "datr", value: process.env.datr, domain: ".instagram.com" },
    { name: "dpr", value: process.env.dpr, domain: ".instagram.com" },
    { name: "ds_user_id", value: process.env.ds_user_id, domain: ".instagram.com" },
    { name: "ig_did", value: process.env.ig_did, domain: ".instagram.com" },
    { name: "mid", value: process.env.mid, domain: ".instagram.com" },
    { name: "ps_l", value: process.env.ps_l, domain: ".instagram.com" },
    { name: "ps_n", value: process.env.ps_n, domain: ".instagram.com" },
    { name: "rur", value: process.env.rur, domain: ".instagram.com" },
    { name: "sessionid", value: process.env.INSTAGRAM_SESSIONID, domain: ".instagram.com" },
    { name: "wd", value: process.env.wd, domain: ".instagram.com" }
  ];

  await page.setCookie(...cookies);

  return { browser, page };
}

app.get("/profile", async (req, res) => {
  try {
    const username = req.query.user || "demattos.art";

    const { browser, page } = await newPage();

    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "networkidle2",
    });

    await wait(2000 + Math.random() * 1500);

    // Scroll to load posts
    await page.evaluate(() => window.scrollBy(0, 1200));
    await wait(1500 + Math.random() * 1000);

    const data = await page.evaluate(() => {
      const getText = (sel) => {
        const el = document.querySelector(sel);
        return el ? el.innerText.trim() : null;
      };

      const getAttr = (sel, attr) => {
        const el = document.querySelector(sel);
        return el ? el.getAttribute(attr) : null;
      };

      // Slogan (fallback intelligent)
      let slogan = null;
      const header = document.querySelector("header section");
      if (header) {
        const spans = [...header.querySelectorAll("span")];
        const candidate = spans.find(el => {
          const t = el.innerText.trim();
          return t.length > 0 && t.length < 120;
        });
        slogan = candidate ? candidate.innerText.trim() : null;
      }

      // Bio
      const bio =
        getText("header section h1") ||
        getText("header section div") ||
        null;

      // External link
      const link = getAttr("header section a[href^='http']", "href");

      // Stats — DOM 2026
      let postsCount = null;
      let followers = null;
      let following = null;

      const statsSpans = [...document.querySelectorAll("header section span")];
      statsSpans.forEach(el => {
        const t = el.innerText.trim().toLowerCase();

        if (t.includes("posts")) {
          postsCount = parseInt(t.replace(/\D/g, ""));
        }
        if (t.includes("followers")) {
          followers = parseInt(t.replace(/\D/g, ""));
        }
        if (t.includes("following")) {
          following = parseInt(t.replace(/\D/g, ""));
        }
      });

      // Profile picture
      const profilePicture = getAttr("header img", "src");

      // Latest posts — DOM 2026
      const posts = [...document.querySelectorAll("article a img, article div img")]
        .slice(0, 12)
        .map(img => ({
          image: img.src,
          alt: img.alt || null
        }));

      return {
        slogan,
        bio,
        link,
        postsCount,
        followers,
        following,
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

app.listen(3000, () => {
  console.log("Instagram Scraper v6 — DOM 2026 — Running on port 3000");
});
