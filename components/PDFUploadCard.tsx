'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, FileUp, Loader2, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ClaudeAnalysis } from '@/lib/api/claudeCharterAnalyzer';
import ProjectContextSelector, { ProjectType, ProjectStage } from '@/components/charter/ProjectContextSelector';
import { SideBySideView } from '@/components/charter/SideBySideView';

export function PDFUploadCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [claudeAnalysis, setClaudeAnalysis] = useState<ClaudeAnalysis | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [analyzingWithClaude, setAnalyzingWithClaude] = useState(false);
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [projectStage, setProjectStage] = useState<ProjectStage | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const isContextComplete = projectType !== null && projectStage !== null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      processFile(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('El archivo no puede exceder 10 MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setIsExtracting(true);

    try {
      const text = await extractTextFromPDF(file);
      setExtractedText(text);

      // Ensure context is complete
      if (!projectType || !projectStage) {
        throw new Error('Project context must be selected before analysis');
      }

      setIsExtracting(false);

      // Automatically start Claude analysis
      setAnalyzingWithClaude(true);
      
      const response = await fetch('/api/analyze-charter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          projectType,
          projectStage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze charter');
      }

      const analysis = await response.json();
      setClaudeAnalysis(analysis);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error procesando el archivo');
    } finally {
      setIsExtracting(false);
      setAnalyzingWithClaude(false);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
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
    return data.text;
  };

  const handleClear = () => {
    setSelectedFile(null);
    setExtractedText('');
    setClaudeAnalysis(null);
    setError(null);
    setProjectType(null);
    setProjectStage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show results (single view - no tabs)
  if (selectedFile && claudeAnalysis && !analyzingWithClaude && !isExtracting) {
    return (
      <div className="flex flex-col h-full">
        {/* Header with key metrics */}
        <div className="border-b border-zinc-700 bg-zinc-900 p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 mb-1">
                📊 Análisis de Tu Charter
              </h2>
              <p className="text-sm text-zinc-400">
                {selectedFile.name} • {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <Button onClick={handleClear} variant="outline" size="sm">
              Analizar Otro Charter
            </Button>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Overall Score */}
            <Card className="border-zinc-700 bg-zinc-800">
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-zinc-400 mb-1">Score General</p>
                  <p className="text-3xl font-bold text-zinc-100">
                    {claudeAnalysis.overallScore}
                    <span className="text-lg text-zinc-400">/100</span>
                  </p>
                  <Badge 
                    variant={
                      claudeAnalysis.overallScore >= 80 ? 'default' :
                      claudeAnalysis.overallScore >= 60 ? 'secondary' :
                      'destructive'
                    }
                    className="mt-2"
                  >
                    {claudeAnalysis.overallScore >= 80 ? '✅ Excelente' :
                     claudeAnalysis.overallScore >= 60 ? '🟡 Mejorable' :
                     '🔴 Necesita Trabajo'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Completeness */}
            <Card className="border-zinc-700 bg-zinc-800">
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-zinc-400 mb-1">Completitud Estructural</p>
                  <p className="text-3xl font-bold text-zinc-100">
                    {claudeAnalysis.overallCompleteness}
                    <span className="text-lg text-zinc-400">%</span>
                  </p>
                  <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${claudeAnalysis.overallCompleteness}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Context Badges */}
            <Card className="border-zinc-700 bg-zinc-800">
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-zinc-400 mb-2">Contexto del Proyecto</p>
                  <div className="flex flex-col gap-2 items-center">
                    <Badge variant="outline" className="border-blue-500 text-blue-400">
                      {claudeAnalysis.projectType === 'strategic' ? 'Estratégico' : 'Operativo'}
                    </Badge>
                    <Badge variant="outline" className="border-purple-500 text-purple-400">
                      {claudeAnalysis.projectStage === 'shaping' ? 'Shaping' :
                       claudeAnalysis.projectStage === 'draft' ? 'Draft' :
                       'Ready'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Alerts */}
          {claudeAnalysis.redFlags && claudeAnalysis.redFlags.length > 0 && (
            <Card className="border-red-500/50 bg-red-950/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-400 mb-2">
                      🚩 Alertas Críticas ({claudeAnalysis.redFlags.length})
                    </p>
                    <ul className="space-y-1">
                      {claudeAnalysis.redFlags.slice(0, 3).map((flag, idx) => (
                        <li key={idx} className="text-sm text-zinc-300">
                          • {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content: Side-by-Side View (scrollable) */}
        <div className="flex-1 overflow-y-auto">
          <SideBySideView
            extractedText={extractedText}
            claudeAnalysis={claudeAnalysis}
          />
        </div>

        {/* Footer with action buttons */}
        <div className="border-t border-zinc-700 bg-zinc-900 p-4">
          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="sm">
              📋 Copiar Recomendaciones
            </Button>
            <Button variant="outline" size="sm">
              💾 Exportar Reporte PDF
            </Button>
            <Button onClick={handleClear} variant="default" size="sm">
              🔄 Analizar Otra Versión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isExtracting || analyzingWithClaude) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-lg text-zinc-300 mb-2">
          {isExtracting ? 'Extrayendo texto del PDF...' : 'Analizando charter con IA...'}
        </p>
        <p className="text-sm text-zinc-500">
          Esto puede tomar unos segundos
        </p>
      </div>
    );
  }

  // Show initial upload UI
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Validate & Improve Your Charter</CardTitle>
        <CardDescription>
          Upload your existing project charter (PDF) and let AI help you strengthen it
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Context Selector and Upload */}
        <div className="space-y-4">
          {/* Step 1: Project Context Selector */}
          <ProjectContextSelector
            projectType={projectType}
            projectStage={projectStage}
            onProjectTypeChange={setProjectType}
            onProjectStageChange={setProjectStage}
          />

          {/* Step 2: PDF Upload (only show if context is complete) */}
          {isContextComplete && (
            <Card className="border-zinc-700 bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-zinc-100">Sube tu Charter</CardTitle>
                <CardDescription className="text-zinc-400">
                  Archivo PDF, máximo 10 MB
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-zinc-600 cursor-pointer transition-colors"
                >
                  <Upload className="mx-auto h-12 w-12 text-zinc-500 mb-4" />
                  <p className="text-zinc-300 mb-2">
                    Click para subir o arrastra el archivo aquí
                  </p>
                  <p className="text-sm text-zinc-500">PDF solamente, máximo 10 MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-950/20 border border-red-500/50 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
