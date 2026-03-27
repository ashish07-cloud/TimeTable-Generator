import React, { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx"; // Make sure to: npm install xlsx

const BulkUploadZone = ({ type, onUpload, expectedHeaders }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // 1. Handle File Parsing Logic
  const processFile = (file) => {
    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json.length === 0) {
          throw new Error("The uploaded file is empty.");
        }

        // Production-level Validation: Check if required columns exist
        if (expectedHeaders) {
          const headers = Object.keys(json[0]);
          const missing = expectedHeaders.filter((h) => !headers.includes(h));
          if (missing.length > 0) {
            throw new Error(`Missing required columns: ${missing.join(", ")}`);
          }
        }

        setFileData({ name: file.name, count: json.length, data: json });
      } catch (err) {
        setError(
          err.message ||
            "Failed to parse file. Ensure it is a valid Excel or CSV.",
        );
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const template = [
      {
        room_number: "A101",
        capacity: 60,
        room_type: "LECTURE_HALL",
        building: "Block A",
        floor: "1",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rooms");

    XLSX.writeFile(workbook, "rooms_template.xlsx");
  };

  // 2. Drag & Drop Event Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = () => {
    onUpload(fileData.data);
    setFileData(null);
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Box */}
      {!fileData ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer
            flex flex-col items-center justify-center text-center space-y-4
            ${
              isDragging
                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                : "border-gray-200 dark:border-gray-800 hover:border-orange-400 dark:hover:border-orange-600 bg-gray-50/50 dark:bg-gray-900/50"
            }
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx, .xls, .csv"
            onChange={(e) =>
              e.target.files[0] && processFile(e.target.files[0])
            }
          />

          <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm text-orange-600">
            <Upload size={32} />
          </div>

          <div>
            <p className="text-sm font-bold dark:text-white">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports .xlsx, .xls, and .csv files for {type}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadTemplate();
            }}
            className="flex items-center gap-2 text-[10px] font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg"
          >
            <Download size={12} /> Download Template
          </button>

          {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 rounded-2xl flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      ) : (
        /* Preview / Confirm State */
        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 rounded-2xl p-6 animate-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500 text-white rounded-xl">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <p className="font-bold text-sm dark:text-white">
                  {fileData.name}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  {fileData.count} records found and validated.
                </p>
              </div>
            </div>
            <button
              onClick={() => setFileData(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full mt-6 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-xl font-bold text-sm hover:from-orange-600 hover:to-orange-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <CheckCircle2 size={18} /> Confirm & Import {fileData.count} {type}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="text-red-500 shrink-0" size={18} />
          <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default BulkUploadZone;