import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  superAdminDashboardService, 
  churchService, 
  contributionTargetService, 
  churchContributionService,
  contributionProgressService 
} from '../services/api';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    totalChurches: 0,
    totalContributedThisYear: 0,
    totalContributedThisMonth: 0,
    totalTargetThisYear: 0,
    overallProgress: 0,
    totalAdmins: 0,
    currentYear: new Date().getFullYear()
  });
  const [churches, setChurches] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [progressTotals, setProgressTotals] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Modals
  const [showChurchModal, setShowChurchModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showProgressDetailModal, setShowProgressDetailModal] = useState(false);
  const [selectedChurchProgress, setSelectedChurchProgress] = useState(null);
  
  // Forms
  const [churchForm, setChurchForm] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    region: '',
    phone: '',
    email: '',
    pastor_name: ''
  });
  
  const [targetForm, setTargetForm] = useState({
    church_id: '',
    year: new Date().getFullYear(),
    target_amount: '',
    description: ''
  });
  
  const [contributionForm, setContributionForm] = useState({
    church_id: '',
    amount: '',
    contribution_date: '',
    payment_method: 'bank_transfer',
    reference_number: '',
    description: '',
    receipt_number: '',
    notes: ''
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, [selectedYear]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load stats
      const statsResponse = await superAdminDashboardService.getStats();
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }

      // Load churches
      const churchesResponse = await churchService.getAll();
      if (churchesResponse.success) {
        setChurches(churchesResponse.data || []);
      }

      // Load contributions
      const contributionsResponse = await churchContributionService.getAll({ year: selectedYear });
      if (contributionsResponse.success) {
        setContributions(contributionsResponse.data || []);
      }

      // Load progress
      const progressResponse = await contributionProgressService.getAllProgress(selectedYear);
      if (progressResponse.success) {
        setProgressData(progressResponse.data || []);
        setProgressTotals(progressResponse.totals || {});
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setErrorMessage('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const showSection = (section) => {
    setActiveSection(section);
  };

  // ============================================
  // CHURCH HANDLERS
  // ============================================
  const handleChurchFormChange = (e) => {
    setChurchForm({
      ...churchForm,
      [e.target.name]: e.target.value
    });
  };

  const handleChurchSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editMode) {
        response = await churchService.update(editId, churchForm);
      } else {
        response = await churchService.create(churchForm);
      }
      
      if (response.success) {
        setShowChurchModal(false);
        resetChurchForm();
        setSuccessMessage(editMode ? 'Church updated successfully!' : 'Church added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error saving church:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to save church');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleEditChurch = (church) => {
    setChurchForm({
      name: church.name,
      code: church.code,
      address: church.address || '',
      city: church.city || '',
      region: church.region || '',
      phone: church.phone || '',
      email: church.email || '',
      pastor_name: church.pastor_name || ''
    });
    setEditId(church.id);
    setEditMode(true);
    setShowChurchModal(true);
  };

  const handleDeleteChurch = async (churchId) => {
    if (window.confirm('Are you sure you want to delete this church? This will also delete all associated contributions and targets.')) {
      try {
        await churchService.delete(churchId);
        setSuccessMessage('Church deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadDashboardData();
      } catch (error) {
        console.error('Error deleting church:', error);
        setErrorMessage('Failed to delete church');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  const resetChurchForm = () => {
    setChurchForm({
      name: '',
      code: '',
      address: '',
      city: '',
      region: '',
      phone: '',
      email: '',
      pastor_name: ''
    });
    setEditMode(false);
    setEditId(null);
  };

  // ============================================
  // TARGET HANDLERS
  // ============================================
  const handleTargetFormChange = (e) => {
    setTargetForm({
      ...targetForm,
      [e.target.name]: e.target.value
    });
  };

  const handleTargetSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await contributionTargetService.setTarget(targetForm);
      
      if (response.success) {
        setShowTargetModal(false);
        setTargetForm({
          church_id: '',
          year: new Date().getFullYear(),
          target_amount: '',
          description: ''
        });
        setSuccessMessage('Contribution target set successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error setting target:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to set target');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // ============================================
  // CONTRIBUTION HANDLERS
  // ============================================
  const handleContributionFormChange = (e) => {
    setContributionForm({
      ...contributionForm,
      [e.target.name]: e.target.value
    });
  };

  const handleContributionSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editMode) {
        response = await churchContributionService.update(editId, contributionForm);
      } else {
        response = await churchContributionService.record(contributionForm);
      }
      
      if (response.success) {
        setShowContributionModal(false);
        resetContributionForm();
        setSuccessMessage(editMode ? 'Contribution updated successfully!' : 'Contribution recorded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error recording contribution:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to record contribution');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleEditContribution = (contribution) => {
    setContributionForm({
      church_id: contribution.church_id,
      amount: contribution.amount,
      contribution_date: contribution.contribution_date.split('T')[0],
      payment_method: contribution.payment_method,
      reference_number: contribution.reference_number || '',
      description: contribution.description || '',
      receipt_number: contribution.receipt_number || '',
      notes: contribution.notes || ''
    });
    setEditId(contribution.id);
    setEditMode(true);
    setShowContributionModal(true);
  };

  const handleDeleteContribution = async (contributionId) => {
    if (window.confirm('Are you sure you want to delete this contribution?')) {
      try {
        await churchContributionService.delete(contributionId);
        setSuccessMessage('Contribution deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadDashboardData();
      } catch (error) {
        console.error('Error deleting contribution:', error);
        setErrorMessage('Failed to delete contribution');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  const resetContributionForm = () => {
    setContributionForm({
      church_id: '',
      amount: '',
      contribution_date: '',
      payment_method: 'bank_transfer',
      reference_number: '',
      description: '',
      receipt_number: '',
      notes: ''
    });
    setEditMode(false);
    setEditId(null);
  };

  // ============================================
  // PROGRESS HANDLERS
  // ============================================
  const handleViewChurchProgress = async (church) => {
    try {
      const response = await contributionProgressService.getChurchProgress(church.church_id, selectedYear);
      if (response.success) {
        setSelectedChurchProgress(response.data);
        setShowProgressDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching church progress:', error);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#10b981'; // green
    if (percentage >= 75) return '#3b82f6'; // blue
    if (percentage >= 50) return '#f59e0b'; // yellow/orange
    if (percentage >= 25) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // ============================================
  // RENDER SECTIONS
  // ============================================
  const renderDashboard = () => (
    <div className="dashboard-overview">
      <h2>Super Admin Dashboard</h2>
      <p className="welcome-text">Welcome! Monitor church contributions and progress across all branches.</p>
      
      <div className="stats-grid">
        <div className="stat-card churches">
          <div className="stat-icon">
            <i className="fas fa-church"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalChurches}</h3>
            <p>Total Churches</p>
          </div>
        </div>
        
        <div className="stat-card target">
          <div className="stat-icon">
            <i className="fas fa-bullseye"></i>
          </div>
          <div className="stat-info">
            <h3>{formatCurrency(stats.totalTargetThisYear)}</h3>
            <p>Total Target ({stats.currentYear})</p>
          </div>
        </div>
        
        <div className="stat-card contributed">
          <div className="stat-icon">
            <i className="fas fa-hand-holding-usd"></i>
          </div>
          <div className="stat-info">
            <h3>{formatCurrency(stats.totalContributedThisYear)}</h3>
            <p>Total Contributed ({stats.currentYear})</p>
          </div>
        </div>
        
        <div className="stat-card progress">
          <div className="stat-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.overallProgress}%</h3>
            <p>Overall Progress</p>
          </div>
        </div>
        
        <div className="stat-card monthly">
          <div className="stat-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="stat-info">
            <h3>{formatCurrency(stats.totalContributedThisMonth)}</h3>
            <p>This Month</p>
          </div>
        </div>
        
        <div className="stat-card admins">
          <div className="stat-icon">
            <i className="fas fa-user-shield"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalAdmins}</h3>
            <p>Total Admins</p>
          </div>
        </div>
      </div>

      {/* Quick Progress Overview */}
      <div className="quick-progress-section">
        <h3>Church Progress Overview ({selectedYear})</h3>
        <div className="progress-overview-grid">
          {progressData.slice(0, 6).map(church => (
            <div key={church.church_id} className="progress-card" onClick={() => handleViewChurchProgress(church)}>
              <div className="progress-card-header">
                <h4>{church.church_name}</h4>
                <span className="progress-badge" style={{ backgroundColor: getProgressColor(church.progress_percentage) }}>
                  {church.progress_percentage}%
                </span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${Math.min(church.progress_percentage, 100)}%`,
                    backgroundColor: getProgressColor(church.progress_percentage)
                  }}
                ></div>
              </div>
              <div className="progress-numbers">
                <span>{formatCurrency(church.total_contributed)}</span>
                <span>of {formatCurrency(church.target_amount)}</span>
              </div>
            </div>
          ))}
        </div>
        {progressData.length > 6 && (
          <button className="view-all-btn" onClick={() => showSection('progress')}>
            View All Progress <i className="fas fa-arrow-right"></i>
          </button>
        )}
      </div>
    </div>
  );

  const renderChurches = () => (
    <div className="section-content">
      <div className="section-header">
        <h2>Manage Churches</h2>
        <button className="add-btn" onClick={() => { resetChurchForm(); setShowChurchModal(true); }}>
          <i className="fas fa-plus"></i> Add Church
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Church Code</th>
              <th>Name</th>
              <th>City/Region</th>
              <th>Pastor</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {churches.map(church => (
              <tr key={church.id}>
                <td><span className="church-code">{church.code}</span></td>
                <td>{church.name}</td>
                <td>{church.city || '-'}{church.region ? `, ${church.region}` : ''}</td>
                <td>{church.pastor_name || '-'}</td>
                <td>
                  {church.phone && <div><i className="fas fa-phone"></i> {church.phone}</div>}
                  {church.email && <div><i className="fas fa-envelope"></i> {church.email}</div>}
                </td>
                <td>
                  <span className={`status-badge ${church.is_active ? 'active' : 'inactive'}`}>
                    {church.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="actions">
                  <button className="edit-btn" onClick={() => handleEditChurch(church)} title="Edit">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteChurch(church.id)} title="Delete">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {churches.length === 0 && (
              <tr>
                <td colSpan="7" className="no-data">No churches found. Add your first church to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTargets = () => (
    <div className="section-content">
      <div className="section-header">
        <h2>Contribution Targets</h2>
        <div className="header-actions">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="year-select"
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
          <button className="add-btn" onClick={() => setShowTargetModal(true)}>
            <i className="fas fa-plus"></i> Set Target
          </button>
        </div>
      </div>

      <div className="targets-grid">
        {progressData.map(church => (
          <div key={church.church_id} className="target-card">
            <div className="target-card-header">
              <h4>{church.church_name}</h4>
              <span className="church-code-badge">{church.church_code}</span>
            </div>
            <div className="target-details">
              <div className="target-row">
                <span className="label">Target:</span>
                <span className="value">{church.is_target_set ? formatCurrency(church.target_amount) : 'Not Set'}</span>
              </div>
              <div className="target-row">
                <span className="label">Contributed:</span>
                <span className="value">{formatCurrency(church.total_contributed)}</span>
              </div>
              <div className="target-row">
                <span className="label">Remaining:</span>
                <span className="value remaining">{formatCurrency(church.remaining_amount)}</span>
              </div>
            </div>
            {church.is_target_set && (
              <div className="progress-section">
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${Math.min(church.progress_percentage, 100)}%`,
                      backgroundColor: getProgressColor(church.progress_percentage)
                    }}
                  ></div>
                </div>
                <span className="progress-text">{church.progress_percentage}% Complete</span>
              </div>
            )}
            <button 
              className="set-target-btn"
              onClick={() => {
                setTargetForm({
                  church_id: church.church_id,
                  year: selectedYear,
                  target_amount: church.target_amount || '',
                  description: ''
                });
                setShowTargetModal(true);
              }}
            >
              {church.is_target_set ? 'Update Target' : 'Set Target'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContributions = () => (
    <div className="section-content">
      <div className="section-header">
        <h2>Church Contributions</h2>
        <div className="header-actions">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="year-select"
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
          <button className="add-btn" onClick={() => { resetContributionForm(); setShowContributionModal(true); }}>
            <i className="fas fa-plus"></i> Record Contribution
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Church</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Reference</th>
              <th>Receipt #</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map(contribution => (
              <tr key={contribution.id}>
                <td>{new Date(contribution.contribution_date).toLocaleDateString()}</td>
                <td>
                  <span className="church-name">{contribution.churches?.name || 'Unknown'}</span>
                  <span className="church-code-small">{contribution.churches?.code}</span>
                </td>
                <td className="amount">{formatCurrency(contribution.amount)}</td>
                <td>
                  <span className={`payment-method ${contribution.payment_method}`}>
                    {contribution.payment_method.replace('_', ' ')}
                  </span>
                </td>
                <td>{contribution.reference_number || '-'}</td>
                <td>{contribution.receipt_number || '-'}</td>
                <td className="actions">
                  <button className="edit-btn" onClick={() => handleEditContribution(contribution)} title="Edit">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteContribution(contribution.id)} title="Delete">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {contributions.length === 0 && (
              <tr>
                <td colSpan="7" className="no-data">No contributions recorded for {selectedYear}.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="section-content">
      <div className="section-header">
        <h2>Contribution Progress</h2>
        <div className="header-actions">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="year-select"
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="progress-summary-cards">
        <div className="summary-card">
          <h4>Total Target</h4>
          <p className="amount">{formatCurrency(progressTotals.total_target || 0)}</p>
        </div>
        <div className="summary-card">
          <h4>Total Contributed</h4>
          <p className="amount contributed">{formatCurrency(progressTotals.total_contributed || 0)}</p>
        </div>
        <div className="summary-card">
          <h4>Overall Progress</h4>
          <p className="amount progress">{progressTotals.overall_progress || 0}%</p>
        </div>
        <div className="summary-card">
          <h4>Remaining</h4>
          <p className="amount remaining">{formatCurrency(progressTotals.total_remaining || 0)}</p>
        </div>
      </div>

      {/* Progress Table */}
      <div className="table-container">
        <table className="data-table progress-table">
          <thead>
            <tr>
              <th>Church</th>
              <th>City</th>
              <th>Pastor</th>
              <th>Target</th>
              <th>Contributed</th>
              <th>Remaining</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {progressData.map(church => (
              <tr key={church.church_id} className={!church.is_target_set ? 'no-target' : ''}>
                <td>
                  <div className="church-info">
                    <span className="name">{church.church_name}</span>
                    <span className="code">{church.church_code}</span>
                  </div>
                </td>
                <td>{church.city || '-'}</td>
                <td>{church.pastor_name || '-'}</td>
                <td>{church.is_target_set ? formatCurrency(church.target_amount) : <span className="not-set">Not Set</span>}</td>
                <td className="contributed">{formatCurrency(church.total_contributed)}</td>
                <td className="remaining">{formatCurrency(church.remaining_amount)}</td>
                <td>
                  {church.is_target_set ? (
                    <div className="progress-cell">
                      <div className="mini-progress-bar">
                        <div 
                          className="mini-progress-fill" 
                          style={{ 
                            width: `${Math.min(church.progress_percentage, 100)}%`,
                            backgroundColor: getProgressColor(church.progress_percentage)
                          }}
                        ></div>
                      </div>
                      <span style={{ color: getProgressColor(church.progress_percentage) }}>
                        {church.progress_percentage}%
                      </span>
                    </div>
                  ) : (
                    <span className="not-applicable">N/A</span>
                  )}
                </td>
                <td>
                  <button 
                    className="view-details-btn"
                    onClick={() => handleViewChurchProgress(church)}
                    title="View Details"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'churches':
        return renderChurches();
      case 'targets':
        return renderTargets();
      case 'contributions':
        return renderContributions();
      case 'progress':
        return renderProgress();
      default:
        return renderDashboard();
    }
  };

  // Super Admin sidebar links
  const superAdminLinks = [
    { section: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
    { section: 'churches', label: 'Manage Churches', icon: 'fas fa-church' },
    { section: 'targets', label: 'Set Targets', icon: 'fas fa-bullseye' },
    { section: 'contributions', label: 'Contributions', icon: 'fas fa-hand-holding-usd' },
    { section: 'progress', label: 'View Progress', icon: 'fas fa-chart-line' },
  ];

  if (isLoading) {
    return (
      <div className="super-admin-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="super-admin-dashboard">
      {/* Custom Super Admin Sidebar */}
      <nav className="super-admin-sidebar">
        <div className="logo">
          <h2>FOCM</h2>
          <p>Super Admin Portal</p>
        </div>

        <ul className="nav-menu">
          {superAdminLinks.map((link, index) => (
            <li key={index}>
              <button
                className={`nav-link-btn ${activeSection === link.section ? 'active' : ''}`}
                onClick={() => showSection(link.section)}
              >
                <i className={link.icon}></i> {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem('adminData');
            localStorage.removeItem('isAdminLoggedIn');
            navigate('/admin/login');
          }}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        {successMessage && (
          <div className="alert success">
            <i className="fas fa-check-circle"></i> {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="alert error">
            <i className="fas fa-exclamation-circle"></i> {errorMessage}
          </div>
        )}
        
        {renderActiveSection()}
      </main>

      {/* Church Modal */}
      {showChurchModal && (
        <div className="modal-overlay" onClick={() => setShowChurchModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editMode ? 'Edit Church' : 'Add New Church'}</h3>
              <button className="close-btn" onClick={() => setShowChurchModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleChurchSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Church Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={churchForm.name}
                    onChange={handleChurchFormChange}
                    required
                    placeholder="e.g. Foundation Church Main"
                  />
                </div>
                <div className="form-group">
                  <label>Church Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={churchForm.code}
                    onChange={handleChurchFormChange}
                    required
                    placeholder="e.g. FCM-001"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={churchForm.address}
                  onChange={handleChurchFormChange}
                  placeholder="Street address"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={churchForm.city}
                    onChange={handleChurchFormChange}
                    placeholder="e.g. Nairobi"
                  />
                </div>
                <div className="form-group">
                  <label>Region</label>
                  <input
                    type="text"
                    name="region"
                    value={churchForm.region}
                    onChange={handleChurchFormChange}
                    placeholder="e.g. Nairobi County"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={churchForm.phone}
                    onChange={handleChurchFormChange}
                    placeholder="+254..."
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={churchForm.email}
                    onChange={handleChurchFormChange}
                    placeholder="church@email.com"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Pastor Name</label>
                <input
                  type="text"
                  name="pastor_name"
                  value={churchForm.pastor_name}
                  onChange={handleChurchFormChange}
                  placeholder="Pastor's full name"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowChurchModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editMode ? 'Update Church' : 'Add Church'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Target Modal */}
      {showTargetModal && (
        <div className="modal-overlay" onClick={() => setShowTargetModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Set Contribution Target</h3>
              <button className="close-btn" onClick={() => setShowTargetModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleTargetSubmit}>
              <div className="form-group">
                <label>Select Church *</label>
                <select
                  name="church_id"
                  value={targetForm.church_id}
                  onChange={handleTargetFormChange}
                  required
                >
                  <option value="">-- Select Church --</option>
                  {churches.filter(c => c.is_active).map(church => (
                    <option key={church.id} value={church.id}>
                      {church.name} ({church.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Year *</label>
                  <select
                    name="year"
                    value={targetForm.year}
                    onChange={handleTargetFormChange}
                    required
                  >
                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() - 1 + i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label>Target Amount (KES) *</label>
                  <input
                    type="number"
                    name="target_amount"
                    value={targetForm.target_amount}
                    onChange={handleTargetFormChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 500000"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={targetForm.description}
                  onChange={handleTargetFormChange}
                  placeholder="Optional notes about this target"
                  rows="3"
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowTargetModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Set Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {showContributionModal && (
        <div className="modal-overlay" onClick={() => setShowContributionModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editMode ? 'Edit Contribution' : 'Record Contribution'}</h3>
              <button className="close-btn" onClick={() => setShowContributionModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleContributionSubmit}>
              <div className="form-group">
                <label>Select Church *</label>
                <select
                  name="church_id"
                  value={contributionForm.church_id}
                  onChange={handleContributionFormChange}
                  required
                  disabled={editMode}
                >
                  <option value="">-- Select Church --</option>
                  {churches.filter(c => c.is_active).map(church => (
                    <option key={church.id} value={church.id}>
                      {church.name} ({church.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount (KES) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={contributionForm.amount}
                    onChange={handleContributionFormChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 50000"
                  />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="contribution_date"
                    value={contributionForm.contribution_date}
                    onChange={handleContributionFormChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    name="payment_method"
                    value={contributionForm.payment_method}
                    onChange={handleContributionFormChange}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Reference Number</label>
                  <input
                    type="text"
                    name="reference_number"
                    value={contributionForm.reference_number}
                    onChange={handleContributionFormChange}
                    placeholder="Transaction reference"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Receipt Number</label>
                <input
                  type="text"
                  name="receipt_number"
                  value={contributionForm.receipt_number}
                  onChange={handleContributionFormChange}
                  placeholder="Receipt number"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={contributionForm.description}
                  onChange={handleContributionFormChange}
                  placeholder="Brief description"
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={contributionForm.notes}
                  onChange={handleContributionFormChange}
                  placeholder="Additional notes"
                  rows="2"
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowContributionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editMode ? 'Update Contribution' : 'Record Contribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Detail Modal */}
      {showProgressDetailModal && selectedChurchProgress && (
        <div className="modal-overlay" onClick={() => setShowProgressDetailModal(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedChurchProgress.church.name} - Progress Details</h3>
              <button className="close-btn" onClick={() => setShowProgressDetailModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="progress-detail-content">
              <div className="progress-summary">
                <div className="summary-item">
                  <span className="label">Target ({selectedYear})</span>
                  <span className="value">{formatCurrency(selectedChurchProgress.target_amount)}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Total Contributed</span>
                  <span className="value contributed">{formatCurrency(selectedChurchProgress.total_contributed)}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Remaining</span>
                  <span className="value remaining">{formatCurrency(selectedChurchProgress.remaining_amount)}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Progress</span>
                  <span className="value" style={{ color: getProgressColor(selectedChurchProgress.progress_percentage) }}>
                    {selectedChurchProgress.progress_percentage}%
                  </span>
                </div>
              </div>

              <div className="large-progress-bar">
                <div 
                  className="large-progress-fill" 
                  style={{ 
                    width: `${Math.min(selectedChurchProgress.progress_percentage, 100)}%`,
                    backgroundColor: getProgressColor(selectedChurchProgress.progress_percentage)
                  }}
                ></div>
              </div>

              <h4>Monthly Breakdown</h4>
              <div className="monthly-chart">
                {selectedChurchProgress.monthly_breakdown.map(item => (
                  <div key={item.month} className="month-bar">
                    <div className="bar-container">
                      <div 
                        className="bar-fill"
                        style={{ 
                          height: `${Math.min((item.amount / (selectedChurchProgress.target_amount / 12)) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                    <span className="month-label">
                      {new Date(2024, item.month - 1).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="month-amount">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>

              {selectedChurchProgress.contributions && selectedChurchProgress.contributions.length > 0 && (
                <>
                  <h4>Recent Contributions</h4>
                  <div className="contributions-list">
                    {selectedChurchProgress.contributions.slice(0, 10).map(contribution => (
                      <div key={contribution.id} className="contribution-item">
                        <div className="contribution-info">
                          <span className="date">{new Date(contribution.contribution_date).toLocaleDateString()}</span>
                          <span className="method">{contribution.payment_method}</span>
                        </div>
                        <span className="amount">{formatCurrency(contribution.amount)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
