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

const VITE_RENDER_API_URL = (import.meta as any).env.VITE_RENDER_API_URL;
const VITE_RAILWAY_API_URL = (import.meta as any).env.VITE_RAILWAY_API_URL;

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
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    averageSgpa: 0,
    passingRate: 0,
    excellenceRate: 0
  });
  const [sgpaDistribution, setSgpaDistribution] = useState({
    excellent: 0,
    verygood: 0,
    good: 0,
    improvement: 0
  });
  const [sgpaTrends, setSgpaTrends] = useState<{ semester: number; avg: number }[]>([]);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const clientId = localStorage.getItem("clientId");
  const [addOrUpdate, setAddOrUpdate] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [semester, setSemester] = useState(0);
  const [clientName, setClientName] = useState(localStorage.getItem("institutionName") || "ABC University");
  const [clientEmail, setClientEmail] = useState(localStorage.getItem("userEmail") || "admin@abcuniversity.edu");
  const [clientExpiry, setClientExpiry] = useState("2025-06-30");
  const [clientPassword, setClientPassword] = useState("");
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    clientEmail: localStorage.getItem("userEmail") || clientEmail,
    rollNo: "",
    name: "",
    email: "",
    role: "student",
    semester: 0,
    sgpa: 0,
    oldEmail: ""
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
    setFormData({
      clientEmail: localStorage.getItem("userEmail") || clientEmail,
      rollNo: "",
      name: "",
      email: "",
      role: "student",
      semester: 0,
      sgpa: 0,
      oldEmail: ""
    });
  }

  const [filterSemester, setFilterSemester] = useState<'all' | number>('all');
  const [filterSgpaRange, setFilterSgpaRange] = useState<'all' | 'excellent' | 'verygood' | 'good' | 'improvement'>('all');
  const [sortBy, setSortBy] = useState<'rollNo' | 'name' | 'semester' | 'sgpa'>('rollNo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; title: string; value: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSemester, filterSgpaRange, sortBy, sortOrder]);

  useEffect(() => {
    const fetchAllStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const queryParams = `page=1&limit=100000000&search=&semester=all&sgpaRange=all&sortBy=rollNo&sortOrder=asc`;

        const results = await Promise.allSettled([
          fetch(`${VITE_RENDER_API_URL}/client/students/${localStorage.getItem("userEmail") || clientEmail}?${queryParams}`).then(async res => {
            if (!res.ok) throw new Error();
            return res.json();
          }),
          fetch(`${VITE_RAILWAY_API_URL}/client/students/${localStorage.getItem("userEmail") || clientEmail}?${queryParams}`).then(async res => {
            if (!res.ok) throw new Error();
            return res.json();
          })
        ]);

        let renderStudentsList: Student[] = [];
        let railwayStudentsList: Student[] = [];

        if (results[0].status === "fulfilled") {
          renderStudentsList = results[0].value.students || [];
        }

        if (results[1].status === "fulfilled") {
          railwayStudentsList = results[1].value.students || [];
        }

        // Merge and de-duplicate by _id
        const mergedMap = new Map<string, Student>();
        [...renderStudentsList, ...railwayStudentsList].forEach(s => {
          if (s && s._id) mergedMap.set(s._id, s);
        });
        const mergedList = Array.from(mergedMap.values());

        setAllStudents(mergedList);
      } catch (err: any) {
        showToast("Failed to fetch student records.", "error");
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchAllStudents();
  }, [refreshTrigger, clientEmail]);

  useEffect(() => {
    // 1. Filter locally
    let filtered = [...allStudents];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        (s.name && s.name.toLowerCase().includes(lowerSearch)) ||
        (s.rollNo && s.rollNo.toLowerCase().includes(lowerSearch))
      );
    }

    if (filterSemester !== 'all') {
      filtered = filtered.filter(s => Number(s.semester) === Number(filterSemester));
    }

    if (filterSgpaRange !== 'all') {
      filtered = filtered.filter(s => {
        if (filterSgpaRange === 'excellent') return s.sgpa >= 9.0;
        if (filterSgpaRange === 'verygood') return s.sgpa >= 7.5 && s.sgpa < 9.0;
        if (filterSgpaRange === 'good') return s.sgpa >= 6.0 && s.sgpa < 7.5;
        if (filterSgpaRange === 'improvement') return s.sgpa < 6.0;
        return true;
      });
    }

    // 2. Sort locally
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'rollNo') {
        comparison = (a.rollNo || '').localeCompare(b.rollNo || '');
      } else if (sortBy === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'semester') {
        comparison = (Number(a.semester) || 0) - (Number(b.semester) || 0);
      } else if (sortBy === 'sgpa') {
        comparison = (Number(a.sgpa) || 0) - (Number(b.sgpa) || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // 3. Paginate locally
    setTotalStudents(filtered.length);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageStudents = filtered.slice(startIndex, startIndex + itemsPerPage);
    setStudents(pageStudents);
  }, [allStudents, searchTerm, filterSemester, filterSgpaRange, sortBy, sortOrder, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalStudents / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

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
    handleInputChange("rollNo",student.rollNo);
    handleInputChange("oldEmail", student.email);
  }

  function convertLastChar(str: string): number {
    if (!str) return 0;
    const lastChar = str.at(-1)!;
    if (/\d/.test(lastChar)) {
      return Number(lastChar);
    }
    const code = lastChar.toLowerCase().charCodeAt(0);
    if (code >= 97 && code <= 122) {
      return (code - 97) % 10;
    }
    return 0;
  }

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const results = await Promise.allSettled([
          fetch(`${VITE_RENDER_API_URL}/client/dashboard/${localStorage.getItem("userEmail") || clientEmail}`).then(async res => {
            if (!res.ok) throw new Error(await res.text());
            return res.json();
          }),
          fetch(`${VITE_RAILWAY_API_URL}/client/dashboard/${localStorage.getItem("userEmail") || clientEmail}`).then(async res => {
            if (!res.ok) throw new Error(await res.text());
            return res.json();
          })
        ]);

        let clientInfo: any = null;
        let partialFailure = false;

        let renderStats = { totalStudents: 0, averageSgpa: 0, passingRate: 0, excellenceRate: 0 };
        let railwayStats = { totalStudents: 0, averageSgpa: 0, passingRate: 0, excellenceRate: 0 };
        let renderDist = { excellent: 0, verygood: 0, good: 0, improvement: 0 };
        let railwayDist = { excellent: 0, verygood: 0, good: 0, improvement: 0 };
        let renderTrends: any[] = [];
        let railwayTrends: any[] = [];
        let renderRecent: any[] = [];
        let railwayRecent: any[] = [];

        if (results[0].status === "fulfilled") {
          const val = results[0].value.data;
          if (val) {
            renderStats = val.stats || renderStats;
            renderDist = val.distribution || renderDist;
            renderTrends = val.trends || [];
            renderRecent = val.recentStudents || [];
            clientInfo = clientInfo || val.client;
          }
        } else {
          console.error("Render database dashboard load failed:", results[0].reason);
          partialFailure = true;
        }

        if (results[1].status === "fulfilled") {
          const val = results[1].value.data;
          if (val) {
            railwayStats = val.stats || railwayStats;
            railwayDist = val.distribution || railwayDist;
            railwayTrends = val.trends || [];
            railwayRecent = val.recentStudents || [];
            clientInfo = clientInfo || val.client;
          }
        } else {
          console.error("Railway database dashboard load failed:", results[1].reason);
          partialFailure = true;
        }

        if (results[0].status === "rejected" && results[1].status === "rejected") {
          throw new Error("Both database servers failed to respond.");
        }

        // Merge statistics
        const totalStudents = renderStats.totalStudents + railwayStats.totalStudents;
        const averageSgpa = totalStudents > 0
          ? ((renderStats.averageSgpa * renderStats.totalStudents) + (railwayStats.averageSgpa * railwayStats.totalStudents)) / totalStudents
          : 0;

        const renderPassingCount = Math.round((renderStats.passingRate / 100) * renderStats.totalStudents);
        const railwayPassingCount = Math.round((railwayStats.passingRate / 100) * railwayStats.totalStudents);
        const passingRate = totalStudents > 0
          ? Math.floor(((renderPassingCount + railwayPassingCount) / totalStudents) * 100)
          : 0;

        const renderExcellenceCount = Math.round((renderStats.excellenceRate / 100) * renderStats.totalStudents);
        const railwayExcellenceCount = Math.round((railwayStats.excellenceRate / 100) * railwayStats.totalStudents);
        const excellenceRate = totalStudents > 0
          ? Math.floor(((renderExcellenceCount + railwayExcellenceCount) / totalStudents) * 100)
          : 0;

        setDashboardStats({
          totalStudents,
          averageSgpa,
          passingRate,
          excellenceRate
        });

        // Merge SGPA distribution buckets
        setSgpaDistribution({
          excellent: renderDist.excellent + railwayDist.excellent,
          verygood: renderDist.verygood + railwayDist.verygood,
          good: renderDist.good + railwayDist.good,
          improvement: renderDist.improvement + railwayDist.improvement
        });

        // Merge SGPA trends by semester
        const semesterMap = new Map<number, { renderAvg?: number; railwayAvg?: number }>();
        renderTrends.forEach(t => {
          semesterMap.set(t.semester, { renderAvg: t.avg });
        });
        railwayTrends.forEach(t => {
          const existing = semesterMap.get(t.semester);
          if (existing) {
            existing.railwayAvg = t.avg;
          } else {
            semesterMap.set(t.semester, { railwayAvg: t.avg });
          }
        });

        const mergedTrends = Array.from(semesterMap.entries()).map(([semester, data]) => {
          let avg = 0;
          if (data.renderAvg !== undefined && data.railwayAvg !== undefined) {
            avg = (data.renderAvg + data.railwayAvg) / 2;
          } else if (data.renderAvg !== undefined) {
            avg = data.renderAvg;
          } else if (data.railwayAvg !== undefined) {
            avg = data.railwayAvg;
          }
          return { semester, avg };
        }).sort((a, b) => a.semester - b.semester);

        setSgpaTrends(mergedTrends);

        // Merge recent students sorted by _id descending
        const mergedRecent = [...renderRecent, ...railwayRecent]
          .sort((a, b) => (b._id || "").localeCompare(a._id || ""))
          .slice(0, 3);

        setRecentStudents(mergedRecent);

        if (clientInfo) {
          setClientName(clientInfo.institutionName);
          setClientEmail(clientInfo.email);
          setClientExpiry(clientInfo.portalExpiryDate?.split("T")[0] || "");
          localStorage.setItem("institutionName", clientInfo.institutionName);
        }

        if (partialFailure) {
          showToast("Warning: Failed to fetch records from one of the database servers.", "warning");
        }

      } catch (err: any) {
        showToast(err.message || "Failed to load dashboard data.", "error");
      }
    };
    fetchDashboard();
  }, [refreshTrigger]);

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
      const apiUrl =
        convertLastChar(formData.rollNo) % 2 === 0
          ? VITE_RENDER_API_URL
          : VITE_RAILWAY_API_URL;

      fetch(`${apiUrl}/client/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          clientId: localStorage.getItem("clientId") || clientId,
          clientEmail: localStorage.getItem("userEmail") || clientEmail,
        }),
      })
        .then(async (res) => {
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message);
          }

          return data;
        })
        .then((data) => {
          showToast(data.message, "success");
          setRefreshTrigger(prev => prev + 1);
        })
        .catch((err) => {
          showToast(err.message, "error");
        });
    }
    else {
      const apiUrl =
        convertLastChar(formData.rollNo) % 2 === 0
          ? VITE_RENDER_API_URL
          : VITE_RAILWAY_API_URL;

      fetch(`${apiUrl}/client/students/${formData.oldEmail}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          clientId: localStorage.getItem("clientId") || clientId,
          clientEmail: localStorage.getItem("userEmail") || clientEmail,
        }),
      })
        .then(async (res) => {
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message);
          }

          return data;
        })
        .then((data) => {
          showToast(data.message, "success");
          setRefreshTrigger(prev => prev + 1);
        })
        .catch((err) => {
          showToast(err.message, "error");
        });
    }
    setShowModal(false);
  };

const deleteStudent = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();

  const apiUrl =
    convertLastChar(formData.rollNo) % 2 === 0
      ? VITE_RENDER_API_URL
      : VITE_RAILWAY_API_URL;

  fetch(`${apiUrl}/client/students/${formData.oldEmail}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientId: localStorage.getItem("clientId") || clientId,
      clientEmail: localStorage.getItem("userEmail") || clientEmail,
    }),
  })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      return data;
    })
    .then((data) => {
      showToast(data.message, "success");
      setRefreshTrigger(prev => prev + 1);
    })
    .catch((err) => {
      showToast(err.message, "error");
    })
    .finally(() => {
      setDeleteModal(false);
    });
};

  const parseCsvRows = (csvText: string) => {
    // Remove byte order mark (BOM) if present
    const cleanText = csvText.replace(/^\uFEFF/, "");
    const rows = cleanText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (rows.length < 2) {
      throw new Error("CSV must include a header row and at least one data row.");
    }

    // Split headers, trim, handle surrounding quotes, and normalize roll_no/roll-no/rollno to rollno
    const headers = rows[0].split(",").map((header) => {
      const cleanHeader = header.replace(/^["']|["']$/g, "").trim().toLowerCase();
      if (cleanHeader === "roll_no" || cleanHeader === "roll-no") {
        return "rollno";
      }
      return cleanHeader;
    });

    // Required column names must remain exactly as: rollNo, name, email, semester, sgpa
    const requiredHeaders = ["rollNo", "name", "email", "semester", "sgpa"];

    // Find missing headers case-insensitively
    const missingHeaders = requiredHeaders.filter((reqHeader) => {
      return !headers.includes(reqHeader.toLowerCase());
    });

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required CSV headers: ${missingHeaders.join(", ")}`);
    }

    return rows.slice(1).map((row, index) => {
      // Split row values, handling quotes
      const values = row.split(",").map((value) => value.replace(/^["']|["']$/g, "").trim());
      const getValue = (key: string) => {
        const headerIndex = headers.indexOf(key.toLowerCase());
        return headerIndex !== -1 ? (values[headerIndex] ?? "") : "";
      };

      const parsedSemester = Number(getValue("semester"));
      const parsedSgpa = Number(getValue("sgpa"));

      if (!getValue("rollNo") || !getValue("name") || !getValue("email")) {
        throw new Error(`Row ${index + 2}: rollNo, name and email are required.`);
      }

      if (!Number.isFinite(parsedSemester) || parsedSemester <= 0) {
        throw new Error(`Row ${index + 2}: semester must be a positive number.`);
      }

      if (!Number.isFinite(parsedSgpa) || parsedSgpa <= 0) {
        throw new Error(`Row ${index + 2}: sgpa must be a positive number.`);
      }

      return {
        clientId: localStorage.getItem("clientId") || clientId,
        clientEmail: localStorage.getItem("userEmail") || clientEmail,
        rollNo: getValue("rollNo"),
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
        studentsFromCsv.map((student) => {
          const apiUrl = convertLastChar(student.rollNo) % 2 === 0
          ? VITE_RENDER_API_URL
          : VITE_RAILWAY_API_URL;
          return fetch(`${apiUrl}/client/students`, {
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
          });
        })
      );

      const successfulUploads = uploadResponses
        .filter((result): result is PromiseFulfilledResult<Student> => result.status === 'fulfilled')
        .map((result) => result.value);

      if (successfulUploads.length > 0) {
        setRefreshTrigger(prev => prev + 1);
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

  const handleSaveSettings = () => {
    if (!clientName.trim() || !clientEmail.trim()) {
      showToast("Institution name and contact email are required", "error");
      return;
    }
    const payload: any = {
      institutionName: clientName,
      email: clientEmail,
    };
    if (clientPassword) {
      payload.password = clientPassword;
    }

    const urls = [
      VITE_RENDER_API_URL,
      VITE_RAILWAY_API_URL
    ];

    Promise.allSettled(
      urls.map((url) =>
        fetch(`${url}/client/profile/${localStorage.getItem("userEmail") || clientEmail}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-User-Email": localStorage.getItem("userEmail") || clientEmail,
            "X-User-Role": localStorage.getItem("userRole") || "client"
          },
          body: JSON.stringify(payload),
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || "Failed to update profile");
          }
          return data;
        })
      )
    ).then((results) => {
      const successful = results.find(r => r.status === "fulfilled");
      if (!successful) {
        const firstError = results.find(r => r.status === "rejected") as PromiseRejectedResult;
        throw new Error(firstError.reason.message || "Failed to update profile on all servers");
      }

      const data = (successful as PromiseFulfilledResult<any>).value;
      showToast("Profile settings updated successfully!", "success");
      setClientPassword("");
      if (data.client) {
        setClientName(data.client.institutionName);
        setClientEmail(data.client.email);
        localStorage.setItem("userEmail", data.client.email);
        localStorage.setItem("institutionName", data.client.institutionName);
      }
    }).catch((err) => {
      showToast(err.message, "error");
    });
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
            <div className="user-avatar">{clientName.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <div className="user-name" title={clientName} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                {clientName}
              </div>
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
                  <div className="stat-card-value">{dashboardStats.totalStudents}</div>
                  <div className="stat-card-change positive">Registered in portal</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Average SGPA</span>
                    <div className="stat-card-icon green">
                      <FileText size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">
                    {dashboardStats.averageSgpa.toFixed(2)}
                  </div>
                  <div className="stat-card-change">Across all semesters</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Passing Rate</span>
                    <div className="stat-card-icon blue">
                      <Eye size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">
                    {dashboardStats.passingRate}%
                  </div>
                  <div className="stat-card-change">SGPA &ge; 5.0</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Excellence Rate</span>
                    <div className="stat-card-icon orange">
                      <UserCheck size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">
                    {dashboardStats.excellenceRate}%
                  </div>
                  <div className="stat-card-change">SGPA &ge; 9.0 (Outstanding)</div>
                </div>
              </div>

              {/* Interactive Charts Grid */}
              <div className="charts-grid">
                {/* Chart 1: SGPA Distribution */}
                <div className="chart-card">
                  <h3 className="chart-card-title">SGPA Distribution</h3>
                  <div className="chart-container">
                    {dashboardStats.totalStudents === 0 ? (
                      <div className="empty-state" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>No student records found</div>
                    ) : (
                      (() => {
                        const excellent = sgpaDistribution.excellent;
                        const veryGood = sgpaDistribution.verygood;
                        const good = sgpaDistribution.good;
                        const improvement = sgpaDistribution.improvement;

                        const data = [
                          { label: 'O (9.0+)', count: excellent, color: '#22c55e' },
                          { label: 'A (7.5-9.0)', count: veryGood, color: '#3b82f6' },
                          { label: 'B (6.0-7.5)', count: good, color: '#eab308' },
                          { label: 'C (<6.0)', count: improvement, color: '#f97316' }
                        ];

                        const maxCount = Math.max(excellent, veryGood, good, improvement, 4);

                        return (
                          <svg width="100%" height="100%" viewBox="0 0 300 160" preserveAspectRatio="xMidYMid meet">
                            {data.map((bar, index) => {
                              const barHeight = (bar.count / maxCount) * 100;
                              const xPos = index * 60 + 40;
                              const yPos = 130 - barHeight;

                              return (
                                <g key={index}>
                                  <rect
                                    x={xPos}
                                    y={yPos}
                                    width="30"
                                    height={barHeight}
                                    rx="4"
                                    fill={bar.color}
                                    className="chart-bar"
                                    onMouseEnter={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const parentRect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
                                      if (parentRect) {
                                        setTooltipData({
                                          x: rect.left - parentRect.left + 15,
                                          y: rect.top - parentRect.top,
                                          title: bar.label,
                                          value: `${bar.count} Student${bar.count !== 1 ? 's' : ''} (${((bar.count / (allStudents.length || students.length || 1)) * 100).toFixed(0)}%)`
                                        });
                                      }
                                    }}
                                    onMouseLeave={() => setTooltipData(null)}
                                  />
                                  <text
                                    x={xPos + 15}
                                    y={yPos - 5}
                                    textAnchor="middle"
                                    fontSize="8"
                                    fontWeight="700"
                                    fill="var(--color-text)"
                                  >
                                    {bar.count}
                                  </text>
                                  <text
                                    x={xPos + 15}
                                    y="145"
                                    textAnchor="middle"
                                    fontSize="8"
                                    fontWeight="600"
                                    fill="var(--color-text-muted)"
                                  >
                                    {bar.label.split(' ')[0]}
                                  </text>
                                </g>
                              );
                            })}
                          </svg>
                        );
                      })()
                    )}
                    {tooltipData && (
                      <div
                        className="chart-tooltip"
                        style={{
                          left: `${tooltipData.x}px`,
                          top: `${tooltipData.y}px`,
                          opacity: 1
                        }}
                      >
                        <div className="chart-tooltip-title">{tooltipData.title}</div>
                        <div>{tooltipData.value}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chart 2: Average SGPA Trend */}
                <div className="chart-card">
                  <h3 className="chart-card-title">Average SGPA Trend</h3>
                  <div className="chart-container">
                    {dashboardStats.totalStudents === 0 ? (
                      <div className="empty-state" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>No trend data available</div>
                    ) : (
                      (() => {
                        const semesterData = sgpaTrends;

                        const points = semesterData.map((d, i) => {
                          const x = semesterData.length > 1 ? 50 + (i / (semesterData.length - 1)) * 200 : 150;
                          const y = 130 - (d.avg / 10) * 90; // Scale 0-10 SGPA to 40-130 height range
                          return { x, y, semester: d.semester, avg: d.avg };
                        });

                        let pathD = "";
                        if (points.length > 0) {
                          pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
                        }

                        return (
                          <svg width="100%" height="100%" viewBox="0 0 300 160" preserveAspectRatio="xMidYMid meet">
                            {/* Y Axis Grid lines */}
                            {[2, 4, 6, 8, 10].map(val => {
                              const y = 130 - (val / 10) * 90;
                              return (
                                <g key={val}>
                                  <line x1="40" y1={y} x2="260" y2={y} stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="2 2" />
                                  <text x="25" y={y + 3} fontSize="8" fill="var(--color-text-muted)" textAnchor="end">{val}.0</text>
                                </g>
                              );
                            })}
                            {/* Connection path */}
                            {pathD && (
                              <path
                                d={pathD}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}
                            {/* Interactive Data points */}
                            {points.map((p, i) => (
                              <circle
                                key={i}
                                cx={p.x}
                                cy={p.y}
                                r="5"
                                fill="#ffffff"
                                stroke="#3b82f6"
                                strokeWidth="2.5"
                                className="chart-dot"
                                onMouseEnter={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const parentRect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
                                  if (parentRect) {
                                    setTooltipData({
                                      x: rect.left - parentRect.left + 5,
                                      y: rect.top - parentRect.top,
                                      title: `Semester ${p.semester}`,
                                      value: `Average SGPA: ${p.avg.toFixed(2)}`
                                    });
                                  }
                                }}
                                onMouseLeave={() => setTooltipData(null)}
                              />
                            ))}
                            {/* X Axis Labels */}
                            {points.map((p, i) => (
                              <text
                                key={i}
                                x={p.x}
                                y="145"
                                textAnchor="middle"
                                fontSize="8"
                                fontWeight="600"
                                fill="var(--color-text-muted)"
                              >
                                Sem {p.semester}
                              </text>
                            ))}
                          </svg>
                        );
                      })()
                    )}
                  </div>
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
                    {recentStudents.map((student) => (
                      <tr key={student._id} className="clickable-row" onClick={() => setSelectedStudent(student)}>
                        <td style={{ fontWeight: 500 }}>{student.rollNo}</td>
                        <td>{student.name}</td>
                        <td>{student.semester}</td>
                        <td>{student.sgpa.toFixed(1)}</td>
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
                        <li>Headers: rollNo (or roll_no), name, email, semester, sgpa</li>
                        <li>All fields are required</li>
                        <li>SGPA should be numeric (0-10 scale)</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'manual' && (
                  <form className="modal-form" style={{ maxWidth: '600px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                      <div className="form-group">
                        <label className="form-label">Roll Number</label>
                        <input type="text" className="form-input" placeholder="e.g., 2024CS005" onChange={(e) => handleInputChange('rollNo', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Student Name</label>
                        <input type="text" className="form-input" placeholder="Enter full name" onChange={(e) => handleInputChange('name', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" className="form-input" placeholder="student@email.com" onChange={(e) => handleInputChange('email', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Semester</label>
                        <input type="text" className="form-input" placeholder="e.g., 4" onChange={(e) => handleInputChange('semester', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">SGPA</label>
                        <input type="number" step="0.01" className="form-input" placeholder="e.g., 8.5" onChange={(e) => handleInputChange('sgpa', e.target.value)} />
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
              <div className="table-header" style={{ borderBottom: 'none' }}>
                <h2 className="table-title">Student Records</h2>
                <div className="table-actions">
                  <button className="btn btn-primary" onClick={() => updateShowModal()}>
                    <Plus size={16} />
                    Add Student
                  </button>
                </div>
              </div>

              {/* Filters Toolbar */}
              <div className="filter-toolbar">
                <div className="filter-group">
                  <span className="filter-label">Search</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search name or roll no..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ margin: 0 }}
                  />
                </div>

                <div className="filter-group">
                  <span className="filter-label">Semester</span>
                  <select
                    className="filter-select"
                    value={filterSemester}
                    onChange={(e) => setFilterSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  >
                    <option value="all">All Semesters</option>
                    {sgpaTrends.map(t => t.semester)
                      .sort((a, b) => Number(a) - Number(b))
                      .map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))
                    }
                  </select>
                </div>

                <div className="filter-group">
                  <span className="filter-label">SGPA Bracket</span>
                  <select
                    className="filter-select"
                    value={filterSgpaRange}
                    onChange={(e) => setFilterSgpaRange(e.target.value as any)}
                  >
                    <option value="all">All Grades</option>
                    <option value="excellent">Excellent (&ge; 9.0)</option>
                    <option value="verygood">Very Good (7.5 - 9.0)</option>
                    <option value="good">Good (6.0 - 7.5)</option>
                    <option value="improvement">Needs Improvement (&lt; 6.0)</option>
                  </select>
                </div>

                <div className="filter-group">
                  <span className="filter-label">Sort By</span>
                  <select
                    className="filter-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <option value="rollNo">Roll Number</option>
                    <option value="name">Name</option>
                    <option value="semester">Semester</option>
                    <option value="sgpa">SGPA</option>
                  </select>
                </div>

                <button
                  className="sort-btn"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                >
                  Order: {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </button>
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
                  {students.map((student) => (
                    <tr
                      key={student._id}
                      className="clickable-row"
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('.action-btn')) return;
                        setSelectedStudent(student);
                      }}
                    >
                      <td style={{ fontWeight: 500 }}>{student.rollNo}</td>
                      <td>{student.name}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{student.email}</td>
                      <td>{student.semester}</td>
                      <td>{student.sgpa.toFixed(1)}</td>
                      <td>
                        <button className="action-btn edit" onClick={() => changeStudent(student, true)}>
                          <Pencil size={14} />
                        </button>
                        <button className="action-btn delete" onClick={() => changeStudent(student, false)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--spacing-md)', padding: '0 var(--spacing-sm)' }}>
                  <div className="pagination-info" style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {totalStudents > 0 ? (
                      `Showing ${startIndex + 1} to ${Math.min(startIndex + itemsPerPage, totalStudents)} of ${totalStudents} students`
                    ) : (
                      'Showing 0 to 0 of 0 students'
                    )}
                  </div>
                  <div className="pagination-buttons" style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '13px' }}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`btn ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setCurrentPage(page)}
                        style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '13px', minWidth: '32px' }}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      className="btn btn-outline"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '13px' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
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
                      <input
                        type="text"
                        className="form-input"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Contact Email</strong>
                      <span>Primary contact for notifications</span>
                    </div>
                    <div className="settings-value">
                      <input
                        type="email"
                        className="form-input"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Portal URL</strong>
                      <span>Your student result portal link</span>
                    </div>
                    <div className="settings-value">
                      <input
                        type="text"
                        className="form-input"
                        value={`${clientName.toLowerCase().replace(/\s+/g, '')}.resultscale.com`}
                        readOnly
                      />
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
                      <span>Update your account password (leave blank to keep current)</span>
                    </div>
                    <div className="settings-value">
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Enter new password"
                        value={clientPassword}
                        onChange={(e) => setClientPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Two-Factor Authentication</strong>
                      <span>Add extra security to your account</span>
                    </div>
                    <div className="settings-value">
                      <button className="btn btn-outline" disabled>Enable 2FA (Disabled)</button>
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
                      <span style={{ fontWeight: 500 }}>
                        {clientExpiry ? new Date(clientExpiry).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'June 30, 2025'}
                      </span>
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Portal Status</strong>
                      <span>Current portal access status</span>
                    </div>
                    <div className="settings-value">
                      <span className={`badge ${clientExpiry && new Date(clientExpiry).getTime() > Date.now() ? 'badge-success' : 'badge-error'}`}>
                        {clientExpiry && new Date(clientExpiry).getTime() > Date.now() ? 'Active' : 'Expired'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--spacing-xl)' }}>
                <button className="btn btn-primary" onClick={handleSaveSettings}>Save Changes</button>
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
                {
                  (addOrUpdate) && <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input type="text" className="form-input" placeholder="Enter roll number" onChange={(e) => handleInputChange('rollNo', e.target.value)} />
                </div>
                }
                <div className="form-group">
                  <label className="form-label">Student Name</label>
                  <input type="text" className="form-input" placeholder="Enter full name" onChange={(e) => handleInputChange('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="Enter email address" onChange={(e) => handleInputChange('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input type="number" className="form-input" placeholder="Enter semester" onChange={(e) => handleInputChange('semester', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">SGPA</label>
                  <input type="number" className="form-input" placeholder="Enter sgpa" onChange={(e) => handleInputChange('sgpa', e.target.value)} />
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
        <div className="modal-overlay" onClick={() => setDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Student</h3>
              <button className="modal-close" onClick={() => setDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete {formData.oldEmail}?
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={(e) => deleteStudent(e)}>Delete Student</button>
            </div>
          </div>
        </div>
      )}

      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Student Drill-down: {selectedStudent.name}</h3>
              <button className="modal-close" onClick={() => setSelectedStudent(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {(() => {
                const percentage = (selectedStudent.sgpa * 9.5).toFixed(1);
                let standing = "Needs Improvement";
                let colorClass = "orange";
                if (selectedStudent.sgpa >= 9.0) {
                  standing = "Outstanding (O)";
                  colorClass = "green";
                } else if (selectedStudent.sgpa >= 7.5) {
                  standing = "Very Good (A)";
                  colorClass = "blue";
                } else if (selectedStudent.sgpa >= 6.0) {
                  standing = "Good (B)";
                  colorClass = "primary";
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <div className="detail-grid" style={{ marginTop: 0 }}>
                      <div className="detail-card">
                        <div className="detail-label">Roll Number</div>
                        <div className="detail-value">{selectedStudent.rollNo}</div>
                      </div>
                      <div className="detail-card">
                        <div className="detail-label">Email Address</div>
                        <div className="detail-value" style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedStudent.email}</div>
                      </div>
                      <div className="detail-card">
                        <div className="detail-label">Semester</div>
                        <div className="detail-value">Semester {selectedStudent.semester}</div>
                      </div>
                      <div className="detail-card">
                        <div className="detail-label">SGPA</div>
                        <div className="detail-value">{selectedStudent.sgpa.toFixed(2)}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Academic Standing:</span>
                        <span style={{ color: `var(--color-${colorClass})` }}>{standing}</span>
                      </div>
                      <div className="progress-container">
                        <div className={`progress-bar ${colorClass}`} style={{ width: `${selectedStudent.sgpa * 10}%` }}></div>
                      </div>
                    </div>

                    <div className="detail-card" style={{ backgroundColor: 'var(--color-background)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)', fontSize: '13px' }}>
                        <span>Percentage Equivalent:</span>
                        <strong>{percentage}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Status:</span>
                        <span className="badge badge-success" style={{ display: 'inline-block' }}>Passed</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedStudent(null)}>Close</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  changeStudent(selectedStudent, true);
                  setSelectedStudent(null);
                }}
              >
                Edit Student Result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientDashboard
