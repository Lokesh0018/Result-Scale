import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { CSVController } from '../controller/csvController'

const router = express.Router()

// Configure multer for CSV uploads — absolute path so it works regardless of cwd
const uploadsDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
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

// Routes
router.post('/upload', upload.single('csvFile'), CSVController.uploadCSV)
router.get('/stats/:clientId', CSVController.getUploadStats)
router.delete('/clear/:clientId', CSVController.clearStudentData)

export { router }
