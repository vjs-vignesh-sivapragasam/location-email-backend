// index.js

import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";

// Load environment variables
dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
// const APP_SECRET_KEY = process.env.APP_SECRET_KEY; // optional, disabled for now

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================
// SMTP CONFIG
// ============================
console.log("📧 Initializing mail transporter...");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Verify SMTP on startup
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP VERIFY FAILED:", err);
  } else {
    console.log("✅ SMTP SERVER READY");
  }
});

// ============================
// LOCATION ENDPOINT
// ============================
app.post("/send-location", async (req, res) => {
  console.log("📥 /send-location HIT");
  console.log("📦 RAW BODY:", req.body);

  try {
    // Accept frontend payload
    const {
      latitude,
      longitude,
      deviceName,
      timestamp,
      battery,
      accuracy,
      address,
      // key,
    } = req.body;

    // 🔐 API key check (disabled for now)
    /*
    if (key !== APP_SECRET_KEY) {
      console.warn("🚫 Invalid API key");
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    */

    if (!latitude || !longitude) {
      console.warn("⚠️ Missing coordinates");
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude are required",
      });
    }

    const device = deviceName || "Unknown Device";
    const batteryLevel = battery !== undefined ? `${battery}%` : "N/A";
    const accuracyMeters = accuracy !== undefined ? `${accuracy} meters` : "N/A";
    const readableAddress = address || "Address not available";

    const timeString = new Date(timestamp || Date.now()).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
    });

    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    const mailOptions = {
      from: EMAIL_USER,
      to: EMAIL_USER,
      subject: `📍 Location from ${device}`,
      html: `
        <h2>📡 Location Update</h2>
        <p><strong>Device:</strong> ${device}</p>
        <p><strong>Time:</strong> ${timeString}</p>
        <p><strong>Battery:</strong> ${batteryLevel}</p>
        <p><strong>Accuracy:</strong> ${accuracyMeters}</p>
        <p><strong>Address:</strong> ${readableAddress}</p>
        <p><strong>Latitude:</strong> ${latitude}</p>
        <p><strong>Longitude:</strong> ${longitude}</p>
        <p><a href="${mapsUrl}" target="_blank">👉 View on Google Maps</a></p>
      `,
    };

    console.log("✉️ Sending email...");
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ EMAIL SENT:", info.response);

    res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("❌ EMAIL SEND ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================
// HEALTH CHECK
// ============================
app.get("/", (req, res) => {
  res.send("📡 Location Email Server is running");
});

// ============================
// START SERVER
// ============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
