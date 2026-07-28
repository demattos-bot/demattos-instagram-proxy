import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.json({ status: "ok", message: "Express fonctionne sur Railway" });
});

app.listen(3000, () => console.log("Serveur Express OK"));
