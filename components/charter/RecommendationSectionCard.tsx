'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { MappedSection } from './SectionMapping';

interface RecommendationSectionCardProps {
  section: MappedSection;
  onClick: () => void;
  isSelected: boolean;
}

export function RecommendationSectionCard({ section, onClick, isSelected }: RecommendationSectionCardProps) {
  const { sectionName, recommendations, hasRecommendations, maxPriority, isComplete, confidence, severity } = section;
  
  // Determinar color del borde basado en prioridad máxima
  const getBorderColor = () => {
    if (!hasRecommendations) {
      return 'border-green-500/50 dark:border-green-500/50';
    }
    if (maxPriority === 'high') {
      return 'border-red-500/50 dark:border-red-500/50';
    }
    if (maxPriority === 'medium') {
      return 'border-amber-500/50 dark:border-amber-500/50';
    }
    if (maxPriority === 'low') {
      return 'border-blue-500/50 dark:border-blue-500/50';
    }
    return 'border-zinc-300 dark:border-zinc-700';
  };
  
  const getBackgroundColor = () => {
    if (isSelected) {
      return 'bg-blue-50 dark:bg-blue-950/20';
    }
    if (!hasRecommendations) {
      return 'bg-green-950/10 dark:bg-green-950/10';
    }
    if (maxPriority === 'high') {
      return 'bg-red-950/10 dark:bg-red-950/10';
    }
    if (maxPriority === 'medium') {
      return 'bg-amber-950/10 dark:bg-amber-950/10';
    }
    if (maxPriority === 'low') {
      return 'bg-blue-950/10 dark:bg-blue-950/10';
    }
    return 'bg-white dark:bg-zinc-900';
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
        return '🔴 ALTA';
      case 'medium':
        return '🟡 MEDIA';
      case 'low':
        return '🔵 BAJA';
    }
  };

  // Determine what to show when no recommendations
  const getEmptyStateMessage = () => {
    if (!isComplete) {
      // Section is missing or incomplete
      const severityLabel = 
        severity === 'high' ? '🔴 CRÍTICO' :
        severity === 'medium' ? '🟡 IMPORTANTE' :
        '🔵 OPCIONAL';
      
      return {
        icon: '⚠️',
        title: 'Sección Incompleta',
        message: `Esta sección necesita atención (${severityLabel} para esta etapa)`,
        variant: severity === 'high' ? 'destructive' : 'default',
        textColor: severity === 'high' 
          ? 'text-red-700 dark:text-red-300' 
          : severity === 'medium'
          ? 'text-yellow-700 dark:text-yellow-300'
          : 'text-blue-700 dark:text-blue-300'
      };
    } else if (confidence === 'low') {
      return {
        icon: '⚠️',
        title: 'Sección Débil',
        message: 'Esta sección fue detectada pero tiene poca información. Considera expandirla.',
        variant: 'default',
        textColor: 'text-yellow-700 dark:text-yellow-300'
      };
    } else {
      return {
        icon: '✅',
        title: 'Sección Bien Estructurada',
        message: 'No se encontraron problemas críticos en esta sección.',
        variant: 'default',
        textColor: 'text-green-700 dark:text-green-300'
      };
    }
  };

  const emptyState = getEmptyStateMessage();
  
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${getBorderColor()} ${getBackgroundColor()}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {sectionName}
        </h3>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {hasRecommendations ? (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${getPriorityBadgeColor(rec.priority)}`}>
                    {getPriorityLabel(rec.priority)}
                  </span>
                </div>
                <div className="space-y-1 pl-4">
                  <div className="text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="font-semibold">Problema:</span> {rec.issue}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-semibold">Sugerencia:</span> {rec.suggestion}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
            <span className="text-2xl">{emptyState.icon}</span>
            <div className="flex-1">
              <p className={`font-medium ${emptyState.textColor}`}>{emptyState.title}</p>
              <p className="text-sm text-zinc-400 mt-1">{emptyState.message}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
