require("dotenv").config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY");
  process.exit(1);
}

const crypto = require("crypto");
const express = require("express");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.set("trust proxy", 1);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({
  extended: true,
  limit: "1mb"
}));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const BUCKET =
  process.env.SUPABASE_BUCKET || "scripts";

const BASE_URL = (
  process.env.BASE_URL ||
  "https://ui-f.onrender.com"
).replace(/\/+$/, "");

const OWNER_NAME =
  process.env.OWNER_NAME || "SEI";

const LOGO_URL =
  "https://cdn.discordapp.com/attachments/1448285099421335623/1537103402314502266/83_20260811161648.png?ex=6a7e7b59&is=6a7d29d9&hm=42ce3e94389bc1852b1d676f81a93c797a91963fa416369e11e0286abc78424f&";

const DISCORD_URL =
  "https://discord.gg/n3xY3YuwuQ";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

function loaderFor(id) {
  return `loadstring(game:HttpGet("${BASE_URL}/script/${id}"))()`;
}

function validID(id) {
  return /^[a-f0-9]{32}$/i.test(id);
}

async function makeID() {
  while (true) {
    const id =
      crypto.randomBytes(16).toString("hex");

    const { data, error } =
      await supabase
        .from("scripts")
        .select("id")
        .eq("id", id)
        .maybeSingle();

    if (error) throw error;

    if (!data) return id;
  }
}

const DISCORD_SVG = `
<svg
class="discord-icon"
viewBox="0 0 127.14 96.36"
xmlns="http://www.w3.org/2000/svg">
<path
fill="currentColor"
d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.14ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z"/>
</svg>
`;

const SHARED_CSS = `
*{
box-sizing:border-box;
margin:0;
padding:0;
}

html{
scroll-behavior:smooth;
}

body{
min-height:100vh;
background:
radial-gradient(
circle at 50% 0%,
#123b8f 0%,
#08152f 35%,
#020817 82%
);
font-family:Arial,sans-serif;
color:white;
overflow-x:hidden;
}

body::before{
content:"";
position:fixed;
inset:0;
pointer-events:none;
background:
linear-gradient(
rgba(255,255,255,.018) 1px,
transparent 1px
),
linear-gradient(
90deg,
rgba(255,255,255,.018) 1px,
transparent 1px
);
background-size:45px 45px;
mask-image:linear-gradient(
to bottom,
black,
transparent
);
}

a{
color:inherit;
}

.nav{
position:sticky;
top:0;
z-index:20;
width:100%;
padding:14px 18px;
background:rgba(2,8,23,.78);
border-bottom:1px solid rgba(80,130,255,.16);
backdrop-filter:blur(18px);
-webkit-backdrop-filter:blur(18px);
}

.nav-inner{
max-width:1050px;
margin:auto;
display:flex;
align-items:center;
justify-content:space-between;
gap:15px;
}

.brand{
display:flex;
align-items:center;
gap:10px;
font-weight:800;
font-size:18px;
}

.brand img{
width:38px;
height:38px;
object-fit:contain;
}

.tabs{
display:flex;
gap:6px;
overflow-x:auto;
scrollbar-width:none;
}

.tabs::-webkit-scrollbar{
display:none;
}

.tab{
border:1px solid transparent;
background:transparent;
color:#94a3b8;
padding:10px 13px;
border-radius:10px;
font-size:13px;
font-weight:bold;
text-decoration:none;
white-space:nowrap;
}

.tab:hover{
background:rgba(80,130,255,.1);
color:white;
}

.tab.active{
background:rgba(59,130,246,.16);
border-color:rgba(96,165,250,.25);
color:#60a5fa;
}

.container{
width:100%;
max-width:1050px;
margin:auto;
padding:35px 18px 60px;
}

.hero{
padding:35px 0 20px;
}

.hero-grid{
display:grid;
grid-template-columns:1.25fr .75fr;
gap:20px;
}

.card{
background:rgba(8,20,42,.86);
border:1px solid rgba(70,130,255,.2);
border-radius:22px;
padding:25px;
box-shadow:
0 15px 60px rgba(0,0,0,.25),
inset 0 0 35px rgba(30,90,255,.025);
backdrop-filter:blur(15px);
-webkit-backdrop-filter:blur(15px);
}

.hero-main{
padding:35px;
}

.logo{
width:125px;
height:125px;
object-fit:contain;
filter:
drop-shadow(0 0 20px rgba(0,130,255,.5))
drop-shadow(0 0 40px rgba(0,80,255,.2));
}

.badge{
display:inline-flex;
margin-top:20px;
padding:8px 15px;
border-radius:20px;
background:rgba(30,100,255,.14);
border:1px solid rgba(80,150,255,.25);
color:#63a9ff;
font-size:12px;
font-weight:bold;
letter-spacing:1px;
}

h1{
margin-top:15px;
font-size:44px;
letter-spacing:1px;
}

.hero-text{
margin-top:10px;
color:#94a3b8;
font-size:16px;
line-height:1.7;
}

.hero-buttons{
display:flex;
gap:10px;
flex-wrap:wrap;
margin-top:25px;
}

.btn{
display:inline-flex;
align-items:center;
justify-content:center;
gap:9px;
min-height:45px;
padding:11px 17px;
border-radius:12px;
font-size:13px;
font-weight:bold;
text-decoration:none;
border:1px solid rgba(255,255,255,.1);
cursor:pointer;
transition:.2s;
}

.btn:hover{
transform:translateY(-2px);
}

.btn-blue{
background:linear-gradient(
135deg,
#2563eb,
#1d4ed8
);
box-shadow:0 8px 25px rgba(37,99,235,.25);
}

.btn-discord{
background:linear-gradient(
135deg,
#5865f2,
#4752c4
);
box-shadow:0 8px 25px rgba(88,101,242,.3);
}

.btn-dark{
background:rgba(15,30,55,.8);
color:#cbd5e1;
}

.discord-icon{
width:20px;
height:20px;
}

.stats{
display:grid;
grid-template-columns:repeat(2,1fr);
gap:12px;
}

.stat{
padding:20px;
border-radius:16px;
background:rgba(2,10,25,.65);
border:1px solid rgba(255,255,255,.06);
}

.number{
font-size:28px;
font-weight:bold;
color:#60a5fa;
}

.label{
margin-top:5px;
font-size:12px;
color:#64748b;
letter-spacing:1px;
}

.section{
margin-top:25px;
}

.section-title{
font-size:20px;
font-weight:bold;
margin-bottom:15px;
}

.section-desc{
color:#64748b;
font-size:13px;
margin-top:-8px;
margin-bottom:18px;
}

.script-grid{
display:grid;
grid-template-columns:repeat(2,1fr);
gap:15px;
}

.script{
padding:20px;
border-radius:17px;
background:rgba(2,10,25,.65);
border:1px solid rgba(70,130,255,.15);
}

.script-name{
font-size:17px;
font-weight:bold;
word-break:break-word;
}

.script-info{
margin-top:8px;
font-size:12px;
color:#64748b;
}

.script-loader{
margin-top:15px;
padding:12px;
border-radius:10px;
background:#020817;
border:1px solid rgba(255,255,255,.06);
font-family:monospace;
font-size:11px;
color:#60a5fa;
overflow:auto;
white-space:nowrap;
}

.empty{
padding:35px 20px;
text-align:center;
border:1px dashed rgba(100,150,255,.2);
border-radius:17px;
color:#64748b;
}

.feature-grid{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:14px;
}

.feature{
padding:20px;
border-radius:17px;
background:rgba(2,10,25,.6);
border:1px solid rgba(255,255,255,.06);
}

.feature-icon{
font-size:25px;
margin-bottom:12px;
}

.feature-title{
font-weight:bold;
font-size:15px;
}

.feature-desc{
margin-top:7px;
font-size:12px;
line-height:1.6;
color:#64748b;
}

.status{
margin-top:20px;
padding:16px;
border-radius:15px;
background:rgba(2,10,25,.65);
border:1px solid rgba(255,255,255,.06);
}

.status-row{
display:flex;
align-items:center;
gap:9px;
font-size:13px;
color:#cbd5e1;
}

.dot{
width:9px;
height:9px;
border-radius:50%;
background:#22c55e;
box-shadow:0 0 12px #22c55e;
}

.footer{
margin-top:40px;
padding-top:20px;
border-top:1px solid rgba(255,255,255,.06);
text-align:center;
font-size:12px;
color:#475569;
}

.footer a{
color:#60a5fa;
text-decoration:none;
}

@media(max-width:750px){

.nav-inner{
align-items:flex-start;
flex-direction:column;
}

.tabs{
width:100%;
}

.container{
padding:20px 13px 45px;
}

.hero-grid{
grid-template-columns:1fr;
}

.hero-main{
padding:27px 22px;
}

h1{
font-size:37px;
}

.logo{
width:110px;
height:110px;
}

.script-grid{
grid-template-columns:1fr;
}

.feature-grid{
grid-template-columns:1fr;
}

.card{
padding:20px;
}

}

@media(max-width:430px){

.tab{
font-size:12px;
padding:9px 11px;
}

.hero-buttons{
flex-direction:column;
}

.btn{
width:100%;
}

}
`;

function pageLayout(title, content, active) {
  return `
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta
name="viewport"
content="width=device-width,initial-scale=1"
>
<title>${title} • SEI HUB</title>
<style>${SHARED_CSS}</style>
</head>

<body>

<nav class="nav">
<div class="nav-inner">

<div class="brand">
<img src="${LOGO_URL}">
<span>SEI HUB</span>
</div>

<div class="tabs">

<a
class="tab ${active === "home" ? "active" : ""}"
href="/"
>
Home
</a>

<a
class="tab ${active === "scripts" ? "active" : ""}"
href="/my-scripts"
>
My Scripts
</a>

<a
class="tab ${active === "upload" ? "active" : ""}"
href="/upload-page"
>
Upload
</a>

<a
class="tab ${active === "developer" ? "active" : ""}"
href="/developer"
>
Developer
</a>

</div>

</div>
</nav>

<div class="container">
${content}

<div class="footer">
SEI HUB • Secure Script Distribution<br>
<a
href="${DISCORD_URL}"
target="_blank"
rel="noopener noreferrer"
>
Developer Discord
</a>
</div>

</div>

</body>
</html>
`;
}

app.get("/", async (req, res) => {
  try {

    const { data, error } =
      await supabase
        .from("scripts")
        .select("downloads")
        .eq("owner", OWNER_NAME);

    if (error) {
      return res.status(500).send(
        "Database Error"
      );
    }

    const scripts = data || [];

    const downloads =
      scripts.reduce(
        (total, script) =>
          total +
          Number(script.downloads || 0),
        0
      );

    const content = `

<div class="hero">
<div class="hero-grid">

<div class="card hero-main">

<img
class="logo"
src="${LOGO_URL}"
alt="SEI HUB"
>

<div class="badge">
SECURE SCRIPT DISTRIBUTION
</div>

<h1>SEI HUB</h1>

<div class="hero-text">
Secure script distribution platform
สำหรับ Script ของคุณ
</div>

<div class="hero-buttons">

<a
class="btn btn-blue"
href="/my-scripts"
>
📦 My Scripts
</a>

<a
class="btn btn-discord"
href="${DISCORD_URL}"
target="_blank"
rel="noopener noreferrer"
>
${DISCORD_SVG}
Join Discord
</a>

</div>

</div>

<div class="card">

<div class="section-title">
Your Dashboard
</div>

<div class="stats">

<div class="stat">
<div class="number">
${scripts.length}
</div>
<div class="label">
YOUR SCRIPTS
</div>
</div>

<div class="stat">
<div class="number">
${downloads}
</div>
<div class="label">
YOUR DOWNLOADS
</div>
</div>

</div>

<div class="status">

<div class="status-row">
<span class="dot"></span>
SEI HUB Online
</div>

</div>

</div>

</div>
</div>

<div class="section">

<div class="section-title">
Features
</div>

<div class="feature-grid">

<div class="feature">
<div class="feature-icon">🔐</div>
<div class="feature-title">
Protected Distribution
</div>
<div class="feature-desc">
ระบบส่ง Script ผ่าน API พร้อมป้องกันหน้า Script
</div>
</div>

<div class="feature">
<div class="feature-icon">📦</div>
<div class="feature-title">
Script Management
</div>
<div class="feature-desc">
ดูและจัดการเฉพาะ Script ของคุณ
</div>
</div>

<div class="feature">
<div class="feature-icon">💬</div>
<div class="feature-title">
Developer Discord
</div>
<div class="feature-desc">
ติดต่อผู้พัฒนาและรับข่าวสารผ่าน Discord
</div>
</div>

</div>

</div>
`;

    res.send(
      pageLayout(
        "Home",
        content,
        "home"
      )
    );

  } catch (error) {

    console.error(
      "Home Error:",
      error.message
    );

    res.status(500).send(
      "Server Error"
    );
  }
});

app.get("/my-scripts", async (req, res) => {

  try {

    const { data, error } =
      await supabase
        .from("scripts")
        .select("*")
        .eq("owner", OWNER_NAME)
        .order("created", {
          ascending: false
        });

    if (error) {
      return res.status(500).send(
        "Database Error"
      );
    }

    const scripts = data || [];

    let scriptHTML = "";

    if (!scripts.length) {

      scriptHTML = `
<div class="empty">
ยังไม่มี Script ของคุณ
<br><br>
<a
class="btn btn-blue"
href="/upload-page"
>
Upload Script
</a>
</div>
`;

    } else {

      scriptHTML = `
<div class="script-grid">

${scripts.map(script => `

<div class="script">

<div class="script-name">
${escapeHTML(script.filename)}
</div>

<div class="script-info">
ID: ${escapeHTML(script.id)}
</div>

<div class="script-info">
Downloads:
${Number(script.downloads || 0)}
</div>

<div class="script-info">
Size:
${Math.round(
  Number(script.size || 0) / 1024
)} KB
</div>

<div class="script-loader">
${escapeHTML(
  loaderFor(script.id)
)}
</div>

</div>

`).join("")}

</div>
`;
    }

    const content = `

<div class="section">

<div class="section-title">
📦 My Scripts
</div>

<div class="section-desc">
แสดงเฉพาะ Script ของ ${escapeHTML(OWNER_NAME)}
</div>

${scriptHTML}

</div>
`;

    res.send(
      pageLayout(
        "My Scripts",
        content,
        "scripts"
      )
    );

  } catch (error) {

    console.error(
      "My Scripts Error:",
      error.message
    );

    res.status(500).send(
      "Server Error"
    );
  }

});

app.get("/upload-page", (req, res) => {

  const content = `

<div class="section">

<div class="card">

<div class="section-title">
⬆️ Upload Script
</div>

<div class="section-desc">
อัปโหลด Script เข้า SEI HUB
</div>

<form
action="/upload"
method="POST"
enctype="multipart/form-data"
>

<input
type="hidden"
name="owner"
value="${escapeHTML(OWNER_NAME)}"
>

<div style="
padding:20px;
border:1px dashed rgba(96,165,250,.3);
border-radius:15px;
text-align:center;
">

<input
type="file"
name="file"
accept=".lua"
required
style="
width:100%;
color:#cbd5e1;
"
>

</div>

<br>

<button
class="btn btn-blue"
type="submit"
style="width:100%"
>
Upload Script
</button>

</form>

</div>

</div>
`;

  res.send(
    pageLayout(
      "Upload",
      content,
      "upload"
    )
  );

});

app.get("/developer", (req, res) => {

  const content = `

<div class="section">

<div class="card hero-main">

<img
class="logo"
src="${LOGO_URL}"
alt="SEI HUB"
>

<div class="badge">
DEVELOPER
</div>

<h1>
SEI HUB
</h1>

<div class="hero-text">
Developer & Script Distribution Platform
</div>

<div class="hero-buttons">

<a
class="btn btn-discord"
href="${DISCORD_URL}"
target="_blank"
rel="noopener noreferrer"
>
${DISCORD_SVG}
Join Developer Discord
</a>

</div>

</div>

</div>

<div class="section">

<div class="feature-grid">

<div class="feature">
<div class="feature-icon">🛡️</div>
<div class="feature-title">
Security
</div>
<div class="feature-desc">
Protected Script endpoint และระบบจัดการไฟล์
</div>
</div>

<div class="feature">
<div class="feature-icon">⚡</div>
<div class="feature-title">
Fast Distribution
</div>
<div class="feature-desc">
โหลด Script ผ่านระบบ API ของ SEI HUB
</div>
</div>

<div class="feature">
<div class="feature-icon">💬</div>
<div class="feature-title">
Community
</div>
<div class="feature-desc">
เข้าร่วม Discord เพื่อพูดคุยกับ Developer
</div>
</div>

</div>

</div>
`;

  res.send(
    pageLayout(
      "Developer",
      content,
      "developer"
    )
  );

});

function escapeHTML(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

app.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {

    try {

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file"
        });
      }

      if (
        !req.file.originalname ||
        !req.file.originalname.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid filename"
        });
      }

      const { data: exists, error } =
        await supabase
          .from("scripts")
          .select("id")
          .eq(
            "filename",
            req.file.originalname
          )
          .eq(
            "owner",
            OWNER_NAME
          )
          .maybeSingle();

      if (error) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      if (exists) {
        return res.status(400).json({
          success: false,
          message:
            "Script name already exists."
        });
      }

      const id = await makeID();

      const { error: uploadError } =
        await supabase.storage
          .from(BUCKET)
          .upload(
            `${id}.lua`,
            req.file.buffer,
            {
              contentType: "text/plain"
            }
          );

      if (uploadError) {
        return res.status(500).json({
          success: false,
          message:
            uploadError.message
        });
      }

      const newData = {

        id,

        filename:
          req.file.originalname,

        owner:
          OWNER_NAME,

        created:
          new Date().toISOString(),

        downloads: 0,

        size:
          req.file.size
      };

      const { error: dbError } =
        await supabase
          .from("scripts")
          .insert(newData);

      if (dbError) {

        await supabase.storage
          .from(BUCKET)
          .remove([
            `${id}.lua`
          ]);

        return res.status(500).json({
          success: false,
          message:
            dbError.message
        });
      }

      res.json({
        success: true,
        id,
        loader:
          loaderFor(id)
      });

    } catch (error) {

      console.error(
        "Upload Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Upload failed"
      });
    }
  }
);

app.get(
  "/script/:id",
  async (req, res) => {

    try {

      const id =
        req.params.id;

      if (!validID(id)) {
        return res.status(400).send(
          "Invalid Script ID"
        );
      }

      const { data, error } =
        await supabase
          .from("scripts")
          .select("*")
          .eq("id", id)
          .maybeSingle();

      if (error) {
        return res.status(500).send(
          "Database Error"
        );
      }

      if (!data) {
        return res.status(404).send(
          "Script Not Found"
        );
      }

      const userAgent =
        req.get("User-Agent") || "";

      if (!/Roblox/i.test(userAgent)) {

        return res.status(403).send(`

<!DOCTYPE html>
<html lang="th">

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width,initial-scale=1"
>

<title>
Protected Script
</title>

<style>
${SHARED_CSS}
</style>

</head>

<body>

<div class="container">

<div
class="card"
style="
max-width:520px;
margin:80px auto;
text-align:center;
"
>

<img
class="logo"
src="${LOGO_URL}"
>

<div class="badge">
PROTECTED SCRIPT
</div>

<h1>
SEI HUB
</h1>

<div class="hero-text">
This resource is protected by SEI HUB.
</div>

<div class="status">

<div class="status-row">
<span class="dot"></span>
Protection Active
</div>

</div>

<div
class="hero-buttons"
style="
justify-content:center;
"
>

<a
class="btn btn-discord"
href="${DISCORD_URL}"
target="_blank"
rel="noopener noreferrer"
>
${DISCORD_SVG}
Join Developer Discord
</a>

</div>

</div>

</div>

</body>
</html>

`);

      }

      const { data: fileBlob, error: dlError } =
        await supabase.storage
          .from(BUCKET)
          .download(
            `${id}.lua`
          );

      if (dlError) {
        return res.status(404).send(
          "File Not Found"
        );
      }

      const text =
        await fileBlob.text();

      await supabase
        .from("scripts")
        .update({
          downloads:
            Number(
              data.downloads || 0
            ) + 1
        })
        .eq("id", id);

      res
        .type("text/plain")
        .send(text);

    } catch (error) {

      console.error(
        "Script Error:",
        error.message
      );

      res.status(500).send(
        "Server Error"
      );
    }

  }
);

app.get(
  "/info/:id",
  async (req, res) => {

    try {

      const id =
        req.params.id;

      if (!validID(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Script ID"
        });
      }

      const { data, error } =
        await supabase
          .from("scripts")
          .select("*")
          .eq("id", id)
          .maybeSingle();

      if (error) {
        return res.status(500).json({
          success: false,
          message:
            error.message
        });
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          message:
            "Not Found"
        });
      }

      res.json({
        success: true,
        data: {
          ...data,
          loader:
            loaderFor(data.id)
        }
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message:
          "Failed to load script info"
      });

    }

  }
);

app.delete(
  "/delete/:id",
  async (req, res) => {

    try {

      const id =
        req.params.id;

      if (!validID(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Script ID"
        });
      }

      const { data, error } =
        await supabase
          .from("scripts")
          .select("*")
          .eq("id", id)
          .maybeSingle();

      if (error) {
        return res.status(500).json({
          success: false,
          message:
            error.message
        });
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          message:
            "Script Not Found"
        });
      }

      if (data.owner !== OWNER_NAME) {
        return res.status(403).json({
          success: false,
          message:
            "Permission Denied"
        });
      }

      const { error: storageError } =
        await supabase.storage
          .from(BUCKET)
          .remove([
            `${id}.lua`
          ]);

      if (storageError) {
        return res.status(500).json({
          success: false,
          message:
            storageError.message
        });
      }

      const { error: deleteError } =
        await supabase
          .from("scripts")
          .delete()
          .eq("id", id)
          .eq("owner", OWNER_NAME);

      if (deleteError) {
        return res.status(500).json({
          success: false,
          message:
            deleteError.message
        });
      }

      res.json({
        success: true,
        message:
          "Deleted"
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message:
          "Delete failed"
      });

    }

  }
);

app.post(
  "/update/:id",
  upload.single("file"),
  async (req, res) => {

    try {

      const id =
        req.params.id;

      if (!validID(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Script ID"
        });
      }

      const { data, error } =
        await supabase
          .from("scripts")
          .select("*")
          .eq("id", id)
          .maybeSingle();

      if (error) {
        return res.status(500).json({
          success: false,
          message:
            error.message
        });
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          message:
            "Script Not Found"
        });
      }

      if (data.owner !== OWNER_NAME) {
        return res.status(403).json({
          success: false,
          message:
            "Permission Denied"
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "No file"
        });
      }

      const { error: uploadError } =
        await supabase.storage
          .from(BUCKET)
          .upload(
            `${id}.lua`,
            req.file.buffer,
            {
              contentType:
                "text/plain",
              upsert: true
            }
          );

      if (uploadError) {
        return res.status(500).json({
          success: false,
          message:
            uploadError.message
        });
      }

      const { error: updateError } =
        await supabase
          .from("scripts")
          .update({
            filename:
              req.file.originalname,
            size:
              req.file.size
          })
          .eq("id", id)
          .eq(
            "owner",
            OWNER_NAME
          );

      if (updateError) {
        return res.status(500).json({
          success: false,
          message:
            updateError.message
        });
      }

      res.json({
        success: true,
        loader:
          loaderFor(id)
      });

    } catch (error) {

      console.error(
        "Update Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Update failed"
      });

    }

  }
);

(async () => {

  try {

    const { error } =
      await supabase
        .from("scripts")
        .select("id")
        .limit(1);

    if (error) {

      console.error(
        "Supabase Error:",
        error.message
      );

    } else {

      console.log(
        "Supabase Connected"
      );

      console.log(
        "Owner:",
        OWNER_NAME
      );

    }

  } catch (error) {

    console.error(
      "Supabase Error:",
      error.message
    );

  }

})();

const PORT =
  process.env.PORT || 3000;

app.listen(
  PORT,
  () => {
    console.log(
      "Server Running : " +
      PORT
    );
  }
);
