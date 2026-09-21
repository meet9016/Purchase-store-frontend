"use client";

import React from 'react';
import { Project, Vendor, Item, PurchaseRequest, PurchaseOrder, VendorBill, PaymentRequest, Stock } from '@/lib/storeData';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Printer, ShoppingBag, ArrowDownLeft, ArrowUpRight, Layers, CreditCard } from 'lucide-react';

interface ModalsProps {
  openModal: string | null;
  setOpenModal: (modal: string | null) => void;
  projects: Project[];
  vendors: Vendor[];
  items: Item[];
  purchaseRequests: PurchaseRequest[];
  purchaseOrders: PurchaseOrder[];
  vendorBills: VendorBill[];
  paymentRequests: PaymentRequest[];
  stocks?: Stock[];
  
  // PR Forms & Handlers
  prForm: any;
  setPrForm: React.Dispatch<React.SetStateAction<any>>;
  prItemInput: any;
  setPrItemInput: React.Dispatch<React.SetStateAction<any>>;
  handleCreatePR: (e: React.FormEvent) => void;

  // PO Forms & Handlers
  poForm: any;
  setPoForm: React.Dispatch<React.SetStateAction<any>>;
  handleCreatePO: (e: React.FormEvent) => void;

  // GRN Forms & Handlers
  grnForm: any;
  setGrnForm: React.Dispatch<React.SetStateAction<any>>;
  handleCreateGRN: (e: React.FormEvent) => void;

  // Outward Forms & Handlers
  outwardForm: any;
  setOutwardForm: React.Dispatch<React.SetStateAction<any>>;
  outwardItemInput: any;
  setOutwardItemInput: React.Dispatch<React.SetStateAction<any>>;
  handleCreateOutward: (e: React.FormEvent) => void;

  // Bill Forms & Handlers
  billForm?: any;
  setBillForm?: React.Dispatch<React.SetStateAction<any>>;
  handleCreateBill?: (e: React.FormEvent) => void;

  // Payment Request Forms & Handlers
  paymentReqForm: any;
  setPaymentReqForm: React.Dispatch<React.SetStateAction<any>>;
  handleCreatePaymentReq: (e: React.FormEvent) => void;

  // Payment Entry Forms & Handlers
  paymentEntryForm: any;
  setPaymentEntryForm: React.Dispatch<React.SetStateAction<any>>;
  handleCreatePaymentEntry: (e: React.FormEvent) => void;

  // Selected Detail drawers
  selectedPrDetail: PurchaseRequest | null;
  setSelectedPrDetail: (pr: PurchaseRequest | null) => void;
  selectedPo: PurchaseOrder | null;
  setSelectedPo: (po: PurchaseOrder | null) => void;
}

export function Modals({
  openModal,
  setOpenModal,
  projects,
  vendors,
  items,
  purchaseRequests,
  purchaseOrders,
  vendorBills,
  paymentRequests,
  stocks = [],
  prForm,
  setPrForm,
  prItemInput,
  setPrItemInput,
  handleCreatePR,
  poForm,
  setPoForm,
  handleCreatePO,
  grnForm,
  setGrnForm,
  handleCreateGRN,
  outwardForm,
  setOutwardForm,
  outwardItemInput,
  setOutwardItemInput,
  handleCreateOutward,
  billForm,
  setBillForm,
  handleCreateBill,
  paymentReqForm,
  setPaymentReqForm,
  handleCreatePaymentReq,
  paymentEntryForm,
  setPaymentEntryForm,
  handleCreatePaymentEntry,
  selectedPrDetail,
  setSelectedPrDetail,
  selectedPo,
  setSelectedPo
}: ModalsProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setErrors({});
  }, [openModal]);

  const clearError = (field: string) => {
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <>
      {/* 1. Create PR Modal */}
      {openModal === 'create-pr' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/70 backdrop-blur-xs animate-backdrop-fade">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 animate-modal-zoom space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#0F172C]">Create Purchase Request</h3>
              <button onClick={() => setOpenModal(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const errs: Record<string, string> = {};
                if (!prForm.projectId) errs.projectId = 'Please select a project location';
                if (!prForm.requiredDate) errs.requiredDate = 'Please select required by date';
                if (!prForm.items || prForm.items.length === 0) {
                  errs.items = 'Please add at least one line item';
                }
                if (Object.keys(errs).length > 0) {
                  setErrors(errs);
                  return;
                }
                handleCreatePR(e);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Project Location"
                  options={projects.map(p => ({ value: p.id, label: p.name }))}
                  value={prForm.projectId}
                  onChange={e => { setPrForm({...prForm, projectId: e.target.value}); clearError('projectId'); }}
                  error={errors.projectId}
                  required
                />
                <DatePicker
                  label="Required by Date"
                  value={prForm.requiredDate}
                  onChange={val => { setPrForm({...prForm, requiredDate: val}); clearError('requiredDate'); }}
                  error={errors.requiredDate}
                  required
                />
                <Select
                  label="Priority Level"
                  options={[{value: 'Low', label: 'Low'}, {value: 'Medium', label: 'Medium'}, {value: 'High', label: 'High'}, {value: 'Urgent', label: 'Urgent'}]}
                  value={prForm.priority}
                  onChange={e => setPrForm({...prForm, priority: e.target.value})}
                />
              </div>

              {/* Add Item Line Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-[#0F172C]">Add Request Line Item</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Select
                    label="Select Master Item"
                    options={items.map(i => ({ value: i.id, label: `${i.name} (${i.itemCode || 'No Code'})` }))}
                    value={prItemInput.itemId}
                    onChange={e => { setPrItemInput({...prItemInput, itemId: e.target.value}); clearError('itemInput'); }}
                    error={errors.itemInput}
                  />
                  <Input
                    label="Quantity"
                    type="number"
                    min={1}
                    value={prItemInput.quantity}
                    onChange={e => setPrItemInput({...prItemInput, quantity: Number(e.target.value)})}
                  />
                  <Input
                    label="Remarks / Specifications"
                    value={prItemInput.remarks}
                    onChange={e => setPrItemInput({...prItemInput, remarks: e.target.value})}
                    placeholder="e.g. For Phase 2 foundation"
                  />
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={() => {
                    if (!prItemInput.itemId) {
                      setErrors(prev => ({ ...prev, itemInput: 'Please select an item first' }));
                      return;
                    }
                    setPrForm({ ...prForm, items: [...prForm.items, prItemInput] });
                    setPrItemInput({ itemId: '', quantity: 1, remarks: '' });
                    clearError('items');
                    clearError('itemInput');
                  }}
                >
                  Add Line Item
                </Button>
              </div>

              {/* Added Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#0F172C]">Line Items ({prForm.items.length})</h4>
                  {errors.items && (
                    <span className="text-xs text-red-500 font-medium">{errors.items}</span>
                  )}
                </div>
                <div className={`border rounded-xl overflow-hidden shadow-xs ${errors.items ? 'border-red-400' : 'border-slate-200'}`}>
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 font-semibold text-xs border-b border-slate-200">
                      <tr>
                        <th className="p-3">Item Name</th>
                        <th className="p-3">Quantity</th>
                        <th className="p-3">Remarks</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {prForm.items.length === 0 ? (
                        <tr><td colSpan={4} className="p-3.5 text-center text-slate-400 italic">No line items added yet</td></tr>
                      ) : (
                        prForm.items.map((it: any, idx: number) => {
                          const itemObj = items.find(i => i.id === it.itemId);
                          return (
                            <tr key={idx}>
                              <td className="p-3 font-semibold text-[#0F172C]">{itemObj?.name || 'Item'}</td>
                              <td className="p-3 font-medium text-slate-800">{it.quantity} {itemObj?.unit}</td>
                              <td className="p-3 text-slate-600">{it.remarks || '-'}</td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = prForm.items.filter((_: any, i: number) => i !== idx);
                                    setPrForm({ ...prForm, items: updated });
                                  }}
                                  className="text-rose-600 hover:text-rose-800 cursor-pointer font-bold p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setOpenModal(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Submit Purchase Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Create PO Modal */}
      {openModal === 'create-po' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/70 backdrop-blur-xs animate-backdrop-fade">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 animate-modal-zoom space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#0F172C]">Create Purchase Order</h3>
              <button onClick={() => setOpenModal(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const errs: Record<string, string> = {};
                if (!poForm.prId) errs.prId = 'Please select an approved requisition';
                if (!poForm.vendorId) errs.vendorId = 'Please select a vendor';
                if (!poForm.expectedDeliveryDate) errs.expectedDeliveryDate = 'Please select expected delivery date';
                if (!poForm.deliveryLocation?.trim()) errs.deliveryLocation = 'Please enter delivery location';
                if (Object.keys(errs).length > 0) {
                  setErrors(errs);
                  return;
                }
                handleCreatePO(e);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Select Approved Requisition"
                  options={purchaseRequests.filter(pr => pr.status === 'Approved' || pr.status === 'Submitted').map(pr => ({ value: pr.id, label: `${pr.prNumber} - ${pr.projectName}` }))}
                  value={poForm.prId}
                  onChange={e => {
                    const selectedPr = purchaseRequests.find(pr => pr.id === e.target.value);
                    if (selectedPr) {
                      const poItems = selectedPr.items.map(it => ({
                        itemId: it.itemId,
                        quantity: it.quantity,
                        rate: 1000,
                        tax: 18,
                        discount: 0
                      }));
                      setPoForm({ ...poForm, prId: e.target.value, items: poItems });
                    }
                    clearError('prId');
                  }}
                  error={errors.prId}
                  required
                />
                <Select
                  label="Select Vendor"
                  options={vendors.map(v => ({ value: v.id, label: v.name }))}
                  value={poForm.vendorId}
                  onChange={e => { setPoForm({...poForm, vendorId: e.target.value}); clearError('vendorId'); }}
                  error={errors.vendorId}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DatePicker
                  label="Expected Delivery Date"
                  value={poForm.expectedDeliveryDate}
                  onChange={val => { setPoForm({...poForm, expectedDeliveryDate: val}); clearError('expectedDeliveryDate'); }}
                  error={errors.expectedDeliveryDate}
                  required
                />
                <Input
                  label="Credit Period (Days)"
                  type="number"
                  value={poForm.creditPeriod}
                  onChange={e => setPoForm({...poForm, creditPeriod: Number(e.target.value)})}
                />
              </div>

              <Input
                label="Delivery Location"
                value={poForm.deliveryLocation}
                onChange={e => { setPoForm({...poForm, deliveryLocation: e.target.value}); clearError('deliveryLocation'); }}
                placeholder="Site location / Main Warehouse"
                error={errors.deliveryLocation}
                required
              />

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setOpenModal(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Generate Purchase Order</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Create GRN Modal */}
      {openModal === 'create-grn' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/70 backdrop-blur-xs animate-backdrop-fade">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 animate-modal-zoom space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <ArrowDownLeft className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172C]">Record Material Receipt (GRN)</h3>
              </div>
              <button onClick={() => setOpenModal(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const errs: Record<string, string> = {};
                if (!grnForm.poId) errs.poId = 'Please select a purchase order';
                if (!grnForm.challanNumber?.trim()) errs.challanNumber = 'Please enter challan number';
                if (!grnForm.vehicleNumber?.trim()) errs.vehicleNumber = 'Please enter vehicle / transporter number';
                if (Object.keys(errs).length > 0) {
                  setErrors(errs);
                  return;
                }
                handleCreateGRN(e);
              }}
              className="space-y-4"
            >
              <Select
                label="Select Purchase Order"
                options={purchaseOrders.map(p => ({ value: p.id, label: `${p.poNumber} - ${p.vendorName} (${p.projectName})` }))}
                value={grnForm.poId}
                onChange={e => { setGrnForm({ ...grnForm, poId: e.target.value }); clearError('poId'); }}
                error={errors.poId}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Challan Number"
                  value={grnForm.challanNumber}
                  onChange={e => { setGrnForm({ ...grnForm, challanNumber: e.target.value }); clearError('challanNumber'); }}
                  placeholder="CH-98765"
                  error={errors.challanNumber}
                  required
                />
                <Input
                  label="Vehicle / Transporter Number"
                  value={grnForm.vehicleNumber}
                  onChange={e => { setGrnForm({ ...grnForm, vehicleNumber: e.target.value }); clearError('vehicleNumber'); }}
                  placeholder="MH-04-AB-1234"
                  error={errors.vehicleNumber}
                  required
                />
              </div>

              <Input
                label="Vendor Invoice Number (Optional)"
                value={grnForm.vendorInvoiceNumber}
                onChange={e => setGrnForm({ ...grnForm, vendorInvoiceNumber: e.target.value })}
                placeholder="INV-2026-001"
              />

              <Input
                label="Inspection Remarks"
                value={grnForm.remarks}
                onChange={e => setGrnForm({ ...grnForm, remarks: e.target.value })}
                placeholder="Material inspected and physically verified at site"
              />

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setOpenModal(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Submit Inward Receipt</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Create Store Outward Modal */}
      {openModal === 'create-outward' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/70 backdrop-blur-xs animate-backdrop-fade">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 animate-modal-zoom space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172C]">Issue Material from Store</h3>
              </div>
              <button onClick={() => setOpenModal(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const errs: Record<string, string> = {};
                if (!outwardForm.projectId) errs.projectId = 'Please select a project site';
                if (!outwardForm.issuedTo?.trim()) errs.issuedTo = 'Please enter recipient name';
                if (!outwardForm.department?.trim()) errs.department = 'Please enter department / contractor';
                if (!outwardForm.purpose?.trim()) errs.purpose = 'Please enter purpose / work package';
                if (!outwardItemInput.itemId) errs.item = 'Please select material to issue';
                if (!outwardItemInput.quantity || outwardItemInput.quantity <= 0) errs.quantity = 'Please enter valid quantity';
                if (Object.keys(errs).length > 0) {
                  setErrors(errs);
                  return;
                }
                handleCreateOutward(e);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Project Site"
                  options={projects.map(p => ({ value: p.id, label: p.name }))}
                  value={outwardForm.projectId}
                  onChange={e => { setOutwardForm({ ...outwardForm, projectId: e.target.value }); clearError('projectId'); }}
                  error={errors.projectId}
                  required
                />
                <Input
                  label="Issued to (Person Name)"
                  value={outwardForm.issuedTo}
                  onChange={e => { setOutwardForm({ ...outwardForm, issuedTo: e.target.value }); clearError('issuedTo'); }}
                  placeholder="Contractor / Engineer Name"
                  error={errors.issuedTo}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Department / Contractor"
                  value={outwardForm.department}
                  onChange={e => { setOutwardForm({ ...outwardForm, department: e.target.value }); clearError('department'); }}
                  placeholder="Civil / Electrical / Structural"
                  error={errors.department}
                  required
                />
                <Input
                  label="Purpose / Work Package"
                  value={outwardForm.purpose}
                  onChange={e => { setOutwardForm({ ...outwardForm, purpose: e.target.value }); clearError('purpose'); }}
                  placeholder="Phase 1 Slab casting"
                  error={errors.purpose}
                  required
                />
              </div>

              {/* Line item selection */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700">Select Material &amp; Quantity</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Select
                    label="Item Name"
                    options={items.map(i => ({ value: i.id, label: `${i.name} (${i.unit})` }))}
                    value={outwardItemInput.itemId}
                    onChange={e => { setOutwardItemInput({ ...outwardItemInput, itemId: e.target.value }); clearError('item'); }}
                    error={errors.item}
                    required
                  />
                  <Input
                    label="Quantity to Issue"
                    type="number"
                    min={1}
                    value={outwardItemInput.quantity}
                    onChange={e => { setOutwardItemInput({ ...outwardItemInput, quantity: Number(e.target.value) }); clearError('quantity'); }}
                    error={errors.quantity}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setOpenModal(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Issue Material Voucher</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Create Vendor Bill Modal */}
      {openModal === 'create-bill' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/70 backdrop-blur-xs animate-backdrop-fade">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 animate-modal-zoom space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172C]">Register Vendor Invoice</h3>
              </div>
              <button onClick={() => setOpenModal(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const errs: Record<string, string> = {};
                if (!billForm?.poId) errs.poId = 'Please select a purchase order';
                if (!billForm?.vendorInvoiceNumber?.trim()) errs.vendorInvoiceNumber = 'Please enter invoice number';
                if (!billForm?.billAmount || billForm.billAmount <= 0) errs.billAmount = 'Please enter valid invoice amount';
                if (!billForm?.billDate) errs.billDate = 'Please select invoice date';
                if (Object.keys(errs).length > 0) {
                  setErrors(errs);
                  return;
                }
                if (handleCreateBill) handleCreateBill(e);
              }}
              className="space-y-4"
            >
              <Select
                label="Select Purchase Order"
                options={purchaseOrders.map(p => ({ value: p.id, label: `${p.poNumber} - ${p.vendorName} (${formatCurrency(p.totalPOAmount || 0)})` }))}
                value={billForm?.poId || ''}
                onChange={e => {
                  const selPo = purchaseOrders.find(p => p.id === e.target.value);
                  if (setBillForm) {
                    setBillForm({
                      ...billForm,
                      poId: e.target.value,
                      billAmount: selPo?.totalPOAmount || 0,
                      creditPeriod: selPo?.creditPeriod || 30
                    });
                  }
                  clearError('poId');
                }}
                error={errors.poId}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Vendor Invoice Number"
                  value={billForm?.vendorInvoiceNumber || ''}
                  onChange={e => {
                    if (setBillForm) setBillForm({ ...billForm, vendorInvoiceNumber: e.target.value });
                    clearError('vendorInvoiceNumber');
                  }}
                  placeholder="INV-998877"
                  error={errors.vendorInvoiceNumber}
                  required
                />
                <Input
                  label="Invoice Amount (INR)"
                  type="number"
                  value={billForm?.billAmount || 0}
                  onChange={e => {
                    if (setBillForm) setBillForm({ ...billForm, billAmount: Number(e.target.value) });
                    clearError('billAmount');
                  }}
                  error={errors.billAmount}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DatePicker
                  label="Invoice Bill Date"
                  value={billForm?.billDate || ''}
                  onChange={val => {
                    if (setBillForm) setBillForm({ ...billForm, billDate: val });
                    clearError('billDate');
                  }}
                  error={errors.billDate}
                  required
                />
                <Input
                  label="Credit Period (Days)"
                  type="number"
                  value={billForm?.creditPeriod || 30}
                  onChange={e => setBillForm && setBillForm({ ...billForm, creditPeriod: Number(e.target.value) })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setOpenModal(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Register Invoice Bill</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Create Payment Request Modal */}
      {openModal === 'create-pay-req' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/70 backdrop-blur-xs animate-backdrop-fade">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-modal-zoom space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172C]">Create Payment Request</h3>
              </div>
              <button onClick={() => setOpenModal(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const errs: Record<string, string> = {};
                if (!paymentReqForm.billId) errs.billId = 'Please select a vendor bill';
                if (!paymentReqForm.requestedAmount || paymentReqForm.requestedAmount <= 0) errs.requestedAmount = 'Please enter valid requested amount';
                if (Object.keys(errs).length > 0) {
                  setErrors(errs);
                  return;
                }
                handleCreatePaymentReq(e);
              }}
              className="space-y-4"
            >
              <Select
                label="Select Vendor Bill"
                options={vendorBills.filter(b => (b.outstandingAmount || b.billAmount) > 0).map(b => ({
                  value: b.id,
                  label: `${b.billNumber} (${b.vendorName}) - Due: ${formatCurrency(b.outstandingAmount || b.billAmount)}`
                }))}
                value={paymentReqForm.billId}
                onChange={e => {
                  const sel = vendorBills.find(b => b.id === e.target.value);
                  setPaymentReqForm({
                    ...paymentReqForm,
                    billId: e.target.value,
                    requestedAmount: sel?.outstandingAmount || sel?.billAmount || 0
                  });
                  clearError('billId');
                  clearError('requestedAmount');
                }}
                error={errors.billId}
                required
              />

              <Input
                label="Requested Payment Amount (INR)"
                type="number"
                value={paymentReqForm.requestedAmount}
                onChange={e => {
                  setPaymentReqForm({ ...paymentReqForm, requestedAmount: Number(e.target.value) });
                  clearError('requestedAmount');
                }}
                error={errors.requestedAmount}
                required
              />

              <Input
                label="Payment Rationale / Remarks"
                value={paymentReqForm.remarks}
                onChange={e => setPaymentReqForm({ ...paymentReqForm, remarks: e.target.value })}
                placeholder="Advance release / Milestone payment"
              />

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setOpenModal(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Submit Payment Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Create Payment Entry Modal */}
      {openModal === 'create-payment' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/70 backdrop-blur-xs animate-backdrop-fade">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-modal-zoom space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172C]">Record Payment Voucher</h3>
              </div>
              <button onClick={() => setOpenModal(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const errs: Record<string, string> = {};
                if (!paymentEntryForm.billId) errs.billId = 'Please select a verified bill';
                if (!paymentEntryForm.paymentAmount || paymentEntryForm.paymentAmount <= 0) errs.paymentAmount = 'Please enter valid disbursement amount';
                if (!paymentEntryForm.transactionNumber?.trim()) errs.transactionNumber = 'Please enter transaction / UTR reference number';
                if (Object.keys(errs).length > 0) {
                  setErrors(errs);
                  return;
                }
                handleCreatePaymentEntry(e);
              }}
              className="space-y-4"
            >
              <Select
                label="Select Verified Bill"
                options={vendorBills.map(b => ({
                  value: b.id,
                  label: `${b.billNumber} (${b.vendorName}) - Amount: ${formatCurrency(b.billAmount)}`
                }))}
                value={paymentEntryForm.billId}
                onChange={e => {
                  const sel = vendorBills.find(b => b.id === e.target.value);
                  setPaymentEntryForm({
                    ...paymentEntryForm,
                    billId: e.target.value,
                    paymentAmount: sel?.outstandingAmount || sel?.billAmount || 0
                  });
                  clearError('billId');
                  clearError('paymentAmount');
                }}
                error={errors.billId}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Disbursed Amount (INR)"
                  type="number"
                  value={paymentEntryForm.paymentAmount}
                  onChange={e => {
                    setPaymentEntryForm({ ...paymentEntryForm, paymentAmount: Number(e.target.value) });
                    clearError('paymentAmount');
                  }}
                  error={errors.paymentAmount}
                  required
                />
                <Select
                  label="Payment Mode"
                  options={[
                    { value: 'Bank Transfer/NEFT/RTGS', label: 'NEFT / RTGS / IMPS' },
                    { value: 'Cheque', label: 'Cheque' },
                    { value: 'UPI', label: 'UPI' },
                    { value: 'Cash', label: 'Cash' }
                  ]}
                  value={paymentEntryForm.paymentMode}
                  onChange={e => setPaymentEntryForm({ ...paymentEntryForm, paymentMode: e.target.value })}
                />
              </div>

              <Input
                label="Transaction / UTR Reference Number"
                value={paymentEntryForm.transactionNumber}
                onChange={e => {
                  setPaymentEntryForm({ ...paymentEntryForm, transactionNumber: e.target.value });
                  clearError('transactionNumber');
                }}
                placeholder="UTR-2026-987654321"
                error={errors.transactionNumber}
                required
              />

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setOpenModal(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Payment Voucher</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. PR Detail Modal */}
      {selectedPrDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/70 backdrop-blur-xs animate-backdrop-fade">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-modal-zoom space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#0F172C]">{selectedPrDetail.prNumber}</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedPrDetail.projectName}</p>
              </div>
              <button onClick={() => setSelectedPrDetail(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div><span className="font-semibold text-slate-500">Requester:</span> <span className="font-bold text-[#0F172C] ml-1">{selectedPrDetail.requesterName}</span></div>
                <div><span className="font-semibold text-slate-500">Date:</span> <span className="font-bold text-[#0F172C] ml-1">{selectedPrDetail.requestDate}</span></div>
                <div><span className="font-semibold text-slate-500">Priority:</span> <span className="font-bold text-[#0F172C] ml-1">{selectedPrDetail.priority}</span></div>
                <div><span className="font-semibold text-slate-500">Status:</span> <span className="font-bold text-emerald-700 ml-1">{selectedPrDetail.status}</span></div>
              </div>

              <h4 className="font-bold text-[#0F172C] text-xs">Requested Line Items</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr><th className="p-3">Item Name</th><th className="p-3">Quantity</th><th className="p-3">Remarks</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPrDetail.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold text-[#0F172C]">{it.itemName}</td>
                        <td className="p-3 font-medium text-slate-800">{it.quantity} {it.unit}</td>
                        <td className="p-3 text-slate-600">{it.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedPrDetail(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* 9. PO View / Print Drawer */}
      {selectedPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/70 backdrop-blur-xs animate-backdrop-fade">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-8 animate-modal-zoom space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0F172C]">Purchase Store Order</h2>
                  <p className="text-xs text-slate-500 font-medium">PO #: {selectedPo.poNumber}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="primary"
                  icon={<Printer className="h-4 w-4" />}
                  onClick={() => window.print()}
                >
                  Print Document
                </Button>
                <button onClick={() => setSelectedPo(null)} className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer text-xl p-1">✕</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="font-semibold text-slate-400 text-xs">Vendor Details</p>
                <p className="font-bold text-[#0F172C] text-base mt-0.5">{selectedPo.vendorName}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 text-xs">Project &amp; Location</p>
                <p className="font-bold text-[#0F172C] text-base mt-0.5">{selectedPo.projectName}</p>
                <p className="text-slate-600 font-normal text-xs mt-0.5">{selectedPo.deliveryLocation}</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold text-xs border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Item Name</th>
                    <th className="p-3.5">Quantity</th>
                    <th className="p-3.5">Unit Rate</th>
                    <th className="p-3.5">Tax Rate</th>
                    <th className="p-3.5 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedPo.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-3.5 font-semibold text-[#0F172C]">{it.itemName}</td>
                      <td className="p-3.5 font-medium text-slate-800">{it.quantity} {it.unit}</td>
                      <td className="p-3.5 font-normal text-slate-700">{formatCurrency(it.rate)}</td>
                      <td className="p-3.5 text-slate-600 font-normal">{it.tax}%</td>
                      <td className="p-3.5 font-bold text-[#0F172C] text-right">{formatCurrency(it.amount || it.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <div className="text-sm font-semibold text-slate-600">
                Status: <span className="text-emerald-700 font-bold ml-1">{selectedPo.status}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-semibold">Grand Total Amount</p>
                <p className="text-2xl font-black text-[#0F172C]">{formatCurrency(selectedPo.totalPOAmount || selectedPo.totalAmount || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
