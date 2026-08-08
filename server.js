require('dotenv').config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_KEY");
    process.exit(1);
}

const crypto = require("crypto");
const express = require("express");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);
const BUCKET = process.env.SUPABASE_BUCKET || "scripts";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

async function makeID() {
  while (true) {
    const id = crypto.randomBytes(16).toString("hex");
    const { data } = await supabase.from("scripts").select("id").eq("id", id).maybeSingle();
    if (!data) return id;
  }
}

const HOME_HTML = (scripts) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SEI HUB — Script Distribution Platform</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080c14;
    --surface: #0d1321;
    --surface2: #111927;
    --border: rgba(255,255,255,0.06);
    --border-hover: rgba(99,179,237,0.3);
    --accent: #63b3ed;
    --accent-dim: rgba(99,179,237,0.12);
    --accent-glow: rgba(99,179,237,0.25);
    --text-primary: #e2e8f0;
    --text-secondary: #718096;
    --text-muted: #4a5568;
    --green: #68d391;
    --green-dim: rgba(104,211,145,0.1);
    --mono: 'JetBrains Mono', monospace;
    --sans: 'Inter', sans-serif;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    font-family: var(--sans);
    color: var(--text-primary);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    position: relative;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    top: -40%;
    left: 50%;
    transform: translateX(-50%);
    width: 900px;
    height: 600px;
    background: radial-gradient(ellipse, rgba(99,179,237,0.04) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .wrapper {
    width: 100%;
    max-width: 480px;
    position: relative;
    z-index: 1;
  }

  /* ── Header ── */
  .header {
    text-align: center;
    margin-bottom: 36px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--accent-dim);
    border: 1px solid rgba(99,179,237,0.2);
    border-radius: 100px;
    padding: 5px 14px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 20px;
  }

  .badge::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 8px var(--accent);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .logo {
    font-size: 42px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text-primary);
    line-height: 1;
    margin-bottom: 8px;
  }

  .logo span {
    color: var(--accent);
  }

  .tagline {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 400;
    letter-spacing: 0.01em;
  }

  /* ── Card ── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .card-header {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .card-header .dot {
    width: 8px; height: 8px;
    border-radius: 50%;
  }
  .dot-red   { background: #fc8181; }
  .dot-yellow{ background: #f6e05e; }
  .dot-green { background: var(--green); }

  /* ── Stats grid ── */
  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
  }

  .stat-item {
    padding: 28px 24px;
    position: relative;
  }

  .stat-item:first-child {
    border-right: 1px solid var(--border);
  }

  .stat-value {
    font-family: var(--mono);
    font-size: 36px;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1;
    margin-bottom: 6px;
    letter-spacing: -0.02em;
  }

  .stat-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .stat-accent {
    position: absolute;
    top: 28px;
    right: 24px;
    font-size: 20px;
    opacity: 0.35;
  }

  /* ── Status row ── */
  .status-row {
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    background: var(--surface2);
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-secondary);
  }

  .status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 6px var(--green);
  }

  .status-active { color: var(--green); font-weight: 500; }

  /* ── Info card ── */
  .info-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
  }

  .info-line {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 0;
    font-size: 13px;
  }

  .info-line:not(:last-child) {
    border-bottom: 1px solid var(--border);
  }

  .info-icon {
    font-size: 14px;
    opacity: 0.6;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .info-key {
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    min-width: 90px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .info-val {
    color: var(--text-secondary);
    line-height: 1.5;
    font-size: 13px;
  }

  .info-val .mono {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--accent);
    background: var(--accent-dim);
    padding: 2px 7px;
    border-radius: 4px;
  }

  /* ── Footer ── */
  .footer {
    text-align: center;
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 4px;
    letter-spacing: 0.04em;
  }

  .footer a {
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.2s;
  }

  .footer a:hover { color: var(--accent); }

  /* ── Forbidden ── */
  .forbidden-wrap {
    width: 100%;
    max-width: 480px;
    z-index: 1;
    position: relative;
  }

  .forbidden-card {
    background: var(--surface);
    border: 1px solid rgba(252,129,129,0.12);
    border-radius: 16px;
    overflow: hidden;
  }

  .forbidden-top {
    background: rgba(252,129,129,0.05);
    padding: 32px 28px 24px;
    text-align: center;
    border-bottom: 1px solid rgba(252,129,129,0.1);
  }

  .forbidden-icon {
    font-size: 36px;
    margin-bottom: 12px;
    display: block;
  }

  .forbidden-title {
    font-size: 18px;
    font-weight: 600;
    color: #fc8181;
    letter-spacing: -0.01em;
    margin-bottom: 6px;
  }

  .forbidden-sub {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .forbidden-body {
    padding: 20px 24px;
  }

  .forbidden-url {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text-muted);
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 14px;
    word-break: break-all;
    line-height: 1.6;
    margin-top: 12px;
  }

  .forbidden-hint {
    margin-top: 12px;
    font-size: 12px;
    color: var(--text-muted);
    text-align: center;
  }
</style>
</head>
<body>
<div class="wrapper">

  <div class="header">
    <div class="badge">Script Distribution</div>
    <div class="logo">SEI<span>.</span>HUB</div>
    <div class="tagline">Secure loader infrastructure for Roblox scripts</div>
  </div>

  <div class="card">
    <div class="card-header">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
      <span style="margin-left:6px;">Overview</span>
    </div>
    <div class="stats">
      <div class="stat-item">
        <div class="stat-accent">📂</div>
        <div class="stat-value">${scripts.length}</div>
        <div class="stat-label">Scripts</div>
      </div>
      <div class="stat-item">
        <div class="stat-accent">⬇</div>
        <div class="stat-value">${scripts.reduce((a,b)=>a+b.downloads,0)}</div>
        <div class="stat-label">Executions</div>
      </div>
    </div>
    <div class="status-row">
      <div class="status-item">
        <span class="status-dot"></span>
        <span class="status-active">All systems operational</span>
      </div>
      <div class="status-item">Supabase · CDN</div>
    </div>
  </div>

  <div class="info-card">
    <div class="info-line">
      <span class="info-icon">🔒</span>
      <span class="info-key">Protection</span>
      <span class="info-val">Scripts are delivered only to verified Roblox clients. Browser access is blocked.</span>
    </div>
    <div class="info-line">
      <span class="info-icon">⚡</span>
      <span class="info-key">Loader</span>
      <span class="info-val"><span class="mono">loadstring(game:HttpGet(url))()</span></span>
    </div>
    <div class="info-line">
      <span class="info-icon">📦</span>
      <span class="info-key">Storage</span>
      <span class="info-val">Supabase Storage with 5 MB per script limit</span>
    </div>
  </div>

  <div class="footer">
    Unauthorized access is prohibited &nbsp;·&nbsp;
    <a href="/scripts">API</a> &nbsp;·&nbsp;
    <a href="/stats">Stats</a>
  </div>

</div>
</body>
</html>`;

const FORBIDDEN_HTML = (protocol, host, id) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Access Restricted — SEI HUB</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080c14; --surface: #0d1321; --surface2: #111927;
    --border: rgba(255,255,255,0.06);
    --text-primary: #e2e8f0; --text-secondary: #718096; --text-muted: #4a5568;
    --red: #fc8181; --accent: #63b3ed;
    --mono: 'JetBrains Mono', monospace; --sans: 'Inter', sans-serif;
  }
  body {
    background: var(--bg); font-family: var(--sans); color: var(--text-primary);
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 40px 20px;
  }
  body::before {
    content: ''; position: fixed; top: -40%; left: 50%; transform: translateX(-50%);
    width: 800px; height: 500px;
    background: radial-gradient(ellipse, rgba(252,129,129,0.04) 0%, transparent 70%);
    pointer-events: none;
  }
  .wrap { width: 100%; max-width: 440px; position: relative; z-index: 1; }
  .card { background: var(--surface); border: 1px solid rgba(252,129,129,0.12); border-radius: 16px; overflow: hidden; }
  .top { background: rgba(252,129,129,0.04); padding: 36px 28px 28px; text-align: center; border-bottom: 1px solid rgba(252,129,129,0.08); }
  .icon { font-size: 40px; margin-bottom: 16px; display: block; }
  .title { font-size: 20px; font-weight: 600; color: var(--red); letter-spacing: -0.02em; margin-bottom: 8px; }
  .sub { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
  .body { padding: 24px; }
  .label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
  .url-box {
    font-family: var(--mono); font-size: 11px; color: var(--text-secondary);
    background: var(--surface2); border: 1px solid var(--border); border-radius: 8px;
    padding: 12px 14px; word-break: break-all; line-height: 1.7;
  }
  .hint { margin-top: 16px; font-size: 12px; color: var(--text-muted); text-align: center; line-height: 1.6; }
  .hint b { color: var(--accent); font-weight: 500; }
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="top">
      <span class="icon">🛡️</span>
      <div class="title">Access Restricted</div>
      <div class="sub">This script is protected by SEI HUB.<br>Direct browser access is not permitted.</div>
    </div>
    <div class="body">
      <div class="label">Loader URL</div>
      <div class="url-box">${protocol}://${host}/script/${id}</div>
      <div class="hint">Use this URL inside Roblox with<br><b>loadstring(game:HttpGet(url))()</b></div>
    </div>
  </div>
</div>
</body>
</html>`;

app.get("/", async (req, res) => {
  const { data: db } = await supabase.from("scripts").select("*");
  const scripts = db || [];
  res.send(HOME_HTML(scripts));
});

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file" });
  if (!req.file.originalname || !req.file.originalname.trim()) {
    return res.status(400).json({ success: false, message: "Invalid filename" });
  }
  const { data: exists } = await supabase.from("scripts").select("id").eq("filename", req.file.originalname).maybeSingle();
  if (exists) return res.status(400).json({ success: false, message: "Script name already exists." });

  const id = await makeID();
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(`${id}.lua`, req.file.buffer, { contentType: "text/plain" });
  if (uploadError) return res.status(500).json({ success: false, message: uploadError.message });

  const newData = { id, filename: req.file.originalname, owner: req.body.owner || "Unknown", created: new Date().toISOString(), downloads: 0, size: req.file.size };
  const { error: dbError } = await supabase.from("scripts").insert(newData);
  if (dbError) {
    await supabase.storage.from(BUCKET).remove([`${id}.lua`]);
    return res.status(500).json({ success: false, message: dbError.message });
  }
  res.json({ success: true, id, loader: `loadstring(game:HttpGet("${req.protocol}://${req.get("host")}/script/${id}"))()` });
});

app.get("/script/:id", async (req, res) => {
  const { data } = await supabase.from("scripts").select("*").eq("id", req.params.id).maybeSingle();
  if (!data) return res.status(404).send("Script Not Found");
  const userAgent = req.get("User-Agent") || "";
  if (!/Roblox/i.test(userAgent)) {
    return res.status(403).send(FORBIDDEN_HTML(req.protocol, req.get("host"), req.params.id));
  }
  const { data: fileBlob, error: dlError } = await supabase.storage.from(BUCKET).download(`${req.params.id}.lua`);
  if (dlError) return res.status(404).send("File Not Found");
  const text = await fileBlob.text();
  await supabase.from("scripts").update({ downloads: data.downloads + 1 }).eq("id", req.params.id);
  res.type("text/plain").send(text);
});

app.get("/scripts", async (req, res) => {
  const { data } = await supabase.from("scripts").select("*").order("created", { ascending: false });
  res.json({ success: true, total: data?.length || 0, scripts: data || [] });
});
app.get("/stats", async (req, res) => {
  const { data } = await supabase.from("scripts").select("downloads");
  res.json({ success: true, scripts: data?.length || 0, downloads: (data || []).reduce((a,b)=>a+b.downloads,0) });
});
app.get("/search/:name", async (req, res) => {
  const { data } = await supabase.from("scripts").select("*").ilike("filename", `%${req.params.name}%`);
  res.json({ success: true, total: data?.length || 0, scripts: data || [] });
});
app.get("/list/:owner", async (req, res) => {
  const { data } = await supabase.from("scripts").select("*").eq("owner", req.params.owner);
  res.json({ success: true, total: data?.length || 0, scripts: data || [] });
});
app.get("/info/:id", async (req, res) => {
  const { data } = await supabase.from("scripts").select("*").eq("id", req.params.id).maybeSingle();
  if (!data) return res.status(404).json({ success: false, message: "Not Found" });
  res.json({ success: true, data });
});
app.delete("/delete/:id", async (req, res) => {
  const owner = req.query.owner;
  if (!owner) return res.status(400).json({ success: false, message: "Owner required" });
  const { data } = await supabase.from("scripts").select("*").eq("id", req.params.id).maybeSingle();
  if (!data) return res.status(404).json({ success: false, message: "Script Not Found" });
  if (data.owner !== owner) return res.status(403).json({ success: false, message: "Permission Denied" });
  await supabase.storage.from(BUCKET).remove([`${req.params.id}.lua`]);
  await supabase.from("scripts").delete().eq("id", req.params.id);
  res.json({ success: true, message: "Deleted" });
});
app.post("/update/:id", upload.single("file"), async (req, res) => {
  const owner = req.body.owner;
  const { data } = await supabase.from("scripts").select("*").eq("id", req.params.id).maybeSingle();
  if (!data) return res.status(404).json({ success: false });
  if (data.owner !== owner) return res.status(403).json({ success: false });
  if (!req.file) return res.status(400).json({ success: false, message: "No file" });
  const { error } = await supabase.storage.from(BUCKET).upload(`${req.params.id}.lua`, req.file.buffer, { contentType: "text/plain", upsert: true });
  if (error) return res.status(500).json({ success: false, message: error.message });
  await supabase.from("scripts").update({ filename: req.file.originalname, size: req.file.size }).eq("id", req.params.id);
  res.json({ success: true, loader: `loadstring(game:HttpGet("${req.protocol}://${req.get("host")}/script/${req.params.id}"))()` });
});

(async () => {
    const { error } = await supabase.from("scripts").select("id").limit(1);
    if (error) console.error("Supabase Error:", error.message);
    else console.log("Supabase Connected");
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Running : " + PORT));
