import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// use this email & app password
const EMAIL_USER = "Vigneshmake28@gmail.com";
const EMAIL_PASS = "wbys fqex amna galu"; // <-- paste your Gmail app password

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
  const { lat, lon } = req.body;

  const mailOptions = {
    from: EMAIL_USER,
    to: EMAIL_USER,
    subject: "📍 Location Update",
    text: `Latitude: ${lat}, Longitude: ${lon}, Time: ${new Date().toLocaleString()}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Email error:", error);
      return res.status(500).send("Email failed");
    }
    console.log("✅ Email sent:", info.response);
    res.send("Email sent successfully");
  });
});

app.get("/", (req, res) => res.send("📡 Location Email Server is online"));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
