'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, FileUp, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { validateCharterStructure, ValidationResult } from '@/lib/validators/charterValidator';
import { ValidationResultsCard } from '@/components/charter/ValidationResultsCard';

export function PDFUploadCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showText, setShowText] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);

    const file = event.target.files?.[0];
    if (!file) return;

    // Validation: Type
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed. Please select a valid PDF.');
      setSelectedFile(null);
      return;
    }

    // Validation: Size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File is too large. Maximum size is 10 MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      setSelectedFile(null);
      return;
    }

    // Success
    setSelectedFile(file);
    setSuccess(true);
    setExtractedText(null);
    setExtractionError(null);
    setShowText(false);
    setValidationResult(null);
    
    // Automatically extract text after file selection
    handleExtractText(file);
  };

  const handleExtractText = async (file: File) => {
    setIsExtracting(true);
    setExtractionError(null);
    setExtractedText(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/pdf/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al extraer texto del PDF');
      }

      const data = await response.json();
      setExtractedText(data.text);
      setExtractionError(null);
      
      // Automatically validate after successful extraction
      if (data.text && data.text.trim().length > 0) {
        validateText(data.text);
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al extraer texto';
      setExtractionError(errorMessage);
      setExtractedText(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const validateText = (text: string) => {
    setIsValidating(true);
    try {
      const result = validateCharterStructure(text);
      setValidationResult(result);
      // Collapse text by default after validation
      setShowText(false);
    } catch (error) {
      console.error('Error validating charter:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(false);
    setExtractedText(null);
    setExtractionError(null);
    setShowText(false);
    setIsExtracting(false);
    setValidationResult(null);
    setIsValidating(false);
  };

  const fileSizeDisplay = selectedFile
    ? `${(selectedFile.size / 1024).toFixed(2)} KB`
    : null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Validate & Improve Your Charter</CardTitle>
        <CardDescription>
          Upload your existing project charter (PDF) and let AI help you strengthen it
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Upload Input */}
        <div className="flex items-center justify-center w-full">
          <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileUp className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400 dark:text-zinc-500">PDF only, max 10 MB</p>
            </div>
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-950/20 dark:border-red-900">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Success State */}
        {success && selectedFile && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-md dark:bg-green-950/20 dark:border-green-900">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                  {isExtracting ? 'Extrayendo texto...' : extractedText ? 'Texto extraído exitosamente' : 'File ready for validation'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {selectedFile.name} • {fileSizeDisplay}
                </p>
              </div>
            </div>

            {/* Extraction Loading */}
            {isExtracting && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-950/20 dark:border-blue-900">
                <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                <p className="text-sm text-blue-700 dark:text-blue-300">Procesando PDF...</p>
              </div>
            )}

            {/* Extraction Error */}
            {extractionError && !isExtracting && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-950/20 dark:border-red-900">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300">Error al extraer texto</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{extractionError}</p>
                </div>
              </div>
            )}

            {/* Validation Loading */}
            {isValidating && !isExtracting && extractedText && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-950/20 dark:border-blue-900">
                <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                <p className="text-sm text-blue-700 dark:text-blue-300">Analizando estructura del charter...</p>
              </div>
            )}

            {/* Validation Results */}
            {validationResult && !isValidating && !isExtracting && extractedText && (
              <ValidationResultsCard result={validationResult} />
            )}

            {/* Extracted Text Preview */}
            {extractedText && !isExtracting && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowText(!showText)}
                  className="flex items-center justify-between w-full p-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition"
                >
                  <span>Texto extraído ({extractedText.length} caracteres)</span>
                  {showText ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {showText && (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md max-h-64 overflow-y-auto">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap break-words">
                      {extractedText}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="default"
                className="flex-1"
                disabled={!extractedText || isExtracting}
              >
                Validate & Get Feedback
              </Button>
              <Button
                variant="outline"
                onClick={handleClearFile}
                disabled={isExtracting}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


