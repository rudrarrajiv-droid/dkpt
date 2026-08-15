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
import LoginView from './components/LoginView';
import ChangePasswordModal from './components/ChangePasswordModal';
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
  Building2,
  LogOut,
  KeyRound
} from 'lucide-react';

export function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('dkp_auth');
    return saved ? JSON.parse(saved) : null;
  });

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

  // Main Data State with Supabase
  const [appData, setAppData] = useState({ company: {}, inventory: [], financials: {} });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const { supabase } = await import('./supabaseClient');
        
        // Fetch company
        const { data: companyData } = await supabase.from('company').select('*').single();
        
        // Fetch inventory with nested lots and transactions
        const { data: inventoryData } = await supabase.from('inventory').select(`
          *,
          lots (*),
          transactions (*)
        `).order('sno', { ascending: true });
        
        setAppData({
          company: companyData || {},
          inventory: inventoryData || [],
          financials: {}
        });
      } catch (e) {
        console.error('Failed to load Supabase data:', e);
        setAppData(initialData); // Fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Sync to LocalStorage as a backup for offline support
  useEffect(() => {
    try {
      if (appData.inventory && appData.inventory.length > 0) {
        localStorage.setItem('dkp_malik_erp_2026', JSON.stringify(appData));
      }
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

  // Modals
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Logout Handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dkp_auth');
  };

  // Style Update Handler (Syncs to Supabase)
  const handleUpdateStyle = async (updatedStyle) => {
    // Optimistic UI Update
    const updated = (appData.inventory || []).map(item => 
      item.id === updatedStyle.id ? updatedStyle : item
    );
    setAppData(prev => ({ ...prev, inventory: updated }));
    setSelectedStyle(updatedStyle);

    try {
      const { supabase } = await import('./supabaseClient');
      
      // Separate relational data
      const { lots, transactions, ...inventoryRow } = updatedStyle;
      
      // 1. Update Inventory Table
      await supabase.from('inventory').upsert(inventoryRow);
      
      // 2. Upsert Lots
      if (lots && lots.length > 0) {
        const lotsToUpsert = lots.map(l => ({ ...l, inventory_id: updatedStyle.id }));
        await supabase.from('lots').upsert(lotsToUpsert);
      }

      // 3. Sync Transactions (Delete and Re-insert for simplicity since they lack UUIDs locally)
      if (transactions && transactions.length > 0) {
        await supabase.from('transactions').delete().eq('inventory_id', updatedStyle.id);
        
        // Remove local temporary IDs if any, so Postgres generates new Serial IDs, preserving order
        const txsToInsert = transactions.map(t => {
          const { id, ...rest } = t;
          return { ...rest, inventory_id: updatedStyle.id };
        });
        
        // Insert in reverse so the newest stays on top if ordered by ID, 
        // or just rely on the JSON array order. The DB will assign IDs sequentially.
        await supabase.from('transactions').insert(txsToInsert.reverse());
      }
    } catch (e) {
      console.error("Supabase sync failed for update:", e);
    }
  };

  // Add New Style Handler (Syncs to Supabase)
  const handleAddNewStyle = async (newStyle) => {
    // Optimistic update
    setAppData(prev => ({
      ...prev,
      inventory: [newStyle, ...(prev.inventory || [])]
    }));

    try {
      const { supabase } = await import('./supabaseClient');
      const { lots, transactions, ...inventoryRow } = newStyle;
      await supabase.from('inventory').insert(inventoryRow);
    } catch(e) {
      console.error("Supabase sync failed for new style:", e);
    }
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

  if (!currentUser) {
    return (
      <LoginView 
        onLogin={(user) => {
          setCurrentUser(user);
          localStorage.setItem('dkp_auth', JSON.stringify(user));
        }} 
      />
    );
  }

  if (isLoading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <BrandLogo size={80} />
        <div style={{ color: 'var(--brand-gold)', fontSize: '1.2rem', animation: 'pulse 1.5s infinite' }}>Connecting to Cloud Database...</div>
      </div>
    );
  }

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

            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.25rem' }}></div>

            <button 
              className="btn-header"
              onClick={() => setIsChangePasswordOpen(true)}
              title="Change Password"
            >
              <KeyRound size={15} />
            </button>

            <button 
              className="btn-header"
              onClick={() => setIsDeployModalOpen(true)}
              title="Deploy & Backup"
            >
              <Cloud size={15} />
            </button>

            <button 
              className="btn-header"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} color="#e6cb7e" />}
            </button>

            <button 
              className="btn-header"
              onClick={handleLogout}
              style={{ color: 'var(--accent-red)' }}
              title="Logout"
            >
              <LogOut size={15} /> Logout
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
            Welcome, <strong>{currentUser.username}</strong> | Project: Malik Creation
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

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <ChangePasswordModal
          user={currentUser}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
