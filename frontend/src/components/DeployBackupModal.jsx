import React, { useRef } from 'react';
import { 
  Cloud, 
  Download, 
  Upload, 
  RotateCcw, 
  Globe, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Server,
  Zap
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const DeployBackupModal = ({ 
  isOpen, 
  onClose, 
  fullData, 
  activeProject = 'Malik Creation',
  onRestoreData, 
  onResetToDefault 
}) => {
  if (!isOpen) return null;
  const fileInputRef = useRef(null);

  const safeProjName = activeProject.replace(/\s+/g, '_');

  // Export full JSON Backup
  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${safeProjName}_BACKUP_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export Full Master Excel Workbook with Multiple Sheets
  const handleDownloadFullExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1. Inventory Summary Sheet
    const invRows = (fullData.inventory || []).map((item, idx) => ({
      'S. No': idx + 1,
      'Vendor': item.vendor,
      'Style / PO': item.style,
      'Balance': item.balance,
      'Unit': item.unit,
      'Invoice Date': item.invoice_date || '',
      'Invoice No': item.invoice_no || '',
      'Invoice Amount': item.invoice_amount || 0,
      'Bill Status': item.status === 3 ? 'Invoiced' : (item.status === 2 ? 'Nil' : 'Open'),
      'Sheet Name': item.sheet_name || ''
    }));
    const invWs = XLSX.utils.json_to_sheet(invRows);
    XLSX.utils.book_append_sheet(wb, invWs, 'Summary');

    // 2. Receipts Sheet
    const recRows = (fullData.financials?.receipts || []).map((r, idx) => ({
      'S. No': idx + 1,
      'Date': r.date,
      'Vendor / Party': r.party,
      'Via': r.via,
      'Amount': r.amount
    }));
    const recWs = XLSX.utils.json_to_sheet(recRows);
    XLSX.utils.book_append_sheet(wb, recWs, 'Receipts');

    // 3. Ganaur Salary Sheet
    const gnuRows = (fullData.financials?.gnu_salary || []).map((e, idx) => ({
      'S. No': idx + 1,
      'Name': e.name,
      'Basic': e.basic,
      'Days': e.days,
      'Total Days': e.total_days,
      'Earned': e.earned,
      'Advance': e.advance,
      'Net Pay': e.net_pay
    }));
    const gnuWs = XLSX.utils.json_to_sheet(gnuRows);
    XLSX.utils.book_append_sheet(wb, gnuWs, 'Ganaur Salary');

    // 4. Panipat Salary Sheet
    const pnpRows = (fullData.financials?.pnp_salary || []).map((e, idx) => ({
      'S. No': idx + 1,
      'Name': e.name,
      'Father': e.father,
      'Basic': e.basic,
      'Days': e.days,
      'Earned': e.earned,
      'Allowance': e.allowance,
      'Net Pay': e.net_pay
    }));
    const pnpWs = XLSX.utils.json_to_sheet(pnpRows);
    XLSX.utils.book_append_sheet(wb, pnpWs, 'Panipat Salary');

    XLSX.writeFile(wb, `DKP_EXPORTS_COMPLETE_DATABASE_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Restore JSON File
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.inventory && parsed.financials) {
          onRestoreData(parsed);
          alert('Database successfully restored from backup file!');
          onClose();
        } else {
          alert('Invalid backup file format. Missing inventory or financials structure.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Cloud size={20} color="var(--brand-gold)" />
            Online Cloud Deployment & Database Backup
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* ONLINE DEPLOYMENT SECTION */}
          <div style={{ background: 'var(--brand-gold-light)', border: '1.5px solid var(--brand-gold-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Globe size={22} color="var(--brand-gold)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                Is App Ko Online Live Kaise Chalayein? (100% Free Hosting)
              </h3>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Aap is application ko kisi bhi free cloud platform jaise <strong>Vercel</strong>, <strong>Netlify</strong> ya <strong>GitHub Pages</strong> par 1 minute me live kar sakte hain jisse aapki poori team ise mobile aur computer par kahin se bhi chala sakegi:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--brand-navy)', marginBottom: '4px' }}>
                  Option 1: Vercel (Recommended)
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  1. <code>vercel.com</code> par free account banayein.<br />
                  2. Is folder ko GitHub repository se connect karke <strong>Deploy</strong> click karein.<br />
                  3. Instant live link mil jayega (e.g. <code>dkp-exports.vercel.app</code>)!
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--brand-navy)', marginBottom: '4px' }}>
                  Option 2: Netlify Drop
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  1. Run <code>npm run build</code> (dist folder ban jayega).<br />
                  2. <code>netlify.com/drop</code> par <code>dist</code> folder drag & drop karein.<br />
                  3. App turant online live ho jayegi!
                </div>
              </div>
            </div>
          </div>

          {/* BACKUP & RESTORE DATA SECTION */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} color="var(--accent-green)" />
              Data Backup & Master Excel Downloads
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {/* 1-Click JSON Backup */}
              <button 
                className="btn btn-secondary" 
                style={{ padding: '1rem', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', height: 'auto' }}
                onClick={handleDownloadBackup}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                  <Download size={16} color="var(--accent-blue)" /> Download JSON Backup
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Saves all 145 styles, lots, receipts, salaries, and expenses safely.
                </div>
              </button>

              {/* Master Multi-Sheet Excel Export */}
              <button 
                className="btn btn-secondary" 
                style={{ padding: '1rem', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', height: 'auto' }}
                onClick={handleDownloadFullExcel}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                  <Download size={16} color="var(--accent-green)" /> Complete Excel Workbook
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Multi-sheet workbook with Summary, Receipts, and Payroll.
                </div>
              </button>

              {/* Restore from JSON Backup */}
              <button 
                className="btn btn-secondary" 
                style={{ padding: '1rem', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', height: 'auto' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--brand-gold)' }}>
                  <Upload size={16} color="var(--brand-gold)" /> Restore Backup File
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Upload a previously saved JSON backup file.
                </div>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".json" 
                style={{ display: 'none' }} 
              />
            </div>
          </div>

          {/* RESET TO FACTORY DEFAULT */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Reset Database to Original Excel Data</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Restore original data extracted directly from Inventory 2026.xlsx and P&L July 2026.xlsx</div>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all data to the initial Excel workbook values?')) {
                  onResetToDefault();
                  alert('Reset to original Excel data completed!');
                  onClose();
                }
              }}
            >
              <RotateCcw size={14} /> Reset to Excel Data
            </button>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeployBackupModal;
