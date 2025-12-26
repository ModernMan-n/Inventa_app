require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/api/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email+password required" });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "user exists" });
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashed, name },
  });
  res.json({ id: user.id, email: user.email });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email+password required" });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "invalid" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "invalid" });
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

app.get("/api/me", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).end();
  const token = auth.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (e) {
    res.status(401).end();
  }
});

// Labels endpoints (simple CRUD)
app.get("/api/labels", async (req, res) => {
  const labels = await prisma.label.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(labels);
});

app.post("/api/labels", async (req, res) => {
  const { title, inventoryNo, barcodeBase64 } = req.body;
  if (!title || !inventoryNo)
    return res.status(400).json({ error: "title+inventoryNo required" });
  const label = await prisma.label.create({
    data: { title, inventoryNo, barcodeBase64 },
  });
  res.json(label);
});

app.delete("/api/labels/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.label.delete({ where: { id } });
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

// --- Dynamic models endpoints (admin) ---
function validName(n) {
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(n);
}

app.post("/api/models", async (req, res) => {
  // body: { name: 'inventory', columns: [{ name:'title', type:'text' }, ...] }
  try {
    const { name, columns } = req.body;
    if (!name || !validName(name))
      return res.status(400).json({ error: "invalid name" });
    if (!Array.isArray(columns) || columns.length === 0)
      return res.status(400).json({ error: "columns required" });
    const table = `dyn_${name}`;
    // build SQL
    const colsSql = columns
      .map((c) => {
        if (!c.name || !validName(c.name))
          throw new Error("invalid column name");
        const t = (c.type || "text").toLowerCase();
        const sqlType =
          t === "integer"
            ? "integer"
            : t === "boolean"
            ? "boolean"
            : t === "datetime"
            ? "timestamp"
            : "text";
        return `"${c.name}" ${sqlType}`;
      })
      .join(", ");
    const sql = `CREATE TABLE IF NOT EXISTS "${table}" (id serial primary key, ${colsSql}, created_at timestamp default now())`;
    await prisma.$executeRawUnsafe(sql);
    res.json({ ok: true, table });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/models", async (req, res) => {
  try {
    const rows = await prisma.$queryRawUnsafe(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'dyn_%' ORDER BY table_name"
    );
    res.json(rows.map((r) => r.table_name));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/models/:name/rows", async (req, res) => {
  try {
    const name = req.params.name;
    if (!validName(name))
      return res.status(400).json({ error: "invalid name" });
    const table = `dyn_${name}`;
    const rows = await prisma.$queryRawUnsafe(
      `SELECT * FROM "${table}" ORDER BY id DESC LIMIT 200`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/models/:name/rows", async (req, res) => {
  try {
    const name = req.params.name;
    if (!validName(name))
      return res.status(400).json({ error: "invalid name" });
    const table = `dyn_${name}`;
    const data = req.body || {};
    const keys = Object.keys(data).filter((k) => validName(k));
    if (keys.length === 0) return res.status(400).json({ error: "no columns" });
    const cols = keys.map((k) => `"${k}"`).join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const values = keys.map((k) => data[k]);
    // Use parameterized query via $queryRawUnsafe (values passed separately)
    const sql = `INSERT INTO "${table}" (${cols}) VALUES (${placeholders}) RETURNING *`;
    const row = await prisma.$queryRawUnsafe(sql, ...values);
    res.json(row[0] || row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/models/:name/rows/:id", async (req, res) => {
  try {
    const name = req.params.name;
    const id = Number(req.params.id);
    if (!validName(name) || !Number.isFinite(id))
      return res.status(400).json({ error: "invalid" });
    const table = `dyn_${name}`;
    await prisma.$executeRawUnsafe(`DELETE FROM "${table}" WHERE id = $1`, id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});
