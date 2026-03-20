import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// ========================
// SUPABASE CONFIG
// ========================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ========================
// GET ALL TRANSACTIONS
// ========================
app.get("/transactions", async (req, res) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("transaction_date", { ascending: false });

  if (error) return res.status(500).json(error);
  res.json(data);
});

// ========================
// ADD TRANSACTION
// ========================
app.post("/transactions", async (req, res) => {
  const { type, amount, purpose, source, date } = req.body;

  const { error } = await supabase.from("transactions").insert([
    {
      type,
      amount,
      purpose,
      source,
      transaction_date: date,
    },
  ]);

  if (error) return res.status(500).json(error);
  res.json({ message: "Thêm thành công" });
});

// ========================
// DELETE
// ========================
app.delete("/transactions/:id", async (req, res) => {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", req.params.id);

  if (error) return res.status(500).json(error);
  res.json({ message: "Deleted successfully" });
});

// ========================
// UPDATE
// ========================
app.put("/transactions/:id", async (req, res) => {
  const { type, amount, purpose, source, date } = req.body;

  const { error } = await supabase
    .from("transactions")
    .update({
      type,
      amount,
      purpose,
      source,
      transaction_date: date,
    })
    .eq("id", req.params.id);

  if (error) return res.status(500).json(error);
  res.json({ message: "Updated successfully" });
});

// ========================
// SUMMARY
// ========================
app.get("/summary", async (req, res) => {
  const { data, error } = await supabase.from("transactions").select("*");

  if (error) return res.status(500).json(error);

  const totalThu = data
    .filter(t => t.type === "Thu")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalChi = data
    .filter(t => t.type === "Chi")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  res.json({ totalThu, totalChi });
});

// ========================
// BALANCE BY SOURCE
// ========================
app.get("/balance-by-source", async (req, res) => {
  const { data, error } = await supabase.from("transactions").select("*");

  if (error) return res.status(500).json(error);

  const result = {};

  data.forEach(t => {
    if (!result[t.source]) result[t.source] = 0;

    if (t.type === "Thu") result[t.source] += Number(t.amount);
    else result[t.source] -= Number(t.amount);
  });

  res.json(result);
});

// ========================
// PORT (QUAN TRỌNG)
// ========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 Server running on port " + PORT);
});