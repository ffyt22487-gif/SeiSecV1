const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

if (!fs.existsSync("scripts")) {
    fs.mkdirSync("scripts");
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "scripts"),
    filename: (req, file, cb) => {
        const id = Math.random().toString(36).substring(2, 10);
        cb(null, id + ".lua");
    }
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file" });
    }

    const id = path.parse(req.file.filename).name;

    res.json({
        success: true,
        id,
        loader: `loadstring(game:HttpGet("https://ui-f.onrender.com/script/${id}"))()`
    });
});

app.get("/script/:id", (req, res) => {
    const file = path.join(__dirname, "scripts", req.params.id + ".lua");

    if (!fs.existsSync(file)) {
        return res.status(404).send("Not Found");
    }

    res.sendFile(file);
});

app.get("/", (req, res) => {
    res.send("API Online");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on " + PORT);
});
