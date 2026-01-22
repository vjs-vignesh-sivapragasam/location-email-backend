// index.js

import dotenv from 'dotenv';
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const APP_SECRET_KEY = process.env.APP_SECRET_KEY;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup nodemailer with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Location report endpoint
app.post('/send-location', (req, res) => {
  const { lat, lon, device, timestamp, battery, accuracy, address, key } = req.body;

  // Validate secret key
  if (key !== APP_SECRET_KEY) {
    return res.status(403).send('Unauthorized: Invalid API key');
  }

  if (!lat || !lon) {
    return res.status(400).send('Latitude and Longitude are required');
  }

  const deviceName = device || 'Unknown Device';
  const batteryLevel = battery !== undefined ? `${battery}%` : 'N/A';
  const accuracyMeters = accuracy !== undefined ? `${accuracy} meters` : 'N/A';
  const readableAddress = address || 'Address not available';

  const timeString = new Date(Number(timestamp || Date.now())).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
  });

  const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;

  const mailOptions = {
    from: EMAIL_USER,
    to: EMAIL_USER,
    subject: `📍 Location from ${deviceName}`,
    html: `
      <h2>📡 Location Update</h2>
      <p><strong>Device:</strong> ${deviceName}</p>
      <p><strong>Time:</strong> ${timeString}</p>
      <p><strong>Battery:</strong> ${batteryLevel}</p>
      <p><strong>Accuracy:</strong> ${accuracyMeters}</p>
      <p><strong>Address:</strong> ${readableAddress}</p>
      <p><strong>Latitude:</strong> ${lat}</p>
      <p><strong>Longitude:</strong> ${lon}</p>
      <p><a href="${mapsUrl}" target="_blank">👉 View on Google Maps</a></p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Email Error FULL:', error);
      console.error('❌ Email Error MESSAGE:', error.message);
       return res.status(500).json({
      success: false,
      error: error.message,
    });
    }
    console.log('✅ Email sent:', info.response);
    res.send('Email sent successfully');
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('📡 Location Email Server is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
