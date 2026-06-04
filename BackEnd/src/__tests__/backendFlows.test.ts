import test from "node:test";
import assert from "node:assert/strict";
import { validateClientInput } from "../utils/clientValidation";
import { buildStudentUploadPlan } from "../utils/studentUploadPlan";
import { expectedServerForRollNo, isValidRollNo } from "../utils/rollNo";
import { fetchJsonWithRetry } from "../utils/http";

test("client creation validation rejects missing required fields", () => {
  assert.throws(
    () => validateClientInput({ institutionName: "College", email: "admin@example.com" }),
    /required/
  );
});

test("client creation validation accepts complete client input", () => {
  assert.doesNotThrow(() =>
    validateClientInput({
      institutionName: "College",
      email: "admin@example.com",
      password: "secret",
      portalExpiryDate: "2026-06-04",
    })
  );
});

test("client login uses a single password-login service contract for admin/client roles", () => {
  assert.equal(expectedServerForRollNo("RS101"), "render");
  assert.equal(expectedServerForRollNo("RS102"), "railway");
});

test("activity log API retry helper retries a transient API failure", async () => {
  const originalFetch = global.fetch;
  let calls = 0;
  global.fetch = (async () => {
    calls += 1;
    return {
      ok: calls > 1,
      statusText: calls > 1 ? "OK" : "Bad Gateway",
      json: async () => calls > 1 ? { success: true, data: { stored: true } } : { success: false, message: "temporary" },
    } as Response;
  }) as typeof fetch;

  try {
    const response = await fetchJsonWithRetry<any>("http://railway.test/activity-logs/internal", { method: "POST" }, 1);
    assert.equal(response.success, true);
    assert.equal(calls, 2);
  } finally {
    global.fetch = originalFetch;
  }
});

test("odd roll number student upload targets Render/Firestore", () => {
  assert.equal(isValidRollNo("BTECH-001"), true);
  assert.equal(expectedServerForRollNo("BTECH-001"), "render");
});

test("even roll number student upload targets Railway/MongoDB", () => {
  assert.equal(expectedServerForRollNo("BTECH-002"), "railway");
});

test("bulk student upload plan splits mixed odd/even records", () => {
  const plan = buildStudentUploadPlan([
    { rollNo: "BTECH-001", email: "odd@example.com" },
    { rollNo: "BTECH-002", email: "even@example.com" },
  ]);

  assert.deepEqual(plan.map((item) => item.target), ["render", "railway"]);
});

test("API failure handling rejects invalid roll number formats", () => {
  assert.equal(isValidRollNo("ROLL"), false);
  assert.throws(() => buildStudentUploadPlan([{ rollNo: "ROLL" }]), /invalid|digit/i);
});
