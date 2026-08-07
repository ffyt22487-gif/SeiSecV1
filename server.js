const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());

const SCRIPT_DIR = path.join(__dirname, "scripts");
const DB_FILE = path.join(__dirname, "database.json");

if (!fs.existsSync(SCRIPT_DIR)) {
  fs.mkdirSync(SCRIPT_DIR);
}

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, "[]");
}

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function makeID() {
  let id;
  do {
    id = Math.random().toString(36).substring(2, 10);
  } while (readDB().find(v => v.id === id));
  return id;
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, SCRIPT_DIR);
  },
  filename(req, file, cb) {
    if (req.params.id) {
      cb(null, req.params.id + ".lua");
    } else {
      cb(null, makeID() + ".lua");
    }
  }
});

const upload = multer({ storage });

app.get("/", (req, res) => {
    const db = readDB();

    res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>SEI HUB</title>
<style>
body{
margin:0;
background:#0f172a;
font-family:Arial;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
color:white;
}
.box{
background:#111827;
padding:40px;
border-radius:20px;
text-align:center;
box-shadow:0 0 30px #00bfff55;
width:420px;
}
h1{
color:#00bfff;
margin:0;
}
p{
color:#d1d5db;
}
.stat{
margin-top:20px;
padding:15px;
background:#1f2937;
border-radius:10px;
}
</style>
</head>
<body>
<div class="box">
<h1>🛡 SEI HUB</h1>
<p>สคริปต์นี้ถูกป้องกันโดย <b>SEI HUB</b></p>

<div class="stat">
📂 Scripts : ${db.length}<br>
⬇ Downloads : ${db.reduce((a,b)=>a+b.downloads,0)}
</div>

<p style="margin-top:20px;">Unauthorized access is prohibited.</p>
</div>
</body>
</html>
`);
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file"
    });
  }

  const id = path.parse(req.file.filename).name;
  const db = readDB();

  // 1. กันชื่อไฟล์ซ้ำ
  if (db.find(v => v.filename === req.file.originalname)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({
      success: false,
      message: "Script name already exists."
    });
  }

  db.push({
    id,
    filename: req.file.originalname,
    owner: req.body.owner || "Unknown",
    created: new Date().toISOString(),
    downloads: 0,
    size: req.file.size
  });

  saveDB(db);

  res.json({
    success: true,
    id,
    loader: `loadstring(game:HttpGet("${req.protocol}://${req.get("host")}/script/${id}"))()`
  });
});

app.get("/script/:id", (req, res) => {
  const db = readDB();
  const data = db.find(v => v.id === req.params.id);

  if (!data) {
    return res.status(404).send("Script Not Found");
  }

  const file = path.join(SCRIPT_DIR, req.params.id + ".lua");
  if (!fs.existsSync(file)) {
    return res.status(404).send("File Not Found");
  }

  data.downloads++;
  saveDB(db);

  res.type("text/plain");
  res.send(fs.readFileSync(file, "utf8"));
});

app.get("/scripts", (req, res) => {
  const db = readDB();
  res.json({
    success: true,
    total: db.length,
    scripts: db
  });
});

app.get("/stats", (req, res) => {
  const db = readDB();
  res.json({
    success: true,
    scripts: db.length,
    downloads: db.reduce((a, b) => a + b.downloads, 0)
  });
});

app.get("/search/:name", (req, res) => {
  const db = readDB();
  const result = db.filter(v =>
    v.filename.toLowerCase().includes(req.params.name.toLowerCase())
  );
  res.json({
    success: true,
    total: result.length,
    scripts: result
  });
});

app.get("/list/:owner", (req, res) => {
  const db = readDB();
  const list = db.filter(v => v.owner == req.params.owner);
  res.json({
    success: true,
    total: list.length,
    scripts: list
  });
});

app.get("/info/:id", (req, res) => {
  const db = readDB();
  const data = db.find(v => v.id === req.params.id);
  if (!data) {
    return res.status(404).json({
      success: false,
      message: "Not Found"
    });
  }
  res.json({
    success: true,
    data
  });
});

app.delete("/delete/:id", (req, res) => {
  const owner = req.query.owner;
  if (!owner) {
    return res.status(400).json({
      success: false,
      message: "Owner required"
    });
  }
  const db = readDB();
  const index = db.findIndex(v => v.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Script Not Found"
    });
  }
  if (db[index].owner !== owner) {
    return res.status(403).json({
      success: false,
      message: "Permission Denied"
    });
  }
  const file = path.join(SCRIPT_DIR, req.params.id + ".lua");
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
  db.splice(index, 1);
  saveDB(db);
  res.json({
    success: true,
    message: "Deleted"
  });
});

app.post("/update/:id", upload.single("file"), (req, res) => {
  const owner = req.body.owner;
  const db = readDB();
  const data = db.find(v => v.id === req.params.id);

  if (!data) {
    return res.status(404).json({ success: false });
  }
  if (data.owner !== owner) {
    return res.status(403).json({ success: false });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file" });
  }

  data.filename = req.file.originalname;
  data.size = req.file.size;
  saveDB(db);

  res.json({
    success: true,
    loader: `loadstring(game:HttpGet("${req.protocol}://${req.get("host")}/script/${req.params.id}"))()`
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server Running : " + PORT);
});
