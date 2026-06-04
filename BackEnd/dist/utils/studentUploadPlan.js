"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildStudentUploadPlan = void 0;
const rollNo_1 = require("./rollNo");
const buildStudentUploadPlan = (records) => records.map((record, index) => ({
    index,
    record,
    target: (0, rollNo_1.expectedServerForRollNo)(record.rollNo),
}));
exports.buildStudentUploadPlan = buildStudentUploadPlan;
