import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

app.post("/send-location", (req, res) => {
  console.log("📥 Payload received:", req.body);
  res.json({
    success: true,
    message: "Backend reachable",
    data: req.body,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
