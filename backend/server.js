import express from "express";

const app = express();
const port = process.env.PORT || 3000;

const students = [
  { id: 1, name: "Aarav Shah", grade: "10" },
  { id: 2, name: "Maya Patel", grade: "11" },
  { id: 3, name: "Rohan Mehta", grade: "12" },
];

const teachers = [
  { id: 1, name: "Ananya Rao", subject: "Mathematics" },
  { id: 2, name: "Kabir Joshi", subject: "Science" },
  { id: 3, name: "Neha Desai", subject: "English" },
];

const healthCheck = (_request, response) => {
  response.json({ status: "okk" });
};

app.get("/health", healthCheck);
app.get("/api/health", healthCheck);
app.get("/api/students", (_request, response) => {
  response.json({ students });
});
app.get("/api/teachers", (_request, response) => {
  response.json({ teachers });
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
