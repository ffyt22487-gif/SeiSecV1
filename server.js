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

const rateMap = new Map();

function rateLimit(req, res, next) {
  const ip =
    req.ip ||
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "unknown";

  const now = Date.now();
  const windowMs = 60000;
  const max = 60;

  let item = rateMap.get(ip);

  if (!item || now - item.time > windowMs) {
    item = {
      time: now,
      count: 0
    };
  }

  item.count++;

  rateMap.set(ip, item);

  if (item.count > max) {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later."
    });
  }

  next();
}

app.use(rateLimit);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  next();
});

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

    if (error) {
      throw error;
    }

    if (!data) {
      return id;
    }
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
radial-gradient(circle at 50% -10%,#123b8f 0%,#08152f 32%,#020817 78%);
font-family:Arial,sans-serif;
color:#fff;
overflow-x:hidden;
}

body::before{
content:"";
position:fixed;
inset:0;
pointer-events:none;
background:
radial-gradient(circle at 15% 20%,rgba(30,100,255,.10),transparent 32%),
radial-gradient(circle at 85% 75%,rgba(0,160,255,.08),transparent 32%);
z-index:0;
}

body::after{
content:"";
position:fixed;
inset:0;
pointer-events:none;
background-image:
linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),
linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px);
background-size:40px 40px;
mask-image:linear-gradient(to bottom,black,transparent);
z-index:0;
}

button,
input{
font:inherit;
}

a{
color:inherit;
}

.app{
position:relative;
z-index:1;
min-height:100vh;
}

.nav{
position:sticky;
top:0;
z-index:50;
height:72px;
display:flex;
align-items:center;
justify-content:space-between;
padding:0 28px;
background:rgba(2,8,23,.82);
border-bottom:1px solid rgba(80,130,255,.16);
backdrop-filter:blur(20px);
-webkit-backdrop-filter:blur(20px);
}

.nav-brand{
display:flex;
align-items:center;
gap:12px;
font-weight:800;
font-size:19px;
letter-spacing:1px;
}

.nav-brand img{
width:42px;
height:42px;
object-fit:contain;
border-radius:12px;
filter:drop-shadow(0 0 12px rgba(0,120,255,.45));
}

.nav-tabs{
display:flex;
align-items:center;
gap:5px;
}

.nav-tab{
border:0;
background:transparent;
color:#7183a5;
padding:11px 15px;
border-radius:12px;
cursor:pointer;
font-size:13px;
font-weight:600;
transition:.2s;
}

.nav-tab:hover{
color:#fff;
background:rgba(70,120,255,.08);
}

.nav-tab.active{
color:#fff;
background:linear-gradient(135deg,rgba(37,99,235,.35),rgba(6,182,212,.16));
box-shadow:inset 0 0 0 1px rgba(80,140,255,.2);
}

.menu-btn{
display:none;
border:0;
background:rgba(60,100,200,.12);
color:#fff;
width:43px;
height:43px;
border-radius:12px;
font-size:22px;
cursor:pointer;
}

.main{
max-width:1180px;
margin:auto;
padding:40px 22px 70px;
}

.page{
display:none;
animation:fadeIn .3s ease;
}

.page.active{
display:block;
}

@keyframes fadeIn{
from{
opacity:0;
transform:translateY(8px);
}
to{
opacity:1;
transform:none;
}
}

.hero{
display:grid;
grid-template-columns:1.2fr .8fr;
gap:25px;
align-items:stretch;
}

.hero-main{
padding:48px;
border-radius:28px;
background:
linear-gradient(145deg,rgba(11,30,70,.92),rgba(5,14,35,.88));
border:1px solid rgba(80,140,255,.22);
box-shadow:
0 20px 80px rgba(0,0,0,.28),
0 0 70px rgba(0,100,255,.08);
}

.hero-logo{
width:110px;
height:110px;
object-fit:contain;
margin-bottom:22px;
filter:
drop-shadow(0 0 22px rgba(0,130,255,.55))
drop-shadow(0 0 45px rgba(0,80,255,.22));
}

.badge{
display:inline-flex;
align-items:center;
gap:8px;
padding:8px 14px;
border-radius:30px;
background:rgba(37,99,235,.13);
border:1px solid rgba(80,150,255,.25);
color:#6daaff;
font-size:11px;
font-weight:700;
letter-spacing:1.5px;
}

.badge-dot{
width:7px;
height:7px;
border-radius:50%;
background:#22c55e;
box-shadow:0 0 10px #22c55e;
}

.hero h1{
margin-top:20px;
font-size:58px;
line-height:1;
letter-spacing:2px;
background:linear-gradient(135deg,#fff,#65a8ff,#38c8ff);
-webkit-background-clip:text;
-webkit-text-fill-color:transparent;
}

.hero p{
margin-top:18px;
max-width:620px;
color:#8ea0c0;
font-size:17px;
line-height:1.7;
}

.hero-actions{
display:flex;
flex-wrap:wrap;
gap:12px;
margin-top:30px;
}

.btn{
border:0;
border-radius:13px;
padding:13px 18px;
cursor:pointer;
font-weight:700;
font-size:13px;
transition:.2s;
}

.btn:hover{
transform:translateY(-2px);
}

.btn-primary{
color:#fff;
background:linear-gradient(135deg,#2563eb,#0ea5e9);
box-shadow:0 8px 25px rgba(37,99,235,.25);
}

.btn-secondary{
color:#d7e4ff;
background:rgba(50,80,140,.15);
border:1px solid rgba(90,130,200,.22);
}

.btn-discord{
display:inline-flex;
align-items:center;
justify-content:center;
gap:10px;
color:#fff;
background:linear-gradient(135deg,#5865f2,#4752c4);
box-shadow:0 8px 28px rgba(88,101,242,.3);
}

.discord-icon{
width:22px;
height:22px;
flex-shrink:0;
}

.hero-side{
display:grid;
grid-template-columns:1fr 1fr;
gap:14px;
}

.quick-card{
padding:25px 20px;
border-radius:22px;
background:rgba(8,21,48,.84);
border:1px solid rgba(80,130,230,.16);
display:flex;
flex-direction:column;
justify-content:center;
min-height:150px;
transition:.25s;
}

.quick-card:hover{
transform:translateY(-4px);
border-color:rgba(80,150,255,.3);
box-shadow:0 15px 35px rgba(0,0,0,.2);
}

.quick-icon{
font-size:28px;
margin-bottom:15px;
}

.quick-number{
font-size:30px;
font-weight:800;
color:#67aaff;
}

.quick-label{
margin-top:7px;
font-size:11px;
color:#667995;
letter-spacing:1px;
}

.section-head{
display:flex;
align-items:center;
justify-content:space-between;
gap:15px;
margin-bottom:20px;
}

.section-head h2{
font-size:25px;
}

.section-head p{
color:#7183a5;
font-size:13px;
margin-top:5px;
}

.section{
margin-top:30px;
}

.card{
background:rgba(7,18,42,.86);
border:1px solid rgba(80,130,230,.17);
border-radius:22px;
padding:24px;
}

.search-box{
display:flex;
gap:10px;
margin-bottom:20px;
}

.search-input{
flex:1;
min-width:0;
height:48px;
padding:0 17px;
border-radius:13px;
border:1px solid rgba(90,130,210,.2);
outline:none;
background:rgba(2,9,23,.72);
color:#fff;
}

.search-input:focus{
border-color:rgba(70,140,255,.55);
box-shadow:0 0 0 3px rgba(37,99,235,.08);
}

.script-grid{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:15px;
}

.script-card{
padding:20px;
border-radius:18px;
background:linear-gradient(145deg,rgba(10,26,58,.9),rgba(4,12,28,.9));
border:1px solid rgba(80,130,230,.14);
transition:.25s;
}

.script-card:hover{
transform:translateY(-4px);
border-color:rgba(80,150,255,.32);
box-shadow:0 15px 35px rgba(0,0,0,.2);
}

.script-top{
display:flex;
align-items:center;
justify-content:space-between;
gap:10px;
}

.script-name{
font-size:16px;
font-weight:700;
word-break:break-word;
}

.script-id{
margin-top:8px;
font-size:10px;
color:#50617f;
word-break:break-all;
}

.script-meta{
display:grid;
grid-template-columns:1fr 1fr;
gap:8px;
margin-top:18px;
}

.meta{
padding:10px;
border-radius:10px;
background:rgba(0,0,0,.2);
}

.meta-label{
font-size:9px;
color:#566986;
text-transform:uppercase;
letter-spacing:1px;
}

.meta-value{
margin-top:5px;
font-size:12px;
color:#c7d5ec;
}

.script-actions{
display:flex;
gap:8px;
margin-top:15px;
}

.small-btn{
flex:1;
height:38px;
border-radius:10px;
border:1px solid rgba(80,130,220,.18);
background:rgba(30,70,130,.13);
color:#bcd0ef;
cursor:pointer;
font-size:11px;
font-weight:700;
}

.small-btn:hover{
background:rgba(37,99,235,.22);
color:#fff;
}

.loader-box{
margin-top:15px;
display:none;
}

.loader-box.open{
display:block;
}

.loader{
width:100%;
min-height:90px;
padding:13px;
border-radius:12px;
background:#020817;
border:1px solid rgba(70,130,230,.18);
color:#7fc0ff;
font-family:monospace;
font-size:11px;
line-height:1.6;
word-break:break-all;
}

.stats-grid{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:15px;
}

.stat-card{
padding:24px;
border-radius:19px;
background:rgba(7,18,42,.86);
border:1px solid rgba(80,130,230,.16);
}

.stat-icon{
font-size:24px;
}

.stat-big{
margin-top:12px;
font-size:32px;
font-weight:800;
color:#67aaff;
}

.stat-title{
margin-top:6px;
font-size:11px;
color:#637594;
letter-spacing:1px;
}

.security-grid{
display:grid;
grid-template-columns:repeat(2,1fr);
gap:15px;
}

.security-card{
padding:24px;
border-radius:19px;
background:rgba(7,18,42,.86);
border:1px solid rgba(80,130,230,.16);
}

.security-card h3{
font-size:16px;
}

.security-card p{
margin-top:9px;
font-size:13px;
color:#7183a5;
line-height:1.6;
}

.security-status{
display:inline-flex;
align-items:center;
gap:7px;
margin-top:15px;
padding:6px 10px;
border-radius:20px;
background:rgba(34,197,94,.09);
border:1px solid rgba(34,197,94,.18);
color:#4ade80;
font-size:10px;
font-weight:700;
}

.info-grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:15px;
}

.info-card{
padding:25px;
border-radius:20px;
background:rgba(7,18,42,.86);
border:1px solid rgba(80,130,230,.16);
}

.info-card h3{
font-size:18px;
}

.info-card p{
margin-top:10px;
color:#7d90b1;
font-size:13px;
line-height:1.7;
}

.discord-large{
margin-top:20px;
width:100%;
min-height:60px;
display:flex;
align-items:center;
justify-content:center;
gap:12px;
border-radius:15px;
text-decoration:none;
background:linear-gradient(135deg,#5865f2,#4752c4);
box-shadow:0 10px 30px rgba(88,101,242,.3);
font-weight:700;
}

.api-list{
margin-top:20px;
display:grid;
gap:10px;
}

.api-row{
display:flex;
align-items:center;
justify-content:space-between;
gap:15px;
padding:14px 16px;
border-radius:12px;
background:rgba(0,0,0,.2);
border:1px solid rgba(255,255,255,.04);
}

.api-method{
font-family:monospace;
font-size:11px;
font-weight:700;
color:#4ade80;
}

.api-path{
font-family:monospace;
font-size:12px;
color:#9db4d8;
word-break:break-all;
}

.empty{
padding:45px 20px;
text-align:center;
color:#647797;
border:1px dashed rgba(80,130,230,.15);
border-radius:18px;
}

.footer{
margin-top:45px;
padding-top:25px;
border-top:1px solid rgba(80,130,230,.12);
text-align:center;
color:#526480;
font-size:12px;
line-height:1.8;
}

.footer a{
color:#6daaff;
text-decoration:none;
}

.toast{
position:fixed;
right:20px;
bottom:20px;
z-index:100;
padding:13px 17px;
border-radius:12px;
background:rgba(8,20,45,.95);
border:1px solid rgba(80,150,255,.3);
box-shadow:0 10px 35px rgba(0,0,0,.35);
color:#dce9ff;
font-size:12px;
opacity:0;
pointer-events:none;
transform:translateY(10px);
transition:.25s;
}

.toast.show{
opacity:1;
transform:none;
}

.mobile-menu{
display:none;
position:fixed;
top:72px;
left:0;
right:0;
z-index:45;
padding:10px;
background:rgba(2,8,23,.97);
border-bottom:1px solid rgba(80,130,255,.16);
backdrop-filter:blur(20px);
}

.mobile-menu.open{
display:grid;
}

.mobile-tab{
padding:14px;
border:0;
border-radius:12px;
background:transparent;
color:#8394b3;
text-align:left;
font-weight:600;
cursor:pointer;
}

.mobile-tab.active{
background:rgba(37,99,235,.16);
color:#fff;
}

@media(max-width:950px){
.hero{
grid-template-columns:1fr;
}

.script-grid{
grid-template-columns:repeat(2,1fr);
}

.stats-grid{
grid-template-columns:repeat(2,1fr);
}

.nav-tabs{
display:none;
}

.menu-btn{
display:block;
}
}

@media(max-width:650px){
.main{
padding:25px 14px 50px;
}

.nav{
padding:0 15px;
}

.hero-main{
padding:32px 23px;
}

.hero h1{
font-size:42px;
}

.hero p{
font-size:15px;
}

.hero-side{
grid-template-columns:1fr 1fr;
}

.script-grid{
grid-template-columns:1fr;
}

.stats-grid{
grid-template-columns:1fr 1fr;
}

.security-grid,
.info-grid{
grid-template-columns:1fr;
}

.search-box{
flex-direction:column;
}

.search-box .btn{
width:100%;
}

.card{
padding:18px;
}
}

@media(max-width:420px){
.hero-side{
grid-template-columns:1fr;
}

.stats-grid{
grid-template-columns:1fr;
}

.hero-actions{
flex-direction:column;
}

.hero-actions .btn{
width:100%;
}
}
`;

function layout(title, content, extraScript = "") {
  return `
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#020817">
<meta name="description" content="SEI HUB Secure Script Distribution">
<title>${escapeHtml(title)}</title>
<style>${SHARED_CSS}</style>
</head>
<body>

<div class="app">

<nav class="nav">

<div class="nav-brand">
<img src="${LOGO_URL}" alt="SEI HUB">
<span>SEI HUB</span>
</div>

<div class="nav-tabs">

<button class="nav-tab active" data-page="home">Home</button>
<button class="nav-tab" data-page="scripts">Scripts</button>
<button class="nav-tab" data-page="stats">Statistics</button>
<button class="nav-tab" data-page="security">Security</button>
<button class="nav-tab" data-page="discord">Developer</button>

</div>

<button class="menu-btn" id="menuBtn">☰</button>

</nav>

<div class="mobile-menu" id="mobileMenu">

<button class="mobile-tab active" data-page="home">🏠 Home</button>
<button class="mobile-tab" data-page="scripts">📦 Scripts</button>
<button class="mobile-tab" data-page="stats">📊 Statistics</button>
<button class="mobile-tab" data-page="security">🛡️ Security</button>
<button class="mobile-tab" data-page="discord">💬 Developer Discord</button>

</div>

<main class="main">
${content}

<div class="footer">
SEI HUB • Secure Script Distribution<br>
Developer Discord:
<a href="${DISCORD_URL}" target="_blank" rel="noopener noreferrer">
${DISCORD_URL}
</a>
</div>

</main>

<div class="toast" id="toast"></div>

</div>

<script>

const pages = ["home","scripts","stats","security","discord"];

function showPage(page){
if(!pages.includes(page)) page="home";

document.querySelectorAll(".page").forEach(el=>{
el.classList.toggle("active",el.dataset.page===page);
});

document.querySelectorAll(".nav-tab,.mobile-tab").forEach(el=>{
el.classList.toggle("active",el.dataset.page===page);
});

const mobileMenu=document.getElementById("mobileMenu");

if(mobileMenu){
mobileMenu.classList.remove("open");
}

window.scrollTo({
top:0,
behavior:"smooth"
});

if(page==="scripts"){
loadScripts();
}

if(page==="stats"){
loadStats();
}
}

document.querySelectorAll("[data-page]").forEach(el=>{
el.addEventListener("click",()=>{
showPage(el.dataset.page);
});
});

const menuBtn=document.getElementById("menuBtn");

if(menuBtn){
menuBtn.addEventListener("click",()=>{
document.getElementById("mobileMenu").classList.toggle("open");
});
}

function toast(message){
const el=document.getElementById("toast");

if(!el) return;

el.textContent=message;
el.classList.add("show");

clearTimeout(window.toastTimer);

window.toastTimer=setTimeout(()=>{
el.classList.remove("show");
},2200);
}

async function copyText(text){
try{
await navigator.clipboard.writeText(text);
toast("Copied!");
}catch{
const area=document.createElement("textarea");
area.value=text;
document.body.appendChild(area);
area.select();
document.execCommand("copy");
area.remove();
toast("Copied!");
}
}

async function loadScripts(){
const container=document.getElementById("scriptGrid");

if(!container) return;

container.innerHTML='<div class="empty">Loading scripts...</div>';

try{
const response=await fetch("/scripts");
const data=await response.json();

if(!data.success){
throw new Error(data.message||"Failed");
}

renderScripts(data.scripts||[]);
}catch(error){
container.innerHTML='<div class="empty">Failed to load scripts</div>';
}
}

function renderScripts(scripts){
const container=document.getElementById("scriptGrid");

if(!container) return;

if(!scripts.length){
container.innerHTML='<div class="empty">No scripts found</div>';
return;
}

container.innerHTML=scripts.map(script=>{

const filename=escapeClient(script.filename||"Unknown");
const owner=escapeClient(script.owner||"Unknown");
const id=escapeClient(script.id||"");
const downloads=Number(script.downloads||0);
const size=formatSize(Number(script.size||0));

return \`
<div class="script-card">

<div class="script-top">
<div class="script-name">\${filename}</div>
</div>

<div class="script-id">\${id}</div>

<div class="script-meta">

<div class="meta">
<div class="meta-label">Owner</div>
<div class="meta-value">\${owner}</div>
</div>

<div class="meta">
<div class="meta-label">Downloads</div>
<div class="meta-value">\${downloads}</div>
</div>

<div class="meta">
<div class="meta-label">Size</div>
<div class="meta-value">\${size}</div>
</div>

<div class="meta">
<div class="meta-label">Status</div>
<div class="meta-value" style="color:#4ade80">ACTIVE</div>
</div>

</div>

<div class="script-actions">

<button class="small-btn" onclick="showLoader('\${id}')">
Loader
</button>

<button class="small-btn" onclick="copyLoader('\${id}')">
Copy
</button>

</div>

<div class="loader-box" id="loader-\${id}">
<div class="loader" id="loaderText-\${id}"></div>
</div>

</div>
\`;

}).join("");
}

function escapeClient(value){
return String(value??"")
.replaceAll("&","&amp;")
.replaceAll("<","&lt;")
.replaceAll(">","&gt;")
.replaceAll('"',"&quot;")
.replaceAll("'","&#039;");
}

function formatSize(bytes){
if(!bytes) return "0 B";

const units=["B","KB","MB","GB"];
let i=0;
let value=bytes;

while(value>=1024&&i<units.length-1){
value/=1024;
i++;
}

return value.toFixed(i===0?0:2)+" "+units[i];
}

function loader(id){
return \`loadstring(game:HttpGet("${location.origin}/script/\${id}"))()\`;
}

function showLoader(id){
const box=document.getElementById("loader-"+id);
const text=document.getElementById("loaderText-"+id);

if(!box||!text) return;

text.textContent=loader(id);
box.classList.toggle("open");
}

function copyLoader(id){
copyText(loader(id));
}

async function loadStats(){
try{
const response=await fetch("/stats");
const data=await response.json();

if(!data.success) return;

const scripts=document.getElementById("statScripts");
const downloads=document.getElementById("statDownloads");

if(scripts) scripts.textContent=data.scripts;
if(downloads) downloads.textContent=data.downloads;

const homeScripts=document.getElementById("homeScripts");
const homeDownloads=document.getElementById("homeDownloads");

if(homeScripts) homeScripts.textContent=data.scripts;
if(homeDownloads) homeDownloads.textContent=data.downloads;

const avg=document.getElementById("statAverage");

if(avg){
avg.textContent=data.scripts
?Math.round(data.downloads/data.scripts)
:0;
}
}catch{}
}

const searchInput=document.getElementById("searchInput");

if(searchInput){
searchInput.addEventListener("input",async()=>{
const query=searchInput.value.trim().toLowerCase();

if(!query){
loadScripts();
return;
}

try{
const response=await fetch("/search/"+encodeURIComponent(query));
const data=await response.json();

if(data.success){
renderScripts(data.scripts||[]);
}
}catch{}
});
}

function refreshAll(){
loadScripts();
loadStats();
toast("Data refreshed");
}

loadStats();

</script>

${extraScript}

</body>
</html>
`;
}

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

    const content = `

<section class="page active" data-page="home">

<div class="hero">

<div class="hero-main">

<img class="hero-logo" src="${LOGO_URL}" alt="SEI HUB">

<div class="badge">
<span class="badge-dot"></span>
SECURE SCRIPT DISTRIBUTION
</div>

<h1>SEI HUB</h1>

<p>
Next-generation secure script distribution platform.
Manage, browse and access your scripts through one clean interface.
</p>

<div class="hero-actions">

<button class="btn btn-primary" onclick="showPage('scripts')">
📦 Browse Scripts
</button>

<button class="btn btn-secondary" onclick="showPage('stats')">
📊 View Statistics
</button>

<a
class="btn btn-discord"
href="${DISCORD_URL}"
target="_blank"
rel="noopener noreferrer"
>
${DISCORD_SVG}
Developer Discord
</a>

</div>

</div>

<div class="hero-side">

<div class="quick-card">
<div class="quick-icon">📦</div>
<div class="quick-number" id="homeScripts">${scripts.length}</div>
<div class="quick-label">TOTAL SCRIPTS</div>
</div>

<div class="quick-card">
<div class="quick-icon">⬇️</div>
<div class="quick-number" id="homeDownloads">${downloads}</div>
<div class="quick-label">TOTAL DOWNLOADS</div>
</div>

<div class="quick-card">
<div class="quick-icon">🛡️</div>
<div class="quick-number">ON</div>
<div class="quick-label">SECURITY</div>
</div>

<div class="quick-card">
<div class="quick-icon">🌐</div>
<div class="quick-number">API</div>
<div class="quick-label">ONLINE</div>
</div>

</div>

</div>

<div class="section">

<div class="section-head">

<div>
<h2>Quick Access</h2>
<p>เครื่องมือที่ใช้บ่อย</p>
</div>

<button class="btn btn-secondary" onclick="refreshAll()">
↻ Refresh
</button>

</div>

<div class="info-grid">

<div class="info-card">
<h3>📦 Script Library</h3>
<p>
ดูสคริปต์ทั้งหมด ค้นหาชื่อสคริปต์
ดูจำนวนดาวน์โหลด และ Copy Loader ได้ทันที
</p>
<button class="btn btn-primary" style="margin-top:18px" onclick="showPage('scripts')">
Open Library
</button>
</div>

<div class="info-card">
<h3>📊 System Statistics</h3>
<p>
ตรวจสอบจำนวน Script และยอดดาวน์โหลดทั้งหมด
พร้อมค่าเฉลี่ยการดาวน์โหลดต่อ Script
</p>
<button class="btn btn-primary" style="margin-top:18px" onclick="showPage('stats')">
View Statistics
</button>
</div>

<div class="info-card">
<h3>🛡️ Security Center</h3>
<p>
ระบบป้องกัน Request เบื้องต้น
ตรวจสอบ Client และป้องกันข้อมูล HTML Injection
</p>
<button class="btn btn-primary" style="margin-top:18px" onclick="showPage('security')">
Security Center
</button>
</div>

<div class="info-card">
<h3>💬 Developer</h3>
<p>
ติดต่อผู้พัฒนาและเข้าร่วม Discord ของ SEI HUB
</p>
<a
class="discord-large"
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

</section>

<section class="page" data-page="scripts">

<div class="section-head">

<div>
<h2>📦 Script Library</h2>
<p>รายการ Script ทั้งหมดในระบบ</p>
</div>

<button class="btn btn-secondary" onclick="loadScripts()">
↻ Refresh
</button>

</div>

<div class="card">

<div class="search-box">

<input
id="searchInput"
class="search-input"
placeholder="ค้นหาชื่อ Script..."
autocomplete="off"
/>

<button
class="btn btn-primary"
onclick="loadScripts()"
>
Search
</button>

</div>

<div id="scriptGrid" class="script-grid">
<div class="empty">Loading scripts...</div>
</div>

</div>

</section>

<section class="page" data-page="stats">

<div class="section-head">

<div>
<h2>📊 Statistics</h2>
<p>ข้อมูลสถิติของ SEI HUB</p>
</div>

<button class="btn btn-secondary" onclick="loadStats()">
↻ Refresh
</button>

</div>

<div class="stats-grid">

<div class="stat-card">
<div class="stat-icon">📦</div>
<div class="stat-big" id="statScripts">${scripts.length}</div>
<div class="stat-title">TOTAL SCRIPTS</div>
</div>

<div class="stat-card">
<div class="stat-icon">⬇️</div>
<div class="stat-big" id="statDownloads">${downloads}</div>
<div class="stat-title">TOTAL DOWNLOADS</div>
</div>

<div class="stat-card">
<div class="stat-icon">📈</div>
<div class="stat-big" id="statAverage">
${scripts.length ? Math.round(downloads / scripts.length) : 0}
</div>
<div class="stat-title">AVERAGE DOWNLOADS</div>
</div>

<div class="stat-card">
<div class="stat-icon">🟢</div>
<div class="stat-big">ONLINE</div>
<div class="stat-title">SYSTEM STATUS</div>
</div>

</div>

<div class="section">

<div class="card">

<h3>System Overview</h3>

<div class="api-list">

<div class="api-row">
<span class="api-method">GET</span>
<span class="api-path">/</span>
</div>

<div class="api-row">
<span class="api-method">GET</span>
<span class="api-path">/scripts</span>
</div>

<div class="api-row">
<span class="api-method">GET</span>
<span class="api-path">/stats</span>
</div>

<div class="api-row">
<span class="api-method">GET</span>
<span class="api-path">/search/:name</span>
</div>

<div class="api-row">
<span class="api-method">GET</span>
<span class="api-path">/info/:id</span>
</div>

<div class="api-row">
<span class="api-method">GET</span>
<span class="api-path">/script/:id</span>
</div>

</div>

</div>

</div>

</section>

<section class="page" data-page="security">

<div class="section-head">

<div>
<h2>🛡️ Security Center</h2>
<p>ระบบป้องกันของ SEI HUB</p>
</div>

</div>

<div class="security-grid">

<div class="security-card">

<h3>🚦 Rate Limiting</h3>

<p>
จำกัด Request ต่อ IP เพื่อลดการยิง Request จำนวนมาก
และช่วยป้องกันการใช้งาน API แบบผิดปกติ
</p>

<div class="security-status">
<span class="dot"></span>
ACTIVE
</div>

</div>

<div class="security-card">

<h3>🔐 Protected Script</h3>

<p>
Endpoint Script ตรวจสอบ User-Agent
และไม่ส่ง Script ให้ Client ที่ไม่ตรงเงื่อนไข
</p>

<div class="security-status">
<span class="dot"></span>
ACTIVE
</div>

</div>

<div class="security-card">

<h3>🧹 HTML Protection</h3>

<p>
ข้อมูลจากฐานข้อมูลถูก Escape ก่อนนำไปแสดงบนหน้าเว็บ
ช่วยลดความเสี่ยงจาก HTML Injection
</p>

<div class="security-status">
<span class="dot"></span>
ACTIVE
</div>

</div>

<div class="security-card">

<h3>📦 Upload Limit</h3>

<p>
จำกัดขนาดไฟล์ Upload สูงสุด 5 MB
เพื่อลดการใช้ Resource ของ Server
</p>

<div class="security-status">
<span class="dot"></span>
ACTIVE
</div>

</div>

<div class="security-card">

<h3>🧱 Security Headers</h3>

<p>
เปิด Response Security Headers เช่น
nosniff, frame protection และ Referrer Policy
</p>

<div class="security-status">
<span class="dot"></span>
ACTIVE
</div>

</div>

<div class="security-card">

<h3>🆔 Random Script ID</h3>

<p>
Script แต่ละตัวใช้ ID แบบสุ่ม 32 ตัวอักษร
ทำให้เดา ID ได้ยาก
</p>

<div class="security-status">
<span class="dot"></span>
ACTIVE
</div>

</div>

</div>

</section>

<section class="page" data-page="discord">

<div class="section-head">

<div>
<h2>💬 Developer</h2>
<p>ช่องทางติดต่อผู้พัฒนา SEI HUB</p>
</div>

</div>

<div class="info-grid">

<div class="info-card">

<h3>SEI HUB Developer</h3>

<p>
หากพบปัญหาเกี่ยวกับระบบ Script
หรือมีข้อเสนอแนะ สามารถติดต่อผ่าน Discord
ของผู้พัฒนาได้โดยตรง
</p>

<a
class="discord-large"
href="${DISCORD_URL}"
target="_blank"
rel="noopener noreferrer"
>
${DISCORD_SVG}
Join Developer Discord
</a>

</div>

<div class="info-card">

<h3>Developer Discord</h3>

<p>
Discord Invite
</p>

<div
style="
margin-top:15px;
padding:15px;
border-radius:12px;
background:rgba(0,0,0,.22);
border:1px solid rgba(255,255,255,.05);
color:#8fbaff;
font-family:monospace;
font-size:12px;
word-break:break-all;
"
>
${DISCORD_URL}
</div>

<button
class="btn btn-primary"
style="margin-top:15px;width:100%"
onclick="copyText('${DISCORD_URL}')"
>
📋 Copy Discord Link
</button>

</div>

</div>

<div class="section">

<div class="card">

<h3>About SEI HUB</h3>

<p style="margin-top:12px;color:#7183a5;line-height:1.8;font-size:13px">
SEI HUB เป็นระบบจัดการและแจกจ่าย Script
ที่เชื่อมต่อกับ Supabase Storage และ Database
พร้อมหน้าเว็บสำหรับดูข้อมูลและจัดการ Script
</p>

</div>

</div>

</section>
`;

    res.send(layout("SEI HUB", content));
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

    const filename = req.file.originalname.trim();

    if (!/\.lua$/i.test(filename)) {
      return res.status(400).json({
        success: false,
        message: "Only .lua files are allowed"
      });
    }

    const { data: exists, error: existsError } =
      await supabase
        .from("scripts")
        .select("id")
        .eq("filename", filename)
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

    const owner =
      String(req.body.owner || "Unknown")
        .trim()
        .slice(0, 100);

    const newData = {
      id,
      filename,
      owner,
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
    console.error("Upload Error:", error.message);

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
🛡️ PROTECTED SCRIPT
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
    const name =
      String(req.params.name || "")
        .slice(0, 100);

    const { data, error } =
      await supabase
        .from("scripts")
        .select("*")
        .ilike(
          "filename",
          `%${name}%`
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
    const owner =
      String(req.params.owner || "")
        .slice(0, 100);

    const { data, error } =
      await supabase
        .from("scripts")
        .select("*")
        .eq("owner", owner)
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
    const id = req.params.id;

    if (!/^[a-f0-9]{32}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Script ID"
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
    const id = req.params.id;
    const owner = String(req.query.owner || "").trim();

    if (!/^[a-f0-9]{32}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Script ID"
      });
    }

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
        .eq("id", id)
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
          `${id}.lua`
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
        .eq("id", id);

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
      const id = req.params.id;
      const owner =
        String(req.body.owner || "").trim();

      if (!/^[a-f0-9]{32}$/i.test(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Script ID"
        });
      }

      const { data, error: findError } =
        await supabase
          .from("scripts")
          .select("*")
          .eq("id", id)
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

      if (!/\.lua$/i.test(req.file.originalname)) {
        return res.status(400).json({
          success: false,
          message: "Only .lua files are allowed"
        });
      }

      const { error: uploadError } =
        await supabase.storage
          .from(BUCKET)
          .upload(
            `${id}.lua`,
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
          .eq("id", id);

      if (updateError) {
        return res.status(500).json({
          success: false,
          message: updateError.message
        });
      }

      res.json({
        success: true,
        loader: loaderFor(id)
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

app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({
      success: false,
      message: "Endpoint Not Found"
    });
  }

  res.status(404).send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>404 - SEI HUB</title>
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
404 NOT FOUND
</div>

<h1>SEI HUB</h1>

<div class="desc">
The requested resource was not found.
</div>

<a
class="btn btn-primary"
style="display:inline-flex;margin-top:25px;text-decoration:none"
href="/"
>
Back to Home
</a>

</div>
</div>

</body>
</html>
`);
});

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
    "SEI HUB Server Running : " + PORT
  );
  console.log(
    "BASE URL : " + BASE_URL
  );
});
