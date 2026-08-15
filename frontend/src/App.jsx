import React, { useState, useEffect } from 'react';
import initialData from './data/initialData.json';
import BrandLogo from './components/BrandLogo';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import PLView from './components/PLView';
import PayrollView from './components/PayrollView';
import LedgerView from './components/LedgerView';
import LotModal from './components/LotModal';
import DeployBackupModal from './components/DeployBackupModal';
import { 
  LayoutDashboard, 
  Package, 
  DollarSign, 
  Users, 
  BookOpen, 
  Cloud, 
  Moon, 
  Sun, 
  Plus, 
  Download,
  Building2
} from 'lucide-react';

export function App() {
  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('dkp_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dkp_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Main Data State with LocalStorage Persistence
  const [appData, setAppData] = useState(() => {
    const saved = localStorage.getItem('dkp_malik_erp_2026');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.inventory && parsed.inventory.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }
    return initialData;
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('dkp_malik_erp_2026', JSON.stringify(appData));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [appData]);

  // Navigation Tab: 'dashboard', 'inventory', 'pl', 'payroll', 'ledgers'
  const [activeTab, setActiveTab] = useState('inventory');

  // Filter States for Inventory View
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterVendor, setFilterVendor] = useState('all');

  // Selected Style for Lot / Transaction Modal
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [isLotModalOpen, setIsLotModalOpen] = useState(false);

  // Deployment & Backup Modal State
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // Style Update Handler
  const handleUpdateStyle = (updatedStyle) => {
    const updated = (appData.inventory || []).map(item => 
      item.id === updatedStyle.id ? updatedStyle : item
    );
    setAppData(prev => ({ ...prev, inventory: updated }));
    setSelectedStyle(updatedStyle);
  };

  // Add New Style Handler
  const handleAddNewStyle = (newStyle) => {
    setAppData(prev => ({
      ...prev,
      inventory: [newStyle, ...(prev.inventory || [])]
    }));
  };

  // Update Financials Handler
  const handleUpdateFinancials = (updatedFinancials) => {
    setAppData(prev => ({
      ...prev,
      financials: updatedFinancials
    }));
  };

  // Restore Data Handler
  const handleRestoreData = (restoredData) => {
    setAppData(restoredData);
  };

  // Reset to Factory Data
  const handleResetToDefault = () => {
    localStorage.removeItem('dkp_malik_erp_2026');
    setAppData(initialData);
  };

  return (
    <div className="app-container">
      {/* Top Corporate Header */}
      <header className="app-header">
        <div className="header-inner">
          
          {/* Brand Identity */}
          <div className="brand-section">
            <div className="brand-logo-badge">
              <BrandLogo size={42} />
            </div>
            <div className="brand-info">
              <div className="brand-title">
                DKPTEXPORTS PRIVATE LIMITED
                <span className="division-pill" style={{ background: 'rgba(197, 155, 39, 0.25)', color: '#fce79a' }}>
                  Project: Malik Creation
                </span>
              </div>
              <div className="brand-tagline">
                Building Trust. Delivering Excellence.
              </div>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="header-actions">
            <button 
              className="btn-header btn-gold"
              onClick={() => {
                setActiveTab('inventory');
                if (appData.inventory && appData.inventory.length > 0) {
                  setSelectedStyle(appData.inventory[0]);
                  setIsLotModalOpen(true);
                }
              }}
            >
              <Plus size={15} /> Add Inward Lot / Challan
            </button>

            <button 
              className="btn-header"
              onClick={() => setIsDeployModalOpen(true)}
            >
              <Cloud size={15} color="var(--brand-gold)" /> Online Deploy & Backup
            </button>

            <button 
              className="btn-header"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} color="#e6cb7e" />}
            </button>
          </div>

        </div>
      </header>

      {/* Sticky Navigation Bar */}
      <nav className="nav-bar">
        <div className="nav-inner">
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              <Package size={16} /> Job-Work & Lot Tracker ({appData.inventory?.length || 0} Styles)
            </button>

            <button
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={16} /> Dashboard & KPI Overview
            </button>

            <button
              className={`nav-tab ${activeTab === 'pl' ? 'active' : ''}`}
              onClick={() => setActiveTab('pl')}
            >
              <DollarSign size={16} /> P&L Statement (July 2026)
            </button>

            <button
              className={`nav-tab ${activeTab === 'payroll' ? 'active' : ''}`}
              onClick={() => setActiveTab('payroll')}
            >
              <Users size={16} /> Multi-Unit Payroll (46 Staff)
            </button>

            <button
              className={`nav-tab ${activeTab === 'ledgers' ? 'active' : ''}`}
              onClick={() => setActiveTab('ledgers')}
            >
              <BookOpen size={16} /> Expense Ledgers & Partners
            </button>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent-green)' }}></span>
            Project: Malik Creation (Port 3000)
          </div>
        </div>
      </nav>

      {/* Main App Content Body */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardView
            inventory={appData.inventory || []}
            financials={appData.financials || {}}
            setActiveTab={setActiveTab}
            setSelectedStyle={(style) => {
              setSelectedStyle(style);
              setIsLotModalOpen(true);
            }}
            setIsLotModalOpen={setIsLotModalOpen}
            setFilterStatus={setFilterStatus}
            setFilterVendor={setFilterVendor}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            inventory={appData.inventory || []}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterVendor={filterVendor}
            setFilterVendor={setFilterVendor}
            onSelectStyle={(style) => {
              setSelectedStyle(style);
              setIsLotModalOpen(true);
            }}
            onAddNewStyle={handleAddNewStyle}
          />
        )}

        {activeTab === 'pl' && (
          <PLView
            financials={appData.financials || {}}
            onUpdateFinancials={handleUpdateFinancials}
          />
        )}

        {activeTab === 'payroll' && (
          <PayrollView
            financials={appData.financials || {}}
            onUpdateFinancials={handleUpdateFinancials}
          />
        )}

        {activeTab === 'ledgers' && (
          <LedgerView
            financials={appData.financials || {}}
            onUpdateFinancials={handleUpdateFinancials}
          />
        )}
      </main>

      {/* Lot / Inward Challan & Job-Work Modal */}
      {isLotModalOpen && selectedStyle && (
        <LotModal
          style={selectedStyle}
          onClose={() => {
            setIsLotModalOpen(false);
            setSelectedStyle(null);
          }}
          onUpdateStyle={handleUpdateStyle}
        />
      )}

      {/* Cloud Deploy & Backup Modal */}
      {isDeployModalOpen && (
        <DeployBackupModal
          isOpen={isDeployModalOpen}
          onClose={() => setIsDeployModalOpen(false)}
          fullData={appData}
          activeProject="DKPTEXPORTS_MALIK_CREATION"
          onRestoreData={handleRestoreData}
          onResetToDefault={handleResetToDefault}
        />
      )}
    </div>
  );
}

export default App;
