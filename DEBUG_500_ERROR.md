# 🔧 Debugging 500 Error - Step by Step Guide

## Current Status
Added comprehensive logging to identify the exact failure point.

## How to Debug

### Step 1: Start Backend with Logs
```bash
cd BackEnd
npm run dev
```

Watch the console output carefully.

### Step 2: Test CSV Upload

#### Option A: Using Frontend
1. Open `http://localhost:5173/client/login`
2. Login with client credentials
3. Go to "Upload Results"
4. Select `sample-students.csv`
5. Click "Upload CSV"
6. **Watch backend console for logs**

#### Option B: Using cURL (Direct Test)
```bash
# Replace CLIENT_ID with actual MongoDB ObjectId
curl -X POST http://localhost:3000/client/upload-csv \
  -F "csvFile=@sample-students.csv" \
  -F "clientId=YOUR_CLIENT_ID_HERE"
```

### Step 3: Read the Logs

The logs will show exactly where it fails:

```
=== CSV Upload Started ===
File: { ... }
Body: { clientId: '...' }
Client ID: ...
Finding client...
Client found: ABC University
Parsing CSV file: uploads/students-...
=== CSV Validation Started ===
File path: uploads/students-...
Processing row 1: { rollno: '...', student_name: '...', ... }
Row 1 parsed successfully: { rollNumber: '...', name: '...', ... }
...
=== CSV Parsing Complete ===
Total rows: 15
Valid students: 15
Errors: 0
Saving students to database...
=== Saving Students to Database ===
Number of students: 15
Client ID: ...
Institution: ABC University
Starting MongoDB session...
Transaction started
Deleting existing students for client...
Deleted students: 0
Prepared student documents: 15
Inserting students...
Inserted students: 15
Updating client student count...
Client updated
Committing transaction...
=== Database Save Successful ===
=== CSV Upload Successful ===
```

### Step 4: Identify the Failure Point

Look for these error patterns:

#### Error Pattern 1: File Not Uploaded
```
No file uploaded
```
**Fix:** Check multer configuration, ensure form-data is sent correctly

#### Error Pattern 2: Invalid Client ID
```
Invalid client ID: undefined
```
**Fix:** Ensure `clientId` is sent in form-data

#### Error Pattern 3: Client Not Found
```
Client not found: 507f1f77bcf86cd799439011
```
**Fix:** Verify client exists in database, check MongoDB connection

#### Error Pattern 4: CSV Parsing Error
```
=== CSV Parsing Error ===
Error: ...
```
**Fix:** Check CSV format, ensure headers match exactly

#### Error Pattern 5: Database Save Error
```
=== Database Save Error ===
Error: ...
```
**Fix:** Check MongoDB connection, schema issues, transaction support

---

## Common Issues & Fixes

### Issue 1: MongoDB Not Running
**Symptoms:**
```
MongooseServerSelectionError: connect ECONNREFUSED
```

**Fix:**
```bash
# Start MongoDB
mongod
```

### Issue 2: Wrong CSV Headers
**Symptoms:**
```
Processing row 1: { roll_no: '...', name: '...', ... }
Row 1 has errors: [ { field: 'rollno', message: 'Roll number is required' } ]
```

**Fix:** CSV must have EXACT headers:
```csv
rollno,student_name,email_address,semester,scgpa
```

### Issue 3: Client ID Not Sent
**Symptoms:**
```
Body: {}
Invalid client ID: undefined
```

**Fix:** Frontend must send clientId in FormData:
```javascript
const formData = new FormData();
formData.append('csvFile', file);
formData.append('clientId', clientId); // ← Must be included
```

### Issue 4: Uploads Directory Missing
**Symptoms:**
```
Error: ENOENT: no such file or directory, open 'uploads/...'
```

**Fix:**
```bash
cd BackEnd
mkdir uploads
```

### Issue 5: MongoDB Transactions Not Supported
**Symptoms:**
```
MongoError: Transaction numbers are only allowed on a replica set member or mongos
```

**Fix:** Either:
- Use MongoDB replica set, OR
- Remove transaction code (less safe but works)

---

## Quick Fixes Applied

### 1. Added Comprehensive Logging
- Every step logs to console
- Easy to identify exact failure point
- Shows data at each stage

### 2. Better Error Messages
- Clear error descriptions
- Stack traces in development
- Validation error details

### 3. File Cleanup
- Deletes uploaded file after processing
- Cleans up on error
- Prevents disk space issues

---

## Testing Checklist

- [ ] MongoDB is running
- [ ] Backend server is running
- [ ] `uploads/` directory exists
- [ ] Client exists in database
- [ ] CSV file has correct headers
- [ ] CSV file has valid data
- [ ] Frontend sends clientId
- [ ] Frontend sends file as 'csvFile'

---

## Next Steps

1. **Run the test** - Upload CSV and watch logs
2. **Find the error** - Look for "Error:" in logs
3. **Apply the fix** - Based on error pattern above
4. **Test again** - Verify fix works
5. **Move to next phase** - Once upload works

---

## Expected Success Output

```
=== CSV Upload Started ===
File: { fieldname: 'csvFile', originalname: 'sample-students.csv', ... }
Body: { clientId: '507f1f77bcf86cd799439011' }
Client ID: 507f1f77bcf86cd799439011
Finding client...
Client found: ABC University
Parsing CSV file: uploads/students-1234567890-123456789.csv
=== CSV Validation Started ===
File path: uploads/students-1234567890-123456789.csv
Processing row 1: { rollno: '21A91A0501', student_name: 'John Doe', email_address: 'john.doe@example.com', semester: '6', scgpa: '8.5' }
Row 1 parsed successfully: { rollNumber: '21A91A0501', name: 'John Doe', email: 'john.doe@example.com', semester: 6, scgpa: 8.5 }
... (more rows)
=== CSV Parsing Complete ===
Total rows: 15
Valid students: 15
Errors: 0
Saving students to database...
=== Saving Students to Database ===
Number of students: 15
Client ID: 507f1f77bcf86cd799439011
Institution: ABC University
Starting MongoDB session...
Transaction started
Deleting existing students for client...
Deleted students: 0
Prepared student documents: 15
Inserting students...
Inserted students: 15
Updating client student count...
Client updated
Committing transaction...
=== Database Save Successful ===
=== CSV Upload Successful ===
```

**Frontend Response:**
```json
{
  "success": true,
  "message": "CSV uploaded and processed successfully",
  "stats": {
    "totalRows": 15,
    "savedStudents": 15,
    "institutionName": "ABC University"
  }
}
```

---

## If Still Failing

1. **Copy the EXACT error from backend console**
2. **Check which log line is the LAST one before error**
3. **That's where it's failing**
4. **Apply the specific fix for that stage**

---

**The logging will tell you EXACTLY what's wrong!** 🔍
