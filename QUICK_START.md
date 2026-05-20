# 🚀 Quick Start Guide - ResultScale

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running on localhost:27017)
- Gmail account with app-specific password

---

## 📦 Installation

### 1. Install Backend Dependencies
```bash
cd BackEnd
npm install
```

### 2. Install Frontend Dependencies
```bash
cd FrontEnd
npm install
```

---

## ⚙️ Configuration

### 1. Configure Email (Backend/.env)
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/result-scale
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**How to get Gmail App Password:**
1. Go to Google Account Settings
2. Security → 2-Step Verification
3. App Passwords → Generate new password
4. Copy and paste in `.env`

---

## 🏃 Running the Application

### 1. Start MongoDB
```bash
# Make sure MongoDB is running on localhost:27017
mongod
```

### 2. Start Backend Server
```bash
cd BackEnd
npm run dev
```
✅ Backend running on `http://localhost:3000`  
✅ Socket.IO enabled for real-time updates

### 3. Start Frontend Development Server
```bash
cd FrontEnd
npm run dev
```
✅ Frontend running on `http://localhost:5173`

---

## 🎯 Testing the System

### Step 1: Admin Login
1. Navigate to `http://localhost:5173/admin/login`
2. Login with admin credentials
3. You'll be redirected to `/dashboard` (Infrastructure Dashboard)
4. You should see:
   - Real-time metrics updating every 2 seconds
   - Empty state for institutions (no CSV uploaded yet)
   - Live events feed
   - Connection status: "Operational"

### Step 2: Upload CSV (as Institution)
1. Navigate to `http://localhost:5173/client/login`
2. Login as institution client
3. Upload a CSV file with this format:

```csv
rollno,student_name,email_address,semester,cgpa
21A91A0501,John Doe,john@example.com,6,8.5
21A91A0502,Jane Smith,jane@example.com,6,9.2
21A91A0503,Bob Johnson,bob@example.com,6,7.8
```

4. CSV will be validated and processed
5. Students will be saved to database
6. Admin dashboard will update in real-time

### Step 3: Student Login & OTP Verification
1. Navigate to `http://localhost:5173/student/login`
2. Enter roll number: `21A91A0501` OR email: `john@example.com`
3. Click "Send OTP"
4. Check email inbox for OTP (6-digit code)
5. Enter OTP on verification page
6. View student result profile

### Step 4: Monitor Infrastructure
1. Go back to admin dashboard (`/dashboard`)
2. Watch real-time metrics:
   - Active Users count
   - Requests per second
   - Results delivered today
   - Traffic load
   - Cache hit rate
   - Platform uptime
3. Click "Institutions" tab to see:
   - Institution name
   - Live traffic
   - Queue status
   - Health status
   - Total students
4. Click "API Monitoring" to see:
   - P50, P95, P99 latency
   - Average response time

---

## 🧪 Sample CSV Files

### Small Dataset (3 students)
```csv
rollno,student_name,email_address,semester,cgpa
21A91A0501,John Doe,john@example.com,6,8.5
21A91A0502,Jane Smith,jane@example.com,6,9.2
21A91A0503,Bob Johnson,bob@example.com,6,7.8
```

### Medium Dataset (10 students)
```csv
rollno,student_name,email_address,semester,cgpa
21A91A0501,John Doe,john1@example.com,6,8.5
21A91A0502,Jane Smith,jane2@example.com,6,9.2
21A91A0503,Bob Johnson,bob3@example.com,6,7.8
21A91A0504,Alice Brown,alice4@example.com,5,8.9
21A91A0505,Charlie Davis,charlie5@example.com,5,7.5
21A91A0506,Diana Evans,diana6@example.com,7,9.0
21A91A0507,Frank Green,frank7@example.com,7,8.2
21A91A0508,Grace Hill,grace8@example.com,8,9.5
21A91A0509,Henry Irving,henry9@example.com,8,8.7
21A91A0510,Ivy Jones,ivy10@example.com,6,8.1
```

---

## 🔍 Troubleshooting

### Issue: Socket.IO not connecting
**Solution:**
- Check if backend is running on port 3000
- Check browser console for connection errors
- Verify CORS settings in `BackEnd/src/server.ts`

### Issue: OTP email not received
**Solution:**
- Check `.env` file has correct `EMAIL_USER` and `EMAIL_PASSWORD`
- Verify Gmail app password is correct
- Check spam folder
- Check backend console for email errors

### Issue: CSV upload fails
**Solution:**
- Verify CSV format matches exactly: `rollno,student_name,email_address,semester,cgpa`
- Check for duplicate roll numbers or emails
- Ensure semester is between 1-8
- Ensure SGPA is between 0-10
- Check file size is under 10MB

### Issue: Dashboard shows empty metrics
**Solution:**
- Wait 2 seconds for first Socket.IO update
- Check if Socket.IO connection is established (green dot in navbar)
- Upload CSV data first
- Check backend console for errors

### Issue: MongoDB connection error
**Solution:**
- Ensure MongoDB is running: `mongod`
- Check MongoDB URI in `.env`: `mongodb://localhost:27017/result-scale`
- Verify MongoDB is accessible on port 27017

---

## 📊 API Testing with Postman/cURL

### 1. Upload CSV
```bash
curl -X POST http://localhost:3000/csv/upload \
  -F "csvFile=@students.csv" \
  -F "clientId=YOUR_CLIENT_ID"
```

### 2. Student Login
```bash
curl -X POST http://localhost:3000/student-auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "21A91A0501"}'
```

### 3. Verify OTP
```bash
curl -X POST http://localhost:3000/student-auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"studentId": "STUDENT_ID", "otp": "123456"}'
```

### 4. Get Infrastructure Metrics
```bash
curl http://localhost:3000/analytics/infra-metrics
```

### 5. Get Institution Metrics
```bash
curl http://localhost:3000/analytics/institution-metrics
```

---

## 🎨 Theme Toggle

The dashboard supports both light and dark themes:
- Click the sun/moon icon in the top navbar
- Theme preference is applied instantly
- All components adapt to the selected theme

---

## 📱 Responsive Design

The dashboard is fully responsive:
- Desktop: Full sidebar + content
- Tablet: Collapsible sidebar
- Mobile: Hamburger menu

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Use app-specific passwords** - Don't use your main Gmail password
3. **Enable 2FA on Gmail** - Required for app passwords
4. **Rate limit OTP requests** - Already implemented (1 minute cooldown)
5. **Monitor security events** - Check dashboard audit logs regularly

---

## 📈 Performance Tips

1. **Database Indexing**: Already configured on `clientId`, `email`, `rollNo`
2. **Socket.IO**: Automatically cleans up disconnected clients
3. **CSV Processing**: Files are deleted after processing
4. **OTP Cleanup**: OTPs are cleared after verification

---

## 🎉 Success Checklist

✅ Backend running on port 3000  
✅ Frontend running on port 5173  
✅ MongoDB connected  
✅ Socket.IO connection established  
✅ Admin can login and see dashboard  
✅ CSV upload works  
✅ Student can login with roll number/email  
✅ OTP email received  
✅ OTP verification works  
✅ Student result displayed  
✅ Real-time metrics updating  
✅ Institutions table populated  
✅ Theme toggle works  

---

## 📞 Need Help?

- Check `CSV_SYSTEM_DOCUMENTATION.md` for detailed architecture
- Review backend console logs for errors
- Check browser console for frontend errors
- Verify all environment variables are set correctly

---

## 🚀 Ready for Production?

Before deploying to production:
1. Change MongoDB URI to production database
2. Use production email service (SendGrid, AWS SES, etc.)
3. Enable HTTPS
4. Set up proper CORS origins
5. Configure rate limiting
6. Set up monitoring and logging
7. Enable database backups
8. Use environment-specific configs

---

**Happy Coding! 🎉**
