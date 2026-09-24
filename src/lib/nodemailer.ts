// src/lib/nodemailer.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.spacemail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // false untuk port 587 (STARTTLS), true jika menggunakan port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Mengatasi potensi kendala sertifikat SSL/TLS pada server mail custom
    rejectUnauthorized: false,
  },
});