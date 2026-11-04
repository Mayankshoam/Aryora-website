"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  FileText,
  Search,
  Download,
  Printer,
  Calendar,
  X,
  Eye,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAllInvoices, maskPAN, CustomerInvoice } from "@/lib/customerStore";
import { BUSINESS_CONFIG } from "@/lib/config/business";

interface InvoicesAdminProps {
  onSelectInvoice?: (invoice: CustomerInvoice) => void;
  selectedInvoice?: CustomerInvoice | null;
  onCloseInvoiceModal?: () => void;
}

export default function InvoicesAdmin({
  onSelectInvoice,
  selectedInvoice: externalSelectedInvoice,
  onCloseInvoiceModal,
}: InvoicesAdminProps) {
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [activeModalInvoice, setActiveModalInvoice] = useState<CustomerInvoice | null>(
    externalSelectedInvoice || null
  );

  useEffect(() => {
    if (externalSelectedInvoice !== undefined) {
      setActiveModalInvoice(externalSelectedInvoice);
    }
  }, [externalSelectedInvoice]);

  const refreshInvoices = () => {
    const list = getAllInvoices();
    setInvoices(list);
  };

  useEffect(() => {
    refreshInvoices();
    window.addEventListener("ayor_customer_changed", refreshInvoices);
    return () => window.removeEventListener("ayor_customer_changed", refreshInvoices);
  }, []);

  // Filter & Search Logic
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q) ||
          inv.customerId.toLowerCase().includes(q) ||
          inv.customerMobile.includes(q) ||
          inv.invoiceDate.toLowerCase().includes(q) ||
          (inv.customerPanMasked && inv.customerPanMasked.toLowerCase().includes(q));

        if (!matches) return false;
      }

      // 2. Date Range
      if (startDate) {
        const start = new Date(startDate).getTime();
        if (new Date(inv.invoiceDate).getTime() < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000;
        if (new Date(inv.invoiceDate).getTime() > end) return false;
      }

      return true;
    });
  }, [invoices, searchQuery, startDate, endDate]);

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  // Export Invoices CSV
  const handleExportInvoicesCSV = () => {
    const headers = [
      "Invoice Number",
      "Invoice Date",
      "Customer ID",
      "Customer Name",
      "Mobile",
      "Masked PAN",
      "Address",
      "HSN Code",
      "Taxable Amount (INR)",
      "CGST 1.5% (INR)",
      "SGST 1.5% (INR)",
      "Total Amount (INR)",
      "Payment Mode",
      "Payment Status",
    ];

    const escapeCell = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;

    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      inv.invoiceDate,
      inv.customerId,
      inv.customerName,
      inv.customerMobile,
      inv.customerPanMasked || "N/A",
      inv.customerAddress,
      BUSINESS_CONFIG.hsnCode,
      inv.taxableAmount,
      inv.cgst,
      inv.sgst,
      inv.totalAmount,
      inv.paymentMode,
      inv.paymentStatus,
    ]);

    const csvContent =
      "\uFEFF" +
      [
        headers.map(escapeCell).join(","),
        ...rows.map((r) => r.map(escapeCell).join(",")),
      ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ayor_tax_invoices_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const closeModal = () => {
    setActiveModalInvoice(null);
    if (onCloseInvoiceModal) onCloseInvoiceModal();
  };

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DDD8D0] p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span>Total Issued Invoices</span>
            <FileText size={16} className="text-[#0E382B]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#111111] mt-1">{invoices.length}</p>
        </div>

        <div className="bg-white border border-[#DDD8D0] p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span>Total Gross Billed</span>
            <span className="font-mono text-xs font-bold text-emerald-800">INR (₹)</span>
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-800 mt-1">
            ₹{invoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-white border border-[#DDD8D0] p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span>GSTIN Status</span>
            <ShieldCheck size={16} className="text-[#C5A880]" />
          </div>
          <p className="text-xs font-bold text-[#111111] mt-1">
            {BUSINESS_CONFIG.gstin ? BUSINESS_CONFIG.gstin : "Blank (Pending Registration)"}
          </p>
          <p className="text-[10px] text-[#888888] mt-0.5">HSN: {BUSINESS_CONFIG.hsnCode} · Fine Jewellery</p>
        </div>

        <div className="bg-white border border-[#DDD8D0] p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span>High-Value PAN Bills</span>
            <CheckCircle2 size={16} className="text-purple-700" />
          </div>
          <p className="font-serif text-2xl font-bold text-purple-800 mt-1">
            {invoices.filter((inv) => inv.totalAmount >= BUSINESS_CONFIG.panThresholdINR).length}
          </p>
        </div>
      </div>

      {/* 2. Search, Date Range & Export Toolbar */}
      <div className="bg-white border border-[#DDD8D0] p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
            <input
              type="text"
              placeholder="Search by invoice number (INV-2026-XXXXXX), customer name, ID, or mobile..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#DDD8D0] rounded-xl text-xs font-medium text-[#111111] focus:outline-none focus:border-[#0E382B]"
            />
          </div>

          {/* Date Range Filters */}
          <div className="flex items-center gap-2 text-xs text-[#666666]">
            <Calendar size={14} className="text-[#C5A880]" />
            <span>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#FAF7F2] border border-[#DDD8D0] px-2 py-1 rounded text-xs"
            />
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#FAF7F2] border border-[#DDD8D0] px-2 py-1 rounded text-xs"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-[11px] text-red-600 underline"
              >
                Reset
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleExportInvoicesCSV}
            className="bg-[#0E382B] hover:bg-[#144636] text-white px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors self-start md:self-auto cursor-pointer"
          >
            <Download size={13} />
            <span>Export Invoices to CSV</span>
          </button>
        </div>
      </div>

      {/* 3. Invoices Table */}
      <div className="bg-white border border-[#DDD8D0] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#DDD8D0] text-[11px] uppercase tracking-wider text-[#666666]">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Invoice Date</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Masked PAN</th>
                <th className="p-3.5">Items Billed</th>
                <th className="p-3.5">Taxable (₹)</th>
                <th className="p-3.5">Total Amount (₹)</th>
                <th className="p-3.5">Payment Mode</th>
                <th className="p-3.5 text-right">Reprint Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE6]">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#888888] italic">
                    No tax invoices found. Invoices are generated automatically on checkout completion.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr key={inv.invoiceNumber} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#0E382B] whitespace-nowrap">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-[#666666]">{inv.invoiceDate}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-[#111111]">{inv.customerName}</p>
                      <p className="text-[11px] text-[#666666]">
                        {inv.customerId} · +91 {inv.customerMobile}
                      </p>
                    </td>
                    <td className="p-3.5 font-mono text-xs whitespace-nowrap">
                      {inv.customerPanMasked ? (
                        <span className="bg-[#FAF7F2] border border-[#DDD8D0] px-2 py-0.5 rounded font-semibold text-[#0E382B]">
                          {inv.customerPanMasked}
                        </span>
                      ) : (
                        <span className="text-[#888888] italic">N/A (&lt; ₹2L)</span>
                      )}
                    </td>
                    <td className="p-3.5 text-[11px]">
                      {inv.items.length} {inv.items.length === 1 ? "item" : "items"} (HSN {BUSINESS_CONFIG.hsnCode})
                    </td>
                    <td className="p-3.5 font-mono font-medium whitespace-nowrap">
                      ₹{inv.taxableAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 font-serif font-bold text-sm text-[#111111] whitespace-nowrap">
                      ₹{inv.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 text-[11px] font-medium text-[#444444] whitespace-nowrap">
                      {inv.paymentMode}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setActiveModalInvoice(inv)}
                        className="bg-[#0E382B] hover:bg-[#144636] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer size={12} />
                        <span>Reprint A4 PDF</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 border-t border-[#DDD8D0] bg-[#FAF7F2] flex items-center justify-between text-xs text-[#666666]">
          <span>
            Showing {filteredInvoices.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
            {Math.min(currentPage * pageSize, filteredInvoices.length)} of {filteredInvoices.length} invoices
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-[#DDD8D0] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EFEBE4]"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-semibold text-[#111111]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded border border-[#DDD8D0] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EFEBE4]"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. MODAL: CLEAN PRINT-READY A4 TAX INVOICE (BLANK GSTIN COMPLIANT) */}
      {activeModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-[#DDD8D0] rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-10 space-y-6 shadow-2xl relative">
            {/* Action Bar (Top) */}
            <div className="flex items-center justify-between pb-4 border-b border-[#DDD8D0] print:hidden">
              <span className="text-xs uppercase tracking-widest font-bold text-[#0E382B] flex items-center gap-1.5">
                <FileText size={15} />
                <span>OFFICIAL TAX INVOICE (ADMIN REPRINT CONSOLE)</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-[#0E382B] hover:bg-[#144636] text-white px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print / Save PDF (A4)</span>
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#EFEBE4] text-[#666666] flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* A4 PRINTABLE INVOICE CONTENT */}
            <div className="p-2 space-y-6 text-[#111111]" id="printable-admin-invoice">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-[#111111]">
                <div>
                  <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0E382B]">
                    {BUSINESS_CONFIG.name}
                  </h1>
                  <p className="text-xs text-[#555555] mt-1">{BUSINESS_CONFIG.legalEntity}</p>
                  <p className="text-xs text-[#666666] max-w-sm mt-0.5">{BUSINESS_CONFIG.address}</p>
                  <p className="text-xs text-[#666666] mt-0.5">
                    Tel: {BUSINESS_CONFIG.phone} · Web: {BUSINESS_CONFIG.website}
                  </p>
                  {/* GSTIN Blank Compliance */}
                  <p className="text-xs font-semibold text-[#111111] mt-1">
                    GSTIN:{" "}
                    <span className="font-mono text-[#888888]">
                      {BUSINESS_CONFIG.gstin ? BUSINESS_CONFIG.gstin : "— (Blank / Exempt)"}
                    </span>
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <span className="bg-[#0E382B] text-white px-3 py-1 rounded text-[11px] uppercase tracking-wider font-bold inline-block">
                    TAX INVOICE
                  </span>
                  <p className="font-mono text-sm font-bold text-[#111111] mt-2">
                    {activeModalInvoice.invoiceNumber}
                  </p>
                  <p className="text-xs text-[#666666]">Date: {activeModalInvoice.invoiceDate}</p>
                  <p className="text-xs font-semibold text-[#0E382B]">
                    HSN Code: {BUSINESS_CONFIG.hsnCode} (Fine Jewellery)
                  </p>
                </div>
              </div>

              {/* Customer & Billing Info */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-[#DDD8D0] text-xs">
                <div className="space-y-1">
                  <p className="uppercase tracking-wider text-[10px] font-bold text-[#888888]">
                    Billed To / Consignee:
                  </p>
                  <p className="font-bold text-sm text-[#111111]">{activeModalInvoice.customerName}</p>
                  <p className="font-mono text-[11px] text-[#0E382B] font-semibold">
                    Customer ID: {activeModalInvoice.customerId}
                  </p>
                  <p className="text-[#666666]">{activeModalInvoice.customerAddress}</p>
                  <p className="text-[#666666]">Mobile: +91 {activeModalInvoice.customerMobile}</p>
                  {activeModalInvoice.customerPanMasked && (
                    <p className="font-mono text-[11px] font-semibold text-[#111111] pt-0.5">
                      Customer PAN: {activeModalInvoice.customerPanMasked}
                    </p>
                  )}
                </div>

                <div className="space-y-1 text-right">
                  <p className="uppercase tracking-wider text-[10px] font-bold text-[#888888]">
                    Dispatch &amp; Payment Details:
                  </p>
                  <p className="font-medium text-[#111111]">
                    Payment Mode: <strong>{activeModalInvoice.paymentMode}</strong>
                  </p>
                  <p className="text-emerald-700 font-semibold">
                    Status: {activeModalInvoice.paymentStatus}
                  </p>
                  <p className="text-[#666666]">Place of Supply: Lucknow, Uttar Pradesh (09)</p>
                  <p className="text-[#666666]">Doorstep Insured Delivery Pan-India</p>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-[#DDD8D0]">
                  <thead className="bg-[#FAF7F2] border-b border-[#DDD8D0] text-[10px] uppercase tracking-wider text-[#666666]">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5">HSN</th>
                      <th className="p-2.5">Purity / Metal</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Rate (₹)</th>
                      <th className="p-2.5 text-right">Taxable (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDD8D0]">
                    {activeModalInvoice.items.map((it, idx) => (
                      <tr key={it.id || idx}>
                        <td className="p-2.5 font-mono text-[#888888]">{idx + 1}</td>
                        <td className="p-2.5 font-semibold text-[#111111]">
                          {it.name}
                          {it.weightGrams && (
                            <span className="block text-[10px] text-[#888888] font-normal">
                              Net Wt: {it.weightGrams}g
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-[#666666]">{it.hsn}</td>
                        <td className="p-2.5 text-[#666666]">
                          {it.purity} · {it.metal}
                        </td>
                        <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                        <td className="p-2.5 text-right font-mono">
                          ₹{it.rate.toLocaleString("en-IN")}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-[#111111]">
                          ₹{it.taxableValue.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax Breakup & Grand Total */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                <div className="max-w-md space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#888888] block">
                      Total Amount in Words:
                    </span>
                    <p className="font-serif italic font-semibold text-sm text-[#0E382B]">
                      {activeModalInvoice.totalInWords}
                    </p>
                  </div>

                  <div className="pt-2 text-[11px] text-[#666666] space-y-1">
                    <p className="font-bold text-[#111111]">Terms &amp; Declarations:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {activeModalInvoice.terms.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="w-full sm:w-72 bg-[#FAF7F2] p-4 rounded-xl border border-[#DDD8D0] space-y-2 text-xs">
                  <div className="flex justify-between text-[#666666]">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{activeModalInvoice.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  {activeModalInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-800 font-semibold">
                      <span>Welcome Discount (AYOR10):</span>
                      <span className="font-mono">-₹{activeModalInvoice.discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#111111] font-semibold border-t border-[#DDD8D0] pt-1.5">
                    <span>Taxable Value:</span>
                    <span className="font-mono">₹{activeModalInvoice.taxableAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-[#666666]">
                    <span>CGST (1.5%):</span>
                    <span className="font-mono">₹{activeModalInvoice.cgst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-[#666666]">
                    <span>SGST (1.5%):</span>
                    <span className="font-mono">₹{activeModalInvoice.sgst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-[#0E382B] font-serif text-base font-bold border-t-2 border-[#0E382B] pt-2">
                    <span>Grand Total:</span>
                    <span>₹{activeModalInvoice.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Signature / Stamp Area */}
              <div className="pt-8 border-t border-[#DDD8D0] flex justify-between items-end text-xs text-[#888888]">
                <div>
                  <p>Electronically generated official document.</p>
                  <p>Certified BIS Hallmarked Jewellery.</p>
                </div>
                <div className="text-right">
                  <div className="w-44 border-b border-[#111111] pb-1 mb-1" />
                  <p className="font-semibold text-[#111111]">For {BUSINESS_CONFIG.legalEntity}</p>
                  <p className="text-[10px]">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

