import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // 1. IMPORT jsonwebtoken
import { createUser, getUserByEmail, verifyUser } from '../models/User.js';
import nodemailer from 'nodemailer';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Configure Nodemailer (use Gmail or any SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS  // app password if using Gmail
  }
});

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  try {
    const existing = await getUserByEmail(email);
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otp_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await createUser({ username, email, password: hashedPassword, otp, otp_expires });

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Smart Timetable Registration',
      text: `Hello ${username}, your OTP is ${otp}. It expires in 10 minutes.`
    });

    res.json({ success: true, message: 'OTP sent to email', email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

  try {
    const user = await getUserByEmail(email);
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.is_verified) return res.status(400).json({ message: 'User already verified' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > user.otp_expires) return res.status(400).json({ message: 'OTP expired' });

    await verifyUser(email);
    res.json({ success: true, message: 'User verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { email: rawEmail, password } = req.body;
  console.log('Login attempt for email (raw):', rawEmail);

  const email = String(rawEmail || '').trim();
  console.log('Normalized email used for lookup:', email);

  try {
    const user = await getUserByEmail(email);
    // console.log('DB returned user:', user ? { id: user.id, email: user.email, is_verified: user.is_verified } : null);
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (!user.is_verified) return res.status(400).json({ message: 'User not verified yet' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Incorrect password' });

    // success...
    return res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
