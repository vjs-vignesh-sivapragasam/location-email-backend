import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

// ========== CONFIG ==========
// Replace with your actual Gmail and App Password
const EMAIL_USER = 'Vigneshmake28@gmail.com';
const EMAIL_PASS = 'wbys fqex amna galu'; // <-- Paste your Gmail App Password here

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ========== Email Sender ==========
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// ========== Route: POST /send-location ==========
app.post('/send-location', (req, res) => {
  const { lat, lon, device, timestamp } = req.body;

  if (!lat || !lon) {
    return res.status(400).send('Latitude and Longitude are required');
  }

  const deviceName = device || 'Unknown Device';
  const timeString = timestamp
  ? new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;

  const mailOptions = {
    from: EMAIL_USER,
    to: EMAIL_USER,
    subject: `📍 Location from ${deviceName}`,
    html: `
      <h2>📡 Location Update</h2>
      <p><strong>Device:</strong> ${deviceName}</p>
      <p><strong>Time:</strong> ${timeString}</p>
      <p><strong>Latitude:</strong> ${lat}</p>
      <p><strong>Longitude:</strong> ${lon}</p>
      <p><a href="${mapsUrl}" target="_blank">👉 View on Google Maps</a></p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Email Error:', error);
      return res.status(500).send('Email failed to send');
    }
    console.log('✅ Email sent:', info.response);
    res.send('Email sent successfully');
  });
});

// ========== Health Check ==========
app.get('/', (req, res) => {
  res.send('📡 Location Email Server is running');
});

// ========== Start Server ==========
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
