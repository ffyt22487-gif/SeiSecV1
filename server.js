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
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

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

const DISCORD_SVG = `
<svg class="discord-icon" viewBox="0 0 127.14 96.36" xmlns="http://www.w3.org/2000/svg">
<path fill="currentColor" d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.14ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z"/>
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
radial-gradient(circle at 50% 5%,#123b8f 0%,#08152f 35%,#020817 82%);
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
radial-gradient(circle at 20% 20%,rgba(30,100,255,.08),transparent 35%),
radial-gradient(circle at 80% 80%,rgba(0,160,255,.07),transparent 35%);
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
background:linear-gradient(135deg,#5865f2,#4752c4);
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
background:linear-gradient(
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

/* ── TAB STYLES ── */
.tabs{
display:flex;
gap:6px;
margin-bottom:28px;
background:rgba(2,10,25,.6);
border:1px solid rgba(70,130,255,.18);
border-radius:18px;
padding:6px;
}

.tab-btn{
flex:1;
padding:10px 8px;
border-radius:12px;
border:none;
background:transparent;
color:#64748b;
font-size:13px;
font-weight:700;
letter-spacing:.6px;
cursor:pointer;
transition:
background .2s ease,
color .2s ease,
box-shadow .2s ease;
display:flex;
align-items:center;
justify-content:center;
gap:6px;
}

.tab-btn:hover{
color:#94a3b8;
background:rgba(255,255,255,.04);
}

.tab-btn.active{
background:rgba(30,100,255,.22);
color:#60a5fa;
box-shadow:
0 0 18px rgba(0,110,255,.18),
inset 0 0 12px rgba(40,100,255,.08);
border:1px solid rgba(70,130,255,.28);
}

.tab-icon{
font-size:15px;
line-height:1;
}

.tab-panel{
display:none;
animation:fadeTab .3s ease both;
}

.tab-panel.active{
display:block;
}

@keyframes fadeTab{
from{
opacity:0;
transform:translateY(8px);
}
to{
opacity:1;
transform:none;
}
}

/* ── SCRIPTS LIST (tab 2) ── */
.search-wrap{
position:relative;
margin-bottom:16px;
}

.search-input{
width:100%;
padding:11px 16px 11px 40px;
border-radius:12px;
background:rgba(2,10,25,.7);
border:1px solid rgba(70,130,255,.22);
color:#e2e8f0;
font-size:14px;
outline:none;
transition:border-color .2s;
}

.search-input:focus{
border-color:rgba(70,130,255,.55);
}

.search-input::placeholder{
color:#475569;
}

.search-icon{
position:absolute;
left:13px;
top:50%;
transform:translateY(-50%);
color:#475569;
font-size:15px;
pointer-events:none;
}

.script-list{
display:flex;
flex-direction:column;
gap:10px;
max-height:320px;
overflow-y:auto;
padding-right:4px;
}

.script-list::-webkit-scrollbar{
width:4px;
}

.script-list::-webkit-scrollbar-track{
background:transparent;
}

.script-list::-webkit-scrollbar-thumb{
background:rgba(70,130,255,.3);
border-radius:4px;
}

.script-card{
padding:14px 16px;
border-radius:14px;
background:rgba(2,10,25,.65);
border:1px solid rgba(255,255,255,.06);
text-align:left;
transition:border-color .2s, background .2s;
cursor:default;
}

.script-card:hover{
border-color:rgba(70,130,255,.3);
background:rgba(10,25,60,.6);
}

.script-name{
font-size:14px;
font-weight:700;
color:#e2e8f0;
margin-bottom:6px;
white-space:nowrap;
overflow:hidden;
text-overflow:ellipsis;
}

.script-meta{
display:flex;
gap:12px;
font-size:12px;
color:#475569;
}

.script-meta span{
display:flex;
align-items:center;
gap:4px;
}

.copy-btn{
margin-top:10px;
width:100%;
padding:8px;
border-radius:9px;
border:1px solid rgba(70,130,255,.25);
background:rgba(30,100,255,.12);
color:#60a5fa;
font-size:12px;
font-weight:700;
cursor:pointer;
letter-spacing:.5px;
transition:
background .2s,
border-color .2s;
}

.copy-btn:hover{
background:rgba(30,100,255,.25);
border-color:rgba(70,130,255,.5);
}

.copy-btn.copied{
background:rgba(34,197,94,.15);
border-color:rgba(34,197,94,.4);
color:#4ade80;
}

.empty-msg{
text-align:center;
padding:32px 0;
color:#475569;
font-size:14px;
}

/* ── UPLOAD TAB (tab 3) ── */
.upload-form{
display:flex;
flex-direction:column;
gap:14px;
text-align:left;
}

.field-label{
font-size:12px;
font-weight:700;
color:#64748b;
letter-spacing:.8px;
margin-bottom:6px;
}

.field-input{
width:100%;
padding:11px 14px;
border-radius:12px;
background:rgba(2,10,25,.7);
border:1px solid rgba(70,130,255,.22);
color:#e2e8f0;
font-size:14px;
outline:none;
transition:border-color .2s;
}

.field-input:focus{
border-color:rgba(70,130,255,.55);
}

.field-input::placeholder{
color:#475569;
}

.drop-zone{
border:2px dashed rgba(70,130,255,.3);
border-radius:14px;
padding:28px 16px;
text-align:center;
cursor:pointer;
transition:
border-color .2s,
background .2s;
position:relative;
}

.drop-zone:hover,
.drop-zone.dragover{
border-color:rgba(70,130,255,.65);
background:rgba(30,100,255,.07);
}

.drop-zone input[type=file]{
position:absolute;
inset:0;
opacity:0;
cursor:pointer;
width:100%;
height:100%;
}

.drop-icon{
font-size:28px;
margin-bottom:8px;
}

.drop-text{
font-size:13px;
color:#64748b;
}

.drop-text strong{
color:#60a5fa;
}

.drop-selected{
margin-top:8px;
font-size:12px;
color:#4ade80;
font-weight:600;
}

.upload-btn{
width:100%;
padding:13px;
border-radius:13px;
border:none;
background:linear-gradient(135deg,#1e64ff,#0e44cc);
color:#fff;
font-size:14px;
font-weight:700;
cursor:pointer;
letter-spacing:.5px;
box-shadow:0 6px 20px rgba(30,100,255,.3);
transition:
filter .2s,
transform .2s;
}

.upload-btn:hover{
filter:brightness(1.1);
transform:translateY(-2px);
}

.upload-btn:active{
transform:scale(.97);
}

.upload-btn:disabled{
opacity:.45;
cursor:not-allowed;
transform:none;
filter:none;
}

.result-box{
margin-top:14px;
padding:14px;
border-radius:13px;
background:rgba(2,10,25,.7);
border:1px solid rgba(70,130,255,.22);
display:none;
}

.result-box.show{
display:block;
animation:fadeTab .3s ease both;
}

.result-label{
font-size:11px;
color:#64748b;
letter-spacing:.8px;
margin-bottom:6px;
}

.result-code{
font-family:monospace;
font-size:12px;
color:#60a5fa;
word-break:break-all;
line-height:1.6;
}

.result-copy{
margin-top:10px;
width:100%;
padding:8px;
border-radius:9px;
border:1px solid rgba(70,130,255,.25);
background:rgba(30,100,255,.12);
color:#60a5fa;
font-size:12px;
font-weight:700;
cursor:pointer;
letter-spacing:.5px;
transition:background .2s, border-color .2s;
}

.result-copy:hover{
background:rgba(30,100,255,.25);
border-color:rgba(70,130,255,.5);
}

.result-copy.copied{
background:rgba(34,197,94,.15);
border-color:rgba(34,197,94,.4);
color:#4ade80;
}

.err-msg{
margin-top:10px;
font-size:13px;
color:#f87171;
text-align:center;
display:none;
}

.err-msg.show{
display:block;
}

/* ── SEARCH TAB (tab 4) ── */
.search-tab-wrap{
display:flex;
gap:8px;
margin-bottom:16px;
}

.search-tab-input{
flex:1;
padding:11px 14px;
border-radius:12px;
background:rgba(2,10,25,.7);
border:1px solid rgba(70,130,255,.22);
color:#e2e8f0;
font-size:14px;
outline:none;
transition:border-color .2s;
}

.search-tab-input:focus{
border-color:rgba(70,130,255,.55);
}

.search-tab-input::placeholder{
color:#475569;
}

.search-go-btn{
padding:11px 18px;
border-radius:12px;
border:none;
background:linear-gradient(135deg,#1e64ff,#0e44cc);
color:#fff;
font-size:13px;
font-weight:700;
cursor:pointer;
transition:filter .2s;
}

.search-go-btn:hover{
filter:brightness(1.1);
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

.tabs{
gap:4px;
padding:5px;
}

.tab-btn{
font-size:11px;
padding:9px 4px;
gap:4px;
}

.tab-icon{
font-size:13px;
}
}
`;

app.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("scripts")
      .select("*");

    if (error) {
      return res.status(500).send("Database Error");
    }

    const scripts = data || [];

    const downloads = scripts.reduce(
      (total, script) =>
        total + Number(script.downloads || 0),
      0
    );

    // Build script cards for tab
    const scriptCardsHTML = scripts.length === 0
      ? `<div class="empty-msg">No scripts yet</div>`
      : scripts.map(s => {
          const kb = (s.size / 1024).toFixed(1);
          const loader = loaderFor(s.id);
          return `
<div class="script-card" data-name="${s.filename.toLowerCase()}">
  <div class="script-name">${s.filename}</div>
  <div class="script-meta">
    <span>👤 ${s.owner || "Unknown"}</span>
    <span>⬇️ ${s.downloads || 0}</span>
    <span>📦 ${kb} KB</span>
  </div>
  <button class="copy-btn" onclick="copyLoader(this,'${loader.replace(/'/g,"\\'")}')">📋 COPY LOADER</button>
</div>`;
        }).join("");

    res.send(`
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SEI HUB</title>
<style>${SHARED_CSS}</style>
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

<h1>SEI HUB</h1>

<!-- TABS -->
<div class="tabs" role="tablist">
  <button class="tab-btn active" onclick="switchTab('home')" id="tab-home" role="tab" aria-selected="true">
    <span class="tab-icon">🏠</span>HOME
  </button>
  <button class="tab-btn" onclick="switchTab('scripts')" id="tab-scripts" role="tab" aria-selected="false">
    <span class="tab-icon">📜</span>SCRIPTS
  </button>
  <button class="tab-btn" onclick="switchTab('upload')" id="tab-upload" role="tab" aria-selected="false">
    <span class="tab-icon">⬆️</span>UPLOAD
  </button>
  <button class="tab-btn" onclick="switchTab('search')" id="tab-search" role="tab" aria-selected="false">
    <span class="tab-icon">🔍</span>SEARCH
  </button>
</div>

<!-- HOME PANEL -->
<div class="tab-panel active" id="panel-home">

<div class="desc">
Secure script distribution platform
</div>

<div class="stats">
<div class="stat">
<div class="number">${scripts.length}</div>
<div class="label">SCRIPTS</div>
</div>
<div class="stat">
<div class="number">${downloads}</div>
<div class="label">DOWNLOADS</div>
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
<div class="discord-title">Join Developer Discord</div>
<div class="discord-sub">discord.gg/n3xY3YuwuQ</div>
</div>
</a>

<hr class="divider">

<div class="footer">
<strong>Developer Discord</strong><br>
<a
href="${DISCORD_URL}"
target="_blank"
rel="noopener noreferrer"
>
${DISCORD_URL}
</a>
<br><br>
SEI HUB • Secure Script Distribution
</div>

</div>
<!-- END HOME PANEL -->

<!-- SCRIPTS PANEL -->
<div class="tab-panel" id="panel-scripts">

<div class="search-wrap">
  <span class="search-icon">🔍</span>
  <input
    class="search-input"
    type="text"
    placeholder="Filter scripts..."
    oninput="filterScripts(this.value)"
    id="scripts-filter"
  >
</div>

<div class="script-list" id="script-list">
${scriptCardsHTML}
</div>

</div>
<!-- END SCRIPTS PANEL -->

<!-- UPLOAD PANEL -->
<div class="tab-panel" id="panel-upload">

<div class="upload-form">

  <div>
    <div class="field-label">OWNER NAME</div>
    <input
      class="field-input"
      type="text"
      id="owner-input"
      placeholder="Your name or Discord ID"
    >
  </div>

  <div>
    <div class="field-label">SCRIPT FILE (.lua)</div>
    <div class="drop-zone" id="drop-zone">
      <input
        type="file"
        accept=".lua,.txt"
        id="file-input"
        onchange="onFileSelect(this)"
      >
      <div class="drop-icon">📂</div>
      <div class="drop-text">
        <strong>Click to choose</strong> or drag & drop
      </div>
      <div class="drop-selected" id="file-name"></div>
    </div>
  </div>

  <button class="upload-btn" id="upload-btn" onclick="doUpload()">⬆️ UPLOAD SCRIPT</button>

  <div class="err-msg" id="err-msg"></div>

  <div class="result-box" id="result-box">
    <div class="result-label">LOADER STRING</div>
    <div class="result-code" id="result-code"></div>
    <button class="result-copy" id="result-copy" onclick="copyResult()">📋 COPY LOADER</button>
  </div>

</div>

</div>
<!-- END UPLOAD PANEL -->

<!-- SEARCH PANEL -->
<div class="tab-panel" id="panel-search">

<div class="search-tab-wrap">
  <input
    class="search-tab-input"
    type="text"
    id="search-input"
    placeholder="Script name or owner..."
    onkeydown="if(event.key==='Enter')doSearch()"
  >
  <button class="search-go-btn" onclick="doSearch()">SEARCH</button>
</div>

<div class="script-list" id="search-results">
  <div class="empty-msg">Type to search scripts</div>
</div>

</div>
<!-- END SEARCH PANEL -->

</div>
</div>

<script>
/* ── TAB SWITCHING ── */
function switchTab(name){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  document.getElementById('panel-'+name).classList.add('active');
}

/* ── FILTER SCRIPTS LIST ── */
function filterScripts(val){
  const q = val.toLowerCase();
  document.querySelectorAll('#script-list .script-card').forEach(card=>{
    card.style.display =
      card.dataset.name.includes(q) ? '' : 'none';
  });
}

/* ── COPY LOADER (script card) ── */
function copyLoader(btn, loader){
  navigator.clipboard.writeText(loader).then(()=>{
    btn.textContent = '✅ COPIED!';
    btn.classList.add('copied');
    setTimeout(()=>{
      btn.textContent = '📋 COPY LOADER';
      btn.classList.remove('copied');
    }, 2000);
  });
}

/* ── DRAG & DROP STYLE ── */
const dz = document.getElementById('drop-zone');
if(dz){
  dz.addEventListener('dragover', e=>{ e.preventDefault(); dz.classList.add('dragover'); });
  dz.addEventListener('dragleave', ()=> dz.classList.remove('dragover'));
  dz.addEventListener('drop', e=>{
    e.preventDefault();
    dz.classList.remove('dragover');
    const fi = document.getElementById('file-input');
    if(e.dataTransfer.files.length){
      fi.files = e.dataTransfer.files;
      onFileSelect(fi);
    }
  });
}

function onFileSelect(input){
  const fn = document.getElementById('file-name');
  fn.textContent = input.files[0] ? '✅ ' + input.files[0].name : '';
}

/* ── UPLOAD ── */
async function doUpload(){
  const owner = document.getElementById('owner-input').value.trim();
  const fileInput = document.getElementById('file-input');
  const errEl = document.getElementById('err-msg');
  const resultBox = document.getElementById('result-box');
  const btn = document.getElementById('upload-btn');

  errEl.classList.remove('show');
  resultBox.classList.remove('show');

  if(!owner){ showErr('Please enter owner name'); return; }
  if(!fileInput.files[0]){ showErr('Please choose a .lua file'); return; }

  const fd = new FormData();
  fd.append('file', fileInput.files[0]);
  fd.append('owner', owner);

  btn.disabled = true;
  btn.textContent = '⏳ UPLOADING...';

  try{
    const r = await fetch('/upload', { method:'POST', body: fd });
    const j = await r.json();

    if(j.success){
      document.getElementById('result-code').textContent = j.loader;
      resultBox.classList.add('show');
      document.getElementById('result-copy').textContent = '📋 COPY LOADER';
      document.getElementById('result-copy').classList.remove('copied');
    } else {
      showErr(j.message || 'Upload failed');
    }
  } catch(e){
    showErr('Network error');
  }

  btn.disabled = false;
  btn.textContent = '⬆️ UPLOAD SCRIPT';
}

function showErr(msg){
  const el = document.getElementById('err-msg');
  el.textContent = '❌ ' + msg;
  el.classList.add('show');
}

/* ── COPY RESULT LOADER ── */
function copyResult(){
  const text = document.getElementById('result-code').textContent;
  const btn = document.getElementById('result-copy');
  navigator.clipboard.writeText(text).then(()=>{
    btn.textContent = '✅ COPIED!';
    btn.classList.add('copied');
    setTimeout(()=>{
      btn.textContent = '📋 COPY LOADER';
      btn.classList.remove('copied');
    }, 2000);
  });
}

/* ── SEARCH ── */
async function doSearch(){
  const q = document.getElementById('search-input').value.trim();
  const container = document.getElementById('search-results');

  if(!q){
    container.innerHTML = '<div class="empty-msg">Type to search scripts</div>';
    return;
  }

  container.innerHTML = '<div class="empty-msg">Searching...</div>';

  try{
    const r = await fetch('/search/' + encodeURIComponent(q));
    const j = await r.json();

    if(!j.success || !j.scripts.length){
      container.innerHTML = '<div class="empty-msg">No scripts found</div>';
      return;
    }

    container.innerHTML = j.scripts.map(s=>{
      const kb = (s.size/1024).toFixed(1);
      const loader = \`loadstring(game:HttpGet("${BASE_URL}/script/\${s.id}"))()"\`;
      return \`
<div class="script-card">
  <div class="script-name">\${s.filename}</div>
  <div class="script-meta">
    <span>👤 \${s.owner||'Unknown'}</span>
    <span>⬇️ \${s.downloads||0}</span>
    <span>📦 \${kb} KB</span>
  </div>
  <button class="copy-btn" onclick="copyLoader(this,'\${loader.replace(/'/g,"\\\\'")}')">📋 COPY LOADER</button>
</div>\`;
    }).join('');

  } catch(e){
    container.innerHTML = '<div class="empty-msg">Search failed</div>';
  }
}
</script>

</body>
</html>
`);
  } catch (error) {
    console.error("Home Error:", error.message);
    res.status(500).send("Server Error");
  }
});

app.post("/upload", upload.single("file"), async (req, res) => {
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

    const { data: exists, error: existsError } =
      await supabase
        .from("scripts")
        .select("id")
        .eq("filename", req.file.originalname)
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
        message: "Script name already exists."
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
        message: uploadError.message
      });
    }

    const newData = {
      id,
      filename: req.file.originalname,
      owner: req.body.owner || "Unknown",
      created: new Date().toISOString(),
      downloads: 0,
      size: req.file.size
    };

    const { error: dbError } =
      await supabase
        .from("scripts")
        .insert(newData);

    if (dbError) {
      await supabase.storage
        .from(BUCKET)
        .remove([`${id}.lua`]);

      return res.status(500).json({
        success: false,
        message: dbError.message
      });
    }

    res.json({
      success: true,
      id,
      loader: loaderFor(id)
    });
  } catch (error) {
    console.error(
      "Upload Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Upload failed"
    });
  }
});

app.get("/script/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!/^[a-f0-9]{32}$/i.test(id)) {
      return res.status(400).send("Invalid Script ID");
    }

    const { data, error } =
      await supabase
        .from("scripts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
      return res.status(500).send("Database Error");
    }

    if (!data) {
      return res.status(404).send("Script Not Found");
    }

    const userAgent =
      req.get("User-Agent") || "";

    if (!/Roblox/i.test(userAgent)) {
      return res.status(403).send(`
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Protected Script</title>
<style>${SHARED_CSS}</style>
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

<h1>SEI HUB</h1>

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
<div class="discord-title">Join Developer Discord</div>
<div class="discord-sub">discord.gg/n3xY3YuwuQ</div>
</div>
</a>

<hr class="divider">

<div class="footer">
<strong>Developer Discord</strong><br>
<a
href="${DISCORD_URL}"
target="_blank"
rel="noopener noreferrer"
>
${DISCORD_URL}
</a>
<br><br>
SEI HUB • Secure Script Distribution
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
        .download(`${id}.lua`);

    if (dlError) {
      return res.status(404).send("File Not Found");
    }

    const text = await fileBlob.text();

    await supabase
      .from("scripts")
      .update({
        downloads:
          Number(data.downloads || 0) + 1
      })
      .eq("id", id);

    res.type("text/plain").send(text);

  } catch (error) {
    console.error(
      "Script Error:",
      error.message
    );

    res.status(500).send("Server Error");
  }
});

app.get("/scripts", async (req, res) => {
  try {
    const { data, error } =
      await supabase
        .from("scripts")
        .select("*")
        .order("created", {
          ascending: false
        });

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      total: data?.length || 0,
      scripts: data || []
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load scripts"
    });
  }
});

app.get("/stats", async (req, res) => {
  try {
    const { data, error } =
      await supabase
        .from("scripts")
        .select("downloads");

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    const downloads =
      (data || []).reduce(
        (total, script) =>
          total +
          Number(script.downloads || 0),
        0
      );

    res.json({
      success: true,
      scripts: data?.length || 0,
      downloads
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load stats"
    });
  }
});

app.get("/search/:name", async (req, res) => {
  try {
    const { data, error } =
      await supabase
        .from("scripts")
        .select("*")
        .ilike(
          "filename",
          `%${req.params.name}%`
        );

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      total: data?.length || 0,
      scripts: data || []
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Search failed"
    });
  }
});

app.get("/list/:owner", async (req, res) => {
  try {
    const { data, error } =
      await supabase
        .from("scripts")
        .select("*")
        .eq("owner", req.params.owner)
        .order("created", {
          ascending: false
        });

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      total: data?.length || 0,
      scripts: data || []
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load scripts"
    });
  }
});

app.get("/info/:id", async (req, res) => {
  try {
    const { data, error } =
      await supabase
        .from("scripts")
        .select("*")
        .eq("id", req.params.id)
        .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Not Found"
      });
    }

    res.json({
      success: true,
      data: {
        ...data,
        loader: loaderFor(data.id)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load script info"
    });
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    const owner = req.query.owner;

    if (!owner) {
      return res.status(400).json({
        success: false,
        message: "Owner required"
      });
    }

    const { data, error } =
      await supabase
        .from("scripts")
        .select("*")
        .eq("id", req.params.id)
        .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Script Not Found"
      });
    }

    if (data.owner !== owner) {
      return res.status(403).json({
        success: false,
        message: "Permission Denied"
      });
    }

    const { error: storageError } =
      await supabase.storage
        .from(BUCKET)
        .remove([
          `${req.params.id}.lua`
        ]);

    if (storageError) {
      return res.status(500).json({
        success: false,
        message: storageError.message
      });
    }

    const { error: deleteError } =
      await supabase
        .from("scripts")
        .delete()
        .eq("id", req.params.id);

    if (deleteError) {
      return res.status(500).json({
        success: false,
        message: deleteError.message
      });
    }

    res.json({
      success: true,
      message: "Deleted"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed"
    });
  }
});

app.post(
  "/update/:id",
  upload.single("file"),
  async (req, res) => {
    try {
      const owner = req.body.owner;

      const { data, error: findError } =
        await supabase
          .from("scripts")
          .select("*")
          .eq("id", req.params.id)
          .maybeSingle();

      if (findError) {
        return res.status(500).json({
          success: false,
          message: findError.message
        });
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Script Not Found"
        });
      }

      if (data.owner !== owner) {
        return res.status(403).json({
          success: false,
          message: "Permission Denied"
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file"
        });
      }

      const { error: uploadError } =
        await supabase.storage
          .from(BUCKET)
          .upload(
            `${req.params.id}.lua`,
            req.file.buffer,
            {
              contentType: "text/plain",
              upsert: true
            }
          );

      if (uploadError) {
        return res.status(500).json({
          success: false,
          message: uploadError.message
        });
      }

      const { error: updateError } =
        await supabase
          .from("scripts")
          .update({
            filename:
              req.file.originalname,
            size: req.file.size
          })
          .eq("id", req.params.id);

      if (updateError) {
        return res.status(500).json({
          success: false,
          message: updateError.message
        });
      }

      res.json({
        success: true,
        loader: loaderFor(req.params.id)
      });

    } catch (error) {
      console.error(
        "Update Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Update failed"
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
      console.log("Supabase Connected");
    }
  } catch (error) {
    console.error(
      "Supabase Error:",
      error.message
    );
  }
})();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    "Server Running : " + PORT
  );
});
