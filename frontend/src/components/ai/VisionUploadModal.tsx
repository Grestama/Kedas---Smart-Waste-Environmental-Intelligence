"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload, X, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { aiService, VisionAnalyzeResponseData } from "../../services/ai";
import { AISuggestionReview, MaterialSuggestion } from "./AISuggestionReview";

interface VisionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationId?: string;
  onApplyCategory: (categoryCode: string) => void;
}

export function VisionUploadModal({
  isOpen,
  onClose,
  destinationId,
  onApplyCategory,
}: VisionUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VisionAnalyzeResponseData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isOpen && e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran file melebihi batas maksimum 5 MB.");
      return;
    }

    const validMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimes.includes(file.type)) {
      setErrorMessage("Format gambar tidak didukung. Harap gunakan JPEG, PNG, atau WEBP.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage(null);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (destinationId) {
      formData.append("destination_id", destinationId);
    }

    try {
      const resp = await aiService.analyzeVision(formData);
      setAnalysisResult(resp);
    } catch (err: any) {
      setErrorMessage(
        err.message || "Gagal melakukan analisis gambar. Pastikan format foto jelas dan tidak buram."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Modal Bantuan Visual Kedas Vision"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#122620]/60 backdrop-blur-[2px] transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-popover border border-stone-200 animate-scale-in">
        {/* Header */}
        <div className="p-4 bg-brand-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Kedas Vision Material Assistant</h3>
              <p className="text-[11px] text-emerald-200/80">
                Identifikasi visual berbantuan AI untuk panduan pemilahan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-brand-800 active:scale-95 transition-all"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 hover:border-brand-600 rounded-xl p-8 text-center cursor-pointer transition-colors bg-stone-50/50 hover:bg-brand-50/30"
            >
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-800 mx-auto flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-stone-800">
                Pilih atau Ambil Foto Material Sampah
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                Mendukung JPEG, PNG, atau WEBP hingga 5 MB.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center max-h-56">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Pratinjau Material Sampah"
                  className="max-h-56 w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                  aria-label="Hapus Foto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!analysisResult && (
                <div className="flex items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-stone-500">
                    File: <strong>{selectedFile?.name}</strong> (
                    {Math.round((selectedFile?.size || 0) / 1024)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-800 hover:bg-brand-900 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menganalisis...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Analisis Material</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <AISuggestionReview
                suggestion={analysisResult.top_candidate}
                onAccept={(catCode) => {
                  onApplyCategory(catCode);
                  onClose();
                }}
                onSelectAlternative={() => {
                  onClose();
                }}
              />
              <p className="text-[11px] text-stone-400 italic leading-relaxed text-center">
                {analysisResult.disclaimer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
