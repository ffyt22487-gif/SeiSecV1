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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const BUCKET = process.env.SUPABASE_BUCKET || "scripts";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024
  }
});

function getBaseUrl(req) {
  const forwardedProto = req.get("x-forwarded-proto");

  if (forwardedProto) {
    return `${forwardedProto.split(",")[0].trim()}://${req.get("host")}`;
  }

  return `${req.protocol}://${req.get("host")}`;
}

function getHttpsBaseUrl(req) {
  return `https://${req.get("host")}`;
}

function makeLoader(req, id) {
  return `loadstring(game:HttpGet("${getHttpsBaseUrl(req)}/script/${id}"))()`;
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

/* =========================================================
   HOME
========================================================= */

app.get("/", async (req, res) => {
  try {
    const { data: db, error } = await supabase
      .from("scripts")
      .select("*");

    if (error) {
      console.error("Home Supabase Error:", error.message);
    }

    const scripts = db || [];

    const totalDownloads = scripts.reduce(
      (total, script) => total + Number(script.downloads || 0),
      0
    );

    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SEI HUB</title>

<style>
*{
  box-sizing:border-box;
}

body{
  margin:0;
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  background:
    radial-gradient(circle at top, #172554 0%, #0f172a 45%, #020617 100%);
  font-family:Arial,Helvetica,sans-serif;
  color:white;
}

.box{
  width:min(90%,460px);
  padding:42px 30px;
  border-radius:24px;
  text-align:center;
  background:rgba(15,23,42,.92);
  border:1px solid rgba(59,130,246,.25);
  box-shadow:
    0 20px 70px rgba(0,0,0,.45),
    0 0 40px rgba(0,191,255,.08);
}

.logo{
  width:72px;
  height:72px;
  margin:0 auto 18px;
  border-radius:20px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#020617;
  border:1px solid rgba(59,130,246,.4);
  font-size:36px;
}

h1{
  margin:0;
  font-size:30px;
  letter-spacing:.5px;
}

.subtitle{
  color:#94a3b8;
  margin-top:10px;
}

.stats{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
  margin-top:28px;
}

.stat{
  padding:18px;
  border-radius:16px;
  background:#111827;
  border:1px solid rgba(255,255,255,.06);
}

.stat-number{
  font-size:25px;
  font-weight:bold;
  color:#38bdf8;
}

.stat-label{
  margin-top:5px;
  color:#94a3b8;
  font-size:13px;
}

.footer{
  margin-top:28px;
  color:#64748b;
  font-size:12px;
}
</style>
</head>

<body>

<div class="box">

  <div class="logo">🛡️</div>

  <h1>SEI HUB</h1>

  <div class="subtitle">
    Secure Script Distribution Platform
  </div>

  <div class="stats">

    <div class="stat">
      <div class="stat-number">${scripts.length}</div>
      <div class="stat-label">Scripts</div>
    </div>

    <div class="stat">
      <div class="stat-number">${totalDownloads}</div>
      <div class="stat-label">Downloads</div>
    </div>

  </div>

  <div class="footer">
    Protected by SEI HUB
  </div>

</div>

</body>
</html>
`);
  } catch (error) {
    console.error("Home Error:", error);

    res.status(500).send("Internal Server Error");
  }
});

/* =========================================================
   UPLOAD
========================================================= */

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
          contentType: "text/plain",
          upsert: false
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
      loader: makeLoader(req, id)
    });

  } catch (error) {
    console.error("Upload Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Upload failed"
    });
  }
});

/* =========================================================
   SCRIPT
========================================================= */

app.get("/script/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const { data, error } = await supabase
      .from("scripts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Script DB Error:", error.message);

      return res.status(500).send("Database Error");
    }

    if (!data) {
      return res.status(404).send("Script Not Found");
    }

    const userAgent = req.get("User-Agent") || "";

    /*
      Browser protection
    */

    if (!/Roblox/i.test(userAgent)) {

      return res.status(403).send(`
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1.0"
>

<title>Protected Script | SEI HUB</title>

<style>

*{
  box-sizing:border-box;
}

body{
  margin:0;
  min-height:100vh;

  display:flex;
  align-items:center;
  justify-content:center;

  padding:24px;

  background:
    radial-gradient(
      circle at top,
      #172554 0%,
      #0f172a 45%,
      #020617 100%
    );

  color:white;

  font-family:
    Inter,
    Arial,
    Helvetica,
    sans-serif;
}

.card{
  width:min(100%,470px);

  padding:36px 28px;

  text-align:center;

  background:
    rgba(15,23,42,.94);

  border:
    1px solid rgba(96,165,250,.18);

  border-radius:24px;

  box-shadow:
    0 25px 80px rgba(0,0,0,.55),
    0 0 50px rgba(37,99,235,.08);

  backdrop-filter:blur(12px);
}

.icon{
  width:76px;
  height:76px;

  margin:0 auto 20px;

  display:flex;
  align-items:center;
  justify-content:center;

  border-radius:22px;

  background:
    linear-gradient(
      145deg,
      #172554,
      #0f172a
    );

  border:
    1px solid rgba(96,165,250,.25);

  font-size:36px;

  box-shadow:
    0 10px 30px rgba(0,0,0,.35);
}

.badge{
  display:inline-block;

  padding:6px 12px;

  margin-bottom:14px;

  border-radius:999px;

  background:rgba(59,130,246,.12);

  color:#60a5fa;

  font-size:12px;

  font-weight:700;

  letter-spacing:.6px;
}

h1{
  margin:0;

  font-size:27px;
}

.description{
  margin:13px 0 0;

  color:#94a3b8;

  line-height:1.7;

  font-size:14px;
}

.info{
  margin-top:25px;

  padding:16px;

  border-radius:15px;

  background:#0b1220;

  border:
    1px solid rgba(255,255,255,.06);
}

.info-title{
  font-size:12px;

  color:#64748b;

  margin-bottom:7px;
}

.info-text{
  color:#cbd5e1;

  font-size:13px;

  line-height:1.5;
}

.status{
  margin-top:18px;

  display:flex;

  align-items:center;

  justify-content:center;

  gap:8px;

  color:#94a3b8;

  font-size:12px;
}

.dot{
  width:7px;
  height:7px;

  border-radius:50%;

  background:#22c55e;

  box-shadow:
    0 0 10px #22c55e;
}

.footer{
  margin-top:25px;

  color:#475569;

  font-size:11px;

  letter-spacing:.3px;
}

</style>

</head>

<body>

<div class="card">

  <div class="icon">
    🛡️
  </div>

  <div class="badge">
    PROTECTED SCRIPT
  </div>

  <h1>
    SEI HUB
  </h1>

  <p class="description">
    This script is protected by SEI HUB
    and cannot be viewed directly in a web browser.
  </p>

  <div class="info">

    <div class="info-title">
      ACCESS RESTRICTED
    </div>

    <div class="info-text">
      Source code access is restricted.
      Please use the provided Loader inside Roblox.
    </div>

  </div>

  <div class="status">

    <span class="dot"></span>

    Script protection is active

  </div>

  <div class="footer">
    SEI HUB • Secure Script Distribution
  </div>

</div>

</body>

</html>
`);

    }

    /*
      Roblox request
    */

    const {
      data: fileBlob,
      error: downloadError
    } = await supabase.storage
      .from(BUCKET)
      .download(`${id}.lua`);

    if (downloadError) {
      console.error(
        "Storage Download Error:",
        downloadError.message
      );

      return res.status(404).send("File Not Found");
    }

    const text = await fileBlob.text();

    await supabase
      .from("scripts")
      .update({
        downloads: Number(data.downloads || 0) + 1
      })
      .eq("id", id);

    res
      .type("text/plain")
      .send(text);

  } catch (error) {
    console.error("Script Error:", error);

    res.status(500).send("Internal Server Error");
  }
});

/* =========================================================
   ALL SCRIPTS
========================================================= */

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
      message: error.message
    });
  }
});

/* =========================================================
   STATS
========================================================= */

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
      (total, item) =>
        total + Number(item.downloads || 0),
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
      message: error.message
    });
  }
});

/* =========================================================
   SEARCH
========================================================= */

app.get("/search/:name", async (req, res) => {
  try {
    const { data, error } = await supabase
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
      message: error.message
    });
  }
});

/* =========================================================
   LIST BY OWNER
========================================================= */

app.get("/list/:owner", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("scripts")
      .select("*")
      .eq("owner", req.params.owner);

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
      message: error.message
    });
  }
});

/* =========================================================
   INFO
========================================================= */

app.get("/info/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const { data, error } = await supabase
      .from("scripts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(
        "Info Supabase Error:",
        error.message
      );

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

    /*
      สร้าง Loader จาก ID โดยตรง
      ไม่จำเป็นต้องเพิ่ม column loader ใน Supabase
    */

    const loader = makeLoader(req, id);

    res.json({
      success: true,

      data: {
        ...data,
        loader
      }
    });

  } catch (error) {
    console.error("Info Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/* =========================================================
   DELETE
========================================================= */

app.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
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
        .remove([`${id}.lua`]);

    if (storageError) {
      console.error(
        "Storage Delete Error:",
        storageError.message
      );
    }

    const { error: dbError } =
      await supabase
        .from("scripts")
        .delete()
        .eq("id", id);

    if (dbError) {
      return res.status(500).json({
        success: false,
        message: dbError.message
      });
    }

    res.json({
      success: true,
      message: "Deleted"
    });

  } catch (error) {
    console.error("Delete Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/* =========================================================
   UPDATE
========================================================= */

app.post(
  "/update/:id",
  upload.single("file"),
  async (req, res) => {

    try {

      const id = req.params.id;
      const owner = req.body.owner;

      const { data, error } = await supabase
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

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file"
        });
      }

      const {
        error: storageError
      } = await supabase.storage
        .from(BUCKET)
        .upload(
          `${id}.lua`,
          req.file.buffer,
          {
            contentType: "text/plain",
            upsert: true
          }
        );

      if (storageError) {
        return res.status(500).json({
          success: false,
          message: storageError.message
        });
      }

      const {
        error: updateError
      } = await supabase
        .from("scripts")
        .update({
          filename: req.file.originalname,
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
        loader: makeLoader(req, id)
      });

    } catch (error) {

      console.error(
        "Update Error:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/* =========================================================
   SUPABASE TEST
========================================================= */

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
      "Supabase Connection Error:",
      error.message
    );

  }

})();

/* =========================================================
   SERVER
========================================================= */

const PORT =
  process.env.PORT || 3000;

app.listen(
  PORT,
  () => {
    console.log(
      "Server Running : " + PORT
    );
  }
);
