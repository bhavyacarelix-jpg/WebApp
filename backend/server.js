import express from "express";

const app = express();
const port = process.env.PORT || 3000;

const students = [
  { id: 1, name: "Aarav Shah", grade: "10" },
  { id: 2, name: "Maya Patel", grade: "11" },
  { id: 3, name: "Rohan Mehta", grade: "12" },
];

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/students", (_request, response) => {
  response.json({ students });
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
