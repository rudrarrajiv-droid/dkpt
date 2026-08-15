import React, { useState } from 'react';
import { 
  BookOpen, 
  User, 
  Download, 
  Plus, 
  Calendar, 
  ArrowDownLeft, 
  ArrowUpRight,
  TrendingDown,
  Car,
  Briefcase
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const LedgerView = ({ financials = {}, onUpdateFinancials }) => {
  const [activeAccount, setActiveAccount] = useState('anil'); // 'anil', 'karambir', 'partner'
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Form states
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expParticulars, setExpParticulars] = useState('');
  const [expDebit, setExpDebit] = useState('');

  const exAnil = financials.ex_anil || [];
  const exKarambir = financials.ex_karambir || [];
  const partnerPayable = financials.partner_payable || {
    car_emi: 0,
    karambir_salary: 28226,
    monthly_expenses: 102862,
    total_payable: 131088
  };

  const totalAnilDebit = exAnil.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const totalKarambirDebit = exKarambir.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);

  // Add new expense entry
  const handleAddExpenseSubmit = (e) => {
    e.preventDefault();
    if (!expParticulars || !expDebit) {
      alert('Please fill in particulars and debit amount.');
      return;
    }

    const debitAmt = parseFloat(expDebit) || 0;
    const isAnil = activeAccount === 'anil';

    if (isAnil) {
      const prevBal = exAnil.length > 0 ? exAnil[exAnil.length - 1].balance : 0;
      const newEntry = {
        id: `EA-${exAnil.length + 1}`,
        date: expDate,
        particulars: expParticulars.trim(),
        receipt_no: '',
        debit: debitAmt,
        credit: 0,
        balance: prevBal - debitAmt
      };
      onUpdateFinancials({
        ...financials,
        ex_anil: [...exAnil, newEntry]
      });
    } else {
      const prevBal = exKarambir.length > 0 ? exKarambir[exKarambir.length - 1].balance : 0;
      const newEntry = {
        id: `EK-${exKarambir.length + 1}`,
        date: expDate,
        particulars: expParticulars.trim(),
        receipt_no: '',
        debit: debitAmt,
        credit: 0,
        balance: prevBal - debitAmt
      };
      onUpdateFinancials({
        ...financials,
        ex_karambir: [...exKarambir, newEntry]
      });
    }

    setIsAddExpenseOpen(false);
    setExpParticulars('');
    setExpDebit('');
  };

  // Export to Excel
  const handleExportLedger = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Anil Ledger
    const anilRows = exAnil.map((e, idx) => ({
      'S. No': idx + 1,
      'Date': e.date,
      'Particulars': e.particulars,
      'Receipt No': e.receipt_no || '',
      'Debit (Exp)': e.debit,
      'Credit': e.credit || 0,
      'Balance': e.balance
    }));
    const anilWs = XLSX.utils.json_to_sheet(anilRows);
    XLSX.utils.book_append_sheet(wb, anilWs, 'Expenses Anil Malik');

    // Sheet 2: Karambir Ledger
    const karambirRows = exKarambir.map((e, idx) => ({
      'S. No': idx + 1,
      'Date': e.date,
      'Particulars': e.particulars,
      'Receipt No': e.receipt_no || '',
      'Debit (Exp)': e.debit,
      'Credit': e.credit || 0,
      'Balance': e.balance
    }));
    const karambirWs = XLSX.utils.json_to_sheet(karambirRows);
    XLSX.utils.book_append_sheet(wb, karambirWs, 'Expenses Karambir Malik');

    XLSX.writeFile(wb, `Malik_Creation_Expense_Ledgers_July_2026.xlsx`);
  };

  return (
    <div className="ledger-view">
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen size={22} color="var(--brand-gold)" />
            <div>
              <h2 className="card-title">Expense Ledgers & Partner Accounts</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Detailed running accounts for Mr. Anil Malik, Mr. Karambir Malik, and Partner Payable Settlements
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExportLedger}>
              <Download size={14} /> Export Ledgers Excel
            </button>
            {activeAccount !== 'partner' && (
              <button className="btn btn-gold btn-sm" onClick={() => setIsAddExpenseOpen(true)}>
                <Plus size={14} /> Add Expense Entry
              </button>
            )}
          </div>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)', padding: '0 1.25rem' }}>
          <button
            className={`nav-tab ${activeAccount === 'anil' ? 'active' : ''}`}
            onClick={() => setActiveAccount('anil')}
          >
            <User size={16} /> Mr. Anil Malik Ledger ({exAnil.length} Entries | Total: ₹{totalAnilDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
          </button>
          <button
            className={`nav-tab ${activeAccount === 'karambir' ? 'active' : ''}`}
            onClick={() => setActiveAccount('karambir')}
          >
            <User size={16} /> Mr. Karambir Malik Ledger ({exKarambir.length} Entries | Total: ₹{totalKarambirDebit.toLocaleString('en-IN')})
          </button>
          <button
            className={`nav-tab ${activeAccount === 'partner' ? 'active' : ''}`}
            onClick={() => setActiveAccount('partner')}
          >
            <Briefcase size={16} /> Partner Payable Account (Karambir Malik: ₹{partnerPayable.total_payable.toLocaleString('en-IN')})
          </button>
        </div>

        {/* TAB 1: MR ANIL MALIK EXPENSE LEDGER */}
        {activeAccount === 'anil' && (
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Particulars / Description</th>
                  <th>Receipt No</th>
                  <th style={{ textAlign: 'right' }}>Debit / Expense (₹)</th>
                  <th style={{ textAlign: 'right' }}>Credit (₹)</th>
                  <th style={{ textAlign: 'right' }}>Running Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {exAnil.map((e, idx) => (
                  <tr key={e.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{e.date || '-'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>{e.particulars}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{e.receipt_no || '-'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-red)' }}>
                      ₹{Number(e.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--accent-green)' }}>
                      {e.credit > 0 ? `₹${Number(e.credit).toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      ₹{Number(e.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: MR KARAMBIR MALIK EXPENSE LEDGER */}
        {activeAccount === 'karambir' && (
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Particulars / Description</th>
                  <th>Receipt No</th>
                  <th style={{ textAlign: 'right' }}>Debit / Expense (₹)</th>
                  <th style={{ textAlign: 'right' }}>Credit (₹)</th>
                  <th style={{ textAlign: 'right' }}>Running Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {exKarambir.map((e, idx) => (
                  <tr key={e.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{e.date || '-'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>{e.particulars}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{e.receipt_no || '-'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-red)' }}>
                      ₹{Number(e.debit).toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--accent-green)' }}>
                      {e.credit > 0 ? `₹${Number(e.credit).toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      ₹{Number(e.balance).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: PARTNER PAYABLE SUMMARY ACCOUNT */}
        {activeAccount === 'partner' && (
          <div style={{ padding: '1.5rem' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1.5px solid var(--brand-gold)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={20} color="var(--brand-gold)" />
                Payable to Karambir (Partner Account)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span>Car EMI Reimbursement</span>
                  <span style={{ fontWeight: 600 }}>{partnerPayable.car_emi > 0 ? `₹${partnerPayable.car_emi.toLocaleString('en-IN')}` : 'Included in Expenses'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span>Partner Salary (Karambir Malik - July)</span>
                  <span style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>₹{partnerPayable.karambir_salary.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span>Monthly Out-of-Pocket Expenses Incurred</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-red)' }}>₹{partnerPayable.monthly_expenses.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', marginTop: '0.5rem', background: 'var(--brand-gold-light)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', border: '1px solid var(--brand-gold-border)' }}>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>TOTAL PAYABLE TO PARTNER</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                    ₹{partnerPayable.total_payable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Entry Modal */}
      {isAddExpenseOpen && (
        <div className="modal-overlay" onClick={() => setIsAddExpenseOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Plus size={20} color="var(--brand-gold)" />
                Add Expense in {activeAccount === 'anil' ? 'Mr. Anil Malik' : 'Mr. Karambir Malik'} Ledger
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsAddExpenseOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleAddExpenseSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Expense Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Particulars / Description *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. DIESEL, TEMPO FREIGHT, MACHINERY PARTS"
                      value={expParticulars}
                      onChange={(e) => setExpParticulars(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Debit Amount (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      className="form-control"
                      placeholder="e.g. 1500"
                      value={expDebit}
                      onChange={(e) => setExpDebit(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddExpenseOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LedgerView;
