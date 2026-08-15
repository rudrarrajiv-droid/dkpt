import React from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Receipt, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Layers, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Factory,
  Building2,
  Users
} from 'lucide-react';

export const DashboardView = ({ 
  inventory = [], 
  financials = {}, 
  setActiveTab, 
  setSelectedStyle, 
  setIsLotModalOpen,
  setFilterStatus,
  setFilterVendor
}) => {
  // Inventory metrics
  const totalStyles = inventory.length;
  const openStyles = inventory.filter(s => s.status === 1);
  const nilStyles = inventory.filter(s => s.status === 2);
  const invoicedStyles = inventory.filter(s => s.status === 3);
  const negBalStyles = inventory.filter(s => s.balance < 0);
  
  const totalInvoicedValue = invoicedStyles.reduce((sum, s) => sum + (Number(s.invoice_amount) || 0), 0);
  
  // Total active lots
  const totalLots = inventory.reduce((sum, s) => sum + (s.lots ? s.lots.length : 1), 0);

  // Financial metrics (July 2026)
  const totalRevenue = (financials.receipts || []).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  
  const totalAnilExp = (financials.ex_anil || []).reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const totalKarambirExp = (financials.ex_karambir || []).reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const totalGnuSalary = (financials.gnu_salary || []).reduce((sum, s) => sum + (Number(s.net_pay) || 0), 0) + 
                         (financials.gnu_salary || []).reduce((sum, s) => sum + (Number(s.advance) || 0), 0); // gross/payout
  const totalPnpSalary = (financials.pnp_salary || []).reduce((sum, s) => sum + (Number(s.net_pay) || 0), 0) +
                         (financials.pnp_salary || []).reduce((sum, s) => sum + (Number(s.advance) || 0), 0);
  const electricity = financials.fixed_expenses?.electricity || 78363.0;
  
  const totalExpenses = electricity + totalAnilExp + totalKarambirExp + (financials.gnu_salary?.length ? 389505 : 0) + (financials.pnp_salary?.length ? 285986 : 0);
  const netPL = totalRevenue - totalExpenses;

  // Vendor distribution
  const vendorMap = {};
  inventory.forEach(item => {
    const v = item.vendor || 'Unknown';
    if (!vendorMap[v]) {
      vendorMap[v] = { total: 0, open: 0, nil: 0, invoiced: 0, neg: 0, totalBilled: 0 };
    }
    vendorMap[v].total++;
    if (item.status === 1) vendorMap[v].open++;
    if (item.status === 2) vendorMap[v].nil++;
    if (item.status === 3) {
      vendorMap[v].invoiced++;
      vendorMap[v].totalBilled += (Number(item.invoice_amount) || 0);
    }
    if (item.balance < 0) vendorMap[v].neg++;
  });

  const sortedVendors = Object.entries(vendorMap).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="dashboard-container">
      {/* Top Executive KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ '--card-accent': 'var(--brand-gold)' }}>
          <div className="kpi-header">
            <span>Total Tracked Styles</span>
            <div className="kpi-icon-wrap" style={{ '--icon-bg': 'var(--brand-gold-light)', '--icon-color': 'var(--brand-gold)' }}>
              <Package size={18} />
            </div>
          </div>
          <div className="kpi-value">{totalStyles}</div>
          <div className="kpi-subtitle">{totalLots} Active Lots across 10 Vendors</div>
        </div>

        <div className="kpi-card" style={{ '--card-accent': 'var(--accent-amber)' }}>
          <div className="kpi-header">
            <span>Open / In-Process</span>
            <div className="kpi-icon-wrap" style={{ '--icon-bg': 'var(--accent-amber-light)', '--icon-color': 'var(--accent-amber)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#b45309' }}>{openStyles.length}</div>
          <div className="kpi-subtitle">Active Job-Work & Pending Inward/Outward</div>
        </div>

        <div className="kpi-card" style={{ '--card-accent': 'var(--accent-blue)' }}>
          <div className="kpi-header">
            <span>Nil / Balanced (0 Bal)</span>
            <div className="kpi-icon-wrap" style={{ '--icon-bg': 'var(--accent-blue-light)', '--icon-color': 'var(--accent-blue)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent-blue)' }}>{nilStyles.length}</div>
          <div className="kpi-subtitle">Production complete, ready for invoice</div>
        </div>

        <div className="kpi-card" style={{ '--card-accent': 'var(--accent-green)' }}>
          <div className="kpi-header">
            <span>Invoiced / Settled</span>
            <div className="kpi-icon-wrap" style={{ '--icon-bg': 'var(--accent-green-light)', '--icon-color': 'var(--accent-green)' }}>
              <Receipt size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent-green)' }}>{invoicedStyles.length}</div>
          <div className="kpi-subtitle">₹{totalInvoicedValue.toLocaleString('en-IN')} Total Billed</div>
        </div>

        <div className="kpi-card" style={{ '--card-accent': 'var(--accent-red)' }}>
          <div className="kpi-header">
            <span>Negative Balances</span>
            <div className="kpi-icon-wrap" style={{ '--icon-bg': 'var(--accent-red-light)', '--icon-color': 'var(--accent-red)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent-red)' }}>{negBalStyles.length}</div>
          <div className="kpi-subtitle">Outward dispatches exceeding inward challan</div>
        </div>

        <div className="kpi-card" style={{ '--card-accent': netPL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
          <div className="kpi-header">
            <span>P&L (July 2026)</span>
            <div className="kpi-icon-wrap" style={{ '--icon-bg': netPL >= 0 ? 'var(--accent-green-light)' : 'var(--accent-red-light)', '--icon-color': netPL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: netPL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '1.4rem' }}>
            {netPL >= 0 ? '+' : '-'}₹{Math.abs(Math.round(netPL)).toLocaleString('en-IN')}
          </div>
          <div className="kpi-subtitle">Revenue ₹{totalRevenue.toLocaleString('en-IN')} | Exp ₹{Math.round(totalExpenses).toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Two Column Layout: Vendor Profiles & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Vendor Job-Work Status Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Building2 size={18} color="var(--brand-gold)" />
              Vendor Job-Work & Style Breakdown
            </h3>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('inventory')}
            >
              View Full Master Table <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vendor Name</th>
                    <th>Total Styles</th>
                    <th>Open / Pending</th>
                    <th>Nil Bal</th>
                    <th>Invoiced</th>
                    <th>Neg Alert</th>
                    <th>Billed Value</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedVendors.map(([vendor, data]) => (
                    <tr key={vendor}>
                      <td style={{ fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--brand-gold)' }}></span>
                          {vendor}
                        </div>
                      </td>
                      <td><span style={{ fontWeight: 700 }}>{data.total}</span> styles</td>
                      <td>
                        <span className="badge badge-open">{data.open}</span>
                      </td>
                      <td>
                        <span className="badge badge-nil">{data.nil}</span>
                      </td>
                      <td>
                        <span className="badge badge-invoiced">{data.invoiced}</span>
                      </td>
                      <td>
                        {data.neg > 0 ? (
                          <span className="badge badge-negative">{data.neg}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>0</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-green)' }}>
                        {data.totalBilled > 0 ? `₹${data.totalBilled.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setFilterVendor(vendor);
                            setActiveTab('inventory');
                          }}
                        >
                          Filter
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Highlights & Unit Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Quick Operations Box */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <h3 className="card-title">
                <Layers size={18} color="var(--brand-gold)" />
                Quick Lot Management
              </h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Track multiple lots arriving on different dates and challans for the same customer/style.
              </div>
              <button 
                className="btn btn-gold" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setActiveTab('inventory');
                }}
              >
                📦 Open Lot & Challan Manager
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setFilterStatus('open');
                    setActiveTab('inventory');
                  }}
                >
                  ⏳ Pending Styles ({openStyles.length})
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setFilterStatus('negative');
                    setActiveTab('inventory');
                  }}
                >
                  ⚠️ Neg Balances ({negBalStyles.length})
                </button>
              </div>
            </div>
          </div>

          {/* Multi-Unit Payroll Quick Widget */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <h3 className="card-title">
                <Users size={18} color="var(--brand-gold)" />
                Units & Payroll Summary
              </h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('payroll')}
              >
                Payroll <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Ganaur Unit</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>30 Staff (Anil & Karambir Malik)</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₹3,89,505</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)' }}>July Net Payout</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Panipat Unit</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>16 Staff (Hasmuddin, Altaab)</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₹2,85,986</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)' }}>July Net Payout</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Negative Balance Alert Styles Table */}
      {negBalStyles.length > 0 && (
        <div className="card">
          <div className="card-header" style={{ background: 'var(--accent-red-light)' }}>
            <h3 className="card-title" style={{ color: '#b91c1c' }}>
              <AlertTriangle size={18} color="#b91c1c" />
              Reconciliation Alert: Styles with Outward Exceeding Inward ({negBalStyles.length} Styles)
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#991b1b' }}>
              Inward challans pending receipt or job-work in transit
            </span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Vendor</th>
                    <th>Style / PO Name</th>
                    <th>Current Balance</th>
                    <th>Unit</th>
                    <th>Sheet Link</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {negBalStyles.slice(0, 10).map((style, idx) => (
                    <tr key={style.id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{style.vendor}</td>
                      <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{style.style}</td>
                      <td>
                        <span className="badge badge-negative">
                          {style.balance} {style.unit}
                        </span>
                      </td>
                      <td>{style.unit}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{style.sheet_name || '-'}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedStyle(style);
                            setIsLotModalOpen(true);
                          }}
                        >
                          Inspect Lots
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
