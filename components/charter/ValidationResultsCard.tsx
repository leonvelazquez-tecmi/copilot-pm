'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { ValidationResult } from '@/lib/validators/charterValidator';

interface ValidationResultsCardProps {
  result: ValidationResult;
}

export function ValidationResultsCard({ result }: ValidationResultsCardProps) {
  const { completeness, sections, missingSections, suggestions } = result;

  // Determinar color basado en completitud
  const getCompletenessColor = () => {
    if (completeness >= 70) return 'text-green-600 dark:text-green-400';
    if (completeness >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressBarColor = () => {
    if (completeness >= 70) return 'bg-green-600 dark:bg-green-500';
    if (completeness >= 50) return 'bg-yellow-600 dark:bg-yellow-500';
    return 'bg-red-600 dark:bg-red-500';
  };

  // Obtener icono de estado por sección
  const getSectionIcon = (found: boolean, confidence: 'high' | 'medium' | 'low') => {
    if (found && confidence === 'high') {
      return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
    }
    if (found && confidence === 'medium') {
      return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    }
    return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
  };

  // Obtener texto de estado por sección
  const getSectionStatusText = (found: boolean, confidence: 'high' | 'medium' | 'low') => {
    if (found && confidence === 'high') {
      return 'Encontrada';
    }
    if (found && confidence === 'medium') {
      return 'Parcial';
    }
    return 'Faltante';
  };

  // Obtener color de texto de estado
  const getSectionStatusColor = (found: boolean, confidence: 'high' | 'medium' | 'low') => {
    if (found && confidence === 'high') {
      return 'text-green-700 dark:text-green-300';
    }
    if (found && confidence === 'medium') {
      return 'text-yellow-700 dark:text-yellow-300';
    }
    return 'text-red-700 dark:text-red-300';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Análisis de Estructura
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Completitud Global */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Completitud
            </span>
            <span className={`text-2xl font-bold ${getCompletenessColor()}`}>
              {completeness}%
            </span>
          </div>
          {/* Barra de progreso */}
          <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProgressBarColor()}`}
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>

        {/* Lista de Secciones */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Secciones del Charter
          </h3>
          <div className="space-y-2">
            {sections.map((section) => (
              <div
                key={section.name}
                className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getSectionIcon(section.found, section.confidence)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {section.name}
                    </p>
                    {section.keywords.length > 0 && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {section.keywords.length} keyword(s) encontrado(s)
                      </p>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-medium ${getSectionStatusColor(section.found, section.confidence)}`}>
                  {getSectionStatusText(section.found, section.confidence)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Secciones Faltantes y Sugerencias */}
        {missingSections.length > 0 && (
          <div className="space-y-2 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Secciones Faltantes Críticas
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {missingSections.map((section) => (
                <li
                  key={section}
                  className="text-sm text-yellow-800 dark:text-yellow-200"
                >
                  {section}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sugerencias */}
        {suggestions.length > 0 && (
          <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
              Sugerencias
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="text-sm text-blue-800 dark:text-blue-200"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

