"use client";

import { useState, useRef } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  FileText,
  Sliders,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  MIN_ANTI_TARNISH_PRICE,
  MAX_ANTI_TARNISH_PRICE,
} from "@/lib/antiTarnishConfig";

interface PreviewItem {
  rowNumber: number;
  data: any;
  valid: boolean;
  isUpdate: boolean;
  errors: string[];
  adjustedPrice?: number;
  adjustedMrp?: number;
}

interface ImportSummary {
  total: number;
  valid: number;
  updates: number;
  failed: number;
}

export default function ImportProductsAdmin() {
  const [file, setFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>("");
  const [autoAdjust, setAutoAdjust] = useState<boolean>(true);
  const [licenseNote, setLicenseNote] = useState<string>(
    "Imported from prao.com under catalog distribution license"
  );

  const [loading, setLoading] = useState(false);
  const [previewList, setPreviewList] = useState<PreviewItem[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [errorList, setErrorList] = useState<PreviewItem[]>([]);
  const [commitResult, setCommitResult] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Handle CSV file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setCommitResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      runPreviewValidation(text, autoAdjust, licenseNote);
    };
    reader.readAsText(selected);
  };

  // Run preview validation via API
  const runPreviewValidation = async (text: string, adjust: boolean, license: string) => {
    setLoading(true);
    setCommitResult(null);

    try {
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvText: text,
          autoAdjust: adjust,
          defaultLicense: license,
          mode: "preview",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPreviewList(data.preview || []);
        setSummary(data.summary || null);
        setErrorList(data.errors || []);
      } else {
        alert(`Validation error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Network error during validation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Execute Commit Import
  const handleCommitImport = async () => {
    if (!csvContent) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvText: csvContent,
          autoAdjust,
          defaultLicense: licenseNote,
          mode: "commit",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCommitResult(data.summary);
        // Refresh preview with current state
        runPreviewValidation(csvContent, autoAdjust, licenseNote);
      } else {
        alert(`Import failed: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Network error during import: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Sync from prao.com
  const handlePraoDirectSync = async () => {
    if (
      !confirm(
        "This will connect to https://prao.com/products.json, fetch all anti-tarnish products, apply price rules (Rs. 499 - Rs. 2,999), and save them into the Ayora catalog. Continue?"
      )
    ) {
      return;
    }

    setLoading(true);
    setCommitResult(null);

    try {
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "prao_direct_sync",
          autoAdjust: true,
          defaultLicense: licenseNote,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCommitResult(data.summary);
        alert(
          `Successfully synced ${data.summary.totalFromPrao} products from prao.com! (Created: ${data.summary.created}, Updated: ${data.summary.updated})`
        );
      } else {
        alert(`PRAO sync failed: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Network error during PRAO sync: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Download Error CSV Report
  const handleDownloadErrorReport = () => {
    if (errorList.length === 0) return;

    const headers = ["row_number", "product_name", "sku", "price", "errors"];
    const rows = errorList.map((err) => [
      err.rowNumber,
      `"${(err.data.product_name || "").replace(/"/g, '""')}"`,
      `"${(err.data.sku || "").replace(/"/g, '""')}"`,
      err.data.price || "",
      `"${err.errors.join("; ").replace(/"/g, '""')}"`,
    ]);

    const csvStr = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `import-errors-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & One-Click Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E0D8]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E382B]/10 text-[#0E382B] text-[10px] uppercase tracking-wider font-semibold mb-2">
            <Package size={12} />
            <span>Anti-Tarnish Catalogue Ingestion</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-[#111111]">
            Bulk Product Import Engine
          </h2>
          <p className="text-xs text-[#666666] mt-1 max-w-2xl">
            Upload a CSV / Excel file or sync directly from{" "}
            <a
              href="https://prao.com"
              target="_blank"
              rel="noreferrer"
              className="underline text-[#0E382B] font-medium"
            >
              prao.com
            </a>
            . Strict price boundary enforcement (₹{MIN_ANTI_TARNISH_PRICE} to ₹{MAX_ANTI_TARNISH_PRICE}) with auto-adjust rounding and duplicate SKU updates.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href="/templates/sample-anti-tarnish-import.csv"
            download="sample-anti-tarnish-import.csv"
            className="px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] bg-white hover:border-[#0E382B] text-xs font-medium text-[#111111] flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <Download size={14} className="text-[#0E382B]" />
            <span>Download CSV Template (10 Rows)</span>
          </a>

          <button
            type="button"
            onClick={handlePraoDirectSync}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-[#0E382B] hover:bg-[#144636] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Sync Live From PRAO.com</span>
          </button>
        </div>
      </div>

      {/* 2. Success Alert after Commit */}
      {commitResult && (
        <div className="p-4 rounded-2xl bg-[#EAF5EF] border border-[#108474]/30 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-[#108474] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#0E382B]">Import Completed Successfully!</p>
            <p className="text-[11px] text-[#444444]">
              {commitResult.totalFromPrao
                ? `Synced ${commitResult.totalFromPrao} products directly from prao.com (${commitResult.created} created, ${commitResult.updated} updated). Total catalog now: ${commitResult.totalProductsNow}.`
                : `Processed ${commitResult.total} rows (${commitResult.created} created, ${commitResult.updated} updated, ${commitResult.failed} skipped/failed). Total catalog: ${commitResult.totalProducts}.`}
            </p>
          </div>
        </div>
      )}

      {/* 3. Configuration & Upload Dropzone Grid */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Upload Card */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-[#E5E0D8] space-y-4 shadow-2xs">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-[#111111] flex items-center gap-2">
            <UploadCloud size={15} className="text-[#0E382B]" />
            <span>1. Upload Product Catalog</span>
          </h3>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip"
            onChange={(e) => setZipFile(e.target.files?.[0] || null)}
            className="hidden"
          />

          {/* Drag & Drop Visual Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#DDD7CD] hover:border-[#0E382B] rounded-xl p-8 text-center bg-[#FAF8F5] cursor-pointer transition-all space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-white border border-[#E5E0D8] mx-auto flex items-center justify-center text-[#0E382B] shadow-2xs">
              <FileSpreadsheet size={22} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#111111]">
                {file ? file.name : "Click to select or drag & drop CSV file"}
              </p>
              <p className="text-[10px] text-[#777777]">
                Required columns: product_name, sku, category, price, description, image_urls, stock, tags
              </p>
            </div>
          </div>

          {/* Optional ZIP of Images */}
          <div className="pt-2 flex items-center justify-between gap-3 text-xs border-t border-[#F0ECE6]">
            <div className="flex items-center gap-2 text-[#555555]">
              <Layers size={14} />
              <span>Optional Images ZIP Archive:</span>
              <span className="font-semibold text-[#111111]">
                {zipFile ? zipFile.name : "None selected"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => zipInputRef.current?.click()}
              className="text-[11px] font-medium text-[#0E382B] hover:underline cursor-pointer"
            >
              {zipFile ? "Change ZIP" : "Attach Images ZIP"}
            </button>
          </div>
        </div>

        {/* Settings & Rules Card */}
        <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-[#E5E0D8] space-y-4 shadow-2xs">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-[#111111] flex items-center gap-2">
            <Sliders size={15} className="text-[#0E382B]" />
            <span>2. Rules & License Configuration</span>
          </h3>

          {/* Auto Adjust Toggle */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#111111] cursor-pointer">
                Auto-Adjust Price Mode
              </label>
              <input
                type="checkbox"
                checked={autoAdjust}
                onChange={(e) => {
                  setAutoAdjust(e.target.checked);
                  if (csvContent) runPreviewValidation(csvContent, e.target.checked, licenseNote);
                }}
                className="w-4 h-4 accent-[#0E382B] rounded cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-[#666666] leading-relaxed">
              If enabled, supplier clearance prices (e.g. ₹99) are scaled to Indian anti-tarnish retail [₹499 to ₹2,999] rounded to the nearest ₹9 ending (e.g. 599, 699, 1499), with strike-through MRP.
            </p>
          </div>

          {/* Image Source / License Note */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#0E382B]" />
              <span>image_source / Rights License Record</span>
            </label>
            <input
              type="text"
              value={licenseNote}
              onChange={(e) => setLicenseNote(e.target.value)}
              placeholder="e.g. Imported from prao.com under catalog distribution license"
              className="w-full px-3 py-2 text-xs border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#0E382B]"
            />
            <p className="text-[9px] text-[#888888]">
              Saved with every imported product as proof of image distribution rights.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Preview & Validation Summary */}
      {summary && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E5E0D8] px-3.5 py-1.5 rounded-xl text-xs">
                <span className="text-[#777777]">Total Rows:</span>
                <strong className="text-[#111111]">{summary.total}</strong>
              </div>
              <div className="flex items-center gap-1.5 bg-[#EAF5EF] border border-[#108474]/30 px-3.5 py-1.5 rounded-xl text-xs text-[#0E382B]">
                <span>Valid:</span>
                <strong className="font-bold">{summary.valid}</strong>
                {summary.updates > 0 && (
                  <span className="text-[10px] text-[#108474]">({summary.updates} will update existing)</span>
                )}
              </div>
              {summary.failed > 0 && (
                <div className="flex items-center gap-1.5 bg-[#FDF0ED] border border-[#B93826]/30 px-3.5 py-1.5 rounded-xl text-xs text-[#B93826]">
                  <span>Errors:</span>
                  <strong className="font-bold">{summary.failed}</strong>
                </div>
              )}
            </div>

            {/* Commit or Error Report Buttons */}
            <div className="flex items-center gap-2">
              {summary.failed > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadErrorReport}
                  className="px-3 py-2 rounded-xl border border-[#B93826]/30 bg-[#FDF0ED] text-[#B93826] text-xs font-medium flex items-center gap-1.5 hover:bg-[#FBE4DF] transition-colors cursor-pointer"
                >
                  <AlertCircle size={13} />
                  <span>Download Error Report ({summary.failed})</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCommitImport}
                disabled={loading || summary.valid === 0}
                className="px-5 py-2.5 rounded-xl bg-[#0E382B] hover:bg-[#144636] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <span>Confirm & Import Valid Rows ({summary.valid})</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Validation Table */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[10px] uppercase tracking-wider text-[#555555] sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4">Row</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">MRP</th>
                    <th className="py-3 px-4">Validation Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0ECE6]">
                  {previewList.map((row, idx) => {
                    return (
                      <tr
                        key={idx}
                        className={row.valid ? "hover:bg-[#FAF8F5]" : "bg-[#FDF9F8] text-[#B93826]"}
                      >
                        <td className="py-3 px-4 font-mono text-[11px] text-[#777777]">
                          #{row.rowNumber}
                        </td>
                        <td className="py-3 px-4">
                          {row.valid ? (
                            row.isUpdate ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#E8F1FC] text-[#1B6AC9]">
                                Update SKU
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EAF5EF] text-[#0E382B]">
                                Valid (New)
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FDF0ED] text-[#B93826]">
                              Invalid
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-[#111111]">
                          {row.data.sku || "—"}
                        </td>
                        <td className="py-3 px-4 font-medium text-[#111111] max-w-xs truncate">
                          {row.data.product_name || "—"}
                        </td>
                        <td className="py-3 px-4 text-[#666666]">{row.data.category || "—"}</td>
                        <td className="py-3 px-4 font-semibold text-[#111111]">
                          ₹{row.adjustedPrice ? row.adjustedPrice.toLocaleString("en-IN") : row.data.price}
                        </td>
                        <td className="py-3 px-4 text-[#888888] line-through">
                          ₹{row.adjustedMrp ? row.adjustedMrp.toLocaleString("en-IN") : row.data.mrp || "—"}
                        </td>
                        <td className="py-3 px-4 text-[11px]">
                          {row.valid ? (
                            <span className="text-[#108474]">Ready for catalog ingestion</span>
                          ) : (
                            <span className="font-semibold text-[#B93826]">{row.errors.join("; ")}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

