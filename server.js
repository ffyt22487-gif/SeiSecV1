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

    if (error) {
      throw error;
    }

    if (!data) {
      return id;
    }
  }
}

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

const ICONS = {
  home: `
    <svg viewBox="0 0 24 24">
      <path d="M3 10.5 12 3l9 7.5"/>
      <path d="M5 9.5V21h14V9.5"/>
      <path d="M9 21v-7h6v7"/>
    </svg>
  `,

  scripts: `
    <svg viewBox="0 0 24 24">
      <path d="M6 3h9l3 3v15H6z"/>
      <path d="M14 3v4h4"/>
      <path d="M9 12h6"/>
      <path d="M9 16h6"/>
    </svg>
  `,

  search: `
    <svg viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7"/>
      <path d="m20 20-4-4"/>
    </svg>
  `,

  stats: `
    <svg viewBox="0 0 24 24">
      <path d="M4 19V5"/>
      <path d="M4 19h16"/>
      <path d="m7 15 4-5 3 3 5-7"/>
    </svg>
  `,

  user: `
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6"/>
    </svg>
  `,

  discord: DISCORD_SVG
};

const CSS = `
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
      #020817 80%
    );
  color:#fff;
  font-family:
    Arial,
    Helvetica,
    sans-serif;
  overflow-x:hidden;
}

body::before{
  content:"";
  position:fixed;
  inset:0;
  pointer-events:none;

  background:
    linear-gradient(
      rgba(70,130,255,.025) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(70,130,255,.025) 1px,
      transparent 1px
    );

  background-size:45px 45px;
}

a{
  color:inherit;
}

button,
input{
  font:inherit;
}

.app{
  min-height:100vh;
  position:relative;
  z-index:1;
}

/* TOPBAR */

.topbar{
  position:sticky;
  top:0;
  z-index:50;

  height:70px;

  display:flex;
  align-items:center;
  justify-content:space-between;

  padding:0 22px;

  background:
    rgba(2,8,23,.88);

  border-bottom:
    1px solid
    rgba(70,130,255,.16);

  backdrop-filter:blur(18px);
  -webkit-backdrop-filter:blur(18px);
}

.brand{
  display:flex;
  align-items:center;
  gap:11px;

  font-weight:800;
  font-size:19px;

  letter-spacing:.5px;
}

.brand img{
  width:38px;
  height:38px;
  object-fit:contain;
}

.brand span{
  color:#fff;
}

.brand small{
  color:#60a5fa;
  font-size:10px;
  display:block;
  margin-top:2px;
  letter-spacing:1px;
}

.menu-button{
  display:none;

  width:42px;
  height:42px;

  border:1px solid
    rgba(255,255,255,.08);

  border-radius:12px;

  background:
    rgba(255,255,255,.04);

  color:#fff;
}

/* LAYOUT */

.layout{
  display:flex;
  min-height:calc(100vh - 70px);
}

.sidebar{
  width:235px;
  flex-shrink:0;

  padding:22px 14px;

  border-right:
    1px solid
    rgba(70,130,255,.14);

  background:
    rgba(2,8,23,.48);

  backdrop-filter:blur(10px);
}

.nav-title{
  padding:8px 12px;

  color:#475569;

  font-size:11px;

  letter-spacing:1.5px;

  font-weight:700;
}

.nav{
  display:flex;
  flex-direction:column;
  gap:6px;

  margin-top:8px;
}

.nav-item{
  width:100%;

  border:1px solid transparent;

  background:transparent;

  color:#94a3b8;

  padding:12px 14px;

  border-radius:13px;

  display:flex;
  align-items:center;

  gap:12px;

  cursor:pointer;

  text-align:left;

  transition:.2s;
}

.nav-item svg{
  width:20px;
  height:20px;

  fill:none;

  stroke:currentColor;

  stroke-width:1.8;

  stroke-linecap:round;
  stroke-linejoin:round;
}

.nav-item:hover{
  background:
    rgba(70,130,255,.08);

  color:#dbeafe;
}

.nav-item.active{
  color:#fff;

  background:
    linear-gradient(
      135deg,
      rgba(37,99,235,.25),
      rgba(30,64,175,.12)
    );

  border-color:
    rgba(96,165,250,.18);

  box-shadow:
    inset 3px 0 0 #3b82f6;
}

.sidebar-discord{
  margin-top:25px;

  padding:15px;

  border-radius:16px;

  background:
    rgba(88,101,242,.08);

  border:
    1px solid
    rgba(88,101,242,.18);
}

.sidebar-discord-title{
  font-size:12px;

  color:#94a3b8;

  margin-bottom:10px;
}

.discord-mini{
  display:flex;
  align-items:center;

  gap:8px;

  color:#a5b4fc;

  text-decoration:none;

  font-weight:700;

  font-size:13px;
}

.discord-mini svg{
  width:20px;
  height:20px;
}

/* CONTENT */

.content{
  width:100%;
  max-width:1200px;

  margin:0 auto;

  padding:32px;
}

.page{
  display:none;

  animation:pageIn .3s ease;
}

.page.active{
  display:block;
}

@keyframes pageIn{
  from{
    opacity:0;
    transform:translateY(8px);
  }

  to{
    opacity:1;
    transform:none;
  }
}

.page-header{
  margin-bottom:25px;
}

.page-header h1{
  font-size:32px;

  margin-bottom:8px;
}

.page-header p{
  color:#64748b;

  font-size:15px;
}

/* HERO */

.hero{
  min-height:320px;

  padding:42px;

  border-radius:26px;

  background:
    linear-gradient(
      135deg,
      rgba(18,59,143,.48),
      rgba(5,20,45,.8)
    );

  border:
    1px solid
    rgba(70,130,255,.22);

  display:flex;
  align-items:center;
  justify-content:space-between;

  gap:30px;

  overflow:hidden;

  position:relative;
}

.hero::after{
  content:"";

  position:absolute;

  width:350px;
  height:350px;

  right:-120px;
  top:-120px;

  border-radius:50%;

  background:
    rgba(37,99,235,.15);

  filter:blur(5px);
}

.hero-text{
  position:relative;
  z-index:2;
}

.hero-badge{
  display:inline-block;

  padding:8px 14px;

  border-radius:30px;

  background:
    rgba(59,130,246,.12);

  border:
    1px solid
    rgba(96,165,250,.2);

  color:#60a5fa;

  font-size:11px;

  font-weight:700;

  letter-spacing:1px;

  margin-bottom:18px;
}

.hero h1{
  font-size:46px;

  line-height:1.1;

  margin-bottom:14px;
}

.hero p{
  color:#94a3b8;

  font-size:16px;

  line-height:1.7;

  max-width:550px;
}

.hero-logo{
  width:190px;
  height:190px;

  object-fit:contain;

  position:relative;
  z-index:2;

  filter:
    drop-shadow(
      0 0 35px
      rgba(0,130,255,.5)
    );
}

/* BUTTONS */

.btn{
  display:inline-flex;

  align-items:center;
  justify-content:center;

  gap:8px;

  min-height:45px;

  padding:10px 17px;

  border-radius:12px;

  border:1px solid
    rgba(255,255,255,.1);

  background:
    rgba(255,255,255,.05);

  color:#fff;

  text-decoration:none;

  cursor:pointer;

  font-weight:700;

  font-size:13px;

  transition:.2s;
}

.btn:hover{
  transform:translateY(-2px);

  background:
    rgba(255,255,255,.09);
}

.btn-primary{
  background:
    linear-gradient(
      135deg,
      #2563eb,
      #1d4ed8
    );

  border-color:
    rgba(96,165,250,.25);

  box-shadow:
    0 8px 22px
    rgba(37,99,235,.25);
}

.btn-discord{
  background:
    linear-gradient(
      135deg,
      #5865f2,
      #4752c4
    );

  box-shadow:
    0 8px 25px
    rgba(88,101,242,.3);
}

.hero-buttons{
  display:flex;

  gap:10px;

  margin-top:25px;

  flex-wrap:wrap;
}

/* CARDS */

.cards{
  display:grid;

  grid-template-columns:
    repeat(3,1fr);

  gap:15px;

  margin-top:20px;
}

.card{
  padding:22px;

  border-radius:18px;

  background:
    rgba(8,20,42,.8);

  border:
    1px solid
    rgba(70,130,255,.14);

  box-shadow:
    0 10px 35px
    rgba(0,0,0,.15);
}

.card-label{
  color:#64748b;

  font-size:12px;

  letter-spacing:1px;
}

.card-number{
  margin-top:10px;

  color:#60a5fa;

  font-size:29px;

  font-weight:800;
}

.card-desc{
  margin-top:5px;

  color:#475569;

  font-size:12px;
}

/* SCRIPT LIST */

.script-list{
  display:flex;

  flex-direction:column;

  gap:10px;
}

.script{
  padding:17px;

  border-radius:16px;

  background:
    rgba(8,20,42,.78);

  border:
    1px solid
    rgba(70,130,255,.14);

  display:flex;

  align-items:center;

  justify-content:space-between;

  gap:15px;
}

.script-info{
  min-width:0;
}

.script-name{
  font-size:15px;

  font-weight:700;

  white-space:nowrap;

  overflow:hidden;

  text-overflow:ellipsis;
}

.script-meta{
  color:#64748b;

  font-size:11px;

  margin-top:6px;
}

.script-actions{
  display:flex;

  gap:7px;

  flex-shrink:0;
}

.small-btn{
  min-height:38px;

  padding:8px 11px;

  border-radius:10px;

  border:1px solid
    rgba(255,255,255,.08);

  background:
    rgba(255,255,255,.04);

  color:#cbd5e1;

  cursor:pointer;

  font-size:11px;

  font-weight:700;
}

.small-btn:hover{
  background:
    rgba(59,130,246,.12);

  color:#fff;
}

/* SEARCH */

.search-box{
  display:flex;

  gap:10px;

  margin-bottom:20px;
}

.search-input{
  flex:1;

  min-height:50px;

  padding:0 16px;

  border-radius:13px;

  outline:none;

  border:
    1px solid
    rgba(70,130,255,.2);

  background:
    rgba(2,10,25,.75);

  color:#fff;

  font-size:14px;
}

.search-input:focus{
  border-color:#3b82f6;

  box-shadow:
    0 0 0 3px
    rgba(59,130,246,.08);
}

/* STATS */

.stat-grid{
  display:grid;

  grid-template-columns:
    repeat(2,1fr);

  gap:15px;
}

.stat-big{
  padding:25px;

  border-radius:20px;

  background:
    linear-gradient(
      135deg,
      rgba(18,59,143,.25),
      rgba(5,20,45,.7)
    );

  border:
    1px solid
    rgba(70,130,255,.16);
}

.stat-big .icon{
  color:#60a5fa;

  font-size:22px;

  margin-bottom:15px;
}

.stat-big h2{
  font-size:34px;
}

.stat-big p{
  color:#64748b;

  font-size:12px;

  margin-top:5px;
}

/* DEVELOPER */

.developer{
  max-width:700px;

  margin:auto;

  text-align:center;

  padding:35px;

  border-radius:24px;

  background:
    rgba(8,20,42,.8);

  border:
    1px solid
    rgba(70,130,255,.16);
}

.developer-logo{
  width:110px;
  height:110px;

  object-fit:contain;

  filter:
    drop-shadow(
      0 0 25px
      rgba(0,130,255,.4)
    );
}

.developer h2{
  font-size:28px;

  margin-top:15px;
}

.developer p{
  color:#64748b;

  margin-top:10px;

  line-height:1.7;
}

/* DISCORD */

.discord-card{
  max-width:700px;

  margin:auto;

  padding:40px 25px;

  text-align:center;

  border-radius:24px;

  background:
    linear-gradient(
      135deg,
      rgba(88,101,242,.18),
      rgba(8,20,42,.85)
    );

  border:
    1px solid
    rgba(88,101,242,.25);
}

.discord-card svg{
  width:70px;
  height:70px;

  color:#7289da;
}

.discord-card h2{
  margin-top:18px;

  font-size:29px;
}

.discord-card p{
  color:#94a3b8;

  margin:12px auto 22px;

  max-width:500px;

  line-height:1.7;
}

/* EMPTY */

.empty{
  padding:50px 20px;

  text-align:center;

  border-radius:18px;

  border:
    1px dashed
    rgba(70,130,255,.18);

  color:#64748b;
}

/* TOAST */

.toast{
  position:fixed;

  left:50%;

  bottom:25px;

  transform:
    translate(-50%,20px);

  padding:12px 18px;

  border-radius:12px;

  background:
    rgba(15,23,42,.96);

  border:
    1px solid
    rgba(96,165,250,.2);

  color:#dbeafe;

  font-size:13px;

  opacity:0;

  pointer-events:none;

  transition:.25s;

  z-index:100;
}

.toast.show{
  opacity:1;

  transform:
    translate(-50%,0);
}

/* MOBILE */

@media(max-width:800px){

  .menu-button{
    display:block;
  }

  .sidebar{
    position:fixed;

    top:70px;
    bottom:0;
    left:0;

    z-index:45;

    transform:
      translateX(-100%);

    transition:.25s;

    width:245px;

    background:
      rgba(2,8,23,.97);
  }

  .sidebar.open{
    transform:
      translateX(0);
  }

  .content{
    padding:20px 15px 90px;
  }

  .hero{
    padding:30px 22px;

    min-height:auto;

    flex-direction:column;

    align-items:flex-start;
  }

  .hero-logo{
    position:absolute;

    width:120px;
    height:120px;

    right:-20px;
    top:20px;

    opacity:.25;
  }

  .hero h1{
    font-size:38px;
  }

  .cards{
    grid-template-columns:1fr;
  }

  .stat-grid{
    grid-template-columns:1fr;
  }

  .script{
    align-items:flex-start;

    flex-direction:column;
  }

  .script-actions{
    width:100%;
  }

  .small-btn{
    flex:1;
  }

  .search-box{
    flex-direction:column;
  }

  .search-box .btn{
    width:100%;
  }

}

@media(max-width:420px){

  .hero h1{
    font-size:32px;
  }

  .page-header h1{
    font-size:27px;
  }

  .developer{
    padding:30px 18px;
  }

}
`;

function layoutHTML(scripts, downloads) {

  const safeScripts =
    JSON.stringify(scripts || [])
      .replace(/</g, "\\u003c");

  return `
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
>

<meta
  name="theme-color"
  content="#020817"
>

<title>SEI HUB</title>

<style>
${CSS}
</style>

</head>

<body>

<div class="app">

<header class="topbar">

<button
  class="menu-button"
  onclick="toggleSidebar()"
>
  ☰
</button>

<div class="brand">

<img
  src="${LOGO_URL}"
  alt="SEI HUB"
>

<div>
  <span>SEI HUB</span>
  <small>SECURE DISTRIBUTION</small>
</div>

</div>

<a
  class="btn btn-discord"
  href="${DISCORD_URL}"
  target="_blank"
  rel="noopener noreferrer"
>
  ${DISCORD_SVG}
  Discord
</a>

</header>

<div class="layout">

<aside
  class="sidebar"
  id="sidebar"
>

<div class="nav-title">
  MENU
</div>

<nav class="nav">

<button
  class="nav-item active"
  data-page="home"
  onclick="showPage('home')"
>
  ${ICONS.home}
  <span>Home</span>
</button>

<button
  class="nav-item"
  data-page="scripts"
  onclick="showPage('scripts')"
>
  ${ICONS.scripts}
  <span>Scripts</span>
</button>

<button
  class="nav-item"
  data-page="search"
  onclick="showPage('search')"
>
  ${ICONS.search}
  <span>Search</span>
</button>

<button
  class="nav-item"
  data-page="stats"
  onclick="showPage('stats')"
>
  ${ICONS.stats}
  <span>Statistics</span>
</button>

<button
  class="nav-item"
  data-page="developer"
  onclick="showPage('developer')"
>
  ${ICONS.user}
  <span>Developer</span>
</button>

<button
  class="nav-item"
  data-page="discord"
  onclick="showPage('discord')"
>
  ${ICONS.discord}
  <span>Discord</span>
</button>

</nav>

<div class="sidebar-discord">

<div class="sidebar-discord-title">
  Developer Community
</div>

<a
  class="discord-mini"
  href="${DISCORD_URL}"
  target="_blank"
  rel="noopener noreferrer"
>
  ${DISCORD_SVG}
  Join Discord
</a>

</div>

</aside>

<main class="content">

<!-- HOME -->

<section
  class="page active"
  id="page-home"
>

<div class="hero">

<div class="hero-text">

<div class="hero-badge">
  SECURE SCRIPT DISTRIBUTION
</div>

<h1>
  SEI HUB
</h1>

<p>
  A secure script distribution platform
  for managing, sharing and delivering
  your scripts.
</p>

<div class="hero-buttons">

<button
  class="btn btn-primary"
  onclick="showPage('scripts')"
>
  Browse Scripts
</button>

<button
  class="btn btn-discord"
  onclick="showPage('discord')"
>
  ${DISCORD_SVG}
  Developer Discord
</button>

</div>

</div>

<img
  class="hero-logo"
  src="${LOGO_URL}"
  alt="SEI HUB"
>

</div>

<div class="cards">

<div class="card">

<div class="card-label">
  TOTAL SCRIPTS
</div>

<div
  class="card-number"
  id="homeScripts"
>
  ${scripts.length}
</div>

<div class="card-desc">
  Published scripts
</div>

</div>

<div class="card">

<div class="card-label">
  TOTAL DOWNLOADS
</div>

<div
  class="card-number"
  id="homeDownloads"
>
  ${downloads}
</div>

<div class="card-desc">
  Script requests
</div>

</div>

<div class="card">

<div class="card-label">
  STATUS
</div>

<div
  class="card-number"
  style="color:#4ade80"
>
  ONLINE
</div>

<div class="card-desc">
  Service operational
</div>

</div>

</div>

</section>

<!-- SCRIPTS -->

<section
  class="page"
  id="page-scripts"
>

<div class="page-header">

<h1>
  Scripts
</h1>

<p>
  Browse available scripts.
</p>

</div>

<div
  class="script-list"
  id="scriptList"
>

</div>

</section>

<!-- SEARCH -->

<section
  class="page"
  id="page-search"
>

<div class="page-header">

<h1>
  Search
</h1>

<p>
  Search scripts by filename.
</p>

</div>

<div class="search-box">

<input
  class="search-input"
  id="searchInput"
  placeholder="Search script..."
  autocomplete="off"
>

<button
  class="btn btn-primary"
  onclick="searchScripts()"
>
  ${ICONS.search}
  Search
</button>

</div>

<div
  class="script-list"
  id="searchResults"
>

<div class="empty">
  Enter a name to search.
</div>

</div>

</section>

<!-- STATS -->

<section
  class="page"
  id="page-stats"
>

<div class="page-header">

<h1>
  Statistics
</h1>

<p>
  SEI HUB platform statistics.
</p>

</div>

<div class="stat-grid">

<div class="stat-big">

<div class="icon">
  📦
</div>

<h2 id="statScripts">
  ${scripts.length}
</h2>

<p>
  Total Scripts
</p>

</div>

<div class="stat-big">

<div class="icon">
  ↓
</div>

<h2 id="statDownloads">
  ${downloads}
</h2>

<p>
  Total Downloads
</p>

</div>

</div>

</section>

<!-- DEVELOPER -->

<section
  class="page"
  id="page-developer"
>

<div class="page-header">

<h1>
  Developer
</h1>

<p>
  Information about SEI HUB.
</p>

</div>

<div class="developer">

<img
  class="developer-logo"
  src="${LOGO_URL}"
  alt="SEI HUB"
>

<h2>
  SEI HUB
</h2>

<p>
  Secure script distribution platform
  developed for script management
  and distribution.
</p>

<div
  style="
    margin-top:22px;
    color:#64748b;
    font-size:13px;
  "
>
  Developer Community
</div>

<div
  style="
    margin-top:5px;
    color:#60a5fa;
    font-weight:700;
  "
>
  SEI HUB Developer
</div>

<div style="margin-top:22px">

<a
  class="btn btn-discord"
  href="${DISCORD_URL}"
  target="_blank"
  rel="noopener noreferrer"
>
  ${DISCORD_SVG}
  Contact Developer
</a>

</div>

</div>

</section>

<!-- DISCORD -->

<section
  class="page"
  id="page-discord"
>

<div class="page-header">

<h1>
  Discord
</h1>

<p>
  Join the official developer community.
</p>

</div>

<div class="discord-card">

${DISCORD_SVG}

<h2>
  Developer Discord
</h2>

<p>
  Join our Discord server for updates,
  support and information about SEI HUB.
</p>

<a
  class="btn btn-discord"
  href="${DISCORD_URL}"
  target="_blank"
  rel="noopener noreferrer"
>
  ${DISCORD_SVG}
  Join Developer Discord
</a>

<div
  style="
    margin-top:16px;
    color:#64748b;
    font-size:12px;
  "
>
  discord.gg/n3xY3YuwuQ
</div>

</div>

</section>

</main>

</div>

</div>

<div
  class="toast"
  id="toast"
>
  Copied!
</div>

<script>

const ALL_SCRIPTS =
${safeScripts};

function showPage(name){

  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove("active");

    });

  const page =
    document.getElementById(
      "page-" + name
    );

  if(page){
    page.classList.add("active");
  }

  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

      item.classList.remove("active");

      if(
        item.dataset.page === name
      ){
        item.classList.add("active");
      }

    });

  document
    .getElementById("sidebar")
    .classList.remove("open");

  if(name === "scripts"){
    renderScripts(
      ALL_SCRIPTS,
      "scriptList"
    );
  }

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}

function toggleSidebar(){

  document
    .getElementById("sidebar")
    .classList.toggle("open");

}

function showToast(text){

  const toast =
    document.getElementById("toast");

  toast.textContent =
    text || "Copied!";

  toast.classList.add("show");

  setTimeout(() => {

    toast.classList.remove("show");

  }, 1800);
}

async function copyText(text){

  try{

    await navigator.clipboard.writeText(
      text
    );

    showToast(
      "Copied to clipboard"
    );

  }catch(e){

    const area =
      document.createElement("textarea");

    area.value = text;

    document.body.appendChild(area);

    area.select();

    document.execCommand("copy");

    area.remove();

    showToast(
      "Copied to clipboard"
    );

  }

}

function copyLoader(id){

  const loader =
    'loadstring(game:HttpGet("' +
    location.origin +
    '/script/' +
    id +
    '"))()';

  copyText(loader);

}

function copyID(id){

  copyText(id);

}

function escapeHTML(value){

  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}

function renderScripts(
  scripts,
  target
){

  const box =
    document.getElementById(target);

  if(!box) return;

  if(!scripts || !scripts.length){

    box.innerHTML =
      '<div class="empty">' +
      'No scripts found.' +
      '</div>';

    return;

  }

  box.innerHTML =
    scripts.map(script => {

      const name =
        escapeHTML(
          script.filename ||
          "Unnamed"
        );

      const owner =
        escapeHTML(
          script.owner ||
          "Unknown"
        );

      const downloads =
        Number(
          script.downloads || 0
        );

      const id =
        escapeHTML(
          script.id
        );

      return \`
<div class="script">

<div class="script-info">

<div class="script-name">
  \${name}
</div>

<div class="script-meta">
  Owner: \${owner}
  • Downloads: \${downloads}
</div>

</div>

<div class="script-actions">

<button
  class="small-btn"
  onclick="copyLoader('\${id}')"
>
  Copy Loader
</button>

<button
  class="small-btn"
  onclick="copyID('\${id}')"
>
  Copy ID
</button>

</div>

</div>
\`;

    }).join("");

}

async function searchScripts(){

  const input =
    document.getElementById(
      "searchInput"
    );

  const results =
    document.getElementById(
      "searchResults"
    );

  const query =
    input.value.trim();

  if(!query){

    results.innerHTML =
      '<div class="empty">' +
      'Enter a script name.' +
      '</div>';

    return;

  }

  results.innerHTML =
    '<div class="empty">' +
    'Searching...' +
    '</div>';

  try{

    const response =
      await fetch(
        "/search/" +
        encodeURIComponent(query)
      );

    const data =
      await response.json();

    if(
      !data.success ||
      !data.scripts
    ){

      results.innerHTML =
        '<div class="empty">' +
        'Search failed.' +
        '</div>';

      return;

    }

    renderScripts(
      data.scripts,
      "searchResults"
    );

  }catch(error){

    results.innerHTML =
      '<div class="empty">' +
      'Unable to connect to server.' +
      '</div>';

  }

}

document
  .getElementById("searchInput")
  ?.addEventListener(
    "keydown",
    function(event){

      if(event.key === "Enter"){
        searchScripts();
      }

    }
  );

renderScripts(
  ALL_SCRIPTS,
  "scriptList"
);

</script>

</body>
</html>
`;
}

/* HOME */

app.get("/", async (req, res) => {

  try{

    const { data, error } =
      await supabase
        .from("scripts")
        .select("*")
        .order(
          "created",
          {
            ascending:false
          }
        );

    if(error){

      console.error(
        "Home DB Error:",
        error.message
      );

      return res
        .status(500)
        .send("Database Error");

    }

    const scripts =
      data || [];

    const downloads =
      scripts.reduce(
        (total, script) =>
          total +
          Number(
            script.downloads || 0
          ),
        0
      );

    res.send(
      layoutHTML(
        scripts,
        downloads
      )
    );

  }catch(error){

    console.error(
      "Home Error:",
      error.message
    );

    res
      .status(500)
      .send("Server Error");

  }

});

/* UPLOAD */

app.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {

    try{

      if(!req.file){

        return res.status(400).json({
          success:false,
          message:"No file"
        });

      }

      if(
        !req.file.originalname ||
        !req.file.originalname.trim()
      ){

        return res.status(400).json({
          success:false,
          message:"Invalid filename"
        });

      }

      const {
        data: exists,
        error: existsError
      } =
        await supabase
          .from("scripts")
          .select("id")
          .eq(
            "filename",
            req.file.originalname
          )
          .maybeSingle();

      if(existsError){

        return res.status(500).json({
          success:false,
          message:existsError.message
        });

      }

      if(exists){

        return res.status(400).json({
          success:false,
          message:
            "Script name already exists."
        });

      }

      const id =
        await makeID();

      const {
        error:uploadError
      } =
        await supabase.storage
          .from(BUCKET)
          .upload(
            `${id}.lua`,
            req.file.buffer,
            {
              contentType:"text/plain"
            }
          );

      if(uploadError){

        return res.status(500).json({
          success:false,
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

        downloads:0,

        size:
          req.file.size

      };

      const {
        error:dbError
      } =
        await supabase
          .from("scripts")
          .insert(newData);

      if(dbError){

        await supabase.storage
          .from(BUCKET)
          .remove([
            `${id}.lua`
          ]);

        return res.status(500).json({
          success:false,
          message:
            dbError.message
        });

      }

      res.json({
        success:true,
        id,
        loader:
          loaderFor(id)
      });

    }catch(error){

      console.error(
        "Upload Error:",
        error.message
      );

      res.status(500).json({
        success:false,
        message:
          "Upload failed"
      });

    }

  }
);

/* SCRIPT DELIVERY */

app.get(
  "/script/:id",
  async (req, res) => {

    try{

      const id =
        req.params.id;

      if(
        !/^[a-f0-9]{32}$/i.test(id)
      ){

        return res
          .status(400)
          .send("Invalid Script ID");

      }

      const {
        data,
        error
      } =
        await supabase
          .from("scripts")
          .select("*")
          .eq("id", id)
          .maybeSingle();

      if(error){

        console.error(
          "Database Error:",
          error.message
        );

        return res
          .status(500)
          .send("Database Error");

      }

      if(!data){

        return res
          .status(404)
          .send("Script Not Found");

      }

      const userAgent =
        req.get("User-Agent") ||
        "";

      /*
        Browser protection page
      */

      if(!/Roblox/i.test(userAgent)){

        return res.status(403).send(`
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
>

<title>Protected Script</title>

<style>

*{
  box-sizing:border-box;
  margin:0;
  padding:0;
}

html,
body{
  min-height:100%;
}

body{

  min-height:100vh;

  background:
    radial-gradient(
      circle at 50% 0%,
      #123b8f 0%,
      #08152f 38%,
      #020817 82%
    );

  color:#fff;

  font-family:
    Arial,
    Helvetica,
    sans-serif;

  overflow-x:hidden;

}

body::before{

  content:"";

  position:fixed;

  inset:0;

  pointer-events:none;

  background:
    linear-gradient(
      rgba(70,130,255,.025) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(70,130,255,.025) 1px,
      transparent 1px
    );

  background-size:
    45px 45px;

}

.wrapper{

  min-height:100vh;

  display:flex;

  align-items:center;

  justify-content:center;

  padding:20px;

}

.protected-card{

  width:100%;

  max-width:520px;

  padding:
    42px 25px 30px;

  text-align:center;

  background:
    rgba(7,20,43,.96);

  border:
    1px solid
    rgba(70,130,255,.35);

  border-radius:28px;

  box-shadow:
    0 0 70px
    rgba(0,110,255,.18),
    0 25px 80px
    rgba(0,0,0,.45);

}

.logo{

  width:145px;

  height:145px;

  object-fit:contain;

  display:block;

  margin:
    0 auto 25px;

  filter:
    drop-shadow(
      0 0 25px
      rgba(0,130,255,.55)
    );

}

.badge{

  display:inline-flex;

  padding:
    10px 22px;

  border-radius:30px;

  background:
    rgba(30,100,255,.15);

  border:
    1px solid
    rgba(80,150,255,.3);

  color:#63a9ff;

  font-size:14px;

  font-weight:700;

  letter-spacing:1px;

}

h1{

  margin:
    20px 0 10px;

  font-size:40px;

  font-weight:800;

}

.desc{

  color:#94a3b8;

  font-size:17px;

  line-height:1.6;

}

.status{

  margin-top:28px;

  padding:20px;

  border-radius:17px;

  background:
    rgba(2,10,25,.75);

  border:
    1px solid
    rgba(255,255,255,.07);

}

.status-title{

  color:#64748b;

  font-size:13px;

  letter-spacing:1px;

  font-weight:700;

  margin-bottom:9px;

}

.status-text{

  color:#cbd5e1;

  font-size:15px;

  line-height:1.5;

}

.active{

  margin-top:23px;

  display:flex;

  align-items:center;

  justify-content:center;

  gap:9px;

  color:#4ade80;

  font-size:15px;

  font-weight:600;

}

.dot{

  width:10px;

  height:10px;

  border-radius:50%;

  background:#22c55e;

  box-shadow:
    0 0 8px #22c55e,
    0 0 18px
    rgba(34,197,94,.6);

}

.discord-btn{

  width:100%;

  min-height:62px;

  margin:
    28px auto 0;

  display:flex;

  align-items:center;

  justify-content:center;

  gap:13px;

  padding:
    13px 18px;

  border-radius:16px;

  background:
    linear-gradient(
      135deg,
      #5865f2,
      #4752c4
    );

  border:
    1px solid
    rgba(255,255,255,.2);

  color:#fff;

  text-decoration:none;

  box-shadow:
    0 8px 25px
    rgba(88,101,242,.35);

  transition:.2s;

}

.discord-btn:hover{

  transform:
    translateY(-3px);

  filter:
    brightness(1.08);

  box-shadow:
    0 13px 35px
    rgba(88,101,242,.5);

}

.discord-btn:active{

  transform:
    scale(.97);

}

.discord-icon{

  width:27px;

  height:27px;

  flex-shrink:0;

}

.discord-text{

  display:flex;

  flex-direction:column;

  align-items:flex-start;

  text-align:left;

}

.discord-title{

  font-size:16px;

  font-weight:700;

}

.discord-sub{

  font-size:11px;

  opacity:.75;

  margin-top:4px;

}

.divider{

  height:1px;

  border:0;

  margin:
    28px 0 20px;

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(70,130,255,.35),
      transparent
    );

}

.footer{

  color:#475569;

  font-size:13px;

  line-height:1.7;

}

.footer a{

  color:#60a5fa;

  text-decoration:none;

  word-break:break-all;

}

@media(max-width:500px){

  .wrapper{
    padding:14px;
  }

  .protected-card{
    padding:
      35px 20px 28px;

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

}

</style>

</head>

<body>

<div class="wrapper">

<div class="protected-card">

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

Developer Discord

<br>

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

      const {
        data:fileBlob,
        error:dlError
      } =
        await supabase.storage
          .from(BUCKET)
          .download(
            `${id}.lua`
          );

      if(dlError){

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
        .eq(
          "id",
          id
        );

      res
        .type("text/plain")
        .send(text);

    }catch(error){

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

/* ALL SCRIPTS */

app.get(
  "/scripts",
  async (req, res) => {

    try{

      const {
        data,
        error
      } =
        await supabase
          .from("scripts")
          .select("*")
          .order(
            "created",
            {
              ascending:false
            }
          );

      if(error){

        return res.status(500).json({
          success:false,
          message:
            error.message
        });

      }

      res.json({

        success:true,

        total:
          data?.length || 0,

        scripts:
          data || []

      });

    }catch(error){

      res.status(500).json({

        success:false,

        message:
          "Failed to load scripts"

      });

    }

  }
);

/* STATS */

app.get(
  "/stats",
  async (req, res) => {

    try{

      const {
        data,
        error
      } =
        await supabase
          .from("scripts")
          .select("downloads");

      if(error){

        return res.status(500).json({

          success:false,

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

        success:true,

        scripts:
          data?.length || 0,

        downloads

      });

    }catch(error){

      res.status(500).json({

        success:false,

        message:
          "Failed to load stats"

      });

    }

  }
);

/* SEARCH */

app.get(
  "/search/:name",
  async (req, res) => {

    try{

      const name =
        req.params.name;

      const {
        data,
        error
      } =
        await supabase
          .from("scripts")
          .select("*")
          .ilike(
            "filename",
            `%${name}%`
          )
          .order(
            "created",
            {
              ascending:false
            }
          );

      if(error){

        return res.status(500).json({

          success:false,

          message:
            error.message

        });

      }

      res.json({

        success:true,

        total:
          data?.length || 0,

        scripts:
          data || []

      });

    }catch(error){

      res.status(500).json({

        success:false,

        message:
          "Search failed"

      });

    }

  }
);

/* OWNER LIST */

app.get(
  "/list/:owner",
  async (req, res) => {

    try{

      const {
        data,
        error
      } =
        await supabase
          .from("scripts")
          .select("*")
          .eq(
            "owner",
            req.params.owner
          )
          .order(
            "created",
            {
              ascending:false
            }
          );

      if(error){

        return res.status(500).json({

          success:false,

          message:
            error.message

        });

      }

      res.json({

        success:true,

        total:
          data?.length || 0,

        scripts:
          data || []

      });

    }catch(error){

      res.status(500).json({

        success:false,

        message:
          "Failed to load scripts"

      });

    }

  }
);

/* INFO */

app.get(
  "/info/:id",
  async (req, res) => {

    try{

      const {
        data,
        error
      } =
        await supabase
          .from("scripts")
          .select("*")
          .eq(
            "id",
            req.params.id
          )
          .maybeSingle();

      if(error){

        return res.status(500).json({

          success:false,

          message:
            error.message

        });

      }

      if(!data){

        return res.status(404).json({

          success:false,

          message:
            "Not Found"

        });

      }

      res.json({

        success:true,

        data:{
          ...data,

          loader:
            loaderFor(data.id)
        }

      });

    }catch(error){

      res.status(500).json({

        success:false,

        message:
          "Failed to load script info"

      });

    }

  }
);

/* DELETE */

app.delete(
  "/delete/:id",
  async (req, res) => {

    try{

      const owner =
        req.query.owner;

      if(!owner){

        return res.status(400).json({

          success:false,

          message:
            "Owner required"

        });

      }

      const {
        data,
        error
      } =
        await supabase
          .from("scripts")
          .select("*")
          .eq(
            "id",
            req.params.id
          )
          .maybeSingle();

      if(error){

        return res.status(500).json({

          success:false,

          message:
            error.message

        });

      }

      if(!data){

        return res.status(404).json({

          success:false,

          message:
            "Script Not Found"

        });

      }

      if(data.owner !== owner){

        return res.status(403).json({

          success:false,

          message:
            "Permission Denied"

        });

      }

      const {
        error:storageError
      } =
        await supabase.storage
          .from(BUCKET)
          .remove([
            `${req.params.id}.lua`
          ]);

      if(storageError){

        return res.status(500).json({

          success:false,

          message:
            storageError.message

        });

      }

      const {
        error:deleteError
      } =
        await supabase
          .from("scripts")
          .delete()
          .eq(
            "id",
            req.params.id
          );

      if(deleteError){

        return res.status(500).json({

          success:false,

          message:
            deleteError.message

        });

      }

      res.json({

        success:true,

        message:"Deleted"

      });

    }catch(error){

      res.status(500).json({

        success:false,

        message:
          "Delete failed"

      });

    }

  }
);

/* UPDATE */

app.post(
  "/update/:id",
  upload.single("file"),
  async (req, res) => {

    try{

      const owner =
        req.body.owner;

      const {
        data,
        error:findError
      } =
        await supabase
          .from("scripts")
          .select("*")
          .eq(
            "id",
            req.params.id
          )
          .maybeSingle();

      if(findError){

        return res.status(500).json({

          success:false,

          message:
            findError.message

        });

      }

      if(!data){

        return res.status(404).json({

          success:false,

          message:
            "Script Not Found"

        });

      }

      if(data.owner !== owner){

        return res.status(403).json({

          success:false,

          message:
            "Permission Denied"

        });

      }

      if(!req.file){

        return res.status(400).json({

          success:false,

          message:
            "No file"

        });

      }

      const {
        error:uploadError
      } =
        await supabase.storage
          .from(BUCKET)
          .upload(
            `${req.params.id}.lua`,
            req.file.buffer,
            {
              contentType:"text/plain",
              upsert:true
            }
          );

      if(uploadError){

        return res.status(500).json({

          success:false,

          message:
            uploadError.message

        });

      }

      const {
        error:updateError
      } =
        await supabase
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

      if(updateError){

        return res.status(500).json({

          success:false,

          message:
            updateError.message

        });

      }

      res.json({

        success:true,

        loader:
          loaderFor(
            req.params.id
          )

      });

    }catch(error){

      console.error(
        "Update Error:",
        error.message
      );

      res.status(500).json({

        success:false,

        message:
          "Update failed"

      });

    }

  }
);

/* SUPABASE CHECK */

(async () => {

  try{

    const {
      error
    } =
      await supabase
        .from("scripts")
        .select("id")
        .limit(1);

    if(error){

      console.error(
        "Supabase Error:",
        error.message
      );

    }else{

      console.log(
        "Supabase Connected"
      );

    }

  }catch(error){

    console.error(
      "Supabase Error:",
      error.message
    );

  }

})();

/* SERVER */

const PORT =
  process.env.PORT || 3000;

app.listen(
  PORT,
  () => {

    console.log(
      "SEI HUB Server Running : " +
      PORT
    );

    console.log(
      "Base URL : " +
      BASE_URL
    );

    console.log(
      "Discord : " +
      DISCORD_URL
    );

  }
);
