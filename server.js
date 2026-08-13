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
);

const BUCKET = process.env.SUPABASE_BUCKET || "scripts";

const BASE_URL = (
  process.env.BASE_URL || "https://ui-f.onrender.com"
).replace(/\/+$/, "");

const LOGO_URL =
  "https://cdn.discordapp.com/attachments/1448285099421335623/1537103402314502266/83_20260811161648.png?ex=6a7e7b59&is=6a7d29d9&hm=42ce3e94389bc1852b1d676f81a93c797a91963fa416369e11e0286abc78424f&";

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

    if (error) {
      throw error;
    }

    if (!data) {
      return id;
    }
  }
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
      (total, script) => total + Number(script.downloads || 0),
      0
    );

    res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SEI HUB</title>
<style>
*{box-sizing:border-box}
body{
margin:0;
min-height:100vh;
background:
radial-gradient(circle at 50% 10%,#123b8f 0%,#08152f 35%,#020817 80%);
font-family:Arial,sans-serif;
display:flex;
align-items:center;
justify-content:center;
color:white;
padding:25px;
}
.box{
width:100%;
max-width:520px;
background:rgba(10,22,45,.9);
border:1px solid rgba(70,130,255,.3);
border-radius:28px;
padding:45px 35px;
text-align:center;
box-shadow:
0 0 70px rgba(0,110,255,.14),
inset 0 0 40px rgba(40,100,255,.04);
}
.logo{
width:135px;
height:135px;
object-fit:contain;
margin-bottom:25px;
filter:drop-shadow(0 0 25px rgba(0,130,255,.45));
}
.badge{
display:inline-block;
padding:10px 22px;
border-radius:30px;
background:rgba(30,100,255,.15);
border:1px solid rgba(80,150,255,.25);
color:#63a9ff;
font-size:14px;
font-weight:bold;
letter-spacing:1px;
}
h1{
margin:20px 0 10px;
font-size:40px;
}
p{
color:#94a3b8;
font-size:17px;
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
}
.footer{
margin-top:30px;
font-size:13px;
color:#475569;
}
</style>
</head>
<body>
<div class="box">
<img class="logo" src="${LOGO_URL}" alt="SEI HUB">
<div class="badge">SECURE SCRIPT DISTRIBUTION</div>
<h1>SEI HUB</h1>
<p>Secure script distribution platform</p>
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
<div class="footer">SEI HUB • Secure Script Distribution</div>
</div>
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

    if (!req.file.originalname || !req.file.originalname.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid filename"
      });
    }

    const { data: exists, error: existsError } = await supabase
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

    const { error: uploadError } = await supabase.storage
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

    const { error: dbError } = await supabase
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

    const { data, error } = await supabase
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

    const userAgent = req.get("User-Agent") || "";

    if (!/Roblox/i.test(userAgent)) {
      return res.status(403).send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Protected Script</title>
<style>
*{box-sizing:border-box}
body{
margin:0;
min-height:100vh;
background:
radial-gradient(circle at 50% 10%,#123b8f 0%,#08152f 35%,#020817 80%);
font-family:Arial,sans-serif;
color:white;
display:flex;
align-items:center;
justify-content:center;
padding:25px;
}
.box{
width:100%;
max-width:520px;
padding:45px 35px;
text-align:center;
border-radius:28px;
background:rgba(10,22,45,.9);
border:1px solid rgba(70,130,255,.35);
box-shadow:
0 0 70px rgba(0,110,255,.16),
inset 0 0 40px rgba(30,100,255,.04);
}
.logo{
width:150px;
height:150px;
object-fit:contain;
margin-bottom:25px;
filter:drop-shadow(0 0 25px rgba(0,130,255,.5));
}
.badge{
display:inline-block;
padding:10px 22px;
border-radius:30px;
background:rgba(30,100,255,.15);
border:1px solid rgba(80,150,255,.25);
color:#63a9ff;
font-weight:bold;
letter-spacing:1px;
font-size:14px;
}
h1{
margin:22px 0 12px;
font-size:38px;
}
.desc{
color:#94a3b8;
font-size:17px;
line-height:1.7;
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
}
.active{
margin-top:25px;
color:#4ade80;
font-size:14px;
}
.dot{
display:inline-block;
width:9px;
height:9px;
background:#22c55e;
border-radius:50%;
margin-right:8px;
box-shadow:0 0 12px #22c55e;
}
.footer{
margin-top:35px;
color:#475569;
font-size:13px;
}
</style>
</head>
<body>
<div class="box">
<img class="logo" src="${LOGO_URL}" alt="SEI HUB">
<div class="badge">PROTECTED SCRIPT</div>
<h1>SEI HUB</h1>
<div class="desc">
Secure script distribution system
</div>
<div class="status">
<div class="status-title">ACCESS PROTECTED</div>
<div class="status-text">
This resource is protected by SEI HUB.
</div>
</div>
<div class="active">
<span class="dot"></span>
Protection Active
</div>
<div class="footer">
SEI HUB • Secure Script Distribution
</div>
</div>
</body>
</html>
`);
    }

    const { data: fileBlob, error: dlError } = await supabase.storage
      .from(BUCKET)
      .download(`${id}.lua`);

    if (dlError) {
      return res.status(404).send("File Not Found");
    }

    const text = await fileBlob.text();

    await supabase
      .from("scripts")
      .update({
        downloads: Number(data.downloads || 0) + 1
      })
      .eq("id", id);

    res.type("text/plain").send(text);
  } catch (error) {
    console.error("Script Error:", error.message);
    res.status(500).send("Server Error");
  }
});

app.get("/scripts", async (req, res) => {
  try {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from("scripts")
      .select("downloads");

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    const downloads = (data || []).reduce(
      (total, script) => total + Number(script.downloads || 0),
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
    const { data, error } = await supabase
      .from("scripts")
      .select("*")
      .ilike("filename", `%${req.params.name}%`);

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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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

    const { data, error } = await supabase
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

    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([`${req.params.id}.lua`]);

    if (storageError) {
      return res.status(500).json({
        success: false,
        message: storageError.message
      });
    }

    const { error: deleteError } = await supabase
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

app.post("/update/:id", upload.single("file"), async (req, res) => {
  try {
    const owner = req.body.owner;

    const { data, error: findError } = await supabase
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

    const { error: uploadError } = await supabase.storage
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

    const { error: updateError } = await supabase
      .from("scripts")
      .update({
        filename: req.file.originalname,
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
    console.error("Update Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Update failed"
    });
  }
});

(async () => {
  try {
    const { error } = await supabase
      .from("scripts")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Supabase Error:", error.message);
    } else {
      console.log("Supabase Connected");
    }
  } catch (error) {
    console.error("Supabase Error:", error.message);
  }
})();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server Running : " + PORT);
});
