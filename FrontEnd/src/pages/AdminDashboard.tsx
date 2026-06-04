import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BarChart3, LayoutDashboard, Users, Settings, LogOut,
  Bell, Building2, Clock, Menu, X,
  Plus, Pencil, Trash2, Mail, Calendar, Shield, Database, MoonStar, Sun,
  History, RotateCw, CheckCircle, XCircle, Eye, MailOpen, FileText, Server
} from 'lucide-react'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/dashboard.css'
import { useTheme } from "../components/ThemeProvider";
import { useToast } from '../components/Toast';
import { Client, Student } from '../types/Types';
import { apiFetch } from '../utils/api';

const VITE_RENDER_API_URL = (import.meta as any).env.VITE_RENDER_API_URL;

function AdminDashboard() {
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [showModal, setShowModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('')
  const [errors, setErrors] = useState<{
    institutionName?: string,
    email?: string,
    password?: string,
    portalExpiryDate?: string
  }>({});



  const [clients, setClients] = useState<Client[]>([]);
  const [activeClients, setActiveClients] = useState<Client[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [renderStudents, setRenderStudents] = useState<Student[]>([]);
  const [railwayStudents, setRailwayStudents] = useState<Student[]>([]);
  const [expired, setExpired] = useState(0);
  const [formData, setFormData] = useState({
    institutionName: "",
    email: "",
    password: "",
    portalExpiryDate: new Date(0),
    role: "client",
    oldEmail: "",
    institutionType: "University",
    logoUrl: "",
    isActive: true
  });

  const [addOrUpdate, setAddOrUpdate] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all')
  const [sortBy, setSortBy] = useState<'institutionName' | 'students' | 'portalExpiryDate'>('institutionName')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; title: string; value: string } | null>(null)

  const [studentSortBy, setStudentSortBy] = useState<'rollNo' | 'name' | 'institutionName' | 'sgpa'>('rollNo')
  const [studentSortOrder, setStudentSortOrder] = useState<'asc' | 'desc'>('asc')

  interface ActivityLog {
    _id: string;
    userEmail: string;
    userRole: string;
    action: string;
    category: 'auth' | 'student' | 'client' | 'system' | 'security';
    details: string;
    status: 'success' | 'failure';
    timestamp: string;
  }
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filterCategory, setFilterCategory] = useState<'all' | 'auth' | 'student' | 'client' | 'system' | 'security'>('all');
  const [filterLogStatus, setFilterLogStatus] = useState<'all' | 'success' | 'failure'>('all');
  const [logSortOrder, setLogSortOrder] = useState<'asc' | 'desc'>('desc');

  interface Inquiry {
    _id: string;
    fullName: string;
    institutionName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: 'unread' | 'read';
    createdAt: string;
  }
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryFilterStatus, setInquiryFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [inquirySortOrder, setInquirySortOrder] = useState<'asc' | 'desc'>('desc');
  const [inquiryPage, setInquiryPage] = useState(1);
  const [inquiryPerPage] = useState(5);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [deleteInquiryModal, setDeleteInquiryModal] = useState<Inquiry | null>(null);

  interface QuotationRequest {
    otpRequired: boolean;
    marksMemoRequired: boolean;
    _id: string;
    institutionName: string;
    contactPerson: string;
    email: string;
    phone: string;
    studentCount: number;
    accessDurationDays: number;
    expectedReleaseDate: string;
    hostingCost: number;
    otpCost: number;
    estimatedTotal: number;
    status: 'Pending' | 'Under Review' | 'Contacted' | 'Quotation Sent' | 'Approved' | 'Rejected';
    createdAt: string;
  }
  const [quotationRequests, setQuotationRequests] = useState<QuotationRequest[]>([]);
  const [loadingQuotations, setLoadingQuotations] = useState(false);
  const [quotationsError, setQuotationsError] = useState<string | null>(null);
  const [quotationSearch, setQuotationSearch] = useState('');
  const [quotationFilterStatus, setQuotationFilterStatus] = useState<'all' | 'Pending' | 'Under Review' | 'Contacted' | 'Quotation Sent' | 'Approved' | 'Rejected'>('all');
  const [quotationSortOrder, setQuotationSortOrder] = useState<'asc' | 'desc'>('desc');
  const [quotationPage, setQuotationPage] = useState(1);
  const [quotationPerPage] = useState(5);
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationRequest | null>(null);
  const [deleteQuotationModal, setDeleteQuotationModal] = useState<QuotationRequest | null>(null);

  const [adminEmail, setAdminEmail] = useState(localStorage.getItem("userEmail") || "admin@resultscale.com");
  const [adminPassword, setAdminPassword] = useState("");
  const [smtpServer, setSmtpServer] = useState(localStorage.getItem("settings_smtpServer") || "smtp.resultscale.com");
  const [senderEmail, setSenderEmail] = useState(localStorage.getItem("settings_senderEmail") || "noreply@resultscale.com");
  const [otpExpiry, setOtpExpiry] = useState(localStorage.getItem("settings_otpExpiry") || "5 minutes");
  const [defaultPortalDuration, setDefaultPortalDuration] = useState(localStorage.getItem("settings_defaultPortalDuration") || "1 year");

  const updateClientLists = (allClients: Client[]) => {
    const active: Client[] = [];
    let expiredCount = 0;
    const processed = allClients.map(c => {
      const isExpired = new Date(c.portalExpiryDate).getTime() < Date.now();
      const updatedStatus = isExpired ? 'expired' : 'active';
      const updated = { ...c, status: updatedStatus as 'active' | 'expired' };
      if (updatedStatus === 'active') {
        active.push(updated);
      } else {
        expiredCount++;
      }
      return updated;
    });
    setClients(processed);
    setActiveClients(active);
    setExpired(expiredCount);
  };

  const toClientRow = (client: any, id: number): Client => ({
    id,
    _id: client._id || client.id,
    institutionName: client.institutionName,
    email: client.email,
    students: client.students || 0,
    status: new Date(client.portalExpiryDate).getTime() < Date.now() ? "expired" : "active",
    portalExpiryDate: client.portalExpiryDate.toString().split("T")[0],
    institutionType: client.institutionType,
    logoUrl: client.logoUrl,
    isActive: client.isActive
  });

  const getJsonHeaders = () => {
    return {
      "Content-Type": "application/json"
    };
  };

  const processedClients = clients
    .filter(client => {
      const matchesSearch = client.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());
      if (filterStatus === 'active') return matchesSearch && client.status === 'active';
      if (filterStatus === 'expired') return matchesSearch && client.status === 'expired';
      return matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'institutionName') {
        comparison = a.institutionName.localeCompare(b.institutionName);
      } else if (sortBy === 'students') {
        comparison = a.students - b.students;
      } else if (sortBy === 'portalExpiryDate') {
        comparison = new Date(a.portalExpiryDate).getTime() - new Date(b.portalExpiryDate).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const processedLogs = logs
    .filter(log => {
      const matchesSearch = log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
      const matchesStatus = filterLogStatus === 'all' || log.status === filterLogStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return logSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  const processedInquiries = inquiries
    .filter(inq => {
      const matchesSearch =
        inq.fullName.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        inq.email.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        inq.phone.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        inq.institutionName.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        inq.subject.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        inq.message.toLowerCase().includes(inquirySearch.toLowerCase());

      const matchesStatus =
        inquiryFilterStatus === 'all' || inq.status === inquiryFilterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return inquirySortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  const totalInquiryPages = Math.ceil(processedInquiries.length / inquiryPerPage);
  const inquiryStartIndex = (inquiryPage - 1) * inquiryPerPage;
  const paginatedInquiries = processedInquiries.slice(inquiryStartIndex, inquiryStartIndex + inquiryPerPage);

  const processedQuotations = quotationRequests
    .filter(req => {
      const matchesSearch =
        req.institutionName.toLowerCase().includes(quotationSearch.toLowerCase()) ||
        req.contactPerson.toLowerCase().includes(quotationSearch.toLowerCase()) ||
        req.email.toLowerCase().includes(quotationSearch.toLowerCase()) ||
        req.phone.toLowerCase().includes(quotationSearch.toLowerCase());

      const matchesStatus =
        quotationFilterStatus === 'all' || req.status === quotationFilterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return quotationSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  const totalQuotationPages = Math.ceil(processedQuotations.length / quotationPerPage);
  const quotationStartIndex = (quotationPage - 1) * quotationPerPage;
  const paginatedQuotations = processedQuotations.slice(quotationStartIndex, quotationStartIndex + quotationPerPage);

  const fetchQuotationRequests = () => {
    setLoadingQuotations(true);
    setQuotationsError(null);
    apiFetch('/admin/quotation-requests')
      .then((data) => {
        setQuotationRequests(data.requests || []);
      })
      .catch((err) => {
        setQuotationsError(err.message);
      })
      .finally(() => setLoadingQuotations(false));
  };

  const handleUpdateQuotationStatus = async (id: string, newStatus: 'Pending' | 'Under Review' | 'Contacted' | 'Quotation Sent' | 'Approved' | 'Rejected') => {
    try {
      const data = await apiFetch(`/admin/quotation-requests/${id}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      setQuotationRequests(prev => prev.map(req => req._id === id ? { ...req, status: newStatus } : req));
      showToast(`Quotation request marked as ${newStatus}`, 'success');
      if (selectedQuotation && selectedQuotation._id === id) {
        setSelectedQuotation(data.request || { ...selectedQuotation, status: newStatus });
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteQuotation = async (id: string) => {
    try {
      await apiFetch(`/admin/quotation-requests/${id}`, { method: 'DELETE' });
      setQuotationRequests(prev => prev.filter(req => req._id !== id));
      showToast('Quotation request deleted successfully', 'success');
      if (selectedQuotation && selectedQuotation._id === id) setSelectedQuotation(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
    setDeleteQuotationModal(null);
  };

  const fetchInquiries = () => {
    setLoadingInquiries(true);
    setInquiryError(null);
    apiFetch('/admin/inquiries')
      .then((data) => {
        setInquiries(data.inquiries || []);
      })
      .catch((err) => {
        setInquiryError(err.message);
        showToast(err.message, 'error');
      })
      .finally(() => {
        setLoadingInquiries(false);
      });
  };

  const handleUpdateInquiryStatus = async (id: string, newStatus: 'unread' | 'read') => {
    fetch(`${VITE_RENDER_API_URL}/admin/inquiries/${id}/status`, {
      method: "PATCH",
      headers: getJsonHeaders(),
      body: JSON.stringify({ status: newStatus })
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to update status");
      return data;
    }).then((data) => {
      setInquiries(prev => prev.map(inq => inq._id === id ? { ...inq, status: newStatus } : inq));
      showToast(`Message marked as ${newStatus}`, 'success');
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry(data.inquiry);
      }
    }).catch((err) => {
      showToast(err.message, 'error');
    });
  };

  const handleDeleteInquiry = async (id: string) => {
    fetch(`${VITE_RENDER_API_URL}/admin/inquiries/${id}`, {
      method: "DELETE",
      headers: getJsonHeaders()
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to delete inquiry");
      return data;
    }).then(() => {
      setInquiries(prev => prev.filter(inq => inq._id !== id));
      showToast("Inquiry deleted successfully", 'success');
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry(null);
      }
    }).catch((err) => {
      showToast(err.message, 'error');
    });
    setDeleteInquiryModal(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: {
      institutionName?: string,
      email?: string,
      password?: string,
      portalExpiryDate?: string
    } = {};

    if (!formData.institutionName.trim()) {
      newErrors.institutionName = "Institution Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    const expiryDate = new Date(formData.portalExpiryDate);

    if (expiryDate.getTime() < new Date().getTime()) {
      newErrors.portalExpiryDate = "Date is Invalid";
    }

    setErrors(newErrors);

    return newErrors;
  };

  const updateShowModal = () => {
    setShowModal(true);
    setAddOrUpdate(true);
    setFormData({
      institutionName: "",
      email: "",
      password: "",
      portalExpiryDate: new Date(),
      role: "client",
      oldEmail: "",
      institutionType: "University",
      logoUrl: "",
      isActive: true
    });
  }

  const changeClient = (client: Client, update: boolean) => {
    if (update) {
      setShowModal(true);
      setAddOrUpdate(false);
      setFormData({
        institutionName: client.institutionName,
        email: client.email,
        password: "", // User re-enters password
        portalExpiryDate: new Date(client.portalExpiryDate),
        role: "client",
        oldEmail: client.email,
        institutionType: client.institutionType || "University",
        logoUrl: client.logoUrl || "",
        isActive: client.isActive !== undefined ? client.isActive : true
      });
    }
    else {
      setDeleteModal(true);
      setFormData(prev => ({ ...prev, oldEmail: client.email }));
    }
  }


  const handleNavClick = (section: string) => {
    setActiveSection(section)
    setSearchTerm('')
    setSidebarOpen(false)
  }


  const fetchLogs = () => {
    apiFetch('/admin/logs')
      .then((data) => setLogs(data.logs || []))
      .catch((err) => {
        showToast(err.message, 'error');
      });
  };

  useEffect(() => {
    if (activeSection === "dashboard" || activeSection === "logs") {
      const fetchStudents = async () => {
        try {
          const data = await apiFetch('/admin/students');
          setStudents(data.students || []);
        } catch (err: any) {
          showToast(err.message, "error");
        }
      };
      fetchStudents();
    }

    if (activeSection === "dashboard" || activeSection === "clients") {
      const fetchClients = async () => {
        try {
          const data = await apiFetch('/admin/dashboard');
          const clients: Client[] = (data.data || []).map(
            (user: any, index: number) => ({
              id: index + 1,
              _id: user._id,
              institutionName: user.institutionName,
              email: user.email,
              students: user.students,
              status: "active",
              portalExpiryDate: user.portalExpiryDate.split("T")[0],
              institutionType: user.institutionType,
              logoUrl: user.logoUrl,
              isActive: user.isActive
            })
          );
          updateClientLists(clients);
        } catch (err: any) {
          showToast(err.message, "error");
        }
      };
      fetchClients();
    }

    if (activeSection === "logs") {
      fetchLogs();
    }

    if (activeSection === "contact-messages") {
      fetchInquiries();
    }

    if (activeSection === "quotation-requests") {
      fetchQuotationRequests();
    }
  }, [activeSection]);

  const addOrUpdateClient = async (e: React.MouseEvent<HTMLButtonElement>) => {
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
      fetch(`${VITE_RENDER_API_URL}/admin/clients`, {
        method: "POST",
        headers: getJsonHeaders(),
        body: JSON.stringify(formData),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message);
        return data;
      }).then((data) => {
        const newClient = toClientRow(data.client, clients.length + 1);
        const updatedClients = [...clients.filter((client) => client.email !== data.client.email), newClient];
        updateClientLists(updatedClients);
        showToast(data.message, "success");
      }).catch((err) => {
        showToast(err.message, "error");
      });
    }
    else {
      fetch(`${VITE_RENDER_API_URL}/admin/clients/${formData.oldEmail}`, {
        method: "PUT",
        headers: getJsonHeaders(),
        body: JSON.stringify(formData),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message);
        return data;
      }).then((data) => {
        const existingId = clients.find((client) => client.email === formData.oldEmail)?.id || clients.length + 1;
        const newClient = toClientRow(data.client, existingId);
        const updatedClients = [...clients.filter((client) => client.email !== formData.oldEmail), newClient];
        updateClientLists(updatedClients);
        showToast(data.message, "success");
      }).catch((err) => {
        showToast(err.message, "error");
      });
    }
    setShowModal(false);
  };

  const deleteClient = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    fetch(`${VITE_RENDER_API_URL}/admin/clients/${formData.oldEmail}`, {
      method: "DELETE",
      headers: getJsonHeaders()
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message);
      return data;
    }).then((data) => {
      const deletedClient: Client = data.client;
      const updatedClients = clients.filter((client) => client.email !== deletedClient.email);
      updateClientLists(updatedClients);
      showToast(data.message, "success");
    }).catch((err) => {
      showToast(err.message, "error");
    });
    setDeleteModal(false);
  }

  const handleSaveSettings = () => {
    if (!adminEmail.trim()) {
      showToast("Admin email is required", "error");
      return;
    }

    // Save standard settings to localStorage
    localStorage.setItem("settings_smtpServer", smtpServer);
    localStorage.setItem("settings_senderEmail", senderEmail);
    localStorage.setItem("settings_otpExpiry", otpExpiry);
    localStorage.setItem("settings_defaultPortalDuration", defaultPortalDuration);
    localStorage.setItem("userEmail", adminEmail);

    if (adminPassword) {
      fetch(`${VITE_RENDER_API_URL}/admin/password/${adminEmail}`, {
        method: "PATCH",
        headers: getJsonHeaders(),
        body: JSON.stringify({ password: adminPassword }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to change password");
        return data;
      }).then(() => {
        showToast("Settings and password updated successfully!", "success");
        setAdminPassword("");
      }).catch((err) => {
        showToast(err.message, "error");
      });
    } else {
      showToast("Settings saved successfully!", "success");
    }
  };


  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <BarChart3 size={18} />
            </div>
            ResultScale
            <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
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
              className={`nav-item ${activeSection === 'clients' ? 'active' : ''}`}
              onClick={() => handleNavClick('clients')}
            >
              <Building2 size={18} />
              Clients
            </button>
            <button
              className={`nav-item ${activeSection === 'logs' ? 'active' : ''}`}
              onClick={() => handleNavClick('logs')}
            >
              <History size={18} />
              Activity Logs
            </button>
            <button
              className={`nav-item ${activeSection === 'contact-messages' ? 'active' : ''}`}
              onClick={() => handleNavClick('contact-messages')}
            >
              <Mail size={18} />
              Contact Messages
            </button>
            <button
              className={`nav-item ${activeSection === 'quotation-requests' ? 'active' : ''}`}
              onClick={() => handleNavClick('quotation-requests')}
            >
              <FileText size={18} />
              Quotation Requests
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
            <div className="user-avatar">{adminEmail.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <div className="user-name" title={adminEmail} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                {adminEmail}
              </div>
              <div className="user-role">Super Admin</div>
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
              {activeSection === 'dashboard' && 'Admin Dashboard'}
              {activeSection === 'clients' && 'Client Management'}
              {activeSection === 'logs' && 'Platform Activity Logs'}
              {activeSection === 'contact-messages' && 'Contact Us Messages'}
              {activeSection === 'quotation-requests' && 'Quotation Requests'}
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
                    <span className="stat-card-title">Total Clients</span>
                    <div className="stat-card-icon primary">
                      <Building2 size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value"> {clients.length}</div>
                  <div className="stat-card-change positive">+{clients.length} total institutions</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Server 1</span>
                    <div className="stat-card-icon green">
                      <Server size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">{renderStudents.length || 0}</div>
                  <div className="stat-card-change">
                    Students in Render
                  </div>
                </div>


                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Server 2</span>
                    <div className="stat-card-icon orange">
                      <Server size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">{railwayStudents.length || 0}</div>
                  <div className="stat-card-change">Students in Railway</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Total Students</span>
                    <div className="stat-card-icon blue">
                      <Users size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">{students.length}</div>
                  <div className="stat-card-change positive">Across all active servers</div>
                </div>
              </div>

              {/* Interactive Charts Grid */}
              <div className="charts-grid">
                {/* Chart 1: Top Client Institutions by Students */}
                <div className="chart-card">
                  <h3 className="chart-card-title">Top Institutions by Students</h3>
                  <div className="chart-container">
                    {clients.length === 0 ? (
                      <div className="empty-state" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>No client institutions found</div>
                    ) : (
                      (() => {
                        const topClientsByStudents = [...clients]
                          .sort((a, b) => b.students - a.students)
                          .slice(0, 5);
                        const maxStudents = Math.max(...clients.map(c => c.students), 10);

                        return (
                          <svg width="100%" height="100%" viewBox="0 0 350 160" preserveAspectRatio="xMidYMid meet">
                            {topClientsByStudents.map((client, index) => {
                              const barWidth = maxStudents > 0 ? (client.students / maxStudents) * 200 : 0;
                              const yPos = index * 30 + 10;
                              return (
                                <g key={client.id || index}>
                                  <text
                                    x="10"
                                    y={yPos + 10}
                                    fontSize="10"
                                    fontWeight="600"
                                    fill="var(--color-text)"
                                  >
                                    {client.institutionName.length > 15 ? client.institutionName.substring(0, 15) + '...' : client.institutionName}
                                  </text>
                                  <rect
                                    x="120"
                                    y={yPos}
                                    width="180"
                                    height="12"
                                    rx="3"
                                    fill="var(--color-background)"
                                  />
                                  <rect
                                    x="120"
                                    y={yPos}
                                    width={barWidth}
                                    height="12"
                                    rx="3"
                                    fill="#3b82f6"
                                    className="chart-bar"
                                    onMouseEnter={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const parentRect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
                                      if (parentRect) {
                                        setTooltipData({
                                          x: rect.left - parentRect.left + barWidth / 2 + 120,
                                          y: rect.top - parentRect.top,
                                          title: client.institutionName,
                                          value: `${client.students.toLocaleString()} Enrolled Students`
                                        });
                                      }
                                    }}
                                    onMouseLeave={() => setTooltipData(null)}
                                  />
                                  <text
                                    x={125 + barWidth}
                                    y={yPos + 10}
                                    fontSize="9"
                                    fontWeight="700"
                                    fill="var(--color-text-muted)"
                                  >
                                    {client.students}
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

                {/* Chart 2: Portal Expiry / Status breakdown */}
                <div className="chart-card">
                  <h3 className="chart-card-title">Portal Status Breakdown</h3>
                  <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {clients.length === 0 ? (
                      <div className="empty-state" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>No portal data available</div>
                    ) : (
                      (() => {
                        const activeCount = activeClients.length;
                        const expiredCount = expired;
                        const totalCount = clients.length;
                        const activePct = totalCount > 0 ? (activeCount / totalCount) * 100 : 0;
                        const expiredPct = totalCount > 0 ? (expiredCount / totalCount) * 100 : 0;
                        const circ = 314.16;
                        const activeOffset = circ - (circ * activePct) / 100;

                        return (
                          <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-around' }}>
                            <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                              <svg width="140" height="140" viewBox="0 0 120 120">
                                <circle
                                  cx="60"
                                  cy="60"
                                  r="50"
                                  fill="transparent"
                                  stroke="var(--color-background)"
                                  strokeWidth="14"
                                />
                                {expiredCount > 0 && (
                                  <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="transparent"
                                    stroke="#f97316"
                                    strokeWidth="14"
                                    strokeDasharray={circ}
                                    strokeDashoffset={0}
                                    className="chart-pie-segment"
                                    onMouseEnter={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const parentRect = e.currentTarget.parentElement?.parentElement?.parentElement?.getBoundingClientRect();
                                      if (parentRect) {
                                        setTooltipData({
                                          x: rect.left - parentRect.left + 70,
                                          y: rect.top - parentRect.top + 30,
                                          title: 'Expired Portals',
                                          value: `${expiredCount} (${expiredPct.toFixed(0)}%)`
                                        });
                                      }
                                    }}
                                    onMouseLeave={() => setTooltipData(null)}
                                  />
                                )}
                                {activeCount > 0 && (
                                  <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="transparent"
                                    stroke="#22c55e"
                                    strokeWidth="14"
                                    strokeDasharray={circ}
                                    strokeDashoffset={activeOffset}
                                    transform="rotate(-90 60 60)"
                                    className="chart-pie-segment"
                                    onMouseEnter={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const parentRect = e.currentTarget.parentElement?.parentElement?.parentElement?.getBoundingClientRect();
                                      if (parentRect) {
                                        setTooltipData({
                                          x: rect.left - parentRect.left + 70,
                                          y: rect.top - parentRect.top + 30,
                                          title: 'Active Portals',
                                          value: `${activeCount} (${activePct.toFixed(0)}%)`
                                        });
                                      }
                                    }}
                                    onMouseLeave={() => setTooltipData(null)}
                                  />
                                )}
                              </svg>
                              <div style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none'
                              }}>
                                <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text)' }}>{totalCount}</span>
                                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Portals</span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#22c55e' }}></span>
                                <strong>Active:</strong> {activeCount} ({activePct.toFixed(0)}%)
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f97316' }}></span>
                                <strong>Expired:</strong> {expiredCount} ({expiredPct.toFixed(0)}%)
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Clients Preview */}
              <div className="table-section">
                <div className="table-header">
                  <h2 className="table-title">Recent Clients</h2>
                  <button className="btn btn-outline" onClick={() => setActiveSection('clients')}>
                    View All
                  </button>
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Institution</th>
                      <th>Email</th>
                      <th>Students</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.slice(-3).map((client) => (
                      <tr key={client.id} className="clickable-row" onClick={() => setSelectedClient(client)}>
                        <td style={{ fontWeight: 500 }}>{client.institutionName}</td>
                        <td style={{ color: 'var(--color-text-muted)' }}>{client.email}</td>
                        <td>{client.students.toLocaleString()}</td>
                        <td>
                          <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                            {client.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Clients Section */}
          {activeSection === 'clients' && (
            <div className="table-section">
              <div className="table-header" style={{ borderBottom: 'none' }}>
                <h2 className="table-title">Client Institutions</h2>
                <div className="table-actions">
                  <button className="btn btn-primary" onClick={() => updateShowModal()}>
                    <Plus size={16} />
                    Add Client
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
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ margin: 0 }}
                  />
                </div>

                <div className="filter-group">
                  <span className="filter-label">Status</span>
                  <select
                    className="filter-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                  >
                    <option value="all">All Portals</option>
                    <option value="active">Active Only</option>
                    <option value="expired">Expired Only</option>
                  </select>
                </div>

                <div className="filter-group">
                  <span className="filter-label">Sort By</span>
                  <select
                    className="filter-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <option value="institutionName">Institution Name</option>
                    <option value="students">Student Count</option>
                    <option value="portalExpiryDate">Expiry Date</option>
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
                    <th>Institution</th>
                    <th>Email</th>
                    <th>Students</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processedClients.map((client) => (
                    <tr
                      key={client.id}
                      className="clickable-row"
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('.action-btn')) return;
                        setSelectedClient(client);
                      }}
                    >
                      <td style={{ fontWeight: 500 }}>{client.institutionName}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{client.email}</td>
                      <td>{client.students.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                          {client.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{client.portalExpiryDate}</td>
                      <td>
                        <button className="action-btn edit" onClick={() => changeClient(client, true)}>
                          <Pencil size={14} />
                        </button>
                        <button className="action-btn delete" onClick={() => changeClient(client, false)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Activity Logs Section */}
          {activeSection === 'logs' && (
            <div className="table-section">
              <div className="table-header" style={{ borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="table-title">System Audit & Activity Logs</h2>
                <button className="btn btn-outline" onClick={fetchLogs} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RotateCw size={14} />
                  Refresh
                </button>
              </div>

              {/* Filters Toolbar */}
              <div className="filter-toolbar">
                <div className="filter-group">
                  <span className="filter-label">Search</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search logs by email, action..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ margin: 0 }}
                  />
                </div>

                <div className="filter-group">
                  <span className="filter-label">Category</span>
                  <select
                    className="filter-select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                  >
                    <option value="all">All Categories</option>
                    <option value="auth">Authentication</option>
                    <option value="student">Student CRUD</option>
                    <option value="client">Client CRUD</option>
                    <option value="system">System Events</option>
                    <option value="security">Security</option>
                  </select>
                </div>

                <div className="filter-group">
                  <span className="filter-label">Status</span>
                  <select
                    className="filter-select"
                    value={filterLogStatus}
                    onChange={(e) => setFilterLogStatus(e.target.value as any)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="success">Success Only</option>
                    <option value="failure">Failure Only</option>
                  </select>
                </div>

                <button
                  className="sort-btn"
                  onClick={() => setLogSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                >
                  Order: {logSortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                </button>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User / Actor</th>
                    <th>Category</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {processedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                        No activity logs found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    processedLogs.map((log) => {
                      let categoryBadgeClass = 'badge-success';
                      if (log.category === 'auth') categoryBadgeClass = 'badge-info';
                      else if (log.category === 'client') categoryBadgeClass = 'badge-primary';
                      else if (log.category === 'student') categoryBadgeClass = 'badge-success';
                      else if (log.category === 'system') categoryBadgeClass = 'badge-warning';
                      else if (log.category === 'security') categoryBadgeClass = 'badge-error';

                      return (
                        <tr key={log._id}>
                          <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 500 }}>{log.userEmail}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                                {log.userRole}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${categoryBadgeClass}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                              {log.category}
                            </span>
                          </td>
                          <td style={{ fontWeight: 500 }}>{log.action}</td>
                          <td style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.details}>
                            {log.details}
                          </td>
                          <td>
                            {log.status === 'success' ? (
                              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={12} /> Success
                              </span>
                            ) : (
                              <span className="badge badge-error" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <XCircle size={12} /> Failure
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Contact Messages Section */}
          {activeSection === 'contact-messages' && (
            <div className="table-section">
              <div className="table-header" style={{ borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="table-title">Contact Form Messages</h2>
                <button className="btn btn-outline" onClick={fetchInquiries} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RotateCw size={14} />
                  Refresh
                </button>
              </div>

              {/* Filters Toolbar */}
              <div className="filter-toolbar">
                <div className="filter-group">
                  <span className="filter-label">Search</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search messages..."
                    value={inquirySearch}
                    onChange={(e) => {
                      setInquirySearch(e.target.value);
                      setInquiryPage(1);
                    }}
                    style={{ margin: 0 }}
                  />
                </div>

                <div className="filter-group">
                  <span className="filter-label">Status</span>
                  <select
                    className="filter-select"
                    value={inquiryFilterStatus}
                    onChange={(e) => {
                      setInquiryFilterStatus(e.target.value as any);
                      setInquiryPage(1);
                    }}
                  >
                    <option value="all">All Messages</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>
                </div>

                <button
                  className="sort-btn"
                  onClick={() => setInquirySortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                >
                  Order: {inquirySortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                </button>
              </div>

              {loadingInquiries ? (
                <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', gap: '12px' }}>
                  <RotateCw size={24} className="spinner-icon animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading messages...</span>
                </div>
              ) : inquiryError ? (
                <div className="error-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-badge-error-text)', backgroundColor: 'var(--color-badge-error-bg)', borderRadius: '8px' }}>
                  {inquiryError}
                </div>
              ) : paginatedInquiries.length === 0 ? (
                <div className="empty-state" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <Mail size={48} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text)' }}>No Messages Found</h3>
                  <p style={{ color: 'var(--color-text-muted)', maxWidth: '360px', fontSize: '0.9rem' }}>
                    When users submit contact inquiries from the homepage, they will appear here.
                  </p>
                </div>
              ) : (
                <div className='contact-table'>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Institution</th>
                        <th>Subject</th>
                        <th>Message Preview</th>
                        <th>Date Submitted</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedInquiries.map((inq) => (
                        <tr
                          key={inq._id}
                          className="clickable-row"
                          style={{ fontWeight: inq.status === 'unread' ? '600' : 'normal' }}
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest('.action-btn')) return;
                            setSelectedInquiry(inq);
                            if (inq.status === 'unread') {
                              handleUpdateInquiryStatus(inq._id, 'read');
                            }
                          }}
                        >
                          <td>{inq.fullName}</td>
                          <td style={{ color: 'var(--color-text-muted)' }}>{inq.email}</td>
                          <td style={{ color: 'var(--color-text-muted)' }}>{inq.phone}</td>
                          <td>{inq.institutionName}</td>
                          <td style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={inq.subject}>
                            {inq.subject}
                          </td>
                          <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)' }} title={inq.message}>
                            {inq.message}
                          </td>
                          <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            {new Date(inq.createdAt).toLocaleDateString()} {new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td>
                            <span className={`badge ${inq.status === 'unread' ? 'badge-error' : 'badge-success'}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                              {inq.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                className="action-btn edit"
                                title="View message"
                                onClick={() => {
                                  setSelectedInquiry(inq);
                                  if (inq.status === 'unread') {
                                    handleUpdateInquiryStatus(inq._id, 'read');
                                  }
                                }}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                className="action-btn"
                                style={{ color: 'var(--color-text-secondary)' }}
                                title={inq.status === 'unread' ? "Mark as Read" : "Mark as Unread"}
                                onClick={() => handleUpdateInquiryStatus(inq._id, inq.status === 'unread' ? 'read' : 'unread')}
                              >
                                {inq.status === 'unread' ? <MailOpen size={14} /> : <Mail size={14} />}
                              </button>
                              <button
                                className="action-btn delete"
                                title="Delete message"
                                onClick={() => setDeleteInquiryModal(inq)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {totalInquiryPages > 1 && (
                    <div className="pagination-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        Showing {inquiryStartIndex + 1} to {Math.min(inquiryStartIndex + inquiryPerPage, processedInquiries.length)} of {processedInquiries.length} inquiries
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-outline"
                          disabled={inquiryPage === 1}
                          onClick={() => setInquiryPage(prev => Math.max(prev - 1, 1))}
                          style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                        >
                          Previous
                        </button>
                        {Array.from({ length: totalInquiryPages }, (_, i) => i + 1).map(p => (
                          <button
                            key={p}
                            className={`btn ${inquiryPage === p ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setInquiryPage(p)}
                            style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          className="btn btn-outline"
                          disabled={inquiryPage === totalInquiryPages}
                          onClick={() => setInquiryPage(prev => Math.min(prev + 1, totalInquiryPages))}
                          style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection === 'quotation-requests' && (
            <div className="table-section">
              <div className="table-header" style={{ borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="table-title">Quotation Requests</h2>
                <button className="btn btn-outline" onClick={fetchQuotationRequests} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RotateCw size={14} />
                  Refresh
                </button>
              </div>

              {/* Filters Toolbar */}
              <div className="filter-toolbar">
                <div className="filter-group">
                  <span className="filter-label">Search</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search requests..."
                    value={quotationSearch}
                    onChange={(e) => {
                      setQuotationSearch(e.target.value);
                      setQuotationPage(1);
                    }}
                    style={{ margin: 0 }}
                  />
                </div>

                <div className="filter-group">
                  <span className="filter-label">Status</span>
                  <select
                    className="filter-select"
                    value={quotationFilterStatus}
                    onChange={(e) => {
                      setQuotationFilterStatus(e.target.value as any);
                      setQuotationPage(1);
                    }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Quotation Sent">Quotation Sent</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <button
                  className="sort-btn"
                  onClick={() => setQuotationSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                >
                  Order: {quotationSortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                </button>
              </div>

              {loadingQuotations ? (
                <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', gap: '12px' }}>
                  <RotateCw size={24} className="spinner-icon animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading requests...</span>
                </div>
              ) : quotationsError && quotationRequests.length === 0 ? (
                <div className="error-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-badge-error-text)', backgroundColor: 'var(--color-badge-error-bg)', borderRadius: '8px' }}>
                  {quotationsError}
                </div>
              ) : processedQuotations.length === 0 ? (
                <div className="empty-state" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <FileText size={48} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text)' }}>No Requests Found</h3>
                  <p style={{ color: 'var(--color-text-muted)', maxWidth: '360px', fontSize: '0.9rem' }}>
                    When clients request result hosting estimations, their entries will show up here.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Institution</th>
                          <th>Contact Person</th>
                          <th>Email</th>
                          <th>Phone Number</th>
                          <th>Students</th>
                          <th>Duration (Days)</th>
                          <th>Estimated Total</th>
                          <th>Status</th>
                          <th>Created Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedQuotations.map((req) => (
                          <tr
                            key={req._id}
                            className="clickable-row"
                            onClick={(e) => {
                              const target = e.target as HTMLElement;
                              if (target.closest('.action-btn')) return;
                              setSelectedQuotation(req);
                            }}
                          >
                            <td style={{ fontWeight: 500, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.institutionName}>{req.institutionName}</td>
                            <td style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.contactPerson}>{req.contactPerson}</td>
                            <td style={{ color: 'var(--color-text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.email}>{req.email}</td>
                            <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{req.phone}</td>
                            <td>{(req.studentCount || 0).toLocaleString('en-IN')}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{req.accessDurationDays} Days</td>
                            <td style={{ fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>₹{(req.estimatedTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td>
                              {(() => {
                                let bgColor = '#FEF3C7';
                                let color = '#D97706';
                                let borderColor = '#FDE68A';
                                switch (req.status) {
                                  case 'Under Review':
                                    bgColor = '#EFF6FF'; color = '#2563EB'; borderColor = '#DBEAFE'; break;
                                  case 'Contacted':
                                    bgColor = '#EEF2FF'; color = '#4F46E5'; borderColor = '#E0E7FF'; break;
                                  case 'Quotation Sent':
                                    bgColor = '#F0FDFA'; color = '#0D9488'; borderColor = '#CCFBF1'; break;
                                  case 'Approved':
                                    bgColor = '#ECFDF5'; color = '#059669'; borderColor = '#D1FAE5'; break;
                                  case 'Rejected':
                                    bgColor = '#FEF2F2'; color = '#DC2626'; borderColor = '#FEE2E2'; break;
                                }
                                return (
                                  <span className="badge" style={{
                                    backgroundColor: bgColor,
                                    color: color,
                                    border: `1px solid ${borderColor}`,
                                    textTransform: 'capitalize',
                                    fontSize: '0.75rem',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                    display: 'inline-block'
                                  }}>
                                    {req.status}
                                  </span>
                                );
                              })()}
                            </td>
                            <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                              {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  className="action-btn edit"
                                  title="View Details"
                                  onClick={() => setSelectedQuotation(req)}
                                >
                                  <Eye size={14} />
                                </button>
                                <a
                                  href={`mailto:${req.email}`}
                                  className="action-btn"
                                  style={{ color: '#EF4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                  title="Contact Client"
                                >
                                  <Mail size={14} />
                                </a>
                                <button
                                  className="action-btn delete"
                                  title="Delete request"
                                  onClick={() => setDeleteQuotationModal(req)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalQuotationPages > 1 && (
                    <div className="pagination-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        Showing {quotationStartIndex + 1} to {Math.min(quotationStartIndex + quotationPerPage, processedQuotations.length)} of {processedQuotations.length} requests
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-outline"
                          disabled={quotationPage === 1}
                          onClick={() => setQuotationPage(prev => Math.max(prev - 1, 1))}
                          style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                        >
                          Previous
                        </button>
                        {Array.from({ length: totalQuotationPages }, (_, i) => i + 1).map(p => (
                          <button
                            key={p}
                            className={`btn ${quotationPage === p ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setQuotationPage(p)}
                            style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          className="btn btn-outline"
                          disabled={quotationPage === totalQuotationPages}
                          onClick={() => setQuotationPage(prev => Math.min(prev + 1, totalQuotationPages))}
                          style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="settings-container">
              <div className="settings-section">
                <h2 className="settings-title">
                  <Shield size={20} />
                  Account Settings
                </h2>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Admin Email</strong>
                      <span>Primary contact for system notifications</span>
                    </div>
                    <div className="settings-value">
                      <input
                        type="email"
                        className="form-input"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                      />
                    </div>
                  </div>
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
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-title">
                  <Mail size={20} />
                  Email Configuration
                </h2>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>SMTP Server</strong>
                      <span>Email server for OTP delivery</span>
                    </div>
                    <div className="settings-value">
                      <input
                        type="text"
                        className="form-input"
                        value={smtpServer}
                        onChange={(e) => setSmtpServer(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Sender Email</strong>
                      <span>From address for outgoing emails</span>
                    </div>
                    <div className="settings-value">
                      <input
                        type="email"
                        className="form-input"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-title">
                  <Calendar size={20} />
                  Default Settings
                </h2>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>OTP Expiry Time</strong>
                      <span>How long OTP codes remain valid</span>
                    </div>
                    <div className="settings-value">
                      <select
                        className="form-input"
                        value={otpExpiry}
                        onChange={(e) => setOtpExpiry(e.target.value)}
                      >
                        <option value="5 minutes">5 minutes</option>
                        <option value="10 minutes">10 minutes</option>
                        <option value="15 minutes">15 minutes</option>
                        <option value="30 minutes">30 minutes</option>
                      </select>
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Default Portal Duration</strong>
                      <span>Default client portal access period</span>
                    </div>
                    <div className="settings-value">
                      <select
                        className="form-input"
                        value={defaultPortalDuration}
                        onChange={(e) => setDefaultPortalDuration(e.target.value)}
                      >
                        <option value="3 months">3 months</option>
                        <option value="6 months">6 months</option>
                        <option value="1 year">1 year</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-title">
                  <Database size={20} />
                  System
                </h2>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Database</strong>
                      <span>View database structure documentation</span>
                    </div>
                    <div className="settings-value">
                      <Link to="/database" className="btn btn-outline">View Schema</Link>
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

      {/* Add Client Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{(addOrUpdate) ? "Add" : "Update"} Client</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form className="modal-form">
                <div className="form-group">
                  <label className="form-label">Institution Name</label>
                  <input type="text" className="form-input" placeholder="Enter institution name" value={formData.institutionName} onChange={(e) => handleInputChange('institutionName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="Enter email address" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" placeholder={addOrUpdate ? "Create password" : "Enter password"} value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Portal Expiry Date</label>
                  <input type="date" className="form-input" value={formData.portalExpiryDate ? (formData.portalExpiryDate instanceof Date ? formData.portalExpiryDate.toISOString().split("T")[0] : String(formData.portalExpiryDate).split("T")[0]) : ""} onChange={(e) => handleInputChange('portalExpiryDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Institution Type</label>
                  <select className="form-input" value={formData.institutionType} onChange={(e) => handleInputChange('institutionType', e.target.value)}>
                    <option value="University">University</option>
                    <option value="Autonomous Institution">Autonomous Institution</option>
                    <option value="Science & Research">Science & Research</option>
                    <option value="Engineering & Technology">Engineering & Technology</option>
                    <option value="Management & Business">Management & Business</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Logo URL</label>
                  <input type="text" className="form-input" placeholder="Enter logo image URL (optional)" value={formData.logoUrl} onChange={(e) => handleInputChange('logoUrl', e.target.value)} />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={(e) => addOrUpdateClient(e)}>{(addOrUpdate) ? "Create" : "Update"} Client</button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(false)}>
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
              <button className="btn btn-outline" onClick={() => setDeleteModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={(e) => deleteClient(e)}>Delete Client</button>
            </div>
          </div>
        </div>
      )}

      {selectedClient && (
        <div className="modal-overlay" onClick={() => setSelectedClient(null)}>
          <div className="modal" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Institution Drill-down: {selectedClient.institutionName}</h3>
              <button className="modal-close" onClick={() => setSelectedClient(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {(() => {
                const clientStudents = students.filter(s => s.institutionName === selectedClient.institutionName);
                const avgSgpa = clientStudents.length > 0
                  ? clientStudents.reduce((acc, curr) => acc + curr.sgpa, 0) / clientStudents.length
                  : 0;

                const expiryDate = new Date(selectedClient.portalExpiryDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const diffTime = expiryDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isExpired = diffDays <= 0;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    {/* Expiry Alert banner */}
                    <div className={`countdown-widget ${isExpired ? 'expired' : ''}`}>
                      <Clock size={16} />
                      {isExpired ? (
                        <span>Expired: This institution's portal expired {Math.abs(diffDays)} days ago. Portal access is blocked.</span>
                      ) : (
                        <span>Active: Portal expires in {diffDays} days ({selectedClient.portalExpiryDate}).</span>
                      )}
                    </div>

                    <div className="detail-grid">
                      <div className="detail-card">
                        <div className="detail-label">Client Email</div>
                        <div className="detail-value">{selectedClient.email}</div>
                      </div>
                      <div className="detail-card">
                        <div className="detail-label">Registered Students</div>
                        <div className="detail-value">{clientStudents.length} / {selectedClient.students}</div>
                      </div>
                      <div className="detail-card">
                        <div className="detail-label">Average SGPA</div>
                        <div className="detail-value">{avgSgpa > 0 ? avgSgpa.toFixed(2) : 'N/A'}</div>
                      </div>
                      <div className="detail-card">
                        <div className="detail-label">Portal Status</div>
                        <div className="detail-value">
                          <span className={`badge ${!isExpired ? 'badge-success' : 'badge-error'}`} style={{ display: 'inline-block' }}>
                            {!isExpired ? 'Active' : 'Expired'}
                          </span>
                        </div>
                      </div>
                      <div className="detail-card">
                        <div className="detail-label">Institution Type</div>
                        <div className="detail-value">{selectedClient.institutionType || 'University'}</div>
                      </div>
                      <div className="detail-card">
                        <div className="detail-label">Logo URL</div>
                        <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '6px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={selectedClient.logoUrl}>
                          {selectedClient.logoUrl ? (
                            <img src={selectedClient.logoUrl} alt="Logo" style={{ height: '20px', borderRadius: '2px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          ) : null}
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedClient.logoUrl || 'None'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--color-text)' }}>Enrolled Students List ({clientStudents.length})</h4>
                      <div className="detail-table-container">
                        {clientStudents.length === 0 ? (
                          <div style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                            No students registered yet for this client.
                          </div>
                        ) : (
                          <table className="detail-table">
                            <thead>
                              <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>SGPA</th>
                              </tr>
                            </thead>
                            <tbody>
                              {clientStudents.map(student => (
                                <tr key={student.rollNo}>
                                  <td style={{ fontWeight: 500 }}>{student.rollNo}</td>
                                  <td>{student.name}</td>
                                  <td style={{ color: 'var(--color-text-muted)' }}>{student.email}</td>
                                  <td style={{ fontWeight: 600 }}>{student.sgpa.toFixed(1)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedClient(null)}>Close</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  changeClient(selectedClient, true);
                  setSelectedClient(null);
                }}
              >
                Edit Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedInquiry && (
        <div className="modal-overlay" onClick={() => setSelectedInquiry(null)}>
          <div className="modal" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Contact Message Detail</h3>
              <button className="modal-close" onClick={() => setSelectedInquiry(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-sm)' }}>
                <div className="detail-card">
                  <div className="detail-label">Sender Name</div>
                  <div className="detail-value" style={{ fontWeight: 600 }}>{selectedInquiry.fullName}</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Email Address</div>
                  <div className="detail-value">
                    <a href={`mailto:${selectedInquiry.email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                      {selectedInquiry.email}
                    </a>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Phone Number</div>
                  <div className="detail-value">
                    <a href={`tel:${selectedInquiry.phone}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                      {selectedInquiry.phone}
                    </a>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Institution Name</div>
                  <div className="detail-value">{selectedInquiry.institutionName}</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Date Submitted</div>
                  <div className="detail-value">
                    {new Date(selectedInquiry.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Status</div>
                  <div className="detail-value">
                    <span className={`badge ${selectedInquiry.status === 'unread' ? 'badge-error' : 'badge-success'}`}>
                      {selectedInquiry.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Subject</label>
                <div className="detail-value" style={{ padding: '8px 12px', background: 'var(--color-background)', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 600 }}>
                  {selectedInquiry.subject}
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Message</label>
                <div style={{
                  padding: '12px 16px',
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  color: 'var(--color-text)'
                }}>
                  {selectedInquiry.message}
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    handleUpdateInquiryStatus(selectedInquiry._id, selectedInquiry.status === 'unread' ? 'read' : 'unread');
                  }}
                  style={{ marginRight: '8px' }}
                >
                  Mark as {selectedInquiry.status === 'unread' ? 'Read' : 'Unread'}
                </button>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setDeleteInquiryModal(selectedInquiry);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteInquiryModal && (
        <div className="modal-overlay" onClick={() => setDeleteInquiryModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Contact Message</h3>
              <button className="modal-close" onClick={() => setDeleteInquiryModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete the message from <strong>{deleteInquiryModal.fullName}</strong> ({deleteInquiryModal.subject})? This action cannot be undone.
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteInquiryModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleDeleteInquiry(deleteInquiryModal._id)} >Delete Message</button>
            </div>
          </div>
        </div>
      )}

      {selectedQuotation && (
        <div className="modal-overlay" onClick={() => setSelectedQuotation(null)}>
          <div className="modal" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Quotation Request Detail</h3>
              <button className="modal-close" onClick={() => setSelectedQuotation(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-sm)' }}>
                <div className="detail-card">
                  <div className="detail-label">Institution Name</div>
                  <div className="detail-value" style={{ fontWeight: 600 }}>{selectedQuotation.institutionName}</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Contact Person</div>
                  <div className="detail-value" style={{ fontWeight: 600 }}>{selectedQuotation.contactPerson}</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Email Address</div>
                  <div className="detail-value">
                    <a href={`mailto:${selectedQuotation.email}`} style={{ color: '#EF4444', textDecoration: 'none', fontWeight: 600 }}>
                      {selectedQuotation.email}
                    </a>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Phone Number</div>
                  <div className="detail-value">
                    <a href={`tel:${selectedQuotation.phone}`} style={{ color: '#EF4444', textDecoration: 'none', fontWeight: 600 }}>
                      {selectedQuotation.phone}
                    </a>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Students Scale</div>
                  <div className="detail-value" style={{ fontWeight: 700 }}>
                    {(selectedQuotation.studentCount || 0).toLocaleString('en-IN')} students
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Access Duration</div>
                  <div className="detail-value">
                    {selectedQuotation.accessDurationDays} Days
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Hosting Cost</div>
                  <div className="detail-value" style={{ fontWeight: 600 }}>
                    ₹{(selectedQuotation.hostingCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">OTP Cost</div>
                  <div className="detail-value" style={{ color: 'var(--color-text-muted)' }}>
                    ₹{(selectedQuotation.otpCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Estimated Total</div>
                  <div className="detail-value" style={{ fontWeight: 800, color: '#EF4444' }}>
                    ₹{(selectedQuotation.estimatedTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">OTP Verification Required?</div>
                  <div className="detail-value" style={{ fontWeight: 600 }}>
                    {selectedQuotation.otpRequired !== false ? 'Yes' : 'No'}
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Marks Memo Downloads?</div>
                  <div className="detail-value" style={{ fontWeight: 600 }}>
                    {selectedQuotation.marksMemoRequired !== false ? 'Yes' : 'No'}
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Status</div>
                  <div className="detail-value">
                    {(() => {
                      let bgColor = '#FEF3C7';
                      let color = '#D97706';
                      let borderColor = '#FDE68A';
                      switch (selectedQuotation.status) {
                        case 'Under Review':
                          bgColor = '#EFF6FF'; color = '#2563EB'; borderColor = '#DBEAFE'; break;
                        case 'Contacted':
                          bgColor = '#EEF2FF'; color = '#4F46E5'; borderColor = '#E0E7FF'; break;
                        case 'Quotation Sent':
                          bgColor = '#F0FDFA'; color = '#0D9488'; borderColor = '#CCFBF1'; break;
                        case 'Approved':
                          bgColor = '#ECFDF5'; color = '#059669'; borderColor = '#D1FAE5'; break;
                        case 'Rejected':
                          bgColor = '#FEF2F2'; color = '#DC2626'; borderColor = '#FEE2E2'; break;
                      }
                      return (
                        <span className="badge" style={{
                          backgroundColor: bgColor,
                          color: color,
                          border: `1px solid ${borderColor}`,
                          textTransform: 'capitalize',
                          fontSize: '0.75rem',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'inline-block'
                        }}>
                          {selectedQuotation.status}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Submitted On</div>
                  <div className="detail-value">
                    {new Date(selectedQuotation.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Expected Release Date</div>
                  <div className="detail-value">
                    {selectedQuotation.expectedReleaseDate ? new Date(selectedQuotation.expectedReleaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Change Status:</span>
                  <select
                    className="filter-select"
                    value={selectedQuotation.status}
                    onChange={(e) => handleUpdateQuotationStatus(selectedQuotation._id, e.target.value as any)}
                    style={{ padding: '4px 8px', fontSize: '0.85rem', margin: 0 }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Quotation Sent">Quotation Sent</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={`mailto:${selectedQuotation.email}`}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#EF4444', borderColor: '#EF4444', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Mail size={16} />
                  Contact Client
                </a>
                <button
                  className="btn btn-outline"
                  style={{ color: '#EF4444', borderColor: '#EF4444' }}
                  onClick={() => {
                    setDeleteQuotationModal(selectedQuotation);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteQuotationModal && (
        <div className="modal-overlay" onClick={() => setDeleteQuotationModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Quotation Request</h3>
              <button className="modal-close" onClick={() => setDeleteQuotationModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete the quotation request from <strong>{deleteQuotationModal.institutionName}</strong>? This action cannot be undone.
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteQuotationModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleDeleteQuotation(deleteQuotationModal._id)} >Delete Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
