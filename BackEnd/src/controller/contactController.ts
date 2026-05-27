import { Request, Response } from "express";
import nodemailer from "nodemailer";
import Inquiry from "../models/Inquiry";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL as string,
    pass: process.env.EMAIL_PASSWORD as string,
  },
});

export const submitInquiry = async (req: Request, res: Response) => {
  const { fullName, institutionName, email, phone, subject, message } = req.body;

  try {
    // 1. Validation checks
    if (!fullName || !institutionName || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format!",
      });
    }

    // Basic phone validation (allowing digits, spaces, hyphens, plus sign, minimum 7 digits)
    const phoneRegex = /^[+]?[0-9\s-]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format!",
      });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters long!",
      });
    }

    // 2. Save inquiry to MongoDB
    const inquiry = new Inquiry({
      fullName: fullName.trim(),
      institutionName: institutionName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });
    await inquiry.save();

    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully.",
    });

  } catch (error: any) {
    console.error("Error in submitInquiry controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      error: error.message,
    });
  }
};
