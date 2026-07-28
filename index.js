import express from "express";
import { webkit } from "@playwright/test";

const app = express();

app.get("/followers", async (req, res) => {
    const user = req.query.user;
    if (!user) return res.json({ error: "Missing ?user=" });

    try {
        const browser = await webkit.launch();
        const page = await browser.newPage();

        await page.goto(`https://www.instagram.com/${user}/`, {
            waitUntil: "networkidle"
        });

        const followers = await page.locator('a[href$="/followers/"] span').innerText().catch(() => null);

        await browser.close();

        if (!followers) return res.json({ error: "Followers not found" });

        res.json({ user, followers: parseInt(followers.replace(/\D/g, "")) });

    } catch (err) {
        res.json({ error: err.message });
    }
});

app.listen(3000, () => console.log("Instagram proxy running on port 3000"));
