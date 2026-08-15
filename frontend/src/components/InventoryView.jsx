import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Layers, 
  Receipt, 
  ArrowUpDown, 
  AlertTriangle, 
  Download, 
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Building2
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const InventoryView = ({ 
  inventory = [], 
  onSelectStyle, 
  onAddNewStyle,
  filterStatus = 'all',
  setFilterStatus,
  filterVendor = 'all',
  setFilterVendor
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('sno');
  const [sortAsc, setSortAsc] = useState(true);
  const [isAddStyleModalOpen, setIsAddStyleModalOpen] = useState(false);

  // New Style Form
  const [newVendor, setNewVendor] = useState('');
  const [newStyleName, setNewStyleName] = useState('');
  const [newUnit, setNewUnit] = useState('Pcs');
  const [newInitialBal, setNewInitialBal] = useState('');

  // Extract unique vendors
  const vendors = Array.from(new Set(inventory.map(i => i.vendor).filter(Boolean)));

  // Filter & Search Logic
  const filteredItems = inventory.filter(item => {
    // Status Filter
    if (filterStatus === 'open' && item.status !== 1) return false;
    if (filterStatus === 'nil' && item.status !== 2) return false;
    if (filterStatus === 'invoiced' && item.status !== 3) return false;
    if (filterStatus === 'negative' && item.balance >= 0) return false;

    // Vendor Filter
    if (filterVendor !== 'all' && item.vendor !== filterVendor) return false;

    // Search Query (Style, Vendor, Invoice No, Challan in lots)
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchStyle = (item.style || '').toLowerCase().includes(q);
      const matchVendor = (item.vendor || '').toLowerCase().includes(q);
      const matchInv = (item.invoice_no || '').toLowerCase().includes(q);
      const matchLotChallan = (item.lots || []).some(l => (l.inward_challan || '').toLowerCase().includes(q));
      return matchStyle || matchVendor || matchInv || matchLotChallan;
    }

    return true;
  });

  // Sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = sortedItems.map((item, idx) => ({
      'S. No': idx + 1,
      'Vendor': item.vendor,
      'Style / PO': item.style,
      'Balance Qty': item.balance,
      'Unit': item.unit,
      'Status': item.status === 3 ? 'Invoiced' : (item.status === 2 ? 'Nil Balance' : 'Open / Pending'),
      'Invoice Date': item.invoice_date || '',
      'Invoice No': item.invoice_no || '',
      'Invoice Amount': item.invoice_amount || 0,
      'Sheet Ref': item.sheet_name || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory Master');
    XLSX.writeFile(wb, `Malik_Creation_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleCreateStyleSubmit = (e) => {
    e.preventDefault();
    if (!newVendor || !newStyleName) {
      alert('Please fill in both Vendor Name and Style Name.');
      return;
    }

    const nextSno = inventory.length + 1;
    const initialBal = parseFloat(newInitialBal) || 0;

    const snoPadded = String(nextSno).padStart(3, '0');
    const newStyleObj = {
      id: `STY-${snoPadded}`,
      sno: nextSno,
      vendor: newVendor.trim(),
      style: newStyleName.trim(),
      balance: initialBal,
      unit: newUnit,
      invoice_date: '',
      invoice_no: '',
      invoice_amount: 0,
      status: initialBal === 0 ? 2 : 1,
      sheet_name: `S_${newStyleName.replace(/\s+/g, '').slice(0, 8)}`,
      transactions: initialBal > 0 ? [{
        date: new Date().toISOString().split('T')[0],
        challan_no: 'CH-INITIAL',
        size_item: newStyleName.trim(),
        inward_qty: initialBal,
        outward_qty: 0,
        balance: initialBal
      }] : [],
      lots: initialBal > 0 ? [{
        lot_id: `LOT-${snoPadded}-1`,
        inward_date: new Date().toISOString().split('T')[0],
        inward_challan: 'CH-INITIAL',
        received_qty: initialBal,
        item_desc: newStyleName.trim(),
        status: 'Active',
        invoice_no: '',
        invoice_date: '',
        invoice_amount: 0
      }] : []
    };

    onAddNewStyle(newStyleObj);
    setIsAddStyleModalOpen(false);
    setNewVendor('');
    setNewStyleName('');
    setNewInitialBal('');
  };

  return (
    <div className="inventory-view">
      {/* Top Toolbar */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} color="var(--brand-gold)" />
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Master Style & Lot Inventory</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tracking {inventory.length} total styles | Showing {sortedItems.length} styles
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExportExcel}>
              <Download size={14} /> Export Excel
            </button>
            <button className="btn btn-gold btn-sm" onClick={() => setIsAddStyleModalOpen(true)}>
              <Plus size={14} /> Add New Style
            </button>
          </div>
        </div>

        <div className="card-body" style={{ paddingBottom: '0.75rem' }}>
          <div className="toolbar">
            {/* Search Input */}
            <div className="search-input-wrap">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                className="search-input"
                placeholder="Search style name, vendor, inward challan, or invoice no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Vendor Filter */}
            <div className="filter-group">
              <select
                className="select-filter"
                value={filterVendor}
                onChange={(e) => setFilterVendor(e.target.value)}
              >
                <option value="all">All Vendors ({vendors.length})</option>
                {vendors.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>

              {/* Status Filter Pills */}
              <div className="filter-pills">
                <button
                  className={`filter-pill ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  All ({inventory.length})
                </button>
                <button
                  className={`filter-pill ${filterStatus === 'open' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('open')}
                >
                  Open (99)
                </button>
                <button
                  className={`filter-pill ${filterStatus === 'nil' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('nil')}
                >
                  Nil (25)
                </button>
                <button
                  className={`filter-pill ${filterStatus === 'invoiced' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('invoiced')}
                >
                  Invoiced (21)
                </button>
                <button
                  className={`filter-pill ${filterStatus === 'negative' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('negative')}
                  style={{ color: filterStatus === 'negative' ? '#b91c1c' : 'inherit' }}
                >
                  ⚠️ Neg Bal (86)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Master Inventory Table */}
        <div className="table-responsive" style={{ border: 'none', borderTop: '1px solid var(--border-color)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }} onClick={() => toggleSort('sno')}>
                  S.No <ArrowUpDown size={12} />
                </th>
                <th onClick={() => toggleSort('vendor')}>
                  Vendor / Customer <ArrowUpDown size={12} />
                </th>
                <th onClick={() => toggleSort('style')}>
                  Style / PO Name <ArrowUpDown size={12} />
                </th>
                <th onClick={() => toggleSort('balance')}>
                  Current Balance <ArrowUpDown size={12} />
                </th>
                <th>Unit</th>
                <th>Lots / Challans</th>
                <th onClick={() => toggleSort('status')}>
                  Status <ArrowUpDown size={12} />
                </th>
                <th>Invoice Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.length > 0 ? (
                sortedItems.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{item.sno || index + 1}</td>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Building2 size={14} color="var(--brand-gold)" />
                        {item.vendor}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--brand-navy)', cursor: 'pointer' }} onClick={() => onSelectStyle(item)}>
                        {item.style}
                      </div>
                      {item.sheet_name && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          Sheet: {item.sheet_name}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${item.balance < 0 ? 'badge-negative' : (item.balance === 0 ? 'badge-nil' : 'badge-open')}`}>
                        {item.balance} {item.unit}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{item.unit}</td>
                    <td>
                      <span style={{ fontSize: '0.78rem', background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        {item.lots ? `${item.lots.length} Lot${item.lots.length > 1 ? 's' : ''}` : '1 Lot'}
                      </span>
                    </td>
                    <td>
                      {item.status === 3 ? (
                        <span className="badge badge-invoiced">Invoiced</span>
                      ) : item.status === 2 ? (
                        <span className="badge badge-nil">Nil Bal (0)</span>
                      ) : (
                        <span className="badge badge-open">Open</span>
                      )}
                    </td>
                    <td>
                      {item.invoice_no ? (
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--accent-green)' }}>
                            {item.invoice_no}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            ₹{Number(item.invoice_amount || 0).toLocaleString('en-IN')} {item.invoice_date ? `(${item.invoice_date})` : ''}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Unbilled</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-gold btn-sm"
                        onClick={() => onSelectStyle(item)}
                      >
                        <Layers size={13} /> View Lots & Ledger
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No styles found matching your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Style Modal */}
      {isAddStyleModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddStyleModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Plus size={20} color="var(--brand-gold)" />
                Create New Style / Job-Work Master
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsAddStyleModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateStyleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Vendor / Customer Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. ART & DESIGN"
                      value={newVendor}
                      onChange={(e) => setNewVendor(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Style / PO Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. D-1550 ORGANZA SUIT"
                      value={newStyleName}
                      onChange={(e) => setNewStyleName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Measurement Unit *</label>
                    <select
                      className="form-control"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                    >
                      <option value="Pcs">Pcs (Pieces)</option>
                      <option value="PCS">PCS</option>
                      <option value="Mtrs">Mtrs (Meters)</option>
                      <option value="SHEET">SHEET</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Inward Qty (Optional)</label>
                    <input
                      type="number"
                      step="any"
                      className="form-control"
                      placeholder="0"
                      value={newInitialBal}
                      onChange={(e) => setNewInitialBal(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddStyleModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold">
                  Create Style
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
