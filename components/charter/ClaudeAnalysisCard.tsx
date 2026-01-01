'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Lightbulb, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import { ClaudeAnalysis } from '@/lib/api/claudeCharterAnalyzer';

interface ClaudeAnalysisCardProps {
  analysis: ClaudeAnalysis;
}

export function ClaudeAnalysisCard({ analysis }: ClaudeAnalysisCardProps) {
  const [showStrengths, setShowStrengths] = useState(true);
  const [showWeaknesses, setShowWeaknesses] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [showRedFlags, setShowRedFlags] = useState(true);

  const { overallScore, strengths, weaknesses, recommendations, redFlags } = analysis;

  // Determinar color basado en score
  const getScoreColor = () => {
    if (overallScore >= 75) return 'text-green-600 dark:text-green-400';
    if (overallScore >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressBarColor = () => {
    if (overallScore >= 75) return 'bg-green-600 dark:bg-green-500';
    if (overallScore >= 60) return 'bg-yellow-600 dark:bg-yellow-500';
    return 'bg-red-600 dark:bg-red-500';
  };

  // Agrupar recomendaciones por prioridad
  const recommendationsByPriority = {
    high: recommendations.filter(r => r.priority === 'high'),
    medium: recommendations.filter(r => r.priority === 'medium'),
    low: recommendations.filter(r => r.priority === 'low'),
  };

  const getPriorityBadgeColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300 border-red-300 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300 border-blue-300 dark:border-blue-800';
    }
  };

  const getPriorityLabel = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'ALTA';
      case 'medium':
        return 'MEDIA';
      case 'low':
        return 'BAJA';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Análisis Cualitativo con IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score General */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Calidad General
            </span>
            <span className={`text-2xl font-bold ${getScoreColor()}`}>
              {overallScore}/100
            </span>
          </div>
          {/* Barra de progreso */}
          <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProgressBarColor()}`}
              style={{ width: `${overallScore}%` }}
            />
          </div>
        </div>

        {/* Fortalezas */}
        {strengths.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setShowStrengths(!showStrengths)}
              className="flex items-center justify-between w-full p-2 text-sm font-semibold text-green-900 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-md transition"
            >
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Fortalezas ({strengths.length})
              </span>
              {showStrengths ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {showStrengths && (
              <ul className="space-y-2 pl-6">
                {strengths.map((strength, index) => (
                  <li
                    key={index}
                    className="text-sm text-green-800 dark:text-green-200 flex items-start gap-2"
                  >
                    <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Oportunidades de Mejora */}
        {weaknesses.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setShowWeaknesses(!showWeaknesses)}
              className="flex items-center justify-between w-full p-2 text-sm font-semibold text-yellow-900 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 rounded-md transition"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Oportunidades de Mejora ({weaknesses.length})
              </span>
              {showWeaknesses ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {showWeaknesses && (
              <ul className="space-y-2 pl-6">
                {weaknesses.map((weakness, index) => (
                  <li
                    key={index}
                    className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2"
                  >
                    <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Recomendaciones */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="flex items-center justify-between w-full p-2 text-sm font-semibold text-blue-900 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-md transition"
            >
              <span className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Recomendaciones Priorizadas ({recommendations.length})
              </span>
              {showRecommendations ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {showRecommendations && (
              <div className="space-y-4">
                {/* Alta Prioridad */}
                {recommendationsByPriority.high.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded border ${getPriorityBadgeColor('high')}`}>
                        🔴 {getPriorityLabel('high')}
                      </span>
                    </div>
                    <div className="space-y-3 pl-4 border-l-2 border-red-300 dark:border-red-800">
                      {recommendationsByPriority.high.map((rec, index) => (
                        <div key={index} className="space-y-1">
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {rec.section}
                          </div>
                          <div className="text-xs text-zinc-600 dark:text-zinc-400">
                            <span className="font-semibold">Problema:</span> {rec.issue}
                          </div>
                          <div className="text-xs text-blue-700 dark:text-blue-300">
                            <span className="font-semibold">Sugerencia:</span> {rec.suggestion}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Media Prioridad */}
                {recommendationsByPriority.medium.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded border ${getPriorityBadgeColor('medium')}`}>
                        🟡 {getPriorityLabel('medium')}
                      </span>
                    </div>
                    <div className="space-y-3 pl-4 border-l-2 border-yellow-300 dark:border-yellow-800">
                      {recommendationsByPriority.medium.map((rec, index) => (
                        <div key={index} className="space-y-1">
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {rec.section}
                          </div>
                          <div className="text-xs text-zinc-600 dark:text-zinc-400">
                            <span className="font-semibold">Problema:</span> {rec.issue}
                          </div>
                          <div className="text-xs text-blue-700 dark:text-blue-300">
                            <span className="font-semibold">Sugerencia:</span> {rec.suggestion}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Baja Prioridad */}
                {recommendationsByPriority.low.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded border ${getPriorityBadgeColor('low')}`}>
                        🔵 {getPriorityLabel('low')}
                      </span>
                    </div>
                    <div className="space-y-3 pl-4 border-l-2 border-blue-300 dark:border-blue-800">
                      {recommendationsByPriority.low.map((rec, index) => (
                        <div key={index} className="space-y-1">
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {rec.section}
                          </div>
                          <div className="text-xs text-zinc-600 dark:text-zinc-400">
                            <span className="font-semibold">Problema:</span> {rec.issue}
                          </div>
                          <div className="text-xs text-blue-700 dark:text-blue-300">
                            <span className="font-semibold">Sugerencia:</span> {rec.suggestion}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Red Flags */}
        {redFlags.length > 0 && (
          <div className="space-y-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-300 flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Alertas Críticas ({redFlags.length})
              </h3>
              <button
                onClick={() => setShowRedFlags(!showRedFlags)}
                className="text-red-600 dark:text-red-400"
              >
                {showRedFlags ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
            {showRedFlags && (
              <ul className="space-y-2 mt-2">
                {redFlags.map((flag, index) => (
                  <li
                    key={index}
                    className="text-sm text-red-800 dark:text-red-200 flex items-start gap-2"
                  >
                    <span className="text-red-600 dark:text-red-400 mt-1">🚩</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

