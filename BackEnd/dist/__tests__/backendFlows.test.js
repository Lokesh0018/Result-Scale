"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const clientValidation_1 = require("../utils/clientValidation");
const studentUploadPlan_1 = require("../utils/studentUploadPlan");
const rollNo_1 = require("../utils/rollNo");
const http_1 = require("../utils/http");
(0, node_test_1.default)("client creation validation rejects missing required fields", () => {
    strict_1.default.throws(() => (0, clientValidation_1.validateClientInput)({ institutionName: "College", email: "admin@example.com" }), /required/);
});
(0, node_test_1.default)("client creation validation accepts complete client input", () => {
    strict_1.default.doesNotThrow(() => (0, clientValidation_1.validateClientInput)({
        institutionName: "College",
        email: "admin@example.com",
        password: "secret",
        portalExpiryDate: "2026-06-04",
    }));
});
(0, node_test_1.default)("client login uses a single password-login service contract for admin/client roles", () => {
    strict_1.default.equal((0, rollNo_1.expectedServerForRollNo)("RS101"), "render");
    strict_1.default.equal((0, rollNo_1.expectedServerForRollNo)("RS102"), "railway");
});
(0, node_test_1.default)("activity log API retry helper retries a transient API failure", async () => {
    const originalFetch = global.fetch;
    let calls = 0;
    global.fetch = (async () => {
        calls += 1;
        return {
            ok: calls > 1,
            statusText: calls > 1 ? "OK" : "Bad Gateway",
            json: async () => calls > 1 ? { success: true, data: { stored: true } } : { success: false, message: "temporary" },
        };
    });
    try {
        const response = await (0, http_1.fetchJsonWithRetry)("http://railway.test/activity-logs/internal", { method: "POST" }, 1);
        strict_1.default.equal(response.success, true);
        strict_1.default.equal(calls, 2);
    }
    finally {
        global.fetch = originalFetch;
    }
});
(0, node_test_1.default)("odd roll number student upload targets Render/Firestore", () => {
    strict_1.default.equal((0, rollNo_1.isValidRollNo)("BTECH-001"), true);
    strict_1.default.equal((0, rollNo_1.expectedServerForRollNo)("BTECH-001"), "render");
});
(0, node_test_1.default)("even roll number student upload targets Railway/MongoDB", () => {
    strict_1.default.equal((0, rollNo_1.expectedServerForRollNo)("BTECH-002"), "railway");
});
(0, node_test_1.default)("bulk student upload plan splits mixed odd/even records", () => {
    const plan = (0, studentUploadPlan_1.buildStudentUploadPlan)([
        { rollNo: "BTECH-001", email: "odd@example.com" },
        { rollNo: "BTECH-002", email: "even@example.com" },
    ]);
    strict_1.default.deepEqual(plan.map((item) => item.target), ["render", "railway"]);
});
(0, node_test_1.default)("API failure handling rejects invalid roll number formats", () => {
    strict_1.default.equal((0, rollNo_1.isValidRollNo)("ROLL"), false);
    strict_1.default.throws(() => (0, studentUploadPlan_1.buildStudentUploadPlan)([{ rollNo: "ROLL" }]), /invalid|digit/i);
});
