import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Calendar, 
  FileText, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Receipt, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Printer
} from 'lucide-react';

export const LotModal = ({ 
  style, 
  onClose, 
  onUpdateStyle 
}) => {
  if (!style) return null;

  const [activeTab, setActiveTab] = useState('lots'); // 'lots', 'add_lot', 'add_dispatch', 'invoice'
  const lots = style.lots || [];
  const transactions = style.transactions || [];

  // Form states
  const [newLotDate, setNewLotDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLotChallan, setNewLotChallan] = useState('');
  const [newLotQty, setNewLotQty] = useState('');
  const [newLotDesc, setNewLotDesc] = useState(style.style || '');

  // Dispatch states
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [dispatchChallan, setDispatchChallan] = useState('');
  const [dispatchQty, setDispatchQty] = useState('');
  const [selectedLotId, setSelectedLotId] = useState(lots[0]?.lot_id || '');

  // Invoice states
  const [invNo, setInvNo] = useState(style.invoice_no || '');
  const [invDate, setInvDate] = useState(style.invoice_date || new Date().toISOString().split('T')[0]);
  const [invAmt, setInvAmt] = useState(style.invoice_amount || '');

  // Add new lot / inward challan
  const handleAddNewLot = (e) => {
    e.preventDefault();
    if (!newLotChallan || !newLotQty) {
      alert('Please enter Inward Challan No and Received Quantity.');
      return;
    }

    const qty = parseFloat(newLotQty) || 0;
    const nextLotNumber = lots.length + 1;
    const newLot = {
      lot_id: `LOT-${style.sno || '00'}-${nextLotNumber}`,
      inward_date: newLotDate,
      inward_challan: newLotChallan,
      received_qty: qty,
      item_desc: newLotDesc || style.style,
      status: 'Active',
      invoice_no: '',
      invoice_date: '',
      invoice_amount: 0
    };

    const newTx = {
      date: newLotDate,
      challan_no: newLotChallan,
      size_item: newLotDesc || style.style,
      inward_qty: qty,
      outward_qty: 0,
      balance: (style.balance || 0) + qty
    };

    const updatedStyle = {
      ...style,
      balance: (style.balance || 0) + qty,
      status: ((style.balance || 0) + qty) === 0 ? 2 : 1,
      lots: [newLot, ...lots],
      transactions: [newTx, ...transactions]
    };

    onUpdateStyle(updatedStyle);
    setNewLotChallan('');
    setNewLotQty('');
    setActiveTab('lots');
  };

  // Add outward dispatch
  const handleAddDispatch = (e) => {
    e.preventDefault();
    if (!dispatchChallan || !dispatchQty) {
      alert('Please enter Outward Challan No and Quantity.');
      return;
    }

    const qty = parseFloat(dispatchQty) || 0;
    const newTx = {
      date: dispatchDate,
      challan_no: dispatchChallan,
      size_item: style.style,
      inward_qty: 0,
      outward_qty: qty,
      balance: (style.balance || 0) - qty
    };

    const newBalance = (style.balance || 0) - qty;
    const updatedStyle = {
      ...style,
      balance: newBalance,
      status: newBalance === 0 ? 2 : (style.status === 3 ? 3 : 1),
      transactions: [newTx, ...transactions]
    };

    onUpdateStyle(updatedStyle);
    setDispatchChallan('');
    setDispatchQty('');
    setActiveTab('lots');
  };

  // Save invoice billing details
  const handleSaveInvoice = (e) => {
    e.preventDefault();
    if (!invNo) {
      alert('Please enter Invoice Number.');
      return;
    }

    const updatedStyle = {
      ...style,
      invoice_no: invNo,
      invoice_date: invDate,
      invoice_amount: parseFloat(invAmt) || 0,
      status: 3 // Mark as invoiced
    };

    onUpdateStyle(updatedStyle);
    setActiveTab('lots');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">
              <Layers size={20} color="var(--brand-gold)" />
              <span>{style.style}</span>
              <span className="division-pill" style={{ marginLeft: '0.5rem' }}>{style.vendor}</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
              Sheet: {style.sheet_name || 'Direct Ledger'} | Unit: {style.unit} | Net Balance: <strong>{style.balance} {style.unit}</strong>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)', padding: '0 1.5rem' }}>
          <button
            className={`nav-tab ${activeTab === 'lots' ? 'active' : ''}`}
            onClick={() => setActiveTab('lots')}
          >
            <Layers size={16} /> All Lots & Challan History ({lots.length})
          </button>
          <button
            className={`nav-tab ${activeTab === 'add_lot' ? 'active' : ''}`}
            onClick={() => setActiveTab('add_lot')}
          >
            <Plus size={16} /> Add Inward Challan (New Lot)
          </button>
          <button
            className={`nav-tab ${activeTab === 'add_dispatch' ? 'active' : ''}`}
            onClick={() => setActiveTab('add_dispatch')}
          >
            <ArrowUpRight size={16} /> Record Dispatch
          </button>
          <button
            className={`nav-tab ${activeTab === 'invoice' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoice')}
          >
            <Receipt size={16} /> Bill / Invoicing
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          
          {/* TAB 1: Lots & Transaction Ledger */}
          {activeTab === 'lots' && (
            <div>
              {/* Summary Cards for this style */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Current Balance</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: style.balance < 0 ? 'var(--accent-red)' : (style.balance === 0 ? 'var(--accent-blue)' : 'var(--brand-navy)') }}>
                    {style.balance} {style.unit}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Billing Status</div>
                  <div style={{ marginTop: '3px' }}>
                    {style.status === 3 ? (
                      <span className="badge badge-invoiced">Invoiced ({style.invoice_no || 'Done'})</span>
                    ) : style.status === 2 ? (
                      <span className="badge badge-nil">Nil Balance (0)</span>
                    ) : (
                      <span className="badge badge-open">Open / In-Process</span>
                    )}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Invoiced Amt</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                    {style.invoice_amount ? `₹${Number(style.invoice_amount).toLocaleString('en-IN')}` : '-'}
                  </div>
                </div>
              </div>

              {/* Recurring Lots / Batches List */}
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} color="var(--brand-gold)" />
                Recorded Lots / Inward Challan Batches
              </h4>

              <div className="lot-timeline" style={{ marginBottom: '1.5rem' }}>
                {lots.map((lot, idx) => (
                  <div key={lot.lot_id || idx} className={`lot-card ${lot.status === 'Billed' ? 'closed' : 'active'}`}>
                    <div className="lot-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="lot-id-badge">{lot.lot_id}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Challan: {lot.inward_challan}</span>
                      </div>
                      <span className={`badge ${lot.status === 'Billed' ? 'badge-invoiced' : (lot.status === 'Nil' ? 'badge-nil' : 'badge-open')}`}>
                        {lot.status || 'Active'}
                      </span>
                    </div>

                    <div className="lot-metrics-grid">
                      <div className="lot-metric-item">
                        <span className="lot-metric-label">Arrival Date</span>
                        <span className="lot-metric-value" style={{ fontSize: '0.85rem' }}>{lot.inward_date || 'N/A'}</span>
                      </div>
                      <div className="lot-metric-item">
                        <span className="lot-metric-label">Inward Qty</span>
                        <span className="lot-metric-value">{lot.received_qty} {style.unit}</span>
                      </div>
                      <div className="lot-metric-item">
                        <span className="lot-metric-label">Item / Size Desc</span>
                        <span className="lot-metric-value" style={{ fontSize: '0.82rem' }}>{lot.item_desc || style.style}</span>
                      </div>
                      {lot.invoice_no && (
                        <div className="lot-metric-item">
                          <span className="lot-metric-label">Invoice Ref</span>
                          <span className="lot-metric-value" style={{ fontSize: '0.82rem', color: 'var(--accent-green)' }}>
                            {lot.invoice_no} ({lot.invoice_date})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Full Inward/Outward Transaction History Table */}
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={16} color="var(--brand-gold)" />
                Detailed Inward / Outward Transaction Ledger
              </h4>

              {transactions.length > 0 ? (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Challan No.</th>
                        <th>Item / Size</th>
                        <th>Inward Qty</th>
                        <th>Outward Qty</th>
                        <th>Running Bal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, i) => (
                        <tr key={i}>
                          <td>{tx.date || '-'}</td>
                          <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{tx.challan_no || '-'}</td>
                          <td>{tx.size_item || '-'}</td>
                          <td style={{ color: tx.inward_qty > 0 ? 'var(--accent-green)' : 'inherit', fontWeight: tx.inward_qty > 0 ? 700 : 400 }}>
                            {tx.inward_qty > 0 ? `+${tx.inward_qty}` : '-'}
                          </td>
                          <td style={{ color: tx.outward_qty > 0 ? 'var(--accent-red)' : 'inherit', fontWeight: tx.outward_qty > 0 ? 700 : 400 }}>
                            {tx.outward_qty > 0 ? `-${tx.outward_qty}` : '-'}
                          </td>
                          <td style={{ fontWeight: 700 }}>
                            {tx.balance} {style.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>
                  No individual ledger entries logged yet. Initial style balance: {style.balance} {style.unit}.
                </div>
              )}

            </div>
          )}

          {/* TAB 2: Add Inward Challan / New Lot Form */}
          {activeTab === 'add_lot' && (
            <form onSubmit={handleAddNewLot}>
              <div style={{ background: 'var(--brand-gold-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--brand-gold-border)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  <Sparkles size={18} color="var(--brand-gold)" />
                  Recurring Lot Inward Entry
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Jab bhi yeh same style 1 mahine baad ya dobara naye challan par aayega, yahan uska Challan No aur Date enter karke naya <strong>Lot</strong> create karein!
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Inward Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newLotDate}
                    onChange={(e) => setNewLotDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Inward Challan No. / PO Ref *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. JB-0945/26-27"
                    value={newLotChallan}
                    onChange={(e) => setNewLotChallan(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Received Quantity ({style.unit}) *</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    placeholder="e.g. 150"
                    value={newLotQty}
                    onChange={(e) => setNewLotQty(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Item / Lot Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newLotDesc}
                    onChange={(e) => setNewLotDesc(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('lots')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold">
                  <Plus size={16} /> Save New Lot & Add Inward
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Record Outward Dispatch */}
          {activeTab === 'add_dispatch' && (
            <form onSubmit={handleAddDispatch}>
              <div style={{ background: 'var(--accent-blue-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(37, 99, 235, 0.2)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  <ArrowUpRight size={18} color="var(--accent-blue)" />
                  Record Outward Dispatch Challan
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Maal dispatch hone par outward challan number aur quantity enter karein. Balance automatically update ho jayega.
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Dispatch Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dispatchDate}
                    onChange={(e) => setDispatchDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Outward Challan No. *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. MC-OUT-1045"
                    value={dispatchChallan}
                    onChange={(e) => setDispatchChallan(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Dispatch Quantity ({style.unit}) *</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    placeholder="e.g. 50"
                    value={dispatchQty}
                    onChange={(e) => setDispatchQty(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('lots')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <ArrowUpRight size={16} /> Record Outward Dispatch
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Invoicing & Billing */}
          {activeTab === 'invoice' && (
            <form onSubmit={handleSaveInvoice}>
              <div style={{ background: 'var(--accent-green-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  <Receipt size={18} color="var(--accent-green)" />
                  Bill & Settle Style Invoice
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Enter invoice number, invoice date, and total billed amount to mark this style/lot as fully Invoiced (Status 3).
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Invoice Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. MC/26-27/22"
                    value={invNo}
                    onChange={(e) => setInvNo(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Invoice Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Invoice Amount (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    placeholder="e.g. 85000"
                    value={invAmt}
                    onChange={(e) => setInvAmt(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('lots')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  <CheckCircle2 size={16} /> Mark as Invoiced & Settle
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LotModal;
