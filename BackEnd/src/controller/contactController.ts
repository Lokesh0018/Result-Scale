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

    // 3. Send email to admin
    const adminEmail = "resultscale@gmail.com";
    const mailOptions = {
      from: process.env.EMAIL as string,
      to: adminEmail,
      subject: `[Contact Inquiry] ${subject.trim()}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background-color: #EF1C25; color: #ffffff; padding: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 24px;">New Inquiry Received</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">ResultScale Landing Page Form</p>
          </div>
          <div style="padding: 24px; background-color: #ffffff;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4b5563; width: 150px; border-bottom: 1px solid #f3f4f6;">Full Name:</td>
                <td style="padding: 8px 0; color: #1f2937; border-bottom: 1px solid #f3f4f6;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4b5563; border-bottom: 1px solid #f3f4f6;">Institution:</td>
                <td style="padding: 8px 0; color: #1f2937; border-bottom: 1px solid #f3f4f6;">${institutionName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4b5563; border-bottom: 1px solid #f3f4f6;">Email:</td>
                <td style="padding: 8px 0; color: #1f2937; border-bottom: 1px solid #f3f4f6;"><a href="mailto:${email}" style="color: #EF1C25; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4b5563; border-bottom: 1px solid #f3f4f6;">Phone:</td>
                <td style="padding: 8px 0; color: #1f2937; border-bottom: 1px solid #f3f4f6;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4b5563; border-bottom: 1px solid #f3f4f6;">Subject:</td>
                <td style="padding: 8px 0; color: #1f2937; border-bottom: 1px solid #f3f4f6;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4b5563; border-bottom: 1px solid #f3f4f6;">Timestamp:</td>
                <td style="padding: 8px 0; color: #1f2937; border-bottom: 1px solid #f3f4f6;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
            
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px;">
              <h4 style="margin: 0 0 10px 0; color: #374151;">Message:</h4>
              <p style="margin: 0; color: #4b5563; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          <div style="background-color: #f3f4f6; color: #9ca3af; text-align: center; padding: 12px; font-size: 12px; border-top: 1px solid #e5e7eb;">
            &copy; ${new Date().getFullYear()} ResultScale. Automated Notification.
          </div>
        </div>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info.response);
    } catch (err) {
      console.error("Mail error:", err);
    }

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
