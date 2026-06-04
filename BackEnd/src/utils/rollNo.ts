export const getRollNoLastDigit = (rollNo: string): number => {
  const match = `${rollNo || ""}`.trim().match(/(\d)\D*$/);
  if (!match) {
    throw new Error("Roll number must contain a digit");
  }
  return Number(match[1]);
};

export const isOddRollNo = (rollNo: string): boolean => getRollNoLastDigit(rollNo) % 2 === 1;

export const expectedServerForRollNo = (rollNo: string): "render" | "railway" =>
  isOddRollNo(rollNo) ? "render" : "railway";

export const assertRollNoBelongsToServer = (rollNo: string) => {
  const expected = expectedServerForRollNo(rollNo);
  const current = (process.env.SERVER_TYPE || "render").toLowerCase();
  if (current !== expected) {
    throw new Error(
      `${expected === "render" ? "ODD" : "EVEN"} roll number students must be handled by the ${expected === "render" ? "Render" : "Railway"} API.`
    );
  }
};
