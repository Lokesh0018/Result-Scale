// ─── CSV Types ─────────────────────────────────────────────────────────────────

export interface CSVStudentRow {
  rollno: string
  student_name: string
  email_address: string
  semester: string
  scgpa: string
}

export interface ParsedStudent {
  rollNumber: string
  name: string
  email: string
  semester: number
  scgpa: number
}

export interface CSVValidationError {
  row: number
  field: string
  message: string
}

export interface CSVValidationResult {
  valid: boolean
  errors: CSVValidationError[]
  students: ParsedStudent[]
  stats: {
    totalRows: number
    validRows: number
    invalidRows: number
  }
}
