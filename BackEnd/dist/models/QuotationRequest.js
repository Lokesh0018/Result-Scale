"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const quotationRequestSchema = new mongoose_1.Schema({
    institutionName: {
        type: String,
        required: true,
        trim: true,
    },
    institutionType: {
        type: String,
        enum: ["College", "University", "Examination Board", "Other"],
        required: true,
    },
    contactPerson: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    cityState: {
        type: String,
        required: true,
        trim: true,
    },
    studentCount: {
        type: Number,
        required: true,
    },
    expectedReleaseDate: {
        type: Date,
        required: true,
    },
    accessDuration: {
        type: String,
        enum: ["7 Days", "15 Days", "30 Days", "Custom"],
        required: true,
    },
    customDurationDays: {
        type: Number,
        default: 0,
    },
    expectedTraffic: {
        type: String,
        enum: ["Low", "Medium", "High"],
        required: true,
    },
    otpRequired: {
        type: Boolean,
        required: true,
        default: false,
    },
    memoDownloadRequired: {
        type: Boolean,
        required: true,
        default: false,
    },
    message: {
        type: String,
        default: "",
    },
    status: {
        type: String,
        enum: ["unread", "read", "contacted"],
        default: "unread",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
exports.default = mongoose_1.default.model("QuotationRequest", quotationRequestSchema);
