import express from 'express'
import multer from 'multer'
import path from 'path'
import { CSVController } from '../controller/csvController'

const router = express.Router()

// Configure multer for CSV uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
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
