'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, FileUp } from 'lucide-react';

export function PDFUploadCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(false);
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
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">File ready for validation</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {selectedFile.name} • {fileSizeDisplay}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="default"
                className="flex-1"
                disabled
              >
                Validate & Get Feedback
              </Button>
              <Button
                variant="outline"
                onClick={handleClearFile}
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


