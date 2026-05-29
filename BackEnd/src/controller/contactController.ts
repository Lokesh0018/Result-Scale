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

export const submitQuotationRequest = async (req: Request, res: Response) => {
  const {
    institutionName,
    institutionType,
    contactPerson,
    email,
    phone,
    cityState,
    studentCount,
    expectedReleaseDate,
    accessDuration,
    customDurationDays,
    expectedTraffic,
    otpRequired,
    memoDownloadRequired,
    message
  } = req.body;

  try {
    // 1. Validation checks
    if (!institutionName || !institutionType || !contactPerson || !email || !phone || !cityState || studentCount === undefined || !expectedReleaseDate || !accessDuration || !expectedTraffic) {
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

    // 2. Save quotation request to MongoDB
    const request = new QuotationRequest({
      institutionName: institutionName.trim(),
      institutionType,
      contactPerson: contactPerson.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      cityState: cityState.trim(),
      studentCount: students,
      expectedReleaseDate: new Date(expectedReleaseDate),
      accessDuration,
      customDurationDays: accessDuration === 'Custom' ? Number(customDurationDays || 0) : 0,
      expectedTraffic,
      otpRequired: Boolean(otpRequired),
      memoDownloadRequired: Boolean(memoDownloadRequired),
      message: message ? message.trim() : "",
      status: "unread",
    });
    await request.save();

    // 3. Log activity
    try {
      await LogActivity(email, "client", "Quotation Request Submitted", "client", `Quotation request submitted by ${institutionName} for ${students} students`, "success");
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
