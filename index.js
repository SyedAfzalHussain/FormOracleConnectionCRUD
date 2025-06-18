import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import path from "path";
import sql from "./db.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve UI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// --- AUTH ---
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await sql`
            SELECT student_id, name, email FROM students WHERE email = ${email} AND password = ${password}
        `;
    if (result.length > 0) {
      res.json({ message: "Login successful", user: result[0] });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    await sql`
            INSERT INTO students (name, email, password) VALUES (${name}, ${email}, ${password})
        `;
    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --- STUDENTS ---
app.get("/students", async (req, res) => {
  try {
    const students =
      await sql`SELECT student_id, name, email, date_of_birth FROM students`;
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
app.post("/students", async (req, res) => {
  const { name, email, date_of_birth } = req.body;
  try {
    await sql`INSERT INTO students (name, email, date_of_birth) VALUES (${name}, ${email}, ${date_of_birth})`;
    res.json({ message: "Student added" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
app.delete("/students/:id", async (req, res) => {
  try {
    await sql`DELETE FROM students WHERE student_id = ${req.params.id}`;
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --- TEACHERS ---
app.get("/teachers", async (req, res) => {
  try {
    const teachers = await sql`SELECT teacher_id, name, email FROM teachers`;
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
app.post("/teachers", async (req, res) => {
  const { name, email } = req.body;
  try {
    await sql`INSERT INTO teachers (name, email) VALUES (${name}, ${email})`;
    res.json({ message: "Teacher added" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
app.delete("/teachers/:id", async (req, res) => {
  try {
    await sql`DELETE FROM teachers WHERE teacher_id = ${req.params.id}`;
    res.json({ message: "Teacher deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --- SUBJECTS ---
app.get("/subjects", async (req, res) => {
  try {
    const subjects =
      await sql`SELECT subject_id, name, description FROM subjects`;
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
app.post("/subjects", async (req, res) => {
  const { name, description } = req.body;
  try {
    await sql`INSERT INTO subjects (name, description) VALUES (${name}, ${description})`;
    res.json({ message: "Subject added" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
app.delete("/subjects/:id", async (req, res) => {
  try {
    await sql`DELETE FROM subjects WHERE subject_id = ${req.params.id}`;
    res.json({ message: "Subject deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --- CLASSES ---
app.get("/classes", async (req, res) => {
  try {
    const classes = await sql`
            SELECT c.class_id, c.name, t.name AS teacher, s.name AS subject
            FROM classes c
            LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
            LEFT JOIN subjects s ON c.subject_id = s.subject_id
        `;
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
app.post("/classes", async (req, res) => {
  const { name, teacher_id, subject_id } = req.body;
  try {
    await sql`INSERT INTO classes (name, teacher_id, subject_id) VALUES (${name}, ${teacher_id}, ${subject_id})`;
    res.json({ message: "Class added" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
app.delete("/classes/:id", async (req, res) => {
  try {
    await sql`DELETE FROM classes WHERE class_id = ${req.params.id}`;
    res.json({ message: "Class deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --- ENROLLMENTS ---
app.get("/enrollments", async (req, res) => {
  try {
    const enrollments = await sql`
            SELECT e.enrollment_id, st.name AS student, c.name AS class, e.enrollment_date
            FROM enrollments e
            LEFT JOIN students st ON e.student_id = st.student_id
            LEFT JOIN classes c ON e.class_id = c.class_id
        `;
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
app.post("/enrollments", async (req, res) => {
  const { student_id, class_id } = req.body;
  try {
    await sql`INSERT INTO enrollments (student_id, class_id) VALUES (${student_id}, ${class_id})`;
    res.json({ message: "Enrollment added" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
app.delete("/enrollments/:id", async (req, res) => {
  try {
    await sql`DELETE FROM enrollments WHERE enrollment_id = ${req.params.id}`;
    res.json({ message: "Enrollment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --- JOIN ENDPOINTS ---
// 1. All students in a class (with class, teacher, subject info)
app.get("/class-students/:class_id", async (req, res) => {
  try {
    const rows = await sql`
      SELECT st.student_id, st.name AS student_name, st.email AS student_email, st.date_of_birth,
             c.class_id, c.name AS class_name,
             t.teacher_id, t.name AS teacher_name,
             s.subject_id, s.name AS subject_name
      FROM enrollments e
      JOIN students st ON e.student_id = st.student_id
      JOIN classes c ON e.class_id = c.class_id
      LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
      LEFT JOIN subjects s ON c.subject_id = s.subject_id
      WHERE c.class_id = ${req.params.class_id}
    `;
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// 2. All classes a student is enrolled in (with teacher, subject info)
app.get("/student-classes/:student_id", async (req, res) => {
  try {
    const rows = await sql`
      SELECT c.class_id, c.name AS class_name,
             t.teacher_id, t.name AS teacher_name,
             s.subject_id, s.name AS subject_name
      FROM enrollments e
      JOIN classes c ON e.class_id = c.class_id
      LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
      LEFT JOIN subjects s ON c.subject_id = s.subject_id
      WHERE e.student_id = ${req.params.student_id}
    `;
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// 3. All enrollments with student, class, teacher, subject info
app.get("/enrollments-joined", async (req, res) => {
  try {
    const rows = await sql`
      SELECT e.enrollment_id, e.enrollment_date,
             st.student_id, st.name AS student_name,
             c.class_id, c.name AS class_name,
             t.teacher_id, t.name AS teacher_name,
             s.subject_id, s.name AS subject_name
      FROM enrollments e
      JOIN students st ON e.student_id = st.student_id
      JOIN classes c ON e.class_id = c.class_id
      LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
      LEFT JOIN subjects s ON c.subject_id = s.subject_id
    `;
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --- SERVER ---
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

// for oracle database we can get the table name using
// select table_name from user_tables;
// Then we can get the column names using
// select column_name from user_tab_columns where table_name = 'table_name';
// Then we can get the data using
// select column_name_here from table_name;
// To insert data we can use
// insert into table_name (column_name_here) values ('value_here');
