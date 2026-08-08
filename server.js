require('dotenv').config();

// 1. เช็กตัวแปร Environment ก่อนเริ่มเซิร์ฟเวอร์
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
console.error("Missing SUPABASE_URL or SUPABASE_KEY");
process.exit(1);
}

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

// 2. จำกัดขนาดไฟล์ 5 MB
const upload = multer({
storage: multer.memoryStorage(),
limits: {
fileSize: 5 * 1024 * 1024
}
});

async function makeID() {
while (true) {
const id = Math.random().toString(36).substring(2, 10);
const { data } = await supabase.from("scripts").select("id").eq("id", id).maybeSingle();
if (!data) return id;
}
}

app.get("/", async (req, res) => {
const { data: db } = await supabase.from("scripts").select("*");
const scripts = db || [];
res.send(`

<!DOCTYPE html>  <html><head><meta charset="UTF-8"><title>SEI HUB</title>  
<style>  
body{margin:0;background:#0f172a;font-family:Arial;display:flex;justify-content:center;align-items:center;height:100vh;color:white;}  
.box{background:#111827;padding:40px;border-radius:20px;text-align:center;box-shadow:0 0 30px #00bfff55;width:420px;}  
h1{color:#00bfff;margin:0;}p{color:#d1d5db;}  
.stat{margin-top:20px;padding:15px;background:#1f2937;border-radius:10px;}  
</style></head><body>  
<div class="box"><h1>🛡 SEI HUB</h1><p>สคริปต์นี้ถูกป้องกันโดย <b>SEI HUB</b></p>  
<div class="stat">📂 Scripts : ${scripts.length}<br>⬇ Downloads : ${scripts.reduce((a,b)=>a+b.downloads,0)}</div>  
<p style="margin-top:20px;">Unauthorized access is prohibited.</p></div></body></html>  
`);  
});  app.post("/upload", upload.single("file"), async (req, res) => {
if (!req.file) return res.status(400).json({ success: false, message: "No file" });

// 3. ป้องกันชื่อไฟล์ว่าง
if (!req.file.originalname || !req.file.originalname.trim()) {
return res.status(400).json({
success: false,
message: "Invalid filename"
});
}

const { data: exists } = await supabase.from("scripts").select("id").eq("filename", req.file.originalname).maybeSingle();
if (exists) return res.status(400).json({ success: false, message: "Script name already exists." });

const id = await makeID();
const { error: uploadError } = await supabase.storage.from(BUCKET).upload(${id}.lua, req.file.buffer, { contentType: "text/plain" });
if (uploadError) return res.status(500).json({ success: false, message: uploadError.message });

const newData = { id, filename: req.file.originalname, owner: req.body.owner || "Unknown", created: new Date().toISOString(), downloads: 0, size: req.file.size };
const { error: dbError } = await supabase.from("scripts").insert(newData);
if (dbError) {
await supabase.storage.from(BUCKET).remove([${id}.lua]);
return res.status(500).json({ success: false, message: dbError.message });
}
res.json({ success: true, id, loader: loadstring(game:HttpGet("${req.protocol}://${req.get("host")}/script/${id}"))() });
});

app.get("/script/:id", async (req, res) => {
const { data } = await supabase.from("scripts").select("*").eq("id", req.params.id).maybeSingle();
if (!data) return res.status(404).send("Script Not Found");

const userAgent = req.get("User-Agent") || "";
if (!/Roblox/i.test(userAgent)) {
return res.status(403).send(`

<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Protected by SEI HUB</title>  <style>body{margin:0;background:#0f172a;font-family:Arial;display:flex;justify-content:center;align-items:center;height:100vh;color:white;}.box{background:#111827;padding:45px;border-radius:20px;text-align:center;box-shadow:0 0 30px #ff000055;width:450px;border:1px solid #ff000033;}h1{color:#ff3344;margin:0;font-size:28px;}p{color:#d1d5db;margin-top:15px;}.code{margin-top:20px;padding:12px;background:#1f2937;border-radius:8px;color:#ff7777;font-size:13px;word-break:break-all;}</style>  </head><body><div class="box"><h1>🛡️ Protected by SEI HUB</h1><p><b>สคริปต์นี้ถูกป้องกันโดย SEI HUB</b></p><p>คุณไม่สามารถดูซอร์สโค้ดผ่าน Browser ได้</p><p>กรุณาใช้ Loader ในเกมเท่านั้น</p><div class="code">${req.protocol}://${req.get("host")}/script/${req.params.id}</div></div></body></html>  
    `);  
  }  const { data: fileBlob, error: dlError } = await supabase.storage.from(BUCKET).download(${req.params.id}.lua);
if (dlError) return res.status(404).send("File Not Found");
const text = await fileBlob.text();
await supabase.from("scripts").update({ downloads: data.downloads + 1 }).eq("id", req.params.id);
res.type("text/plain").send(text);
});

app.get("/scripts", async (req, res) => {
const { data } = await supabase.from("scripts").select("").order("created", { ascending: false });
res.json({ success: true, total: data?.length || 0, scripts: data || [] });
});
app.get("/stats", async (req, res) => {
const { data } = await supabase.from("scripts").select("downloads");
res.json({ success: true, scripts: data?.length || 0, downloads: (data || []).reduce((a,b)=>a+b.downloads,0) });
});
app.get("/search/:name", async (req, res) => {
const { data } = await supabase.from("scripts").select("").ilike("filename", %${req.params.name}%);
res.json({ success: true, total: data?.length || 0, scripts: data || [] });
});
app.get("/list/:owner", async (req, res) => {
const { data } = await supabase.from("scripts").select("").eq("owner", req.params.owner);
res.json({ success: true, total: data?.length || 0, scripts: data || [] });
});
app.get("/info/:id", async (req, res) => {
const { data } = await supabase.from("scripts").select("").eq("id", req.params.id).maybeSingle();
if (!data) return res.status(404).json({ success: false, message: "Not Found" });
res.json({ success: true, data });
});
app.delete("/delete/:id", async (req, res) => {
const owner = req.query.owner;
if (!owner) return res.status(400).json({ success: false, message: "Owner required" });
const { data } = await supabase.from("scripts").select("").eq("id", req.params.id).maybeSingle();
if (!data) return res.status(404).json({ success: false, message: "Script Not Found" });
if (data.owner !== owner) return res.status(403).json({ success: false, message: "Permission Denied" });
await supabase.storage.from(BUCKET).remove([${req.params.id}.lua]);
await supabase.from("scripts").delete().eq("id", req.params.id);
res.json({ success: true, message: "Deleted" });
});
app.post("/update/:id", upload.single("file"), async (req, res) => {
const owner = req.body.owner;
const { data } = await supabase.from("scripts").select("").eq("id", req.params.id).maybeSingle();
if (!data) return res.status(404).json({ success: false });
if (data.owner !== owner) return res.status(403).json({ success: false });
if (!req.file) return res.status(400).json({ success: false, message: "No file" });
const { error } = await supabase.storage.from(BUCKET).upload(${req.params.id}.lua, req.file.buffer, { contentType: "text/plain", upsert: true });
if (error) return res.status(500).json({ success: false, message: error.message });
await supabase.from("scripts").update({ filename: req.file.originalname, size: req.file.size }).eq("id", req.params.id);
res.json({ success: true, loader: loadstring(game:HttpGet("${req.protocol}://${req.get("host")}/script/${req.params.id}"))() });
});

// เช็กการเชื่อมต่อ Supabase
(async () => {
const { error } = await supabase.from("scripts").select("id").limit(1);
if (error) {
console.error("Supabase Error:", error.message);
} else {
console.log("Supabase Connected");
}
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log("Server Running : " + PORT);
});
