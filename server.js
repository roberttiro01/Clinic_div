const express = require("express");
const mysql = require("mysql");


const app = express();
app.use(express.json());


// msql connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",        // change if needed
  password: "",        // change if needed
  database: "clinicdeped_db"
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error("MySQL connection failed:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// Get all patients
app.get("/patients", (req, res) => {
  const sql = `SELECT * FROM patients ORDER BY ID DESC`;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json(results);
  });
});

//Get patient by ID
app.get("/patients/:id", (req, res) => {
  const { id } = req.params;

  const sql = `SELECT * FROM patients WHERE ID = ?`;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({
        error: "Patient not found"
      });
    }

    res.status(200).json({
      patient: results[0]
    });
  });
});

//  Create patient
app.post("/patients", (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      error: "Request body is required. Please send JSON data with Content-Type: application/json"
    });
  }

  const { name, age, sex, address, date, prescription } = req.body;

  if (!name || !age || !sex || !address || !date || !prescription) {
    return res.status(400).json({
      error: "All fields are required"
    });
  }

  const sql = `
    INSERT INTO patients (Name, Age, Sex, Address, Date, prescription)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, age, sex, address, date, prescription], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      message: "Patient record saved",
      patient_id: result.insertId
    });
  });
});

//Update patient
app.put("/patients/:id", (req, res) => {
  const { id } = req.params;

  if (!req.body) {
    return res.status(400).json({
      error: "Request body is required. Please send JSON data with Content-Type: application/json"
    });
  }

  const { name, age, sex, address, date, prescription } = req.body;

  if (!name || !age || !sex || !address || !date || !prescription) {
    return res.status(400).json({
      error: "All fields are required"
    });
  }

  const sql = `
    UPDATE patients 
    SET Name = ?, Age = ?, Sex = ?, Address = ?, Date = ?, prescription = ?
    WHERE ID = ?
  `;

  db.query(sql, [name, age, sex, address, date, prescription, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Patient not found"
      });
    }

    res.status(200).json({
      message: "Patient record updated successfully"
    });
  });
});

// 🔹 DELETE: Delete patient by ID
app.delete("/patients/:id", (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM patients WHERE ID = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Patient not found"
      });
    }

    res.status(200).json({
      message: "Patient record deleted successfully"
    });
  });
});

// Error handler for JSON parsing errors 
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: "Invalid JSON format in request body",
      details: err.message
    });
  }
  next(err);
});

// Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
