import express, { Request, Response } from "express";
import { 
  GetDashboard, AddClient, UpdateClient, DeleteClient, GetStudents, 
  UpdatePassword, GetInquiries, UpdateInquiryStatus, DeleteInquiry,
  GetQuotationRequests, UpdateQuotationRequestStatus, DeleteQuotationRequest
} from "../service/adminService";
import { GetActivityLogs, LogActivity } from "../service/logService";

export const getDashboard = async (req: Request, res: Response) => {
    try {
        const data = await GetDashboard();
        return res.status(200).json({
            success: true,
            message: "DashBoard Fetched Successfully",
            data
        });
    }
    catch (err: any) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            err: err.message
        });
    }
}

export const addClient = async (req: Request, res: Response) => {
    const { institutionName, email, password, portalExpiryDate, institutionType, logoUrl, isActive } = req.body;
    const actorEmail = "admin@resultscale.com";
    const actorRole = "admin";
    try {
        if (!institutionName || !email || !password || !portalExpiryDate)
            return res.status(400).json({
                success: false,
                message: "Institution name, email, password, portal expiry date are required !",
            });
        const client = await AddClient(
            institutionName,
            email.toLowerCase(),
            password,
            new Date(portalExpiryDate),
            institutionType,
            logoUrl,
            isActive !== undefined ? (typeof isActive === 'string' ? isActive === 'true' : Boolean(isActive)) : true
        );
        await LogActivity(actorEmail, actorRole, "Client Created", "client", `Created client institution: ${institutionName} (${email.toLowerCase()})`, "success");
        return res.status(201).json({
            success: true,
            message: "Client Added Successfully",
            client
        });
    }
    catch (err: any) {
        await LogActivity(actorEmail, actorRole, "Client Creation Failed", "client", `Failed to create client ${email || ""}: ${err.message}`, "failure");
        const isDuplicate = err.message.includes("Already Exists") || 
                            err.code === 11000 || 
                            err.message.toLowerCase().includes("duplicate") || 
                            err.message.toLowerCase().includes("unique index");
        if (isDuplicate)
            return res.status(409).json({
                success: false,
                message: `Already Exists with Email ${email.toLowerCase()}`
            });
        if (err.message === "Date was Expired !" || err.message === "Invalid portal expiry date !")
            return res.status(400).json({
                success: false,
                message: err.message
            });
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const updateClient = async (req: Request, res: Response) => {
    const oldEmail = req.params.email as string;
    const { institutionName, email, password, portalExpiryDate, institutionType, logoUrl, isActive } = req.body;
    const actorEmail = "admin@resultscale.com";
    const actorRole = "admin";
    try {
        if (!institutionName || !oldEmail || !email || !password || !portalExpiryDate)
            return res.status(400).json({
                success: false,
                message: "Institution name, email, password, portal expiry date are required !",
            });
        const client = await UpdateClient(
            institutionName,
            oldEmail.toLowerCase(),
            email.toLowerCase(),
            password,
            new Date(portalExpiryDate),
            institutionType,
            logoUrl,
            isActive !== undefined ? (typeof isActive === 'string' ? isActive === 'true' : Boolean(isActive)) : undefined
        );
        await LogActivity(actorEmail, actorRole, "Client Updated", "client", `Updated client institution: ${institutionName} (${email.toLowerCase()})`, "success");
        return res.status(200).json({
            success: true,
            message: "Client Updated Successfully",
            client
        });
    }
    catch (err: any) {
        await LogActivity(actorEmail, actorRole, "Client Update Failed", "client", `Failed to update client ${oldEmail}: ${err.message}`, "failure");
        const isDuplicate = err.message.includes("Already Exists") || 
                            err.code === 11000 || 
                            err.message.toLowerCase().includes("duplicate") || 
                            err.message.toLowerCase().includes("unique index");
        if (isDuplicate)
            return res.status(409).json({
                success: false,
                message: `Already Exists with Email ${email.toLowerCase()}`
            });

        if (err.message === "Client not found !")
            return res.status(404).json({
                success: false,
                message: err.message
            });

        if (err.message === "Date was Expired !" || err.message === "Invalid portal expiry date !")
            return res.status(400).json({
                success: false,
                message: err.message
            });
            
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const deleteClient = async (req: Request, res: Response) => {
    const email = req.params.email as string;
    const actorEmail = "admin@resultscale.com";
    const actorRole = "admin";
    try {
        const client = await DeleteClient(email.toLowerCase());
        await LogActivity(actorEmail, actorRole, "Client Deleted", "client", `Deleted client and all enrolled student data: ${email.toLowerCase()}`, "success");
        return res.status(200).json({
            success: true,
            message: "Client Deleted Successfully",
            client
        });
    }
    catch (err: any) {
        await LogActivity(actorEmail, actorRole, "Client Deletion Failed", "client", `Failed to delete client ${email}: ${err.message}`, "failure");
        if (err.message === "Client not found !") {
            return res.status(404).json({
                success: false,
                message: err.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

export const getStudents = async (req: Request, res: Response) => {
    try {
        const students = await GetStudents();
        return res.status(200).json({
            success: true,
            message: "Students Fetched Successfully",
            students
        });
    }
    catch (err: any) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

export const updatePassword = async (req: Request, res: Response) => {
    const email = req.params.email as string;
    const { password } = req.body;
    const actorEmail = "admin@resultscale.com";
    const actorRole = "admin";
    try {
        const admin = await UpdatePassword(email.toLowerCase(), password);
        await LogActivity(actorEmail, actorRole, "Password Updated", "security", `Admin password updated for: ${email.toLowerCase()}`, "success");
        return res.status(200).json({
            message: "Password Changed Successfully",
            admin
        });
    }
    catch (err: any) {
        await LogActivity(actorEmail, actorRole, "Password Update Failed", "security", `Failed to update admin password for ${email}: ${err.message}`, "failure");
        if(err.message === "Admin not found !"){
            return res.status(404).json({
            success: false,
            message: err.message,
        });
        }
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

export const getActivityLogs = async (req: Request, res: Response) => {
    try {
        const logs = await GetActivityLogs();
        return res.status(200).json({
            success: true,
            message: "Activity logs fetched successfully",
            logs
        });
    }
    catch (err: any) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const getInquiries = async (req: Request, res: Response) => {
    try {
        const inquiries = await GetInquiries();
        return res.status(200).json({
            success: true,
            message: "Inquiries fetched successfully",
            inquiries
        });
    } catch (err: any) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            err: err.message
        });
    }
}

export const updateInquiryStatus = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { status } = req.body;
    const actorEmail = "admin@resultscale.com";
    const actorRole = "admin";
    try {
        if (!status || !['unread', 'read'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Valid status ('unread' or 'read') is required"
            });
        }
        const inquiry = await UpdateInquiryStatus(id, status as 'unread' | 'read');
        await LogActivity(actorEmail, actorRole, "Inquiry Status Updated", "system", `Updated status of inquiry from ${inquiry.fullName} to ${status}`, "success");
        return res.status(200).json({
            success: true,
            message: "Inquiry status updated successfully",
            inquiry
        });
    } catch (err: any) {
        await LogActivity(actorEmail, actorRole, "Inquiry Status Update Failed", "system", `Failed to update inquiry status for ID ${id}: ${err.message}`, "failure");
        if (err.message === "Inquiry not found !") {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        }
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const deleteInquiry = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const actorEmail = "admin@resultscale.com";
    const actorRole = "admin";
    try {
        const inquiry = await DeleteInquiry(id);
        await LogActivity(actorEmail, actorRole, "Inquiry Deleted", "system", `Deleted inquiry from ${inquiry.fullName} (${inquiry.email})`, "success");
        return res.status(200).json({
            success: true,
            message: "Inquiry deleted successfully",
            inquiry
        });
    } catch (err: any) {
        await LogActivity(actorEmail, actorRole, "Inquiry Deletion Failed", "system", `Failed to delete inquiry ID ${id}: ${err.message}`, "failure");
        if (err.message === "Inquiry not found !") {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        }
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const getQuotationRequests = async (req: Request, res: Response) => {
    try {
        const requests = await GetQuotationRequests();
        return res.status(200).json({
            success: true,
            message: "Quotation requests fetched successfully",
            requests
        });
    } catch (err: any) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            err: err.message
        });
    }
}

export const updateQuotationRequestStatus = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { status } = req.body;
    const actorEmail = "admin@resultscale.com";
    const actorRole = "admin";
    try {
        if (!status || !['Pending', 'Under Review', 'Contacted', 'Quotation Sent', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Valid status ('Pending', 'Under Review', 'Contacted', 'Quotation Sent', 'Approved', or 'Rejected') is required"
            });
        }
        const request = await UpdateQuotationRequestStatus(id, status as any);
        await LogActivity(actorEmail, actorRole, "Quotation Request Status Updated", "system", `Updated status of quotation request from ${request.institutionName} to ${status}`, "success");
        return res.status(200).json({
            success: true,
            message: "Quotation request status updated successfully",
            request
        });
    } catch (err: any) {
        await LogActivity(actorEmail, actorRole, "Quotation Request Status Update Failed", "system", `Failed to update status of quotation request ID ${id}: ${err.message}`, "failure");
        if (err.message === "Quotation request not found !") {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        }
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const deleteQuotationRequest = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const actorEmail = "admin@resultscale.com";
    const actorRole = "admin";
    try {
        const request = await DeleteQuotationRequest(id);
        await LogActivity(actorEmail, actorRole, "Quotation Request Deleted", "system", `Deleted quotation request from ${request.institutionName} (${request.email})`, "success");
        return res.status(200).json({
            success: true,
            message: "Quotation request deleted successfully",
            request
        });
    } catch (err: any) {
        await LogActivity(actorEmail, actorRole, "Quotation Request Deletion Failed", "system", `Failed to delete quotation request ID ${id}: ${err.message}`, "failure");
        if (err.message === "Quotation request not found !") {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        }
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}
