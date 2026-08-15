import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Receipt, 
  FileText, 
  Download, 
  UserCheck, 
  Calendar,
  Zap,
  Building,
  Users
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const PLView = ({ financials = {}, onUpdateFinancials }) => {
  const [selectedMonth, setSelectedMonth] = useState('July 2026');
  const [isAddRevenueModalOpen, setIsAddRevenueModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  // Form states for Revenue
  const [revDate, setRevDate] = useState(new Date().toISOString().split('T')[0]);
  const [revParty, setRevParty] = useState('');
  const [revVia, setRevVia] = useState('');
  const [revAmount, setRevAmount] = useState('');

  // Form states for Expense
  const [expCategory, setExpCategory] = useState('Electricity');
  const [expAmount, setExpAmount] = useState('');

  const receipts = financials.receipts || [];
  const exAnil = financials.ex_anil || [];
  const exKarambir = financials.ex_karambir || [];
  const gnuSalary = financials.gnu_salary || [];
  const pnpSalary = financials.pnp_salary || [];

  // Revenue calculation
  const totalRevenue = receipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  // Expense calculations
  const totalAnilExp = exAnil.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const totalKarambirExp = exKarambir.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const totalGnuSalary = 389505; // Ganaur salary total from sheet formula
  const totalPnpSalary = 285986; // Panipat salary total from sheet formula
  const electricity = financials.fixed_expenses?.electricity || 78363.0;
  const rentGanaur = financials.fixed_expenses?.rent_ganaur || 0;
  const rentPanipat = financials.fixed_expenses?.rent_panipat || 0;

  const totalExpenses = electricity + rentGanaur + rentPanipat + totalAnilExp + totalKarambirExp + totalGnuSalary + totalPnpSalary;

  // Net Profit/Loss
  const netPL = totalRevenue - totalExpenses;

  // Partner Sharing Ratio (2/3 Anil Malik, 1/3 Karambir Malik)
  const anilShare = Math.round(netPL * (2 / 3));
  const karambirShare = Math.round(netPL * (1 / 3));
  const roundingCheck = (netPL - anilShare - karambirShare).toFixed(2);

  // Add revenue
  const handleAddRevenue = (e) => {
    e.preventDefault();
    if (!revParty || !revAmount) {
      alert('Please enter party name and amount.');
      return;
    }

    const newRec = {
      id: `REC-${receipts.length + 1}`,
      date: revDate,
      party: revParty.trim(),
      via: revVia.trim(),
      amount: parseFloat(revAmount) || 0
    };

    onUpdateFinancials({
      ...financials,
      receipts: [newRec, ...receipts]
    });

    setIsAddRevenueModalOpen(false);
    setRevParty('');
    setRevVia('');
    setRevAmount('');
  };

  // Export P&L to Excel
  const handleExportPL = () => {
    const plRows = [
      { Category: 'REVENUE', Particulars: 'Direct Receipts & Sales', Amount: totalRevenue },
      ...receipts.map(r => ({ Category: 'Revenue Item', Particulars: `${r.party} (${r.date})`, Amount: r.amount })),
      { Category: 'EXPENSE', Particulars: 'Electricity Bill', Amount: electricity },
      { Category: 'EXPENSE', Particulars: 'Expenses (Mr Anil Malik)', Amount: totalAnilExp },
      { Category: 'EXPENSE', Particulars: 'Expenses (Mr Karambir Malik)', Amount: totalKarambirExp },
      { Category: 'EXPENSE', Particulars: 'Ganaur Staff Salary', Amount: totalGnuSalary },
      { Category: 'EXPENSE', Particulars: 'Panipat Staff Salary', Amount: totalPnpSalary },
      { Category: 'SUMMARY', Particulars: 'TOTAL REVENUE', Amount: totalRevenue },
      { Category: 'SUMMARY', Particulars: 'TOTAL EXPENSES', Amount: totalExpenses },
      { Category: 'NET RESULT', Particulars: 'NET PROFIT / LOSS', Amount: netPL },
      { Category: 'PARTNER SHARE', Particulars: 'Mr. Anil Malik (2/3)', Amount: anilShare },
      { Category: 'PARTNER SHARE', Particulars: 'Mr. Karambir Malik (1/3)', Amount: karambirShare }
    ];

    const ws = XLSX.utils.json_to_sheet(plRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Profit & Loss');
    XLSX.writeFile(wb, `DKP_PL_Statement_${selectedMonth.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div className="pl-view">
      {/* Top Banner with Month selector & Export */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <DollarSign size={20} color="var(--brand-gold)" />
              Profit & Loss Statement ({selectedMonth})
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Comprehensive revenue receipts, multi-unit salaries, expenses, and partner distribution
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExportPL}>
              <Download size={14} /> Export P&L Excel
            </button>
            <button className="btn btn-gold btn-sm" onClick={() => setIsAddRevenueModalOpen(true)}>
              <Plus size={14} /> Add Revenue / Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Expenses (Debit) vs Revenue (Credit) */}
      <div className="pl-grid">
        
        {/* EXPENSES CARD (DEBIT SIDE) */}
        <div className="card pl-card-expense">
          <div className="card-header" style={{ background: 'var(--accent-red-light)' }}>
            <h3 className="card-title" style={{ color: '#b91c1c' }}>
              <TrendingDown size={18} color="#b91c1c" />
              Expenses & Outflows (Debit)
            </h3>
            <span style={{ fontWeight: 800, color: '#b91c1c' }}>
              ₹{Math.round(totalExpenses).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Expense Head</th>
                    <th>Linked Sheet / Source</th>
                    <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Rent (Ganaur Unit)</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Factory Rent</td>
                    <td style={{ textAlign: 'right' }}>{rentGanaur > 0 ? `₹${rentGanaur.toLocaleString('en-IN')}` : '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Rent (Panipat Unit)</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Factory Rent</td>
                    <td style={{ textAlign: 'right' }}>{rentPanipat > 0 ? `₹${rentPanipat.toLocaleString('en-IN')}` : '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Electricity Bills</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Power & Utilities</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{electricity.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Expenses (Mr. Anil Malik)</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Ex Anil Ledger (16 items)</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{totalAnilExp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Expenses (Mr. Karambir Malik)</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Ex Karambir Ledger (24 items)</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{totalKarambirExp.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Salary (Ganaur Staff)</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Gnu Salary (30 Employees)</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-navy)' }}>₹{totalGnuSalary.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Salary (Panipat Staff)</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Pnp Salary (16 Employees)</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-navy)' }}>₹{totalPnpSalary.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pl-total-box" style={{ margin: '1rem', background: 'var(--accent-red-light)', color: '#b91c1c' }}>
              <span>TOTAL EXPENSES (C35)</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* REVENUE CARD (CREDIT SIDE) */}
        <div className="card pl-card-revenue">
          <div className="card-header" style={{ background: 'var(--accent-green-light)' }}>
            <h3 className="card-title" style={{ color: '#047857' }}>
              <TrendingUp size={18} color="#047857" />
              Revenue Receipts & Sales (Credit)
            </h3>
            <span style={{ fontWeight: 800, color: '#047857' }}>
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Vendor / Customer / Source</th>
                    <th>Via</th>
                    <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.length > 0 ? (
                    receipts.map((rec) => (
                      <tr key={rec.id}>
                        <td>{rec.date || '-'}</td>
                        <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{rec.party}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{rec.via || 'Direct'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-green)' }}>
                          ₹{Number(rec.amount).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No receipts recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pl-total-box" style={{ margin: '1rem', background: 'var(--accent-green-light)', color: '#047857' }}>
              <span>TOTAL REVENUE (D35)</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹{totalRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>

      {/* PARTNER PROFIT / LOSS SHARING CARD */}
      <div className="partner-split-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#d4af37', fontWeight: 700 }}>
              Net Operational Outcome (July, 2026)
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: netPL >= 0 ? '#4ade80' : '#f87171' }}>
              {netPL >= 0 ? 'Net Profit: +' : 'Net Loss: -'}₹{Math.abs(Math.round(netPL)).toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', textAlign: 'right' }}>
            Formula: <code>= Revenue (D35) - Expenses (C35)</code>
            <div>Net Variance: {netPL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        {/* Partner Sharing Grid */}
        <div className="partner-split-grid">
          <div className="partner-box">
            <div className="partner-name">Mr. Anil Malik</div>
            <div className="partner-share-pct">Partner Share: 2/3 (66.67%)</div>
            <div className="partner-amount" style={{ color: anilShare >= 0 ? '#4ade80' : '#f87171' }}>
              {anilShare >= 0 ? '+' : '-'}₹{Math.abs(anilShare).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
              Formula: <code>=ROUND(Net P&L * 2/3, 0)</code>
            </div>
          </div>

          <div className="partner-box">
            <div className="partner-name">Mr. Karambir Malik</div>
            <div className="partner-share-pct">Partner Share: 1/3 (33.33%)</div>
            <div className="partner-amount" style={{ color: karambirShare >= 0 ? '#4ade80' : '#f87171' }}>
              {karambirShare >= 0 ? '+' : '-'}₹{Math.abs(karambirShare).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
              Formula: <code>=ROUND(Net P&L * 1/3, 0)</code>
            </div>
          </div>

          <div className="partner-box">
            <div className="partner-name">Partnership Verification</div>
            <div className="partner-share-pct">Total Distributed</div>
            <div className="partner-amount" style={{ color: '#ffffff', fontSize: '1.2rem' }}>
              ₹{(anilShare + karambirShare).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
              Rounding Balance Check: <strong>{roundingCheck}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Add Revenue Modal */}
      {isAddRevenueModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddRevenueModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Plus size={20} color="var(--brand-gold)" />
                Add Revenue / Payment Receipt
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsAddRevenueModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleAddRevenue}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Receipt Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={revDate}
                      onChange={(e) => setRevDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Party / Vendor / Source Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. ART & DESIGN INC."
                      value={revParty}
                      onChange={(e) => setRevParty(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Mode / Via</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Bank Transfer / Cash"
                      value={revVia}
                      onChange={(e) => setRevVia(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Receipt Amount (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      className="form-control"
                      placeholder="e.g. 50000"
                      value={revAmount}
                      onChange={(e) => setRevAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddRevenueModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold">
                  Save Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PLView;
