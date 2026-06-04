import { expectedServerForRollNo } from "./rollNo";

export type UploadPlanItem = {
  index: number;
  record: any;
  target: "render" | "railway";
};

export const buildStudentUploadPlan = (records: any[]): UploadPlanItem[] =>
  records.map((record, index) => ({
    index,
    record,
    target: expectedServerForRollNo(record.rollNo),
  }));
