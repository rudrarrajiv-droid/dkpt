import React, { useState } from 'react';
import { 
  Users, 
  Building, 
  Calendar, 
  Download, 
  Plus, 
  Search, 
  DollarSign, 
  UserCheck,
  Award
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const PayrollView = ({ financials = {}, onUpdateFinancials }) => {
  const [activeUnit, setActiveUnit] = useState('ganaur'); // 'ganaur' or 'panipat'
  const [searchTerm, setSearchTerm] = useState('');

  const gnuSalary = financials.gnu_salary || [];
  const pnpSalary = financials.pnp_salary || [];

  // Metrics for Ganaur
  const totalGnuGross = gnuSalary.reduce((sum, e) => sum + (Number(e.earned) || 0), 0);
  const totalGnuAdv = gnuSalary.reduce((sum, e) => sum + (Number(e.advance) || 0), 0);
  const totalGnuInc = gnuSalary.reduce((sum, e) => sum + (Number(e.incentive) || 0), 0);
  const totalGnuNet = gnuSalary.reduce((sum, e) => sum + (Number(e.net_pay) || 0), 0);

  // Metrics for Panipat
  const totalPnpGross = pnpSalary.reduce((sum, e) => sum + (Number(e.earned) || 0), 0);
  const totalPnpAllowance = pnpSalary.reduce((sum, e) => sum + (Number(e.allowance) || 0), 0);
  const totalPnpAdv = pnpSalary.reduce((sum, e) => sum + (Number(e.advance) || 0), 0);
  const totalPnpOt = pnpSalary.reduce((sum, e) => sum + (Number(e.ot) || 0), 0);
  const totalPnpNet = pnpSalary.reduce((sum, e) => sum + (Number(e.net_pay) || 0), 0);

  // Filtered lists
  const filteredGnu = gnuSalary.filter(e => 
    (e.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPnp = pnpSalary.filter(e => 
    (e.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.father || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export Payroll to Excel
  const handleExportPayroll = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Ganaur
    const gnuRows = gnuSalary.map((e, idx) => ({
      'S. No': idx + 1,
      'Employee Name': e.name,
      'Basic Salary': e.basic,
      'Type': e.type,
      'Working Days': e.days,
      'Holidays': e.holiday,
      'Fines': e.fine,
      'Total Days': e.total_days,
      'Earned Amount': e.earned,
      'Advance Paid': e.advance,
      'Incentive': e.incentive,
      'Net Payable': e.net_pay
    }));
    const gnuWs = XLSX.utils.json_to_sheet(gnuRows);
    XLSX.utils.book_append_sheet(wb, gnuWs, 'Ganaur Salary');

    // Sheet 2: Panipat
    const pnpRows = pnpSalary.map((e, idx) => ({
      'S. No': idx + 1,
      'Employee Name': e.name,
      'Father Name': e.father,
      'Basic Salary': e.basic,
      'Type': e.type,
      'Working Days': e.days,
      'Holidays': e.holiday,
      'Total Days': e.total_days,
      'Earned Amount': e.earned,
      'Daily Allowance': e.allowance,
      'Advance Paid': e.advance,
      'Overtime': e.ot,
      'Net Payable': e.net_pay
    }));
    const pnpWs = XLSX.utils.json_to_sheet(pnpRows);
    XLSX.utils.book_append_sheet(wb, pnpWs, 'Panipat Salary');

    XLSX.writeFile(wb, `Malik_Creation_Payroll_July_2026.xlsx`);
  };

  return (
    <div className="payroll-view">
      {/* Unit Selector Header */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={22} color="var(--brand-gold)" />
            <div>
              <h2 className="card-title">Multi-Unit Payroll & Attendance Engine (July 2026)</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Automated days calculation, allowances, incentives, advance deductions, and net payouts
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExportPayroll}>
              <Download size={14} /> Export Payroll Excel
            </button>
          </div>
        </div>

        {/* Unit Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)', padding: '0 1.25rem' }}>
          <button
            className={`nav-tab ${activeUnit === 'ganaur' ? 'active' : ''}`}
            onClick={() => setActiveUnit('ganaur')}
          >
            <Building size={16} /> Ganaur Unit ({gnuSalary.length} Staff | Net: ₹{totalGnuNet.toLocaleString('en-IN')})
          </button>
          <button
            className={`nav-tab ${activeUnit === 'panipat' ? 'active' : ''}`}
            onClick={() => setActiveUnit('panipat')}
          >
            <Building size={16} /> Panipat Unit ({pnpSalary.length} Staff | Net: ₹{totalPnpNet.toLocaleString('en-IN')})
          </button>
        </div>

        {/* Search & Summary Sub-bar */}
        <div className="card-body" style={{ paddingBottom: '0.75rem' }}>
          <div className="toolbar">
            <div className="search-input-wrap" style={{ maxWidth: '350px' }}>
              <Search className="search-icon" size={16} />
              <input
                type="text"
                className="search-input"
                placeholder={`Search ${activeUnit === 'ganaur' ? 'Ganaur' : 'Panipat'} employee name...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Quick KPI stats */}
            {activeUnit === 'ganaur' ? (
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                <div>Total Earned: <strong>₹{totalGnuGross.toLocaleString('en-IN')}</strong></div>
                <div>Advances: <strong style={{ color: 'var(--accent-red)' }}>₹{totalGnuAdv.toLocaleString('en-IN')}</strong></div>
                <div>Incentives: <strong style={{ color: 'var(--accent-green)' }}>₹{totalGnuInc.toLocaleString('en-IN')}</strong></div>
                <div>Net Payout: <strong style={{ color: 'var(--brand-navy)', fontSize: '1rem' }}>₹{totalGnuNet.toLocaleString('en-IN')}</strong></div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                <div>Total Earned: <strong>₹{totalPnpGross.toLocaleString('en-IN')}</strong></div>
                <div>Allowances: <strong style={{ color: 'var(--accent-green)' }}>₹{totalPnpAllowance.toLocaleString('en-IN')}</strong></div>
                <div>Advances: <strong style={{ color: 'var(--accent-red)' }}>₹{totalPnpAdv.toLocaleString('en-IN')}</strong></div>
                <div>Net Payout: <strong style={{ color: 'var(--brand-navy)', fontSize: '1rem' }}>₹{totalPnpNet.toLocaleString('en-IN')}</strong></div>
              </div>
            )}
          </div>
        </div>

        {/* UNIT 1: GANAUR SALARY TABLE */}
        {activeUnit === 'ganaur' && (
          <div className="table-responsive" style={{ border: 'none', borderTop: '1px solid var(--border-color)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Employee Name</th>
                  <th>Basic Salary</th>
                  <th>Type</th>
                  <th>Days Worked</th>
                  <th>Holidays</th>
                  <th>Fine</th>
                  <th>Total Days</th>
                  <th>Earned Amount</th>
                  <th>Incentive</th>
                  <th>Advance Paid</th>
                  <th style={{ textAlign: 'right' }}>Net Payable (₹)</th>
                </tr>
              </thead>
              <tbody>
                {filteredGnu.map((emp, idx) => (
                  <tr key={emp.id || idx}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{emp.name}</td>
                    <td>₹{Number(emp.basic).toLocaleString('en-IN')}</td>
                    <td>
                      <span className="badge" style={{ background: 'var(--bg-subtle)' }}>{emp.type}</span>
                    </td>
                    <td>{emp.days}</td>
                    <td>{emp.holiday || '-'}</td>
                    <td style={{ color: emp.fine > 0 ? 'var(--accent-red)' : 'inherit' }}>{emp.fine || '-'}</td>
                    <td style={{ fontWeight: 600 }}>{emp.total_days}</td>
                    <td>₹{Number(emp.earned).toLocaleString('en-IN')}</td>
                    <td style={{ color: emp.incentive > 0 ? 'var(--accent-green)' : 'inherit' }}>
                      {emp.incentive > 0 ? `+₹${emp.incentive}` : '-'}
                    </td>
                    <td style={{ color: emp.advance > 0 ? 'var(--accent-red)' : 'inherit' }}>
                      {emp.advance > 0 ? `-₹${emp.advance}` : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--accent-green)', fontSize: '0.92rem' }}>
                      ₹{Number(emp.net_pay).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* UNIT 2: PANIPAT SALARY TABLE */}
        {activeUnit === 'panipat' && (
          <div className="table-responsive" style={{ border: 'none', borderTop: '1px solid var(--border-color)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Employee Name</th>
                  <th>Father / Guardian</th>
                  <th>Basic Salary</th>
                  <th>Type</th>
                  <th>Days</th>
                  <th>Holidays</th>
                  <th>Total Days</th>
                  <th>Earned Amount</th>
                  <th>Daily Allowance (₹100/day)</th>
                  <th>Overtime</th>
                  <th>Advance Paid</th>
                  <th style={{ textAlign: 'right' }}>Net Payable (₹)</th>
                </tr>
              </thead>
              <tbody>
                {filteredPnp.map((emp, idx) => (
                  <tr key={emp.id || idx}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{emp.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{emp.father || '-'}</td>
                    <td>₹{Number(emp.basic).toLocaleString('en-IN')}</td>
                    <td>
                      <span className="badge" style={{ background: 'var(--bg-subtle)' }}>{emp.type}</span>
                    </td>
                    <td>{emp.days}</td>
                    <td>{emp.holiday || '-'}</td>
                    <td style={{ fontWeight: 600 }}>{emp.total_days}</td>
                    <td>₹{Number(emp.earned).toLocaleString('en-IN')}</td>
                    <td style={{ color: emp.allowance > 0 ? 'var(--accent-green)' : 'inherit' }}>
                      {emp.allowance > 0 ? `+₹${emp.allowance}` : '-'}
                    </td>
                    <td style={{ color: emp.ot > 0 ? 'var(--accent-green)' : 'inherit' }}>
                      {emp.ot > 0 ? `+₹${emp.ot}` : '-'}
                    </td>
                    <td style={{ color: emp.advance > 0 ? 'var(--accent-red)' : 'inherit' }}>
                      {emp.advance > 0 ? `-₹${emp.advance}` : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--accent-green)', fontSize: '0.92rem' }}>
                      ₹{Number(emp.net_pay).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollView;
