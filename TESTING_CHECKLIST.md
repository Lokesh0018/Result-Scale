# ✅ Testing Checklist - CSV Upload System

## Pre-Testing Setup

### 1. Environment Check
- [ ] MongoDB running on `localhost:27017`
- [ ] `.env` file configured with `EMAIL_USER` and `EMAIL_PASSWORD`
- [ ] `uploads/` directory exists in BackEnd folder
- [ ] No TypeScript errors in backend
- [ ] No TypeScript errors in frontend

### 2. Start Services
```bash
# Terminal 1: Backend
cd BackEnd
npm run dev
# Should see: "Server running on port 3000"

# Terminal 2: Frontend  
cd FrontEnd
npm run dev
# Should see: "Local: http://localhost:5173"
```

---

## Test Suite 1: CSV Upload (Client Side)

### Test 1.1: Client Login
- [ ] Navigate to `http://localhost:5173/client/login`
- [ ] Enter valid client credentials
- [ ] Click "Sign In"
- [ ] **Expected:** Redirects to `/client/dashboard`
- [ ] **Expected:** Dashboard loads without errors

### Test 1.2: Navigate to Upload Section
- [ ] Click "Upload Results" in sidebar
- [ ] **Expected:** Upload section displays
- [ ] **Expected:** "CSV Upload" tab is active
- [ ] **Expected:** File input UI visible

### Test 1.3: Select CSV File
- [ ] Click "Select File" button
- [ ] Choose `sample-students.csv` from project root
- [ ] **Expected:** File name displays: "Selected: sample-students.csv"
- [ ] **Expected:** "Upload CSV" button appears
- [ ] **Expected:** No errors in console

### Test 1.4: Upload CSV File
- [ ] Click "Upload CSV" button
- [ ] **Expected:** Button shows "Uploading..."
- [ ] **Expected:** Success toast: "Successfully uploaded 15 students!"
- [ ] **Expected:** File input clears
- [ ] **Expected:** Dashboard refreshes

### Test 1.5: Verify Upload Success
- [ ] Click "Dashboard" in sidebar
- [ ] **Expected:** "Total Students" card shows 15
- [ ] **Expected:** "Recent Students" table shows last 3 students
- [ ] **Expected:** Student names, roll numbers, semesters, SGPAs visible

### Test 1.6: View All Students
- [ ] Click "Students" in sidebar
- [ ] **Expected:** Table shows all 15 students
- [ ] **Expected:** All data matches CSV (names, emails, roll numbers, semesters, SGPAs)
- [ ] **Expected:** Search works correctly

---

## Test Suite 2: CSV Validation

### Test 2.1: Invalid File Type
- [ ] Go to "Upload Results"
- [ ] Try to select a .txt or .pdf file
- [ ] **Expected:** Error toast: "Please select a CSV file"

### Test 2.2: File Too Large
- [ ] Create a CSV file > 10MB
- [ ] Try to upload
- [ ] **Expected:** Error toast: "File size must be less than 10MB"

### Test 2.3: Duplicate Roll Numbers
Create `test-duplicate-rollno.csv`:
```csv
rollno,student_name,email_address,semester,cgpa
TEST001,Student A,a@test.com,6,8.5
TEST001,Student B,b@test.com,6,9.0
```
- [ ] Upload this file
- [ ] **Expected:** Error response with validation details
- [ ] **Expected:** Shows which row has duplicate

### Test 2.4: Duplicate Emails
Create `test-duplicate-email.csv`:
```csv
rollno,student_name,email_address,semester,cgpa
TEST001,Student A,same@test.com,6,8.5
TEST002,Student B,same@test.com,6,9.0
```
- [ ] Upload this file
- [ ] **Expected:** Error response with validation details

### Test 2.5: Invalid Email Format
Create `test-invalid-email.csv`:
```csv
rollno,student_name,email_address,semester,cgpa
TEST001,Student A,notanemail,6,8.5
```
- [ ] Upload this file
- [ ] **Expected:** Error: "Invalid email format"

### Test 2.6: Invalid Semester
Create `test-invalid-semester.csv`:
```csv
rollno,student_name,email_address,semester,cgpa
TEST001,Student A,a@test.com,10,8.5
```
- [ ] Upload this file
- [ ] **Expected:** Error: "Semester must be between 1 and 8"

### Test 2.7: Invalid cgpa
Create `test-invalid-cgpa.csv`:
```csv
rollno,student_name,email_address,semester,cgpa
TEST001,Student A,a@test.com,6,15.5
```
- [ ] Upload this file
- [ ] **Expected:** Error: "cgpa must be between 0 and 10"

### Test 2.8: Missing Required Fields
Create `test-missing-fields.csv`:
```csv
rollno,student_name,email_address,semester,cgpa
TEST001,,a@test.com,6,8.5
```
- [ ] Upload this file
- [ ] **Expected:** Error: "Student name is required"

---

## Test Suite 3: Student Login & OTP

### Test 3.1: Student Login - Valid Credentials
- [ ] Navigate to `http://localhost:5173/student/login`
- [ ] Enter roll number: `21A91A0501`
- [ ] Enter email: `john.doe@example.com`
- [ ] Click "Send OTP"
- [ ] **Expected:** Success toast: "OTP sent to your email address!"
- [ ] **Expected:** Redirects to `/student/verify-otp`
- [ ] **Expected:** No errors in console

### Test 3.2: Check Email for OTP
- [ ] Open email inbox for `john.doe@example.com`
- [ ] **Expected:** Email received from your configured EMAIL_USER
- [ ] **Expected:** Subject: "Your OTP for Login"
- [ ] **Expected:** Email contains 6-digit OTP
- [ ] **Expected:** Email mentions "valid for 5 minutes"

### Test 3.3: Student Login - Invalid Roll Number
- [ ] Go to `/student/login`
- [ ] Enter roll number: `INVALID123`
- [ ] Enter email: `john.doe@example.com`
- [ ] Click "Send OTP"
- [ ] **Expected:** Error toast: "Invalid credentials"

### Test 3.4: Student Login - Invalid Email
- [ ] Go to `/student/login`
- [ ] Enter roll number: `21A91A0501`
- [ ] Enter email: `wrong@example.com`
- [ ] Click "Send OTP"
- [ ] **Expected:** Error toast: "Student not found!"

### Test 3.5: Student Login - Missing Fields
- [ ] Go to `/student/login`
- [ ] Leave roll number empty
- [ ] Enter email: `john.doe@example.com`
- [ ] Click "Send OTP"
- [ ] **Expected:** Error toast: "Roll number is required"

---

## Test Suite 4: OTP Verification

### Test 4.1: Valid OTP
- [ ] After receiving OTP email
- [ ] Enter the 6-digit OTP correctly
- [ ] Click "Verify & View Result"
- [ ] **Expected:** Success toast: "OTP verified Successfully"
- [ ] **Expected:** Redirects to `/student/result`
- [ ] **Expected:** Student data passed to result page

### Test 4.2: Invalid OTP
- [ ] Go to OTP verification page
- [ ] Enter wrong OTP: `000000`
- [ ] Click "Verify & View Result"
- [ ] **Expected:** Error toast: "Invalid OTP !"

### Test 4.3: Expired OTP
- [ ] Request OTP
- [ ] Wait 6 minutes (OTP expires after 5 minutes)
- [ ] Enter the expired OTP
- [ ] Click "Verify & View Result"
- [ ] **Expected:** Error toast: "OTP expired !"

### Test 4.4: Incomplete OTP
- [ ] Enter only 4 digits
- [ ] **Expected:** "Verify & View Result" button disabled
- [ ] **Expected:** Cannot submit

### Test 4.5: OTP Auto-Focus
- [ ] Enter first digit
- [ ] **Expected:** Focus automatically moves to next input
- [ ] Enter all 6 digits
- [ ] **Expected:** All inputs filled correctly

### Test 4.6: OTP Backspace
- [ ] Fill all 6 digits
- [ ] Press backspace on last input
- [ ] **Expected:** Last digit clears
- [ ] Press backspace again
- [ ] **Expected:** Focus moves to previous input

### Test 4.7: Resend OTP
- [ ] Wait for timer to reach 0
- [ ] Click "Resend OTP"
- [ ] **Expected:** Timer resets to 60 seconds
- [ ] **Expected:** New OTP sent to email
- [ ] **Expected:** Old OTP no longer works

---

## Test Suite 5: Student Result Display

### Test 5.1: View Result - All Data Present
- [ ] After successful OTP verification
- [ ] **Expected:** Result page displays
- [ ] **Expected:** Student Name: "John Doe"
- [ ] **Expected:** Roll Number: "21A91A0501"
- [ ] **Expected:** Email: "john.doe@example.com"
- [ ] **Expected:** Institution Name: (from client)
- [ ] **Expected:** Semester: "6"
- [ ] **Expected:** SGPA: "8.50" (from CSV)

### Test 5.2: Verify NO Mock Data
- [ ] Check result page carefully
- [ ] **Expected:** NO fake subjects table
- [ ] **Expected:** NO mock grades (A, B+, etc.)
- [ ] **Expected:** NO fake CGPA
- [ ] **Expected:** NO fake total credits
- [ ] **Expected:** ONLY real data from CSV

### Test 5.3: Print Functionality
- [ ] Click "Print" button
- [ ] **Expected:** Browser print dialog opens
- [ ] **Expected:** Result page formatted for printing

### Test 5.4: Navigation
- [ ] Click "Home" button
- [ ] **Expected:** Redirects to landing page `/`

### Test 5.5: Direct Access Without Login
- [ ] Open new incognito window
- [ ] Navigate directly to `http://localhost:5173/student/result`
- [ ] **Expected:** Shows "No Result Found" message
- [ ] **Expected:** "Go to Login" button visible

---

## Test Suite 6: Multiple Students

### Test 6.1: Second Student Login
- [ ] Logout/clear session
- [ ] Login as: rollno=`21A91A0502`, email=`jane.smith@example.com`
- [ ] Verify OTP
- [ ] **Expected:** Shows Jane Smith's data
- [ ] **Expected:** SGPA: 9.20
- [ ] **Expected:** NOT John Doe's data

### Test 6.2: Third Student Login
- [ ] Logout/clear session
- [ ] Login as: rollno=`21A91A0508`, email=`grace.hill@example.com`
- [ ] Verify OTP
- [ ] **Expected:** Shows Grace Hill's data
- [ ] **Expected:** Semester: 8
- [ ] **Expected:** SGPA: 9.50

---

## Test Suite 7: Data Replacement

### Test 7.1: Upload New CSV (Replace Old Data)
- [ ] Login as client
- [ ] Upload a NEW CSV with different students
- [ ] **Expected:** Old students deleted
- [ ] **Expected:** New students saved
- [ ] **Expected:** Dashboard shows new count

### Test 7.2: Verify Old Students Cannot Login
- [ ] Try to login as old student (from first CSV)
- [ ] **Expected:** Error: "Student not found!"

### Test 7.3: Verify New Students Can Login
- [ ] Login as new student (from second CSV)
- [ ] **Expected:** OTP sent successfully
- [ ] **Expected:** Can view result

---

## Test Suite 8: Edge Cases

### Test 8.1: Empty CSV
Create `test-empty.csv`:
```csv
rollno,student_name,email_address,semester,cgpa
```
- [ ] Upload this file
- [ ] **Expected:** Error or success with 0 students

### Test 8.2: CSV with BOM (Byte Order Mark)
- [ ] Create CSV in Excel and save as "CSV UTF-8"
- [ ] Upload
- [ ] **Expected:** Parses correctly despite BOM

### Test 8.3: CSV with Extra Columns
Create `test-extra-columns.csv`:
```csv
rollno,student_name,email_address,semester,cgpa,extra_column
TEST001,Student A,a@test.com,6,8.5,ignored
```
- [ ] Upload this file
- [ ] **Expected:** Parses successfully, ignores extra column

### Test 8.4: CSV with Missing Columns
Create `test-missing-columns.csv`:
```csv
rollno,student_name,email_address
TEST001,Student A,a@test.com
```
- [ ] Upload this file
- [ ] **Expected:** Error: Missing required columns

### Test 8.5: Very Large CSV (1000+ students)
- [ ] Generate CSV with 1000 students
- [ ] Upload
- [ ] **Expected:** Uploads successfully
- [ ] **Expected:** All 1000 students saved
- [ ] **Expected:** No timeout errors

---

## Test Suite 9: Security

### Test 9.1: Student Cannot Access Other Results
- [ ] Login as Student A
- [ ] Get Student A's result
- [ ] Try to manually change URL or state to access Student B's data
- [ ] **Expected:** Cannot access other student's data

### Test 9.2: OTP Cannot Be Reused
- [ ] Login and get OTP
- [ ] Verify OTP successfully
- [ ] Try to use same OTP again
- [ ] **Expected:** Error: "OTP expired !" or "Invalid OTP !"

### Test 9.3: Rate Limiting (if implemented)
- [ ] Request OTP
- [ ] Immediately request OTP again
- [ ] **Expected:** Must wait 60 seconds between requests

---

## Test Suite 10: Error Handling

### Test 10.1: Backend Down
- [ ] Stop backend server
- [ ] Try to upload CSV
- [ ] **Expected:** Error toast with network error message

### Test 10.2: MongoDB Down
- [ ] Stop MongoDB
- [ ] Try to upload CSV
- [ ] **Expected:** Error toast: "Internal server error"

### Test 10.3: Email Service Down
- [ ] Use invalid EMAIL_PASSWORD in .env
- [ ] Try student login
- [ ] **Expected:** Error toast about email delivery failure

---

## Final Verification

### Checklist
- [ ] All 10 test suites passed
- [ ] Zero console errors in browser
- [ ] Zero console errors in backend
- [ ] CSV upload works end-to-end
- [ ] Student login works end-to-end
- [ ] OTP email delivery works
- [ ] OTP verification works
- [ ] Student result shows ONLY real CSV data
- [ ] NO mock data anywhere
- [ ] Dashboard updates correctly
- [ ] Multiple students can login independently
- [ ] Data replacement works correctly

---

## 🎉 Success Criteria

✅ **All tests passed**  
✅ **Zero errors**  
✅ **CSV → Login → OTP → Result flow works perfectly**  
✅ **Only real data from CSV displayed**  
✅ **Production ready**  

---

## 📝 Test Results Log

Date: ___________  
Tester: ___________  

| Test Suite | Status | Notes |
|------------|--------|-------|
| 1. CSV Upload | ⬜ | |
| 2. CSV Validation | ⬜ | |
| 3. Student Login | ⬜ | |
| 4. OTP Verification | ⬜ | |
| 5. Result Display | ⬜ | |
| 6. Multiple Students | ⬜ | |
| 7. Data Replacement | ⬜ | |
| 8. Edge Cases | ⬜ | |
| 9. Security | ⬜ | |
| 10. Error Handling | ⬜ | |

**Overall Status:** ⬜ Pass / ⬜ Fail

**Issues Found:**
1. 
2. 
3. 

---

**Ready for production deployment!** 🚀
