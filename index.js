import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { Resend } from "resend";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

app.post("/send-location", async (req, res) => {
  console.log("📥 /send-location HIT");
  console.log("📦 BODY:", req.body);

  try {
    const {
      latitude,
      longitude,
      accuracy,
      timestamp,
      battery,
      address,
      deviceName,
    } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude & Longitude required",
      });
    }

    const timeString = new Date(timestamp || Date.now()).toLocaleString(
      "en-IN",
      { timeZone: "Asia/Kolkata" }
    );

    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    console.log("✉️ Sending email via Resend...");

    const email = await resend.emails.send({
      from: "Location Tracker <onboarding@resend.dev>",
      to: ["yourmail@gmail.com"], // 👈 change to your email
      subject: "📍 Location Update",
      html: `
        <h2>📡 Location Update</h2>
        <p><b>Time:</b> ${timeString}</p>
        <p><b>Latitude:</b> ${latitude}</p>
        <p><b>Longitude:</b> ${longitude}</p>
        <p><b>Accuracy:</b> ${accuracy ?? "N/A"} meters</p>
        <p><b>Battery:</b> ${battery ?? "N/A"}%</p>
        <p><b>Address:</b> ${address ?? "N/A"}</p>
        <p><a href="${mapsUrl}">👉 View on Google Maps</a></p>
      `,
    });

    console.log("✅ EMAIL SENT:", email.id);

    res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (err) {
    console.error("❌ EMAIL ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("📡 Location Email Server running on Render");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
