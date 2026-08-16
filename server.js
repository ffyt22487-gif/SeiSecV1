/*
  SUPABASE — สร้าง 2 table นี้ก่อน:

  CREATE TABLE keys (
    id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    key         text        UNIQUE NOT NULL,
    owner       text        NOT NULL,
    expires_at  timestamptz,
    active      boolean     DEFAULT true,
    created_at  timestamptz DEFAULT now()
  );

  CREATE TABLE key_tasks (
    id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    discord_id  text        NOT NULL,
    task_url    text,
    completed   boolean     DEFAULT false,
    created_at  timestamptz DEFAULT now()
  );

  ENV ที่ต้องเพิ่ม:
    BOT_SECRET=<สุ่มสตริงอะไรก็ได้ ใส่ใน bot.py ด้วย>
    LOOTLABS_API_KEY=7dc59a565dfdb62f6228af1cd7295b3f0495d2f2b37db44a32f62a19c8b3bbd2
*/

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

const BOT_SECRET =
  process.env.BOT_SECRET || "";

const LOOTLABS_API_KEY =
  process.env.LOOTLABS_API_KEY || "";

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

// ---------- helpers ----------

function loaderFor(id) {
  return `loadstring(game:HttpGet("${BASE_URL}/script/${id}?key=YOUR_KEY"))()`;
}

function generateKey() {
  const seg = () =>
    crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase();

  return `SEI-${seg()}-${seg()}-${seg()}`;
}

async function makeID() {
  while (true) {
    const id =
      crypto.randomBytes(16).toString("hex");

    const {
      data,
      error
    } = await supabase
      .from("scripts")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return id;
    }
  }
}

async function validateKey(key) {
  if (!key || !key.trim()) {
    return {
      valid: false,
      reason: "missing"
    };
  }

  const {
    data,
    error
  } = await supabase
    .from("keys")
    .select("*")
    .eq("key", key.trim())
    .eq("active", true)
    .maybeSingle();

  if (error || !data) {
    return {
      valid: false,
      reason: "invalid"
    };
  }

  if (
    data.expires_at &&
    new Date(data.expires_at) < new Date()
  ) {
    return {
      valid: false,
      reason: "expired",
      data
    };
  }

  return {
    valid: true,
    data
  };
}

// ---------- static assets ----------

const DISCORD_SVG = `
<svg
class="discord-icon"
viewBox="0 0 127.14 96.36"
xmlns="http://www.w3.org/2000/svg"
>
<path
fill="currentColor"
d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.14ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z"
/>
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
circle at 50% 5%,
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
radial-gradient(
circle at 20% 20%,
rgba(30,100,255,.08),
transparent 35%
),
radial-gradient(
circle at 80% 80%,
rgba(0,160,255,.07),
transparent 35%
);
}

.page{
min-height:100vh;
display:flex;
align-items:center;
justify-content:center;
padding:25px;
position:relative;
z-index:1;
}

.box{
width:100%;
max-width:520px;
background:rgba(10,22,45,.92);
border:1px solid rgba(70,130,255,.32);
border-radius:28px;
padding:45px 35px;
text-align:center;
box-shadow:
0 0 70px rgba(0,110,255,.16),
0 20px 80px rgba(0,0,0,.35),
inset 0 0 40px rgba(40,100,255,.04);
backdrop-filter:blur(15px);
-webkit-backdrop-filter:blur(15px);
animation:boxIn .55s ease both;
}

@keyframes boxIn{
from{
opacity:0;
transform:translateY(20px) scale(.97);
}
to{
opacity:1;
transform:none;
}
}

.logo{
width:150px;
height:150px;
object-fit:contain;
margin-bottom:25px;
filter:
drop-shadow(0 0 20px rgba(0,130,255,.5))
drop-shadow(0 0 45px rgba(0,80,255,.25));
transition:transform .3s ease;
}

.logo:hover{
transform:scale(1.05);
}

.badge{
display:inline-flex;
align-items:center;
justify-content:center;
padding:10px 22px;
border-radius:30px;
background:rgba(30,100,255,.15);
border:1px solid rgba(80,150,255,.28);
color:#63a9ff;
font-size:14px;
font-weight:bold;
letter-spacing:1px;
}

h1{
margin:20px 0 10px;
font-size:40px;
font-weight:800;
letter-spacing:1px;
}

.desc{
color:#94a3b8;
font-size:17px;
line-height:1.7;
}

.stats{
margin-top:28px;
display:flex;
gap:12px;
}

.stat{
flex:1;
padding:18px;
border-radius:16px;
background:rgba(2,10,25,.65);
border:1px solid rgba(255,255,255,.06);
}

.number{
font-size:25px;
font-weight:bold;
color:#60a5fa;
}

.label{
margin-top:6px;
font-size:13px;
color:#64748b;
letter-spacing:1px;
}

.discord-btn{
margin:28px auto 0;
width:100%;
max-width:330px;
min-height:58px;
display:flex;
align-items:center;
justify-content:center;
gap:12px;
padding:15px 22px;
border-radius:15px;
background:
linear-gradient(
135deg,
#5865f2,
#4752c4
);
border:1px solid rgba(255,255,255,.18);
color:#fff;
font-size:15px;
font-weight:bold;
text-decoration:none;
box-shadow:
0 8px 25px rgba(88,101,242,.35),
0 0 25px rgba(88,101,242,.12);
transition:
transform .2s ease,
box-shadow .2s ease,
filter .2s ease;
}

.discord-btn:hover{
transform:translateY(-3px);
filter:brightness(1.08);
box-shadow:
0 12px 35px rgba(88,101,242,.5),
0 0 35px rgba(88,101,242,.2);
}

.discord-btn:active{
transform:scale(.97);
box-shadow:
0 5px 15px rgba(88,101,242,.3);
}

.discord-icon{
width:25px;
height:25px;
flex-shrink:0;
}

.discord-text{
display:flex;
flex-direction:column;
align-items:flex-start;
line-height:1.2;
}

.discord-title{
font-size:15px;
font-weight:700;
}

.discord-sub{
font-size:11px;
opacity:.75;
margin-top:3px;
font-weight:400;
}

.divider{
height:1px;
border:0;
margin:30px 0 20px;
background:
linear-gradient(
90deg,
transparent,
rgba(70,130,255,.35),
transparent
);
}

.footer{
font-size:13px;
color:#475569;
line-height:1.7;
}

.footer strong{
color:#64748b;
}

.footer a{
color:#60a5fa;
text-decoration:none;
}

.footer a:hover{
text-decoration:underline;
}

.status{
margin-top:30px;
padding:18px;
border-radius:16px;
background:rgba(2,10,25,.65);
border:1px solid rgba(255,255,255,.06);
}

.status-title{
color:#64748b;
font-size:13px;
letter-spacing:1px;
margin-bottom:8px;
}

.status-text{
color:#cbd5e1;
font-size:15px;
line-height:1.5;
}

.active{
margin-top:25px;
color:#4ade80;
font-size:14px;
font-weight:600;
display:flex;
align-items:center;
justify-content:center;
gap:8px;
}

.dot{
display:inline-block;
width:9px;
height:9px;
background:#22c55e;
border-radius:50%;
box-shadow:0 0 12px #22c55e;
animation:pulse 1.8s infinite;
}

@keyframes pulse{
0%,100%{
opacity:1;
box-shadow:0 0 12px #22c55e;
}
50%{
opacity:.45;
box-shadow:0 0 5px #22c55e;
}
}

@media(max-width:500px){

.page{
padding:15px;
}

.box{
padding:38px 22px 30px;
border-radius:24px;
}

.logo{
width:135px;
height:135px;
}

h1{
font-size:36px;
}

.desc{
font-size:16px;
}

.discord-btn{
max-width:100%;
}

}
`;

function protectedPage() {
  return `
<!DOCTYPE html>
<html lang="th">

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width,initial-scale=1"
>

<title>Protected Script</title>

<style>
${SHARED_CSS}
</style>

</head>

<body>

<div class="page">

<div class="box">

<img
class="logo"
src="${LOGO_URL}"
alt="SEI HUB"
>

<div class="badge">
PROTECTED SCRIPT
</div>

<h1>
SEI HUB
</h1>

<div class="desc">
Secure script distribution system
</div>

<div class="status">

<div class="status-title">
ACCESS PROTECTED
</div>

<div class="status-text">
This resource is protected by SEI HUB.
</div>

</div>

<div class="active">

<span class="dot"></span>

Protection Active

</div>

<a
class="discord-btn"
href="${DISCORD_URL}"
target="_blank"
rel="noopener noreferrer"
>

${DISCORD_SVG}

<div class="discord-text">

<div class="discord-title">
Join Developer Discord
</div>

<div class="discord-sub">
discord.gg/n3xY3YuwuQ
</div>

</div>

</a>

<hr class="divider">

<div class="footer">

<strong>
Developer Discord
</strong>

<br>

<a
href="${DISCORD_URL}"
target="_blank"
rel="noopener noreferrer"
>

${DISCORD_URL}

</a>

<br>
<br>

SEI HUB • Secure Script Distribution

</div>

</div>

</div>

</body>

</html>
`;
}

// ---------- routes ----------

app.get("/", async (req, res) => {

  try {

    const {
      data,
      error
    } = await supabase
      .from("scripts")
      .select("*");

    if (error) {
      return res
        .status(500)
        .send("Database Error");
    }

    const scripts = data || [];

    const downloads =
      scripts.reduce(
        (total, script) =>
          total +
          Number(script.downloads || 0),
        0
      );

    res.send(`
<!DOCTYPE html>

<html lang="th">

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width,initial-scale=1"
>

<title>SEI HUB</title>

<style>
${SHARED_CSS}
</style>

</head>

<body>

<div class="page">

<div class="box">

<img
class="logo"
src="${LOGO_URL}"
alt="SEI HUB"
>

<div class="badge">
SECURE SCRIPT DISTRIBUTION
</div>

<h1>
SEI HUB
</h1>

<div class="desc">
Secure script distribution platform
</div>

<div class="stats">

<div class="stat">

<div class="number">
${scripts.length}
</div>

<div class="label">
SCRIPTS
</div>

</div>

<div class="stat">

<div class="number">
${downloads}
</div>

<div class="label">
DOWNLOADS
</div>

</div>

</div>

<a
class="discord-btn"
href="${DISCORD_URL}"
target="_blank"
rel="noopener noreferrer"
>

${DISCORD_SVG}

<div class="discord-text">

<div class="discord-title">
Join Developer Discord
</div>

<div class="discord-sub">
discord.gg/n3xY3YuwuQ
</div>

</div>

</a>

<hr class="divider">

<div class="footer">

<strong>
Developer Discord
</strong>

<br>

<a
href="${DISCORD_URL}"
target="_blank"
rel="noopener noreferrer"
>

${DISCORD_URL}

</a>

<br>
<br>

SEI HUB • Secure Script Distribution

</div>

</div>

</div>

</body>

</html>
`);

  } catch (error) {

    console.error(
      "Home Error:",
      error.message
    );

    res
      .status(500)
      .send("Server Error");
  }
});

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

      const {
        data: exists,
        error: existsError
      } = await supabase
        .from("scripts")
        .select("id")
        .eq(
          "filename",
          req.file.originalname
        )
        .maybeSingle();

      if (existsError) {

        return res.status(500).json({
          success: false,
          message: existsError.message
        });
      }

      if (exists) {

        return res.status(400).json({
          success: false,
          message:
            "Script name already exists."
        });
      }

      const id =
        await makeID();

      const {
        error: uploadError
      } = await supabase.storage
        .from(BUCKET)
        .upload(
          `${id}.lua`,
          req.file.buffer,
          {
            contentType:
              "text/plain"
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
          req.body.owner ||
          "Unknown",

        created:
          new Date().toISOString(),

        downloads: 0,

        size:
          req.file.size

      };

      const {
        error: dbError
      } = await supabase
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

      if (
        !/^[a-f0-9]{32}$/i.test(id)
      ) {

        return res
          .status(400)
          .send("Invalid Script ID");
      }

      const {
        data,
        error
      } = await supabase
        .from("scripts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {

        return res
          .status(500)
          .send("Database Error");
      }

      if (!data) {

        return res
          .status(404)
          .send("Script Not Found");
      }

      const userAgent =
        req.get("User-Agent") ||
        "";

      if (!/Roblox/i.test(userAgent)) {

        return res
          .status(403)
          .send(protectedPage());
      }

      // ---------- key validation ----------

      const keyParam =
        req.query.key;

      if (!keyParam) {

        return res
          .status(401)
          .type("text/plain")
          .send(
            "SEI HUB: Key required. " +
            "Contact the script owner for a key."
          );
      }

      const keyResult =
        await validateKey(keyParam);

      if (!keyResult.valid) {

        const msg =
          keyResult.reason === "expired"
            ? "SEI HUB: Key expired. Contact the script owner."
            : "SEI HUB: Invalid key. Contact the script owner.";

        return res
          .status(403)
          .type("text/plain")
          .send(msg);
      }

      // ---------- serve script ----------

      const {
        data: fileBlob,
        error: dlError
      } = await supabase.storage
        .from(BUCKET)
        .download(
          `${id}.lua`
        );

      if (dlError) {

        return res
          .status(404)
          .send("File Not Found");
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

      res
        .status(500)
        .send("Server Error");
    }
  }
);

// ---------- key endpoints ----------

app.post(
  "/genkey",
  async (req, res) => {

    try {

      const {
        owner,
        days,
        secret
      } = req.body;

      if (
        !BOT_SECRET ||
        secret !== BOT_SECRET
      ) {

        return res.status(403).json({
          success: false,
          message: "Forbidden"
        });
      }

      if (!owner || !owner.trim()) {

        return res.status(400).json({
          success: false,
          message: "Owner required"
        });
      }

      const key = generateKey();

      const expires_at =
        days && Number(days) > 0
          ? new Date(
              Date.now() +
              Number(days) * 86_400_000
            ).toISOString()
          : null;

      const {
        error
      } = await supabase
        .from("keys")
        .insert({
          key,
          owner: owner.trim(),
          expires_at,
          active: true,
          created_at: new Date().toISOString()
        });

      if (error) {

        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      res.json({
        success: true,
        key,
        expires_at
      });

    } catch (error) {

      console.error(
        "GenKey Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to generate key"
      });
    }
  }
);

app.get(
  "/mykey/:owner",
  async (req, res) => {

    try {

      const {
        data,
        error
      } = await supabase
        .from("keys")
        .select("key, expires_at, created_at, active")
        .eq("owner", req.params.owner)
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) {

        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      // filter out expired keys from response
      const now = new Date();

      const keys = (data || []).filter(
        (k) =>
          !k.expires_at ||
          new Date(k.expires_at) > now
      );

      res.json({
        success: true,
        keys
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: "Failed to load keys"
      });
    }
  }
);

app.get(
  "/validate/:key",
  async (req, res) => {

    try {

      const result =
        await validateKey(req.params.key);

      if (!result.valid) {

        return res.status(
          result.reason === "missing" ? 400 : 403
        ).json({
          success: true,
          valid: false,
          message:
            result.reason === "expired"
              ? "Key expired"
              : "Invalid key"
        });
      }

      res.json({
        success: true,
        valid: true,
        owner: result.data.owner,
        expires_at: result.data.expires_at
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        valid: false,
        message: "Validation failed"
      });
    }
  }
);

app.delete(
  "/revokekey/:key",
  async (req, res) => {

    try {

      const secret =
        req.query.secret;

      if (
        !BOT_SECRET ||
        secret !== BOT_SECRET
      ) {

        return res.status(403).json({
          success: false,
          message: "Forbidden"
        });
      }

      const {
        data: existing,
        error: findError
      } = await supabase
        .from("keys")
        .select("id")
        .eq("key", req.params.key)
        .maybeSingle();

      if (findError) {

        return res.status(500).json({
          success: false,
          message: findError.message
        });
      }

      if (!existing) {

        return res.status(404).json({
          success: false,
          message: "Key not found"
        });
      }

      const {
        error
      } = await supabase
        .from("keys")
        .update({ active: false })
        .eq("key", req.params.key);

      if (error) {

        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      res.json({
        success: true,
        message: "Revoked"
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: "Failed to revoke key"
      });
    }
  }
);

// ---------- existing endpoints (unchanged) ----------

app.get(
  "/scripts",
  async (req, res) => {

    try {

      const {
        data,
        error
      } = await supabase
        .from("scripts")
        .select("*")
        .order(
          "created",
          {
            ascending: false
          }
        );

      if (error) {

        return res.status(500).json({
          success: false,
          message:
            error.message
        });
      }

      res.json({

        success: true,

        total:
          data?.length || 0,

        scripts:
          data || []

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          "Failed to load scripts"

      });
    }
  }
);

app.get(
  "/stats",
  async (req, res) => {

    try {

      const {
        data,
        error
      } = await supabase
        .from("scripts")
        .select("downloads");

      if (error) {

        return res.status(500).json({

          success: false,

          message:
            error.message

        });
      }

      const downloads =
        (data || []).reduce(
          (total, script) =>
            total +
            Number(
              script.downloads || 0
            ),
          0
        );

      res.json({

        success: true,

        scripts:
          data?.length || 0,

        downloads

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          "Failed to load stats"

      });
    }
  }
);

app.get(
  "/search/:name",
  async (req, res) => {

    try {

      const {
        data,
        error
      } = await supabase
        .from("scripts")
        .select("*")
        .ilike(
          "filename",
          `%${req.params.name}%`
        );

      if (error) {

        return res.status(500).json({

          success: false,

          message:
            error.message

        });
      }

      res.json({

        success: true,

        total:
          data?.length || 0,

        scripts:
          data || []

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          "Search failed"

      });
    }
  }
);

app.get(
  "/list/:owner",
  async (req, res) => {

    try {

      const {
        data,
        error
      } = await supabase
        .from("scripts")
        .select("*")
        .eq(
          "owner",
          req.params.owner
        )
        .order(
          "created",
          {
            ascending: false
          }
        );

      if (error) {

        return res.status(500).json({

          success: false,

          message:
            error.message

        });
      }

      res.json({

        success: true,

        total:
          data?.length || 0,

        scripts:
          data || []

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          "Failed to load scripts"

      });
    }
  }
);

app.get(
  "/info/:id",
  async (req, res) => {

    try {

      const {
        data,
        error
      } = await supabase
        .from("scripts")
        .select("*")
        .eq(
          "id",
          req.params.id
        )
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

      const owner =
        req.query.owner;

      if (!owner) {

        return res.status(400).json({

          success: false,

          message:
            "Owner required"

        });
      }

      const {
        data,
        error
      } = await supabase
        .from("scripts")
        .select("*")
        .eq(
          "id",
          req.params.id
        )
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

      if (data.owner !== owner) {

        return res.status(403).json({

          success: false,

          message:
            "Permission Denied"

        });
      }

      const {
        error: storageError
      } = await supabase.storage
        .from(BUCKET)
        .remove([
          `${req.params.id}.lua`
        ]);

      if (storageError) {

        return res.status(500).json({

          success: false,

          message:
            storageError.message

        });
      }

      const {
        error: deleteError
      } = await supabase
        .from("scripts")
        .delete()
        .eq(
          "id",
          req.params.id
        );

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

      const owner =
        req.body.owner;

      const {
        data,
        error: findError
      } = await supabase
        .from("scripts")
        .select("*")
        .eq(
          "id",
          req.params.id
        )
        .maybeSingle();

      if (findError) {

        return res.status(500).json({

          success: false,

          message:
            findError.message

        });
      }

      if (!data) {

        return res.status(404).json({

          success: false,

          message:
            "Script Not Found"

        });
      }

      if (data.owner !== owner) {

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

      const {
        error: uploadError
      } = await supabase.storage
        .from(BUCKET)
        .upload(
          `${req.params.id}.lua`,
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

      const {
        error: updateError
      } = await supabase
        .from("scripts")
        .update({

          filename:
            req.file.originalname,

          size:
            req.file.size

        })
        .eq(
          "id",
          req.params.id
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
          loaderFor(
            req.params.id
          )

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

// ---------- lootlabs ----------

async function createLootlabsTask(
  discordId
) {

  const redirectUrl =
    `${BASE_URL}/lootlabs/complete` +
    `?user=${encodeURIComponent(discordId)}`;

  const response = await fetch(
    "https://lootlabs.gg/api/publisher/tasks",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        "api-key":
          LOOTLABS_API_KEY
      },
      body: JSON.stringify({
        title:
          "SEI HUB - Get your script key",
        tasks_amount: 1,
        url: redirectUrl
      })
    }
  );

  if (!response.ok) {

    const text =
      await response.text();

    throw new Error(
      `Lootlabs API ${response.status}: ` +
      text.slice(0, 200)
    );
  }

  const data =
    await response.json();

  // content_url = newer Lootlabs, task_url = older
  const taskUrl =
    data.content_url ||
    data.task_url ||
    data.url;

  if (!taskUrl) {
    throw new Error(
      "Lootlabs did not return a task URL"
    );
  }

  return taskUrl;
}

function lootlabsPage(
  title,
  badgeText,
  statusTitle,
  statusText,
  key = null
) {

  const keyBlock = key
    ? `
<div class="status" style="margin-top:18px;background:rgba(0,40,10,.6);border-color:rgba(100,255,100,.2);">
<div class="status-title">YOUR KEY</div>
<div class="status-text" style="font-family:monospace;font-size:18px;color:#4ade80;letter-spacing:2px;">${key}</div>
</div>
<p style="margin-top:16px;color:#94a3b8;font-size:14px;">
ไปที่ Discord แล้วพิมพ์ <strong style="color:#60a5fa">/mykey</strong> เพื่อดู Key ของคุณอีกครั้ง
</p>`
    : "";

  return `
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — SEI HUB</title>
<style>${SHARED_CSS}</style>
</head>
<body>
<div class="page">
<div class="box">
<img class="logo" src="${LOGO_URL}" alt="SEI HUB">
<div class="badge">${badgeText}</div>
<h1>SEI HUB</h1>
<div class="status">
<div class="status-title">${statusTitle}</div>
<div class="status-text">${statusText}</div>
</div>
${keyBlock}
<a class="discord-btn" href="${DISCORD_URL}" target="_blank" rel="noopener noreferrer">
${DISCORD_SVG}
<div class="discord-text">
<div class="discord-title">Join Developer Discord</div>
<div class="discord-sub">discord.gg/n3xY3YuwuQ</div>
</div>
</a>
<hr class="divider">
<div class="footer">
<strong>Developer Discord</strong><br>
<a href="${DISCORD_URL}" target="_blank" rel="noopener noreferrer">${DISCORD_URL}</a>
<br><br>SEI HUB • Secure Script Distribution
</div>
</div>
</div>
</body>
</html>
`;
}

// POST /lootlabs/task
// Discord bot calls this to get a Lootlabs task link for a user
app.post(
  "/lootlabs/task",
  async (req, res) => {

    try {

      const {
        discord_id,
        secret
      } = req.body;

      if (
        !BOT_SECRET ||
        secret !== BOT_SECRET
      ) {

        return res.status(403).json({
          success: false,
          message: "Forbidden"
        });
      }

      if (
        !discord_id ||
        !discord_id.trim()
      ) {

        return res.status(400).json({
          success: false,
          message: "discord_id required"
        });
      }

      if (!LOOTLABS_API_KEY) {

        return res.status(500).json({
          success: false,
          message: "Lootlabs not configured on server"
        });
      }

      const ownerId =
        discord_id.trim();

      // Already has an active non-expired key — just return it
      const {
        data: existingKey
      } = await supabase
        .from("keys")
        .select("key, expires_at")
        .eq("owner", ownerId)
        .eq("active", true)
        .maybeSingle();

      if (existingKey) {

        const expired =
          existingKey.expires_at &&
          new Date(existingKey.expires_at) < new Date();

        if (!expired) {

          return res.json({
            success: true,
            already_has_key: true,
            key: existingKey.key
          });
        }
      }

      // Pending task created in the last 10 minutes — reuse it
      const {
        data: pendingTask
      } = await supabase
        .from("key_tasks")
        .select("task_url, created_at")
        .eq("discord_id", ownerId)
        .eq("completed", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pendingTask) {

        const ageMs =
          Date.now() -
          new Date(pendingTask.created_at).getTime();

        if (ageMs < 10 * 60_000) {

          return res.json({
            success: true,
            pending: true,
            task_url: pendingTask.task_url
          });
        }
      }

      // Create new Lootlabs task
      const taskUrl =
        await createLootlabsTask(ownerId);

      await supabase
        .from("key_tasks")
        .insert({
          discord_id: ownerId,
          task_url: taskUrl,
          completed: false,
          created_at: new Date().toISOString()
        });

      res.json({
        success: true,
        task_url: taskUrl
      });

    } catch (error) {

      console.error(
        "Lootlabs Task Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create Lootlabs task"
      });
    }
  }
);

// GET /lootlabs/complete
// Lootlabs redirects the user here after they finish tasks
app.get(
  "/lootlabs/complete",
  async (req, res) => {

    try {

      const discordId =
        String(req.query.user || "").trim();

      if (!discordId) {

        return res
          .status(400)
          .send(lootlabsPage(
            "Error",
            "ERROR",
            "MISSING USER",
            "ไม่พบ Discord ID กรุณาลองใหม่อีกครั้ง"
          ));
      }

      // Idempotent — already has a valid key
      const {
        data: existingKey
      } = await supabase
        .from("keys")
        .select("key, expires_at")
        .eq("owner", discordId)
        .eq("active", true)
        .maybeSingle();

      if (existingKey) {

        const expired =
          existingKey.expires_at &&
          new Date(existingKey.expires_at) < new Date();

        if (!expired) {

          return res.send(
            lootlabsPage(
              "Key Ready",
              "KEY READY",
              "มี Key อยู่แล้ว",
              "ไม่จำเป็นต้องทำ Task ซ้ำ",
              existingKey.key
            )
          );
        }
      }

      // Generate and store new key
      const newKey = generateKey();

      const {
        error: insertError
      } = await supabase
        .from("keys")
        .insert({
          key: newKey,
          owner: discordId,
          expires_at: null,
          active: true,
          created_at: new Date().toISOString()
        });

      if (insertError) {

        console.error(
          "Lootlabs Complete Insert Error:",
          insertError.message
        );

        return res
          .status(500)
          .send(lootlabsPage(
            "Error",
            "ERROR",
            "GENERATION FAILED",
            "สร้าง Key ไม่สำเร็จ กรุณาติดต่อเจ้าของ"
          ));
      }

      // Mark pending tasks as completed
      await supabase
        .from("key_tasks")
        .update({ completed: true })
        .eq("discord_id", discordId)
        .eq("completed", false);

      res.send(
        lootlabsPage(
          "Key Unlocked",
          "KEY UNLOCKED",
          "สำเร็จแล้ว 🎉",
          "ทำ Task เสร็จแล้ว Key ของคุณพร้อมใช้งาน",
          newKey
        )
      );

    } catch (error) {

      console.error(
        "Lootlabs Complete Error:",
        error.message
      );

      res
        .status(500)
        .send(lootlabsPage(
          "Error",
          "SERVER ERROR",
          "เกิดข้อผิดพลาด",
          "กรุณาติดต่อเจ้าของ Discord"
        ));
    }
  }
);

// ---------- boot ----------

(async () => {

  try {

    const {
      error
    } = await supabase
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
