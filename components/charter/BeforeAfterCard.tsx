'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { MappedSection } from './SectionMapping';

interface BeforeAfterCardProps {
  section: MappedSection;
  projectType: 'strategic' | 'operational';
}

// Helper to determine source/authority for each section
function getMethodologySource(
  sectionName: string,
  projectType: 'strategic' | 'operational',
  hasIssue: boolean
): { source: string; details: string } {
  // Map section names to their authoritative sources
  const sources: Record<string, { source: string; details: string }> = {
    'Información Básica del Proyecto': {
      source: 'PMI PMBOK 7th Edition',
      details: 'Project Charter Fundamentals - Basic project information required'
    },
    'Propósito y Justificación': 
      projectType === 'strategic' 
        ? {
            source: 'Lean Startup (Eric Ries) + Innovation Accounting (Kromatic)',
            details: 'Strategic projects require explicit hypothesis validation'
          }
        : {
            source: 'PMI PMBOK 7th Edition + Business Case Analysis (HBR)',
            details: 'Operational projects require quantified problem & ROI'
          },
    'Objetivos y Criterios de Éxito': {
      source: 'SMART Criteria (Doran, 1981) + PMI-ACP Framework',
      details: 'Objectives must be Specific, Measurable, Achievable, Relevant, Time-bound'
    },
    'Requisitos de Alto Nivel': {
      source: 'PMI PMBOK 7th Edition',
      details: 'Scope Management - Explicit boundaries (In/Out of scope)'
    },
    'Supuestos y Riesgos': {
      source: 'PMI-ACP Risk Management + Agile Practice Guide',
      details: 'Assumptions must be documented and validated; risks identified early'
    },
    'Presupuesto y Recursos': {
      source: 'PMI PMBOK 7th Edition',
      details: 'Budget Estimates by Stage: Shaping ±30% | Draft ±15% | Ready ±5%'
    },
    'Interesados': {
      source: 'PMI-ACP Framework',
      details: 'Stakeholder Identification - Min 3 key roles with assigned owners'
    },
    'Autorización': {
      source: 'PMI Project Governance',
      details: 'Formal authorization required with dates and approval process'
    }
  };

  return sources[sectionName] || {
    source: 'PMI PMBOK 7th Edition',
    details: 'Standard project management practices'
  };
}

export default function BeforeAfterCard({ section, projectType }: BeforeAfterCardProps) {
  const hasIssues = section.hasRecommendations && section.recommendations.length > 0;
  const hasContent = section.content && section.content !== 'Sección no encontrada en el documento';
  // A section is truly missing if Claude says it's not found OR if no content was extracted
  const isMissing = !section.isComplete || !hasContent;
  
  // Determine status badge
  const getStatusBadge = () => {
    if (isMissing) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          FALTANTE
        </Badge>
      );
    }
    if (hasIssues) {
      const highestPriority = section.recommendations.reduce((highest, rec) => {
        if (rec.priority === 'high') return 'high';
        if (rec.priority === 'medium' && highest !== 'high') return 'medium';
        return highest;
      }, 'low' as 'high' | 'medium' | 'low');

      if (highestPriority === 'high') {
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            CRÍTICO
          </Badge>
        );
      }
      return (
        <Badge variant="secondary" className="bg-yellow-600 gap-1">
          <AlertTriangle className="h-3 w-3" />
          MEJORABLE
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-green-500 text-green-400 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        COMPLETA
      </Badge>
    );
  };

  // Extract first 200 characters from content
  const getContentPreview = () => {
    if (isMissing || section.content === 'Sección no encontrada en el documento') {
      return {
        text: '',
        charCount: 0,
        isMissing: true
      };
    }
    const preview = section.content.substring(0, 200);
    return {
      text: preview + (section.content.length > 200 ? '...' : ''),
      charCount: Math.min(section.content.length, 200),
      isMissing: false
    };
  };

  const contentPreview = getContentPreview();
  const methodology = getMethodologySource(section.sectionName, projectType, hasIssues);

  // Generate positive checklist for complete sections
  const getPositiveChecklist = () => {
    const items: string[] = [];
    
    if (section.confidence === 'high') {
      items.push('Contenido suficiente y bien estructurado');
    }
    
    // Section-specific checks
    if (section.sectionName.includes('Interesados') || section.sectionName.includes('Presupuesto')) {
      items.push('Roles clave identificados');
      if (!section.content.toLowerCase().includes('tbd')) {
        items.push('Nombres específicos asignados (no TBD)');
      }
    }
    
    if (section.sectionName.includes('Objetivos')) {
      if (/\d+%|\d+ de \d+/.test(section.content)) {
        items.push('Criterios cuantificados');
      }
    }
    
    if (section.sectionName.includes('Alcance') || section.sectionName.includes('Requisitos')) {
      if (section.content.toLowerCase().includes('dentro') && section.content.toLowerCase().includes('fuera')) {
        items.push('Límites explícitos (Dentro/Fuera)');
      }
    }

    // Default items if none detected
    if (items.length === 0) {
      items.push('Sección identificada correctamente');
      items.push('Información base presente');
    }

    return items;
  };

  return (
    <Card className="border-2 border-zinc-700 bg-zinc-900">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-zinc-100">
            {section.sectionName}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent>
        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT PANEL: What the charter says */}
          <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/30">
            <h4 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              📄 LO QUE DICE TU CHARTER:
            </h4>
            
            {contentPreview.isMissing ? (
              <div className="space-y-2">
                <p className="text-sm text-amber-400 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Sección no encontrada en el documento.</span>
                </p>
                <p className="text-xs text-zinc-500">
                  La sección no se encontró en el documento o no se pudo extraer su contenido mediante los patrones de búsqueda.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  "{contentPreview.text}"
                </p>
                <p className="text-xs text-zinc-500">
                  ({contentPreview.charCount} caracteres extraídos)
                </p>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: What it should say OR positive evaluation */}
          <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/30">
            {isMissing ? (
              // Show missing section message
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                  ⚠️ SECCIÓN NO ENCONTRADA:
                </h4>
                <p className="text-sm text-zinc-300">
                  Esta sección no se encontró en el documento o no se pudo extraer su contenido.
                </p>
                {section.confidence && (
                  <p className="text-xs text-zinc-500">
                    Confianza de detección: {section.confidence === 'high' ? 'Alta' : section.confidence === 'medium' ? 'Media' : 'Baja'}
                  </p>
                )}
                <div className="mt-4 pt-3 border-t border-zinc-700">
                  <p className="text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                    📚 Fuente:
                  </p>
                  <p className="text-xs text-zinc-400">{methodology.source}</p>
                  <p className="text-xs text-zinc-500 mt-1">{methodology.details}</p>
                </div>
              </div>
            ) : hasIssues ? (
              // Show recommendations
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                  💡 LO QUE DEBERÍA DECIR:
                </h4>
                
                {section.recommendations.map((rec, idx) => (
                  <div key={idx} className="space-y-2">
                    {/* Priority badge */}
                    <div>
                      {rec.priority === 'high' && (
                        <Badge variant="destructive" className="bg-red-500">
                          🔴 ALTA PRIORIDAD
                        </Badge>
                      )}
                      {rec.priority === 'medium' && (
                        <Badge variant="secondary" className="bg-yellow-600">
                          🟡 MEDIA PRIORIDAD
                        </Badge>
                      )}
                      {rec.priority === 'low' && (
                        <Badge variant="outline" className="border-blue-500 text-blue-400">
                          🔵 BAJA PRIORIDAD
                        </Badge>
                      )}
                    </div>

                    {/* Issue */}
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 mb-1">Problema:</p>
                      <p className="text-sm text-zinc-300">{rec.issue}</p>
                    </div>

                    {/* Suggestion */}
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 mb-1">Sugerencia:</p>
                      <p className="text-sm text-blue-400">{rec.suggestion}</p>
                    </div>
                  </div>
                ))}

                {/* Source/Methodology */}
                <div className="mt-4 pt-3 border-t border-zinc-700">
                  <p className="text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                    📚 Fuente:
                  </p>
                  <p className="text-xs text-zinc-400">{methodology.source}</p>
                  <p className="text-xs text-zinc-500 mt-1">{methodology.details}</p>
                </div>
              </div>
            ) : (
              // Show positive evaluation
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  ✅ EVALUACIÓN POSITIVA:
                </h4>

                <p className="text-sm text-zinc-300">
                  Esta sección cumple con los estándares de calidad:
                </p>

                {/* Positive checklist */}
                <ul className="space-y-1.5">
                  {getPositiveChecklist().map((item, idx) => (
                    <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Source/Methodology */}
                <div className="mt-4 pt-3 border-t border-zinc-700">
                  <p className="text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                    📚 Fuente:
                  </p>
                  <p className="text-xs text-zinc-400">{methodology.source}</p>
                  <p className="text-xs text-zinc-500 mt-1">{methodology.details}</p>
                </div>

                <p className="text-sm text-green-400 font-medium mt-3">
                  No se requieren cambios.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

