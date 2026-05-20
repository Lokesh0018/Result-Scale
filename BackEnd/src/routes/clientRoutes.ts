import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {login} from "../controller/loginController";
import { getDashboard, addStudent, updateStudent, deleteStudent, getStudents, updatePassword } from "../controller/clientController";
import { CSVController } from "../controller/csvController";

// Configure multer for CSV uploads — use absolute path so it works regardless of cwd
const uploadsDir = path.join(__dirname, '../../uploads')

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'students-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true)
    } else {
      cb(new Error('Only CSV files are allowed'))
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
})

export const router = express.Router();
router.post("/login",login);

router.get("/dashboard/:clientId",getDashboard);
router.post("/students",addStudent);
router.put("/students/:email",updateStudent);
router.delete("/students/:email",deleteStudent);

router.get("/students/:clientId",getStudents);

router.patch("/password/:email",updatePassword);

// CSV Upload Route
router.post("/upload-csv", upload.single('csvFile'), CSVController.uploadCSV);