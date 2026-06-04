"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertRollNoBelongsToServer = exports.expectedServerForRollNo = exports.isOddRollNo = exports.getRollNoLastDigit = exports.isValidRollNo = void 0;
const isValidRollNo = (rollNo) => /^[A-Za-z0-9._/-]*\d[A-Za-z0-9._/-]*$/.test(`${rollNo || ""}`.trim());
exports.isValidRollNo = isValidRollNo;
const getRollNoLastDigit = (rollNo) => {
    if (!(0, exports.isValidRollNo)(rollNo)) {
        throw new Error("Roll number format is invalid");
    }
    const match = `${rollNo || ""}`.trim().match(/(\d)\D*$/);
    if (!match) {
        throw new Error("Roll number must contain a digit");
    }
    return Number(match[1]);
};
exports.getRollNoLastDigit = getRollNoLastDigit;
const isOddRollNo = (rollNo) => (0, exports.getRollNoLastDigit)(rollNo) % 2 === 1;
exports.isOddRollNo = isOddRollNo;
const expectedServerForRollNo = (rollNo) => (0, exports.isOddRollNo)(rollNo) ? "render" : "railway";
exports.expectedServerForRollNo = expectedServerForRollNo;
const assertRollNoBelongsToServer = (rollNo) => {
    const expected = (0, exports.expectedServerForRollNo)(rollNo);
    const current = (process.env.SERVER_TYPE || "render").toLowerCase();
    if (current !== expected) {
        throw new Error(`${expected === "render" ? "ODD" : "EVEN"} roll number students must be handled by the ${expected === "render" ? "Render" : "Railway"} API.`);
    }
};
exports.assertRollNoBelongsToServer = assertRollNoBelongsToServer;
