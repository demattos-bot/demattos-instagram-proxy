import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

app.get("/followers", async (req, res) => {
    const user = req.query.user;
    if (!user) return res.json({ error: "Missing ?user=" });

    try {
        const browser = await puppeteer.connect({
            browserWSEndpoint: "wss://chrome.browserless.io?token=TON_TOKEN_ICI"
        });

        const page = await browser.newPage();
        await page.goto(`https://www.instagram.com/${user}/`, {
            waitUntil: "networkidle2"
        });

        const followers = await page.evaluate(() => {
            const el = document.querySelector('a[href$="/followers/"] span');
            if (!el) return null;
            return el.innerText.replace(/\D/g, "");
        });

        await browser.close();

        if (!followers) return res.json({ error: "Followers not found" });

        res.json({ user, followers: parseInt(followers) });

    } catch (err) {
        res.json({ error: err.message });
    }
});

app.listen(3000, () => console.log("Instagram proxy running on port 3000"));
