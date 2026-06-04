"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFailure = exports.sendSuccess = void 0;
const sendSuccess = (res, status, message, data = {}) => res.status(status).json({
    success: true,
    message,
    data,
    ...data,
});
exports.sendSuccess = sendSuccess;
const sendFailure = (res, status, message, error = {}) => res.status(status).json({
    success: false,
    message,
    error,
});
exports.sendFailure = sendFailure;
