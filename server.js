const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());

const upload = multer({ dest: "scripts/" });

if (!fs.existsSync("scripts")) {
    fs.mkdirSync("scripts");
}

app.get("/", (req, res) => {
    res.send("API Online");
});

app.post("/upload", upload.single("script"), (req, res) => {
    const name = req.body.name;

    if (!name || !req.file) {
        return res.status(400).send("Missing name or file");
    }

    fs.renameSync(
        req.file.path,
        path.join("scripts", `${name}.lua`)
    );

    res.json({
        success: true,
        loader: `loadstring(game:HttpGet("${req.protocol}://${req.get("host")}/api/${name}"))()`
    });
});

app.get("/api/:name", (req, res) => {
    const file = path.join("scripts", `${req.params.name}.lua`);

    if (!fs.existsSync(file)) {
        return res.status(404).send("Not Found");
    }

    res.type("text/plain");
    res.send(fs.readFileSync(file, "utf8"));
});

app.listen(process.env.PORT || 3000);
