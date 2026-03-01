const express = require("express");
const cors = require("cors");
const sql = require("mssql");

const app = express();
app.use(cors());
app.use(express.json());

/* ========================
   CẤU HÌNH SQL SERVER
======================== */

const config = {
  user: "sa",              // đổi theo máy m
  password: "1234",      // đổi password SQL Server
  server: "localhost",
  database: "MoneyManager",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

/* ========================
   THÊM GIAO DỊCH
======================== */

app.post("/transactions", async (req, res) => {
  try {
    const { type, amount, purpose, source, date } = req.body;

    await sql.connect(config);

    await sql.query`
      INSERT INTO Transactions (Type, Amount, Purpose, Source, TransactionDate)
      VALUES (${type}, ${amount}, ${purpose}, ${source}, ${date})
    `;

    res.json({ message: "Thêm thành công" });

  } catch (err) {
    res.status(500).send(err);
  }
});

/* ========================
   LẤY DANH SÁCH + LỌC
======================== */

app.get("/transactions", async (req, res) => {
  try {
    const { year, month, day } = req.query;

    await sql.connect(config);

    let query = "SELECT * FROM Transactions WHERE 1=1";

    if (year) query += ` AND YEAR(TransactionDate) = ${year}`;
    if (month) query += ` AND MONTH(TransactionDate) = ${month}`;
    if (day) query += ` AND DAY(TransactionDate) = ${day}`;

    const result = await sql.query(query);

    res.json(result.recordset);

  } catch (err) {
    res.status(500).send(err);
  }
});

/* ========================
   TÍNH TỔNG
======================== */

app.get("/summary", async (req, res) => {
  try {
    await sql.connect(config);

    const result = await sql.query(`
      SELECT 
        SUM(CASE WHEN Type = N'Thu' THEN Amount ELSE 0 END) AS TotalThu,
        SUM(CASE WHEN Type = N'Chi' THEN Amount ELSE 0 END) AS TotalChi
      FROM Transactions
    `);

    res.json(result.recordset[0]);

  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/balance-by-source", async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT 
        Source,
        SUM(CASE 
              WHEN Type = N'Thu' THEN Amount 
              ELSE -Amount 
            END) AS Balance
      FROM Transactions
      GROUP BY Source
    `);

    res.json(result.recordset);

  } catch (err) {
    console.log("🔥 ERROR:", err);
    res.status(500).send("Server Error");
  }
});
/* ========================
   DELETE
======================== */
app.delete("/transactions/:id", async (req, res) => {
  try {
    await sql.query`
      DELETE FROM Transactions WHERE Id = ${req.params.id}
    `;
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.log("🔥 ERROR:", err);
    res.status(500).send("Server Error");
  }
});
/* ========================
   UPDATE
======================== */
app.put("/transactions/:id", async (req, res) => {
  try {
    const { type, amount, purpose, source, date } = req.body;

    await sql.query`
      UPDATE Transactions
      SET Type = ${type},
          Amount = ${amount},
          Purpose = ${purpose},
          Source = ${source},
          TransactionDate = ${date}
      WHERE Id = ${req.params.id}
    `;

    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.log("🔥 ERROR:", err);
    res.status(500).send("Server Error");
  }
});
app.listen(5000, () => console.log("🔥 Server chạy tại http://localhost:5000"));