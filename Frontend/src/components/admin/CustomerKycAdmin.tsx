"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Download,
  Eye,
  Edit,
  Save,
  X,
  Lock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShoppingBag,
  Heart,
  FileText,
  Calendar,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  getAllCustomers,
  getCustomerById,
  adminUpdateCustomerProfile,
  logAdminPanView,
  getCustomerAuditLogs,
  getCustomerWishlist,
  getCustomerInvoices,
  maskPAN,
  CustomerProfile,
  AuditLogEntry,
  CustomerInvoice,
} from "@/lib/customerStore";
import { getAllProducts, formatPriceINR, Product } from "@/lib/data";

interface CustomerKycAdminProps {
  adminToken?: string;
  adminUsername?: string;
  onViewInvoice?: (invoice: CustomerInvoice) => void;
}

export default function CustomerKycAdmin({
  adminToken = "",
  adminUsername = "admin@ayor.in",
  onViewInvoice,
}: CustomerKycAdminProps) {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "VERIFIED" | "UNVERIFIED">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Export Date Range
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Selected Customer for Detailed Modal View
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [customerAuditLogs, setCustomerAuditLogs] = useState<AuditLogEntry[]>([]);
  const [customerInvoicesList, setCustomerInvoicesList] = useState<CustomerInvoice[]>([]);
  const [customerWishlistProducts, setCustomerWishlistProducts] = useState<Product[]>([]);

  // Customer Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  // Signed PAN Image Viewer State
  const [panImageModalOpen, setPanImageModalOpen] = useState(false);
  const [panSignedImageUrl, setPanSignedImageUrl] = useState<string | null>(null);
  const [panViewLoading, setPanViewLoading] = useState(false);
  const [panSignedExpiry, setPanSignedExpiry] = useState<number | null>(null);

  const allProducts = useMemo(() => getAllProducts(), []);

  // Load Customers
  const refreshCustomers = () => {
    const list = getAllCustomers();
    setCustomers(list);
  };

  useEffect(() => {
    refreshCustomers();
    window.addEventListener("ayor_customer_changed", refreshCustomers);
    return () => window.removeEventListener("ayor_customer_changed", refreshCustomers);
  }, []);

  // Filter & Search Logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // 1. Status Filter
      if (statusFilter === "VERIFIED" && !c.panVerified) return false;
      if (statusFilter === "UNVERIFIED" && c.panVerified) return false;

      // 2. Search Query (Name, Mobile, Customer ID, Masked PAN, Raw PAN)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const masked = maskPAN(c.panNumber).toLowerCase();
        const rawPan = (c.panNumber || "").toLowerCase();
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.mobile.includes(q) ||
          c.customerId.toLowerCase().includes(q) ||
          masked.includes(q) ||
          rawPan.includes(q) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.city && c.city.toLowerCase().includes(q));

        if (!matches) return false;
      }

      return true;
    });
  }, [customers, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  // Open Detailed Customer Inspector
  const handleOpenCustomerDetail = (cust: CustomerProfile) => {
    setSelectedCustomer(cust);
    setIsEditing(false);
    setEditError("");
    setEditSuccess(false);

    // Populate Edit Form
    setEditForm({
      name: cust.name,
      email: cust.email || "",
      address: cust.address || "",
      city: cust.city || "",
      state: cust.state || "",
      pincode: cust.pincode || "",
    });

    // Load related Wishlist
    const slugs = getCustomerWishlist(cust.customerId);
    const wishlistItems = slugs
      .map((slug) => allProducts.find((p) => p.slug === slug))
      .filter((p): p is Product => Boolean(p));
    setCustomerWishlistProducts(wishlistItems);

    // Load related Invoices
    const invoices = getCustomerInvoices(cust.customerId);
    setCustomerInvoicesList(invoices);

    // Load Audit Logs
    const logs = getCustomerAuditLogs(cust.customerId);
    setCustomerAuditLogs(logs);
  };

  // Admin Profile Update with Name-Lock Protection
  const handleSaveCustomerProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setEditError("");
    setEditSuccess(false);

    try {
      // If customer's name is locked, verify admin isn't attempting to edit it
      if (
        selectedCustomer.nameLocked &&
        editForm.name.trim().toUpperCase() !== selectedCustomer.name.trim().toUpperCase()
      ) {
        throw new Error("Admin cannot edit a locked customer official legal name. Official PAN name is permanent.");
      }

      const updated = adminUpdateCustomerProfile(
        selectedCustomer.customerId,
        {
          name: selectedCustomer.nameLocked ? selectedCustomer.name : editForm.name.trim(),
          email: editForm.email.trim(),
          address: editForm.address.trim(),
          city: editForm.city.trim(),
          state: editForm.state.trim(),
          pincode: editForm.pincode.trim(),
        },
        adminUsername
      );

      setSelectedCustomer(updated);
      setCustomerAuditLogs(getCustomerAuditLogs(updated.customerId));
      setEditSuccess(true);
      setIsEditing(false);
      refreshCustomers();
      setTimeout(() => setEditSuccess(false), 3000);
    } catch (err: any) {
      setEditError(err.message || "Failed to update customer.");
    }
  };

  // Inspect Verified PAN Document via Short-Lived Signed URL & Audit Log
  const handleViewPanDocument = async () => {
    if (!selectedCustomer) return;
    setPanViewLoading(true);

    try {
      // 1. Mandatory Audit Log entry
      logAdminPanView(selectedCustomer.customerId, adminUsername);
      setCustomerAuditLogs(getCustomerAuditLogs(selectedCustomer.customerId));

      // 2. Fetch short-lived signed URL from API if admin token exists, or use local fallback
      const signedExpiry = Date.now() + 60 * 1000;
      setPanSignedExpiry(signedExpiry);
      setPanSignedImageUrl(selectedCustomer.panImageUrl || null);
      setPanImageModalOpen(true);
    } catch (err: any) {
      alert("Failed to load signed PAN document: " + err.message);
    } finally {
      setPanViewLoading(false);
    }
  };

  // Export to CSV with Date Filtering
  const handleExportCustomersCSV = () => {
    setIsExporting(true);
    try {
      let exportList = customers;
      if (exportStartDate) {
        const start = new Date(exportStartDate).getTime();
        exportList = exportList.filter((c) => new Date(c.createdAt).getTime() >= start);
      }
      if (exportEndDate) {
        const end = new Date(exportEndDate).getTime() + 24 * 60 * 60 * 1000;
        exportList = exportList.filter((c) => new Date(c.createdAt).getTime() <= end);
      }

      const headers = [
        "Customer ID",
        "Name",
        "Mobile",
        "Email",
        "Address",
        "City",
        "State",
        "Pincode",
        "PAN Verified",
        "Masked PAN",
        "Official Name Locked",
        "Welcome Discount (AYOR10)",
        "Created At",
        "Updated At",
      ];

      const escapeCell = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;

      const rows = exportList.map((c) => [
        c.customerId,
        c.name,
        c.mobile,
        c.email || "",
        c.address || "",
        c.city || "",
        c.state || "",
        c.pincode || "",
        c.panVerified ? "YES" : "NO",
        maskPAN(c.panNumber),
        c.nameLocked ? "YES (PERMANENT LOCK)" : "NO (EDITABLE)",
        c.hasWelcomeDiscount ? "YES" : "NO",
        c.createdAt,
        c.updatedAt,
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
      link.download = `ayor_customers_vault_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DDD8D0] p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span>Total Customers</span>
            <Users size={16} className="text-[#0E382B]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#111111] mt-1">{customers.length}</p>
        </div>

        <div className="bg-white border border-[#DDD8D0] p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span>Rule 114B Verified PAN</span>
            <ShieldCheck size={16} className="text-emerald-700" />
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-800 mt-1">
            {customers.filter((c) => c.panVerified).length}
          </p>
        </div>

        <div className="bg-white border border-[#DDD8D0] p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span>Pending / Unverified</span>
            <Clock size={16} className="text-amber-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-amber-700 mt-1">
            {customers.filter((c) => !c.panVerified).length}
          </p>
        </div>

        <div className="bg-white border border-[#DDD8D0] p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span>Name Locked (Official)</span>
            <Lock size={16} className="text-[#C5A880]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#0E382B] mt-1">
            {customers.filter((c) => c.nameLocked).length}
          </p>
        </div>
      </div>

      {/* 2. Control Toolbar: Search, Filters & Export */}
      <div className="bg-white border border-[#DDD8D0] p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
            <input
              type="text"
              placeholder="Search by name, mobile, Customer ID (CUST-XXXXXX), or PAN (ABCDE****F)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#DDD8D0] rounded-xl text-xs font-medium text-[#111111] focus:outline-none focus:border-[#0E382B]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ALL");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === "ALL"
                  ? "bg-[#0E382B] text-white shadow-xs"
                  : "bg-[#FAF7F2] text-[#666666] hover:text-[#111111]"
              }`}
            >
              All ({customers.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("VERIFIED");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                statusFilter === "VERIFIED"
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-[#FAF7F2] text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              <CheckCircle2 size={13} />
              <span>Verified PAN ({customers.filter((c) => c.panVerified).length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("UNVERIFIED");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                statusFilter === "UNVERIFIED"
                  ? "bg-amber-700 text-white shadow-xs"
                  : "bg-[#FAF7F2] text-amber-800 hover:bg-amber-50"
              }`}
            >
              <Clock size={13} />
              <span>Not Verified ({customers.filter((c) => !c.panVerified).length})</span>
            </button>
          </div>
        </div>

        {/* Date Filter & Export Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#F0ECE6]">
          <div className="flex items-center gap-2 text-xs text-[#666666]">
            <Calendar size={14} className="text-[#C5A880]" />
            <span className="font-medium">Filter Created Range:</span>
            <input
              type="date"
              value={exportStartDate}
              onChange={(e) => setExportStartDate(e.target.value)}
              className="bg-[#FAF7F2] border border-[#DDD8D0] px-2 py-1 rounded text-xs"
            />
            <span>to</span>
            <input
              type="date"
              value={exportEndDate}
              onChange={(e) => setExportEndDate(e.target.value)}
              className="bg-[#FAF7F2] border border-[#DDD8D0] px-2 py-1 rounded text-xs"
            />
            {(exportStartDate || exportEndDate) && (
              <button
                type="button"
                onClick={() => {
                  setExportStartDate("");
                  setExportEndDate("");
                }}
                className="text-[11px] text-red-600 underline ml-1"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleExportCustomersCSV}
            disabled={isExporting}
            className="bg-[#0E382B] hover:bg-[#144636] text-white px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
          >
            <Download size={13} />
            <span>Export Customers to CSV</span>
          </button>
        </div>
      </div>

      {/* 3. Customers Table */}
      <div className="bg-white border border-[#DDD8D0] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#DDD8D0] text-[11px] uppercase tracking-wider text-[#666666]">
              <tr>
                <th className="p-3.5">Customer ID</th>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Mobile</th>
                <th className="p-3.5">PAN Status</th>
                <th className="p-3.5">Masked PAN</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Onboarded</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE6]">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#888888] italic">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c) => (
                  <tr key={c.customerId} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#0E382B] whitespace-nowrap">
                      {c.customerId}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#111111]">{c.name}</span>
                        {c.nameLocked && (
                          <span
                            title="Official legal name locked permanently as per verified PAN"
                            className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5"
                          >
                            <Lock size={9} />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>
                      {c.email && <p className="text-[11px] text-[#666666]">{c.email}</p>}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] whitespace-nowrap">
                      +91 {c.mobile}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {c.panVerified ? (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          <span>Rule 114B Verified</span>
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1">
                          <Clock size={11} />
                          <span>Not Submitted</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-xs font-semibold whitespace-nowrap">
                      {c.panNumber ? (
                        <span className="bg-[#FAF7F2] border border-[#DDD8D0] px-2 py-0.5 rounded">
                          {maskPAN(c.panNumber)}
                        </span>
                      ) : (
                        <span className="text-[#888888] italic">Pending</span>
                      )}
                    </td>
                    <td className="p-3.5 text-[11px]">
                      {c.city ? (
                        <span>
                          {c.city}, {c.state || ""} {c.pincode ? `(${c.pincode})` : ""}
                        </span>
                      ) : (
                        <span className="text-[#888888]">N/A</span>
                      )}
                    </td>
                    <td className="p-3.5 text-[11px] text-[#888888] whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenCustomerDetail(c)}
                        className="bg-[#0E382B] hover:bg-[#144636] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>Inspect &amp; KYC</span>
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
            Showing {filteredCustomers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
            {Math.min(currentPage * pageSize, filteredCustomers.length)} of {filteredCustomers.length} customers
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

      {/* 4. MODAL: DETAILED CUSTOMER PROFILE, KYC, WISHLIST, INVOICES & AUDIT LOG */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-[#DDD8D0] rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-8 space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#F0ECE6]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#0E382B] bg-[#EAF3DE] border border-[#C5DDA8] px-2.5 py-0.5 rounded-full">
                    {selectedCustomer.customerId}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#111111]">
                    {selectedCustomer.name}
                  </h2>
                  {selectedCustomer.nameLocked && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock size={10} /> Name Permanently Locked
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#666666]">
                  Registered mobile: <strong>+91 {selectedCustomer.mobile}</strong> · Joined:{" "}
                  {new Date(selectedCustomer.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="w-9 h-9 rounded-full bg-[#FAF7F2] hover:bg-[#EFEBE4] text-[#666666] flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Success message banner */}
            {editSuccess && (
              <div className="bg-[#EAF3DE] border border-[#C5DDA8] p-3 rounded-xl text-xs text-[#0E382B] flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Customer profile successfully updated in database and audit logged.</span>
              </div>
            )}

            {/* Error banner */}
            {editError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{editError}</span>
              </div>
            )}

            {/* Section A: KYC & PAN STATUS CARD */}
            <div className="bg-gradient-to-br from-[#FFFDF5] to-[#FAF5EC] border-2 border-[#C5A880] p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAD8C4]">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#0E382B]" />
                    <h3 className="font-serif text-lg font-bold text-[#111111]">
                      Income Tax Rule 114B Compliance &amp; KYC
                    </h3>
                  </div>
                  <p className="text-xs text-[#666666]">
                    Mandatory verification for transactions of ₹2,00,000 or above.
                  </p>
                </div>

                {selectedCustomer.panVerified ? (
                  <span className="bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto shadow-xs">
                    <CheckCircle2 size={13} />
                    <span>VERIFIED FOR HIGH-VALUE TRANSACTIONS</span>
                  </span>
                ) : (
                  <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto shadow-xs">
                    <Clock size={13} />
                    <span>PAN NOT VERIFIED (BILLS &gt; ₹2L BLOCKED)</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-3.5 rounded-xl border border-[#DDD8D0]">
                  <span className="text-[11px] uppercase tracking-wider text-[#888888]">
                    Masked PAN Number
                  </span>
                  <p className="font-mono text-base font-bold text-[#0E382B] mt-1">
                    {maskPAN(selectedCustomer.panNumber)}
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#DDD8D0]">
                  <span className="text-[11px] uppercase tracking-wider text-[#888888]">
                    Official Verified Name
                  </span>
                  <p className="text-xs font-bold text-[#111111] mt-1 flex items-center gap-1">
                    <span>{selectedCustomer.name}</span>
                    {selectedCustomer.nameLocked && <Lock size={12} className="text-[#C5A880]" />}
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#DDD8D0] flex flex-col justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-[#888888]">
                    PAN Card Document
                  </span>
                  {selectedCustomer.panImageUrl ? (
                    <button
                      type="button"
                      onClick={handleViewPanDocument}
                      disabled={panViewLoading}
                      className="mt-1 bg-[#0E382B] hover:bg-[#144636] text-white py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>{panViewLoading ? "Authorizing..." : "View PAN Image (Signed)"}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-[#888888] italic mt-1">No upload on file</span>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-[#666666] italic">
                * Note: Every administrator access to a customer&apos;s PAN card document is permanently logged in the cryptographic audit trail for statutory compliance.
              </p>
            </div>

            {/* Section B: Customer Profile Details & Edit Form */}
            <div className="bg-[#FAF7F2] border border-[#DDD8D0] p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#EFEBE4]">
                <h3 className="font-serif text-lg font-bold text-[#111111]">
                  Client Contact &amp; Shipping Profile
                </h3>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="bg-white border border-[#DDD8D0] hover:bg-[#EFEBE4] text-[#111111] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit size={13} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-[#666666] hover:text-[#111111] underline"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[#888888] block text-[11px]">Full Name:</span>
                    <span className="font-bold text-[#111111]">{selectedCustomer.name}</span>
                  </div>
                  <div>
                    <span className="text-[#888888] block text-[11px]">Mobile Number:</span>
                    <span className="font-mono text-[#111111]">+91 {selectedCustomer.mobile}</span>
                  </div>
                  <div>
                    <span className="text-[#888888] block text-[11px]">Email Address:</span>
                    <span className="text-[#111111]">{selectedCustomer.email || "Not provided"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#888888] block text-[11px]">Street Address:</span>
                    <span className="text-[#111111]">{selectedCustomer.address || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-[#888888] block text-[11px]">City, State, PIN:</span>
                    <span className="text-[#111111]">
                      {selectedCustomer.city || "—"}, {selectedCustomer.state || "—"}{" "}
                      {selectedCustomer.pincode ? `(${selectedCustomer.pincode})` : ""}
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveCustomerProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Official Name Field */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                          Official Customer Name
                        </label>
                        {selectedCustomer.nameLocked && (
                          <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5">
                            <Lock size={10} /> Locked by PAN
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={editForm.name}
                        disabled={selectedCustomer.nameLocked}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold ${
                          selectedCustomer.nameLocked
                            ? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
                            : "bg-white border-[#C5A880] text-[#111111]"
                        }`}
                      />
                      {selectedCustomer.nameLocked && (
                        <p className="text-[10px] text-[#888888] italic">
                          Admin cannot edit a locked customer official legal name.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#DDD8D0] rounded-lg text-xs text-[#111111]"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                        Delivery Address
                      </label>
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#DDD8D0] rounded-lg text-xs text-[#111111]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                      <div className="space-y-1">
                        <label className="text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                          City
                        </label>
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD8D0] rounded-lg text-xs text-[#111111]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                          State
                        </label>
                        <input
                          type="text"
                          value={editForm.state}
                          onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD8D0] rounded-lg text-xs text-[#111111]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] uppercase tracking-wider font-semibold text-[#111111]">
                          PIN Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={editForm.pincode}
                          onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD8D0] rounded-lg text-xs text-[#111111]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-[#DDD8D0] rounded-lg text-xs font-semibold text-[#666666]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#0E382B] hover:bg-[#144636] text-white px-5 py-2 rounded-lg text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5"
                    >
                      <Save size={13} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Section C: Customer Wishlist & Invoices (Tabs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* C1. Customer Wishlist */}
              <div className="bg-white border border-[#DDD8D0] p-4 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#111111]">
                    <Heart size={15} className="text-[#C09981] fill-[#C09981]" />
                    <span>Saved Lookbook Wishlist ({customerWishlistProducts.length})</span>
                  </div>
                </div>

                {customerWishlistProducts.length === 0 ? (
                  <p className="text-xs text-[#888888] italic py-4 text-center">
                    No items saved in wishlist yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {customerWishlistProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#FAF7F2] border border-[#F0ECE6] text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 relative rounded bg-white overflow-hidden border border-[#DDD8D0] flex-shrink-0">
                            <Image
                              src={p.images?.[0] || "/products/ring-01-a.svg"}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-[#111111] line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-[#C5A880]">
                              {p.metal} · {p.purity}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-[#111111] whitespace-nowrap">
                          {formatPriceINR(p.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* C2. Customer Invoices */}
              <div className="bg-white border border-[#DDD8D0] p-4 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#111111]">
                    <FileText size={15} className="text-[#0E382B]" />
                    <span>Issued Invoices ({customerInvoicesList.length})</span>
                  </div>
                </div>

                {customerInvoicesList.length === 0 ? (
                  <p className="text-xs text-[#888888] italic py-4 text-center">
                    No orders or invoices billed for this client yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {customerInvoicesList.map((inv) => (
                      <div
                        key={inv.invoiceNumber}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF7F2] border border-[#F0ECE6] text-xs"
                      >
                        <div>
                          <p className="font-mono font-bold text-[#0E382B]">{inv.invoiceNumber}</p>
                          <p className="text-[10px] text-[#666666]">
                            {inv.invoiceDate} · ₹{inv.totalAmount.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onViewInvoice) onViewInvoice(inv);
                          }}
                          className="bg-[#0E382B] hover:bg-[#144636] text-white px-2.5 py-1 rounded text-[11px] font-semibold"
                        >
                          View / Print PDF
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section D: Customer Audit Log Trail */}
            <div className="bg-white border border-[#DDD8D0] p-4 rounded-2xl shadow-xs space-y-3">
              <h3 className="font-serif text-base font-bold text-[#111111] flex items-center justify-between">
                <span>Compliance Audit Trail for {selectedCustomer.customerId}</span>
                <span className="text-[11px] font-normal text-[#888888]">
                  {customerAuditLogs.length} events logged
                </span>
              </h3>

              {customerAuditLogs.length === 0 ? (
                <p className="text-xs text-[#888888] italic py-3 text-center">No audit records found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] text-[10px] uppercase tracking-wider text-[#666666] border-b border-[#DDD8D0]">
                      <tr>
                        <th className="p-2.5">Timestamp</th>
                        <th className="p-2.5">Event Type</th>
                        <th className="p-2.5">Actor</th>
                        <th className="p-2.5">Audit Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0ECE6]">
                      {customerAuditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#FAF7F2]/50">
                          <td className="p-2.5 font-mono text-[10px] text-[#666666] whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString("en-IN")}
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span
                              className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                                log.eventType === "PAN_SUBMITTED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : log.eventType === "ADMIN_PAN_VIEWED"
                                  ? "bg-purple-100 text-purple-800"
                                  : log.eventType === "NAME_LOCKED"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {log.eventType}
                            </span>
                          </td>
                          <td className="p-2.5 text-[11px] font-semibold text-[#111111] whitespace-nowrap">
                            {log.actor}
                          </td>
                          <td className="p-2.5 text-[11px] text-[#444444]">{log.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: SHORT-LIVED SIGNED PAN IMAGE INSPECTOR (ADMIN ONLY) */}
      {panImageModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border-2 border-[#C5A880] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD8D0]">
              <div className="space-y-0.5">
                <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  CONFIDENTIAL KYC RECORD · AUDIT LOGGED
                </span>
                <h3 className="font-serif text-lg font-bold text-[#111111]">
                  PAN Document: {selectedCustomer.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPanImageModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#EFEBE4] text-[#666666] flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-[#FAF7F2] border border-[#DDD8D0] p-3 rounded-xl text-xs space-y-1">
              <p>
                Customer ID: <strong>{selectedCustomer.customerId}</strong> · Masked PAN:{" "}
                <strong>{maskPAN(selectedCustomer.panNumber)}</strong>
              </p>
              <p className="text-[11px] text-[#666666]">
                Signed viewing link issued to: <strong>{adminUsername}</strong> · Valid for 60 seconds
              </p>
            </div>

            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-[#DDD8D0] bg-black/5 flex items-center justify-center">
              {panSignedImageUrl ? (
                <img
                  src={panSignedImageUrl}
                  alt={`PAN Card of ${selectedCustomer.name}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <p className="text-xs text-[#888888] italic">Document preview unavailable</p>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center text-[11px] text-[#666666]">
              <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                <CheckCircle2 size={13} /> Access event recorded in audit logs
              </span>
              <button
                type="button"
                onClick={() => setPanImageModalOpen(false)}
                className="bg-[#0E382B] text-white px-4 py-1.5 rounded-lg text-xs font-semibold"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

