import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const app = express();
const port = process.env.PORT || 3000;

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    department: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

const Student = mongoose.model("Student", studentSchema);

const teachers = [
  { id: 1, name: "Ananya Rao", subject: "Mathematics" },
  { id: 2, name: "Kabir Joshi", subject: "Science" },
  { id: 3, name: "Neha Desai", subject: "English" },
];

const staff = [
  { id: 1, name: "Sana Kapoor", role: "Librarian", department: "Library" },
  { id: 2, name: "Dev Malhotra", role: "Nurse", department: "Health Services" },
  { id: 3, name: "Ira Nair", role: "Counselor", department: "Student Support" },
];

const healthCheck = (_request, response) => {
  response.json({ status: "okk" });
};

app.use(express.json());

app.get("/health", healthCheck);

app.get("/api/health", healthCheck);
app.get("/api/students", async (_request, response, next) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 }).lean();
    response.json({
      students: students.map(({ _id, name, grade, department }) => ({
        id: _id.toString(),
        name,
        grade,
        ...(department ? { department } : {}),
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/students", async (request, response, next) => {
  const { name, grade, department } = request.body ?? {};
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof grade !== "string" ||
    !grade.trim() ||
    (department !== undefined && typeof department !== "string")
  ) {
    response.status(400).json({
      error: "Name and grade are required; department must be a string.",
    });
    return;
  }

  try {
    const student = await Student.create({
      name: name.trim(),
      grade: grade.trim(),
      department: department?.trim() ?? "",
    });
    response.status(201).json({
      student: {
        id: student._id.toString(),
        name: student.name,
        grade: student.grade,
        ...(student.department ? { department: student.department } : {}),
      },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/teachers", (_request, response) => {
  response.json({ teachers });
});
app.get("/api/staff", (_request, response) => {
  response.json({ staff });
});

app.use((error, _request, response, _next) => {
  console.error("API request failed:", error);
  response.status(500).json({ error: "An unexpected server error occurred." });
});

async function startServer() {
  const mongoUri =
    process.env.MONGODB_URI;

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log(`Backend server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start backend:", error);
  process.exitCode = 1;
});
