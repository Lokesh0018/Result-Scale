import { Request, Response } from "express";
import nodemailer from "nodemailer";
import Inquiry from "../models/Inquiry";
import QuotationRequest from "../models/QuotationRequest";
import { LogActivity } from "../service/logService";

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
    if (process.env.SERVER_TYPE !== "render") {
      return res.status(400).json({ success: false, message: "Contact messages must be submitted to the Render API." });
    }

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

    // 2. Save contact message to the Render-owned datastore
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

export const submitQuotationRequest = async (req: Request, res: Response) => {
  const {
    institutionName,
    contactPerson,
    email,
    phone,
    studentCount,
    accessDurationDays,
    expectedReleaseDate,
    otpRequired,
    marksMemoRequired,
  } = req.body;

  try {
    if (process.env.SERVER_TYPE !== "railway") {
      return res.status(400).json({ success: false, message: "Quotation requests must be submitted to the Railway API." });
    }

    // 1. Validation checks
    if (!institutionName || !contactPerson || !email || !phone || studentCount === undefined || accessDurationDays === undefined || !expectedReleaseDate) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled!",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format!",
      });
    }

    const phoneRegex = /^[+]?[0-9\s-]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format!",
      });
    }

    const students = Number(studentCount);
    if (isNaN(students) || students <= 0) {
      return res.status(400).json({
        success: false,
        message: "Student count must be a positive number!",
      });
    }

    const durationDays = Number(accessDurationDays);
    if (isNaN(durationDays) || durationDays <= 0) {
      return res.status(400).json({
        success: false,
        message: "Access duration must be a positive number of days!",
      });
    }

    // Calculations based on ₹1.5 per student per day of portal access
    const hostingCost = students * durationDays * 1.5;
    const otpCost = 0; // OTP is included at no extra cost
    const estimatedTotal = hostingCost;

    // 2. Save quotation request to MongoDB
    const request = new QuotationRequest({
      institutionName: institutionName.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      studentCount: students,
      accessDurationDays: durationDays,
      expectedReleaseDate: new Date(expectedReleaseDate),
      hostingCost,
      otpCost,
      estimatedTotal,
      otpRequired: otpRequired !== false,
      marksMemoRequired: marksMemoRequired !== false,
      status: "Pending",
    });
    await request.save();

    // 3. Log activity
    try {
      await LogActivity(email, "client", "Quotation Request Submitted", "client", `Quotation request submitted by ${institutionName} for ${students} students, total estimated: ₹${estimatedTotal}`, "success");
    } catch (logErr) {
      console.error("Failed to log activity:", logErr);
    }

    return res.status(201).json({
      success: true,
      message: "Quotation request submitted successfully",
      request
    });

  } catch (error: any) {
    console.error("Error in submitQuotationRequest controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      error: error.message,
    });
  }
};
