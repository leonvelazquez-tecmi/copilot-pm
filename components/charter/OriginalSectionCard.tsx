'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { MappedSection } from './SectionMapping';

interface OriginalSectionCardProps {
  section: MappedSection;
  onClick: () => void;
  isSelected: boolean;
}

export function OriginalSectionCard({ section, onClick, isSelected }: OriginalSectionCardProps) {
  const { sectionName, content, isComplete, maxPriority, hasRecommendations } = section;
  
  // Determinar color del borde basado en prioridad máxima
  const getBorderColor = () => {
    if (!hasRecommendations && isComplete) {
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
    if (!content || content.length === 0) {
      return 'border-zinc-700 border-dashed dark:border-zinc-700';
    }
    return 'border-zinc-300 dark:border-zinc-700';
  };
  
  const getBackgroundColor = () => {
    if (isSelected) {
      return 'bg-blue-50 dark:bg-blue-950/20';
    }
    if (!hasRecommendations && isComplete) {
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
    if (!content || content.length === 0) {
      return 'bg-zinc-900/50 dark:bg-zinc-900/50';
    }
    return 'bg-white dark:bg-zinc-900';
  };
  
  // Obtener icono de estado
  const getStatusIcon = () => {
    if (!content || content.length === 0) {
      return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    }
    if (isComplete && !hasRecommendations) {
      return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
    }
    if (hasRecommendations) {
      return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
  };
  
  const getStatusText = () => {
    if (!content || content.length === 0) {
      return 'Faltante';
    }
    if (isComplete && !hasRecommendations) {
      return 'Completa';
    }
    if (hasRecommendations) {
      return 'Mejorable';
    }
    return 'Completa';
  };
  
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${getBorderColor()} ${getBackgroundColor()}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {sectionName}
          </h3>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              {getStatusText()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {content && content.length > 0 ? (
          <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
            {content.length > 500 ? (
              <>
                {content.substring(0, 500)}
                <span className="text-zinc-500 dark:text-zinc-500">...</span>
              </>
            ) : (
              content
            )}
          </div>
        ) : (
          <div className="text-sm text-zinc-500 dark:text-zinc-400 italic">
            Sección no encontrada en el documento
          </div>
        )}
      </CardContent>
    </Card>
  );
}


