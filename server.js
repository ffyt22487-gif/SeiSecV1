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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);{

const BUCKET = process.env.SUPABASE_BUCKET || "scripts";

const BASE_URL = (
  process.env.BASE_URL || "https://ui-f.onrender.com"
).replace(/\/+$/, "");

const LOGO_URL =
  "https://cdn.discordapp.com/attachments/1448285099421335623/1537103402314502266/83_20260811161648.png?ex=6a7e7b59&is=6a7d29d9&hm=42ce3e94389bc1852b1d676f81a93c797a91963fa416369e11e0286abc78424f&";

const DISCORD_URL = "https://discord.gg/n3xY3YuwuQ";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

function loaderFor(id) {
  return `loadstring(game:HttpGet("${BASE_URL}/script/${id}"))()`;
}

async function makeID() {
  while (true) {
    const id = crypto.randomBytes(16).toString("hex");
    const { data, error } = await supabase
      .from("scripts")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return id;
  }
}

/* ─────────────────────────────────────────────
   SHARED STYLES & LAYOUT HELPERS
───────────────────────────────────────────── */
const SHARED_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #020917;
    --bg2:       #050f22;
    --blue:      #2563eb;
    --cyan:      #06b6d4;
    --glow-b:    rgba(37,99,235,0.55);
    --glow-c:    rgba(6,182,212,0.45);
    --glass:     rgba(8,20,50,0.72);
    --border:    rgba(37,99,235,0.28);
    --border2:   rgba(6,182,212,0.22);
    --txt:       #e2eaf8;
    --sub:       #7a90b8;
    --dim:       #3d5278;
    --success:   #22c55e;
  }

  html { scroll-behavior: smooth; }

  body {
    min-height: 100vh;
    background: var(--bg);
    font-family: 'Inter', sans-serif;
    color: var(--txt);
    overflow-x: hidden;
  }

  /* ── Canvas particle bg ── */
  #canvas-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  /* ── Radial colour blobs ── */
  .blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(120px);
    opacity: 0.18;
    pointer-events: none;
    z-index: 0;
  }
  .blob-1 { width: 700px; height: 700px; background: #1a3fa0; top: -200px; left: -200px; }
  .blob-2 { width: 500px; height: 500px; background: #064e74; bottom: -100px; right: -100px; }
  .blob-3 { width: 350px; height: 350px; background: #0e3b6e; top: 40%; left: 50%; transform: translateX(-50%); }

  /* ── Scanline overlay ── */
  body::after {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(0,20,60,0.06) 3px,
      rgba(0,20,60,0.06) 4px
    );
    pointer-events: none;
    z-index: 1;
  }

  /* ── Page wrapper ── */
  .page {
    position: relative;
    z-index: 2;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
  }

  /* ── Glass card ── */
  .card {
    width: 100%;
    max-width: 560px;
    background: var(--glass);
    border: 1px solid var(--border);
    border-radius: 28px;
    padding: 52px 44px 44px;
    text-align: center;
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow:
      0 0 0 1px rgba(37,99,235,0.08),
      0 8px 60px rgba(0,10,40,0.7),
      0 0 120px rgba(37,99,235,0.12),
      inset 0 1px 0 rgba(255,255,255,0.05);
    animation: cardIn 0.7s cubic-bezier(.22,.9,.36,1) both;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: none; }
  }

  /* ── Logo ── */
  .logo-wrap {
    position: relative;
    display: inline-block;
    margin-bottom: 28px;
  }
  .logo-wrap::before {
    content: '';
    position: absolute;
    inset: -18px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%);
    animation: pulse 3s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,100% { transform: scale(1);   opacity: 0.7; }
    50%      { transform: scale(1.12); opacity: 1; }
  }
  .logo {
    width: 130px;
    height: 130px;
    object-fit: contain;
    border-radius: 50%;
    border: 2px solid rgba(37,99,235,0.5);
    box-shadow:
      0 0 30px var(--glow-b),
      0 0 60px rgba(6,182,212,0.2);
    position: relative;
    z-index: 1;
    transition: transform 0.4s ease, box-shadow 0.4s ease;
  }
  .logo:hover {
    transform: scale(1.06) rotate(3deg);
    box-shadow: 0 0 50px var(--glow-b), 0 0 90px var(--glow-c);
  }

  /* ── Badge ── */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 18px;
    border-radius: 40px;
    background: linear-gradient(135deg, rgba(37,99,235,0.18), rgba(6,182,212,0.12));
    border: 1px solid var(--border2);
    color: var(--cyan);
    font-family: 'Orbitron', monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    margin-bottom: 18px;
  }
  .badge-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 10px var(--cyan);
    animation: blink 1.8s ease-in-out infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  /* ── Heading ── */
  .brand {
    font-family: 'Orbitron', monospace;
    font-size: 52px;
    font-weight: 900;
    letter-spacing: 4px;
    line-height: 1;
    background: linear-gradient(135deg, #e2eaf8 0%, var(--cyan) 50%, var(--blue) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 10px;
    filter: drop-shadow(0 0 20px rgba(6,182,212,0.4));
  }
  .tagline {
    color: var(--sub);
    font-size: 15px;
    font-weight: 400;
    letter-spacing: 0.5px;
    margin-bottom: 36px;
  }

  /* ── Stats row ── */
  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 32px;
  }
  .stat {
    padding: 22px 16px;
    border-radius: 18px;
    background: rgba(3,12,30,0.7);
    border: 1px solid rgba(255,255,255,0.05);
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s, transform 0.3s;
  }
  .stat::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--blue), var(--cyan));
    opacity: 0.7;
  }
  .stat:hover {
    border-color: var(--border);
    transform: translateY(-2px);
  }
  .stat-num {
    font-family: 'Orbitron', monospace;
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(90deg, #93c5fd, var(--cyan));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
  }
  .stat-label 
    margin-top: 7px;
    font-size: 11px;
    color: var(--dim);
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 500;
  }

  /* ── Discord button ── */
  .discord-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 13px 28px;
    border-radius: 14px;
    background: linear-gradient(135deg, #5865F2, #4752c4);
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    letter-spacing: 0.3px;
    border: 1px solid rgba(255,255,255,0.15);
    box-shadow: 0 4px 24px rgba(88,101,242,0.4), 0 0 0 1px rgba(88,101,242,0.3);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    margin-bottom: 28px;
  }
  .discord-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 36px rgba(88,101,242,0.6), 0 0 0 1px rgba(88,101,242,0.5);
  }
  .discord-icon { width: 22px; height: 22px; flex-shrink: 0; }

  /* ── Divider ── */
  .divider {
    border: none;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border), transparent);
    margin: 0 0 22px;
  }

  /* ── Footer ── */
  .footer {
    font-size: 12px;
    color: var(--dim);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-family: 'Orbitron', monospace;
    font-weight: 400;
  }
  .footer a {
    color: var(--cyan);
    text-decoration: none;
  }
  .footer a:hover { text-decoration: underline; }

  /* ── Protected page specifics ── */
  .shield-icon { font-size: 48px; margin-bottom: 14px; display: block; }
  .status-box {
    margin: 24px 0;
    padding: 18px 20px;
    border-radius: 16px;
    background: rgba(2,9,23,0.7);
    border: 1px solid rgba(255,255,255,0.05);
    text-align: left;
  }
  .status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    font-size: 13px;
  }
  .status-row:last-child { border-bottom: none; }
  .status-key { color: var(--dim); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
  .status-val { color: var(--txt); font-family: 'Orbitron', monospace; font-size: 11px; }
  .status-ok  { color: var(--success); font-family: 'Orbitron', monospace; font-size: 11px; }

  .pill-ok {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 30px;
    background: rgba(34,197,94,0.12);
    border: 1px solid rgba(34,197,94,0.3);
    color: var(--success);
    font-size: 12px;
    font-weight: 600;
  }
  .pill-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 8px var(--success);
    animation: blink 1.8s ease-in-out infinite;
  }

  @media (max-width: 500px) {
    .card { padding: 36px 22px 32px; }
    .brand { font-size: 38px; }
    .stat-num { font-size: 26px; }
  }
`;

const CANVAS_SCRIPT = `
  (function(){
    const c = document.getElementById('canvas-bg');
    if(!c) return;
    const ctx = c.getContext('2d');
    let W, H, pts = [];
    const N = 80;
    function resize(){
      W = c.width  = window.innerWidth;
      H = c.height = window.innerHeight;
    }
    function init(){
      pts = [];
      for(let i=0;i<N;i++){
        pts.push({
          x: Math.random()*W,
          y: Math.random()*H,
          vx:(Math.random()-.5)*.35,
          vy:(Math.random()-.5)*.35,
          r: Math.random()*1.6+.4
        });
      }
    }
    function draw(){
      ctx.clearRect(0,0,W,H);
      // dots
      for(const p of pts){
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle='rgba(96,165,250,0.55)';
        ctx.fill();
      }
      // lines
      for(let i=0;i<pts.length;i++){
        for(let j=i+1;j<pts.length;j++){
          const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
          const d=Math.sqrt(dx*dx+dy*dy);
          if(d<140){
            ctx.beginPath();
            ctx.moveTo(pts[i].x,pts[i].y);
            ctx.lineTo(pts[j].x,pts[j].y);
            ctx.strokeStyle=\`rgba(37,99,235,\${(1-d/140)*.22})\`;
            ctx.lineWidth=.7;
            ctx.stroke();
          }
        }
      }
      // move
      for(const p of pts){
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>W) p.vx*=-1;
        if(p.y<0||p.y>H) p.vy*=-1;
      }
      requestAnimationFrame(draw);
    }
    resize(); init(); draw();
    window.addEventListener('resize',()=>{ resize(); init(); });
  })();
`;

const DISCORD_SVG = `<svg class="discord-icon" viewBox="0 0 127.14 96.36" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M107.7 8.07A105.16 105.16 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.14ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z"/></svg>`;

/* ─────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────── */
app.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("scripts").select("*");
    if (error) return res.status(500).send("Database Error");

    const scripts = data || [];
    const downloads = scripts.reduce((t, s) => t + Number(s.downloads || 0), 0);

    res.send(`<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SEI HUB — Secure Script Distribution</title>
<style>${SHARED_CSS}</style>
</head>
<body>
<canvas id="canvas-bg"></canvas>
<div class="blob blob-1"></div>
<div class="blob blob-2"></div>
<div class="blob blob-3"></div>

<div class="page">
  <div class="card">

    <div class="logo-wrap">
      <img class="logo" src="${LOGO_URL}" alt="SEI HUB Logo">
    </div>

    <div class="badge">
      <span class="badge-dot"></span>
      Secure Script Distribution
    </div>

    <h1 class="brand">SEI HUB</h1>
    <p class="tagline">Next-generation script delivery platform for Roblox</p>

    <div class="stats">
      <div class="stat">
        <div class="stat-num">${scripts.length}</div>
        <div class="stat-label">Scripts</div>
      </div>
      <div class="stat">
        <div class="stat-num">${downloads}</div>
        <div class="stat-label">Downloads</div>
      </div>
    </div>

    <a class="discord-btn" href="${DISCORD_URL}" target="_blank" rel="noopener">
      ${DISCORD_SVG}
      Join our Discord
    </a>

    <hr class="divider">

    <p class="footer">
      SEI HUB &nbsp;·&nbsp; Developer:
      <a href="${DISCORD_URL}" target="_blank">discord.gg/n3xY3YuwuQ</a>
    </p>

  </div>
</div>

<script>${CANVAS_SCRIPT}</script>
</body>
</html>`);
  } catch (err) {
    console.error("Home Error:", err.message);
    res.status(500).send("Server Error");
  }
});

/* ─────────────────────────────────────────────
   PROTECTED SCRIPT PAGE  (non-Roblox UA)
───────────────────────────────────────────── */
function protectedPage() {
  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SEI HUB — Protected Script</title>
<style>${SHARED_CSS}</style>
</head>
<body>
<canvas id="canvas-bg"></canvas>
<div class="blob blob-1"></div>
<div class="blob blob-2"></div>

<div class="page">
  <div class="card">

    <div class="logo-wrap">
      <img class="logo" src="${LOGO_URL}" alt="SEI HUB Logo">
    </div>

    <div class="badge">
      <span class="badge-dot"></span>
      Protected Resource
    </div>

    <h1 class="brand">SEI HUB</h1>
    <p class="tagline">This script is protected by SEI HUB security layer</p>

    <div class="status-box">
      <div class="status-row">
        <span class="status-key">Access</span>
        <span class="status-val" style="color:#f87171">RESTRICTED</span>
      </div>
      <div class="status-row">
        <span class="status-key">Client</span>
        <span class="status-val">Non-Roblox Agent</span>
      </div>
      <div class="status-row">
        <span class="status-key">Protocol</span>
        <span class="status-val">SEI-SHIELD v2</span>
      </div>
      <div class="status-row">
        <span class="status-key">Protection</span>
        <span class="status-ok">ACTIVE</span>
      </div>
    </div>

    <div class="pill-ok" style="margin-bottom:28px">
      <span class="pill-dot"></span>
      Shield Online
    </div>

    <a class="discord-btn" href="${DISCORD_URL}" target="_blank" rel="noopener">
      ${DISCORD_SVG}
      Join our Discord
    </a>

    <hr class="divider">

    <p class="footer">
      SEI HUB &nbsp;·&nbsp; Developer:
      <a href="${DISCORD_URL}" target="_blank">discord.gg/n3xY3YuwuQ</a>
    </p>

  </div>
</div>

<script>${CANVAS_SCRIPT}</script>
</body>
</html>`;
}

/* ─────────────────────────────────────────────
   SCRIPT DELIVERY
───────────────────────────────────────────── */
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file" });
    if (!req.file.originalname || !req.file.originalname.trim())
      return res.status(400).json({ success: false, message: "Invalid filename" });

    const { data: exists, error: existsError } = await supabase
      .from("scripts").select("id").eq("filename", req.file.originalname).maybeSingle();
    if (existsError) return res.status(500).json({ success: false, message: existsError.message });
    if (exists) return res.status(400).json({ success: false, message: "Script name already exists." });

    const id = await makeID();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET).upload(`${id}.lua`, req.file.buffer, { contentType: "text/plain" });
    if (uploadError) return res.status(500).json({ success: false, message: uploadError.message });

    const newData = {
      id,
      filename: req.file.originalname,
      owner: req.body.owner || "Unknown",
      created: new Date().toISOString(),
      downloads: 0,
      size: req.file.size
    };

    const { error: dbError } = await supabase.from("scripts").insert(newData);
    if (dbError) {
      await supabase.storage.from(BUCKET).remove([`${id}.lua`]);
      return res.status(500).json({ success: false, message: dbError.message });
    }

    res.json({ success: true, id, loader: loaderFor(id) });
  } catch (err) {
    console.error("Upload Error:", err.message);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

app.get("/script/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const { data, error } = await supabase
      .from("scripts").select("*").eq("id", id).maybeSingle();
    if (error) return res.status(500).send("Database Error");
    if (!data) return res.status(404).send("Script Not Found");

    const userAgent = req.get("User-Agent") || "";
    if (!/Roblox/i.test(userAgent)) return res.status(403).send(protectedPage());

    const { data: fileBlob, error: dlError } = await supabase.storage
      .from(BUCKET).download(`${id}.lua`);
    if (dlError) return res.status(404).send("File Not Found");

    const text = await fileBlob.text();

    await supabase.from("scripts")
      .update({ downloads: Number(data.downloads || 0) + 1 }).eq("id", id);

    res.type("text/plain").send(text);
  } catch (err) {
    console.error("Script Error:", err.message);
    res.status(500).send("Server Error");
  }
});

app.get("/scripts", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("scripts").select("*").order("created", { ascending: false });
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, total: data?.length || 0, scripts: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load scripts" });
  }
});

app.get("/stats", async (req, res) => {
  try {
    const { data, error } = await supabase.from("scripts").select("downloads");
    if (error) return res.status(500).json({ success: false, message: error.message });
    const downloads = (data || []).reduce((t, s) => t + Number(s.downloads || 0), 0);
    res.json({ success: true, scripts: data?.length || 0, downloads });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load stats" });
  }
});

app.get("/search/:name", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("scripts").select("*").ilike("filename", `%${req.params.name}%`);
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, total: data?.length || 0, scripts: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Search failed" });
  }
});

app.get("/list/:owner", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("scripts").select("*").eq("owner", req.params.owner)
      .order("created", { ascending: false });
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, total: data?.length || 0, scripts: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load scripts" });
  }
});

app.get("/info/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("scripts").select("*").eq("id", req.params.id).maybeSingle();
    if (error) return res.status(500).json({ success: false, message: error.message });
    if (!data) return res.status(404).json({ success: false, message: "Not Found" });
    res.json({ success: true, data: { ...data, loader: loaderFor(data.id) } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load script info" });
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    const owner = req.query.owner;
    if (!owner) return res.status(400).json({ success: false, message: "Owner required" });

    const { data, error } = await supabase
      .from("scripts").select("*").eq("id", req.params.id).maybeSingle();
    if (error) return res.status(500).json({ success: false, message: error.message });
    if (!data) return res.status(404).json({ success: false, message: "Script Not Found" });
    if (data.owner !== owner) return res.status(403).json({ success: false, message: "Permission Denied" });

    const { error: storageError } = await supabase.storage
      .from(BUCKET).remove([`${req.params.id}.lua`]);
    if (storageError) return res.status(500).json({ success: false, message: storageError.message });

    const { error: deleteError } = await supabase
      .from("scripts").delete().eq("id", req.params.id);
    if (deleteError) return res.status(500).json({ success: false, message: deleteError.message });

    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

app.post("/update/:id", upload.single("file"), async (req, res) => {
  try {
    const owner = req.body.owner;

    const { data, error: findError } = await supabase
      .from("scripts").select("*").eq("id", req.params.id).maybeSingle();
    if (findError) return res.status(500).json({ success: false, message: findError.message });
    if (!data) return res.status(404).json({ success: false, message: "Script Not Found" });
    if (data.owner !== owner) return res.status(403).json({ success: false, message: "Permission Denied" });
    if (!req.file) return res.status(400).json({ success: false, message: "No file" });

    const { error: uploadError } = await supabase.storage
      .from(BUCKET).upload(`${req.params.id}.lua`, req.file.buffer,
        { contentType: "text/plain", upsert: true });
    if (uploadError) return res.status(500).json({ success: false, message: uploadError.message });

    const { error: updateError } = await supabase
      .from("scripts").update({ filename: req.file.originalname, size: req.file.size })
      .eq("id", req.params.id);
    if (updateError) return res.status(500).json({ success: false, message: updateError.message });

    res.json({ success: true, loader: loaderFor(req.params.id) });
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

/* ── Supabase connection check ── */
(async () => {
  try {
    const { error } = await supabase.from("scripts").select("id").limit(1);
    if (error) console.error("Supabase Error:", error.message);
    else console.log("Supabase Connected");
  } catch (err) {
    console.error("Supabase Error:", err.message);
  }
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Running : " + PORT));
