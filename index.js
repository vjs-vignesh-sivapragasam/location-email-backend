import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const EMAIL_USER = 'Vigneshmake28@gmail.com';
const EMAIL_PASS = 'wbys fqex amna galu'; // Your Gmail App Password

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

app.post('/send-location', (req, res) => {
  const { lat, lon, device, timestamp, battery, accuracy, address } = req.body;

  if (!lat || !lon) {
    return res.status(400).send('Latitude and Longitude are required');
  }

  const deviceName = device || 'Unknown Device';
  const batteryLevel = battery !== undefined ? `${battery}%` : 'N/A';
  const accuracyMeters = accuracy !== undefined ? `${accuracy} meters` : 'N/A';
  const readableAddress = address || 'Address not available';

const time = new Date(timestamp || Date.now());
const timeString = new Date(Number(timestamp)).toLocaleString('en-IN', {
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
      console.error('❌ Email Error:', error);
      return res.status(500).send('Email failed to send');
    }
    console.log('✅ Email sent:', info.response);
    res.send('Email sent successfully');
  });
});

app.get('/', (req, res) => {
  res.send('📡 Location Email Server is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
