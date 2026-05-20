import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BarChart3, LayoutDashboard, Upload, Users, Settings, LogOut,
  Bell, Menu, X, FileText, UserCheck, Eye, Plus, Pencil, Trash2,
  Mail, Calendar, Shield, Building2, MoonStar, Sun
} from 'lucide-react'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/dashboard.css'
import { useTheme } from "../components/ThemeProvider";
import { useToast } from '../components/Toast';
import { Student } from '../types/Types';


function ClientDashboard() {
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [activeTab, setActiveTab] = useState('upload')
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [students, setStudents] = useState<Student[]>([]);
  const clientId = localStorage.getItem("clientId");
  const [addOrUpdate, setAddOrUpdate] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [semester,setSemester] = useState(0);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    clientId: clientId,
    rollNo: "",
    name: "",
    email: "",
    role: "student",
    semester: 0,
    sgpa: 0,
    oldEmail:""
  });
  const [errors, setErrors] = useState<{
    institutionName?: string,
    email?: string,
    password?: string,
    portalExpiryDate?: string
  }>({});

  const updateShowModal = () => {
    setShowModal(true);
    setAddOrUpdate(true);
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNavClick = (section: string) => {
    setActiveSection(section)
    setSearchTerm('')
    setSidebarOpen(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  const changeStudent = (student: Student, update: boolean) => {
    if (update) {
      setShowModal(true);
      setAddOrUpdate(false);
    }
    else {
      setDeleteModal(true);
    }
    handleInputChange("oldEmail", student.email);
  }

  useEffect(() => {
    if (activeSection === "dashboard") {
      fetch(`http://localhost:3000/client/dashboard/${clientId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message);
        return data;
      }).then((data) => {
        setStudents(data.data);
      }).catch((err) => {
        showToast(err.message, 'error');
      });
    }
    setSemester(students.reduce((acc,student) => acc + student.semester,0));
  }, [activeSection]);

  const validateForm = () => {
    const newErrors: {
      rollNo?: string,
      name?: string,
      email?: string,
      semester?: string,
      sgpa?: string
    } = {};

    if (!formData.rollNo.trim()) {
      newErrors.rollNo = "Roll Number is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.semester === 0) {
      newErrors.semester = "Semester is required";
    }

    if (formData.sgpa === 0) {
      newErrors.sgpa = "SGPA is required";
    }

    setErrors(newErrors);

    return newErrors;
  };

  const addOrUpdateStudent = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      const errorMessages = Object.values(validationErrors);
      showToast(
        errorMessages[0] || "Please fill in all required fields",
        "error"
      );
      return;
    }
    if (addOrUpdate) {
      console.log(formData);
      fetch("http://localhost:3000/client/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message);
        return data;
      }).then((data) => {
        const updatedStudents = [...students,data.student]
        setStudents(updatedStudents);
        showToast(data.message, "success");
      }).catch((err) => {
        showToast(err.message, "error");
      });
    }
    else {
      fetch(`http://localhost:3000/client/students/${formData.oldEmail}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message);
        return data;
      }).then((data) => {
        const newStudent: Student = data.student;
        const updatedStudents = [...students.filter((student)=>student.email !== formData.oldEmail), newStudent];
        setStudents(updatedStudents);
        showToast(data.message, "success");
      }).catch((err) => {
        showToast(err.message, "error");
      });
    }
    setSemester(students.reduce((acc,student) => acc + student.semester,0));
    setShowModal(false);
  };

  const deleteStudent = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    fetch(`http://localhost:3000/client/students/${formData.oldEmail}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body:JSON.stringify({
        clientId:clientId
      })
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message);
      return data;
    }).then((data) => {
      const deletedStudent: Student = data.student;
      const updatedStudents = students.filter((student) => student.email !== deletedStudent.email);
      setStudents(updatedStudents);
      showToast(data.message, "success");
    }).catch((err) => {
      showToast(err.message, "error");
    });
    setDeleteModal(false);
    setSemester(students.reduce((acc,student) => acc + student.semester,0));
  }

  const parseCsvRows = (csvText: string) => {
    const rows = csvText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (rows.length < 2) {
      throw new Error("CSV must include a header row and at least one data row.");
    }

    const headers = rows[0].split(",").map((header) => header.trim().toLowerCase());
    const requiredHeaders = ["roll_no", "name", "email", "semester", "sgpa"];

    const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required CSV headers: ${missingHeaders.join(", ")}`);
    }

    return rows.slice(1).map((row, index) => {
      const values = row.split(",").map((value) => value.trim());
      const getValue = (key: string) => values[headers.indexOf(key)] ?? "";

      const parsedSemester = Number(getValue("semester"));
      const parsedSgpa = Number(getValue("sgpa"));

      if (!getValue("roll_no") || !getValue("name") || !getValue("email")) {
        throw new Error(`Row ${index + 2}: roll_no, name and email are required.`);
      }

      if (!Number.isFinite(parsedSemester) || parsedSemester <= 0) {
        throw new Error(`Row ${index + 2}: semester must be a positive number.`);
      }

      if (!Number.isFinite(parsedSgpa) || parsedSgpa <= 0) {
        throw new Error(`Row ${index + 2}: sgpa must be a positive number.`);
      }

      return {
        clientId,
        rollNo: getValue("roll_no"),
        name: getValue("name"),
        email: getValue("email"),
        semester: parsedSemester,
        sgpa: parsedSgpa,
      };
    });
  };

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      showToast('Please upload a valid .csv file.', 'error');
      return;
    }

    setIsUploadingCsv(true);
    try {
      const csvText = await file.text();
      const studentsFromCsv = parseCsvRows(csvText);

      const uploadResponses = await Promise.allSettled(
        studentsFromCsv.map((student) =>
          fetch("http://localhost:3000/client/students", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(student),
          }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
              throw new Error(data.message || `Failed to upload ${student.email}`);
            }
            return data.student as Student;
          })
        )
      );

      const successfulUploads = uploadResponses
        .filter((result): result is PromiseFulfilledResult<Student> => result.status === 'fulfilled')
        .map((result) => result.value);

      if (successfulUploads.length > 0) {
        setStudents((prev) => [...prev, ...successfulUploads]);
      }

      const failedUploads = uploadResponses.filter((result) => result.status === 'rejected');
      if (failedUploads.length === 0) {
        showToast(`Uploaded ${successfulUploads.length} students successfully.`, 'success');
      } else {
        showToast(
          `Uploaded ${successfulUploads.length} student(s), failed ${failedUploads.length}.`,
          'error'
        );
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to parse or upload CSV file.', 'error');
    } finally {
      setIsUploadingCsv(false);
      event.target.value = '';
    }
  };


  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <BarChart3 size={18} />
            </div>
            ResultScale
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main</div>
            <button
              className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>
            <button
              className={`nav-item ${activeSection === 'upload' ? 'active' : ''}`}
              onClick={() => handleNavClick('upload')}
            >
              <Upload size={18} />
              Upload Results
            </button>
            <button
              className={`nav-item ${activeSection === 'students' ? 'active' : ''}`}
              onClick={() => handleNavClick('students')}
            >
              <Users size={18} />
              Students
            </button>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">System</div>
            <button
              className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => handleNavClick('settings')}
            >
              <Settings size={18} />
              Settings
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">A</div>
            <div className="user-details">
              <div className="user-name">ABC University</div>
              <div className="user-role">Institution</div>
            </div>
            <button onClick={() => navigate('/')} className="action-btn">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="page-title">
              {activeSection === 'dashboard' && 'Client Dashboard'}
              {activeSection === 'upload' && 'Upload Results'}
              {activeSection === 'students' && 'Student Records'}
              {activeSection === 'settings' && 'Settings'}
            </h1>
          </div>
          <div className="header-right">
            <button onClick={toggleTheme} className="header-btn">
              {theme === "light" ? <MoonStar /> : <Sun />}
            </button>
            <button className="header-btn">
              <Bell size={20} />
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Total Students</span>
                    <div className="stat-card-icon primary">
                      <Users size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">{students.length}</div>
                  <div className="stat-card-change positive">+{students.length} this semester</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Results Published</span>
                    <div className="stat-card-icon green">
                      <FileText size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">{semester}</div>
                  <div className="stat-card-change">{(semester/students.length*8)/100}% of total</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Results Viewed</span>
                    <div className="stat-card-icon blue">
                      <Eye size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">{students.length}</div>
                  <div className="stat-card-change">{students.length/students.length*100}% view rate</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">OTPs Sent</span>
                    <div className="stat-card-icon orange">
                      <UserCheck size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">{semester}</div>
                  <div className="stat-card-change">This month</div>
                </div>
              </div>

              {/* Recent Students Preview */}
              <div className="table-section">
                <div className="table-header">
                  <h2 className="table-title">Recent Students</h2>
                  <button className="btn btn-outline" onClick={() => setActiveSection('students')}>
                    View All
                  </button>
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Name</th>
                      <th>Semester</th>
                      <th>SGPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.slice(-3).map((student) => (
                      <tr key={student._id}>
                        <td style={{ fontWeight: 500 }}>{student.rollNo}</td>
                        <td>{student.name}</td>
                        <td>{student.semester}</td>
                        <td>{student.sgpa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Upload Results Section */}
          {activeSection === 'upload' && (
            <div className="tabs-container">
              <div className="tabs-header">
                <button
                  className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                  onClick={() => setActiveTab('upload')}
                >
                  CSV Upload
                </button>
                <button
                  className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
                  onClick={() => setActiveTab('manual')}
                >
                  Manual Entry
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'upload' && (
                  <div className="upload-area">
                    <div className="upload-icon">
                      <Upload size={32} />
                    </div>
                    <h3 className="upload-title">Upload CSV File</h3>
                    <p className="upload-description">
                      Drag and drop your CSV file here, or click to browse.
                      <br />
                      Supported format: .csv (max 10MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleCsvUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      className="btn btn-primary"
                      style={{ marginTop: 'var(--spacing-lg)' }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingCsv}
                    >
                      {isUploadingCsv ? 'Uploading...' : 'Select File'}
                    </button>

                    <div className="upload-info">
                      <h4>CSV Format Requirements:</h4>
                      <ul>
                        <li>Headers: roll_no, name, email, semester, sgpa, cgpa</li>
                        <li>All fields are required</li>
                        <li>SGPA and CGPA should be numeric (0-10 scale)</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'manual' && (
                  <form className="modal-form" style={{ maxWidth: '600px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                      <div className="form-group">
                        <label className="form-label">Roll Number</label>
                        <input type="text" className="form-input" placeholder="e.g., 2024CS005"  onChange={(e) => handleInputChange('rollNo', e.target.value)}/>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Student Name</label>
                        <input type="text" className="form-input" placeholder="Enter full name"  onChange={(e) => handleInputChange('name', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" className="form-input" placeholder="student@email.com"  onChange={(e) => handleInputChange('email', e.target.value)}/>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Semester</label>
                        <input type="text" className="form-input" placeholder="e.g., 4"  onChange={(e) => handleInputChange('semester', e.target.value)}/>
                      </div>
                      <div className="form-group">
                        <label className="form-label">SGPA</label>
                        <input type="number" step="0.01" className="form-input" placeholder="e.g., 8.5"  onChange={(e) => handleInputChange('sgpa', e.target.value)}/>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }} onClick={(e) => {
                      setAddOrUpdate(true);
                      addOrUpdateStudent(e);
                      }}>
                      Add Student Result
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Students Section */}
          {activeSection === 'students' && (
            <div className="table-section">
              <div className="table-header">
                <h2 className="table-title">Student Records</h2>
                <div className="table-actions">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={() => updateShowModal()}>
                    <Plus size={16} />
                    Add Student
                  </button>
                </div>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Semester</th>
                    <th>SGPA</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student._id}>
                      <td style={{ fontWeight: 500 }}>{student.rollNo}</td>
                      <td>{student.name}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{student.email}</td>
                      <td>{student.semester}</td>
                      <td>{student.sgpa.toFixed(1)}</td>
                      <td>
                        <button className="action-btn edit" onClick={() => changeStudent(student,true)}>
                          <Pencil size={14} />
                        </button>
                        <button className="action-btn delete" onClick={() => changeStudent(student,false)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="settings-container">
              <div className="settings-section">
                <h2 className="settings-title">
                  <Building2 size={20} />
                  Institution Profile
                </h2>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Institution Name</strong>
                      <span>Your organization name</span>
                    </div>
                    <div className="settings-value">
                      <input type="text" className="form-input" defaultValue="ABC University" />
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Contact Email</strong>
                      <span>Primary contact for notifications</span>
                    </div>
                    <div className="settings-value">
                      <input type="email" className="form-input" defaultValue="admin@abcuniversity.edu" />
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Portal URL</strong>
                      <span>Your student result portal link</span>
                    </div>
                    <div className="settings-value">
                      <input type="text" className="form-input" defaultValue="results.abcuniversity.edu" readOnly />
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-title">
                  <Shield size={20} />
                  Security Settings
                </h2>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Password</strong>
                      <span>Update your account password</span>
                    </div>
                    <div className="settings-value">
                      <button className="btn btn-outline">Change Password</button>
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Two-Factor Authentication</strong>
                      <span>Add extra security to your account</span>
                    </div>
                    <div className="settings-value">
                      <button className="btn btn-outline">Enable 2FA</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-title">
                  <Mail size={20} />
                  Email Notifications
                </h2>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>OTP Delivery</strong>
                      <span>Email service for sending OTPs</span>
                    </div>
                    <div className="settings-value">
                      <span className="badge badge-success">Active</span>
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Result Notification</strong>
                      <span>Notify students when results are published</span>
                    </div>
                    <div className="settings-value">
                      <label className="toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-title">
                  <Calendar size={20} />
                  Portal Status
                </h2>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Portal Expiry</strong>
                      <span>Your portal access expires on</span>
                    </div>
                    <div className="settings-value">
                      <span style={{ fontWeight: 500 }}>June 30, 2025</span>
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Portal Status</strong>
                      <span>Current portal access status</span>
                    </div>
                    <div className="settings-value">
                      <span className="badge badge-success">Active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--spacing-xl)' }}>
                <button className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Student Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{(addOrUpdate) ? "Create" : "Update"} Student</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form className="modal-form">
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input type="text" className="form-input" placeholder="Enter roll number"  onChange={(e) => handleInputChange('rollNo', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Student Name</label>
                  <input type="text" className="form-input" placeholder="Enter full name"  onChange={(e) => handleInputChange('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="Enter email address"  onChange={(e) => handleInputChange('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input type="number" className="form-input" placeholder="Enter semester"  onChange={(e) => handleInputChange('semester', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">SGPA</label>
                  <input type="number" className="form-input" placeholder="Enter sgpa"  onChange={(e) => handleInputChange('sgpa', e.target.value)}/>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={(e) => addOrUpdateStudent(e)}>{(addOrUpdate) ? "Create" : "Update"} Student</button>
            </div>
          </div>
        </div>
      )}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Client</h3>
              <button className="modal-close" onClick={() => setDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete {formData.oldEmail}?
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={(e) => deleteStudent(e)}>Delete Client</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientDashboard
