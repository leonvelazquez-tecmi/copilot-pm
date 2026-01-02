import { ClaudeAnalysis } from '@/lib/api/claudeCharterAnalyzer';

export interface MappedSection {
  sectionName: string;
  content: string;
  startIndex: number;
  endIndex: number;
  hasRecommendations: boolean;
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    issue: string;
    suggestion: string;
  }[];
  isComplete: boolean; // from Claude analysis
  confidence?: 'high' | 'medium' | 'low'; // from Claude analysis
  severity?: 'low' | 'medium' | 'high'; // inferred from confidence and completeness
  maxPriority: 'high' | 'medium' | 'low' | null; // highest priority recommendation
}

// Orden estándar de secciones PMI
const SECTION_ORDER = [
  'Información Básica del Proyecto',
  'Propósito y Justificación',
  'Objetivos y Criterios de Éxito',
  'Requisitos de Alto Nivel',
  'Supuestos y Riesgos',
  'Presupuesto y Recursos',
  'Interesados',
  'Autorización'
];

// Mapeo de secciones PMI a patterns del PDF real
interface SectionPattern {
  startPattern: RegExp;
  endPattern: RegExp | null; // null = hasta el final del documento
}

const SECTION_PATTERNS: Record<string, SectionPattern> = {
  'Información Básica del Proyecto': {
    startPattern: /Nombre del proyecto:|Ficha de Proyecto|Resumen:|Equipo al que se presentan/i,
    endPattern: /Contexto y Antecedentes|Solicitado o propuesto/i,
  },
  'Propósito y Justificación': {
    startPattern: /Contexto y Antecedentes|Resumen:/i,
    endPattern: /Fechas Clave|Alineación con Estrategia/i,
  },
  'Objetivos y Criterios de Éxito': {
    startPattern: /Sobre el proyecto|Objetivo Principal|Objetivos específicos|Criterios de Éxito/i,
    endPattern: /Alcance:|Hitos y entregables/i,
  },
  'Requisitos de Alto Nivel': {
    startPattern: /Alcance:/i,
    endPattern: /Criterios de Éxito|Hitos|Equipo del Proyecto/i,
  },
  'Supuestos y Riesgos': {
    startPattern: /Riesgos|Atenciones|Fortalezas:/i,
    endPattern: /Fechas Clave|Alineación|sesión del faro/i,
  },
  'Presupuesto y Recursos': {
    startPattern: /ROI Esperado|Retorno sobre la Inversión/i,
    endPattern: /Transición a operación|Control de cambios/i,
  },
  'Interesados': {
    startPattern: /Equipo del Proyecto|Roles clave|Miembros del Equipo/i,
    endPattern: /ROI Esperado|Transición/i,
  },
  'Autorización': {
    startPattern: /Fechas Clave|Control de cambios|Versión.*Fecha/i,
    endPattern: null, // End of document
  },
};

/**
 * Extrae contenido de una sección usando regex patterns
 */
function extractSectionWithPattern(
  text: string,
  sectionName: string,
  pattern: SectionPattern
): { content: string; startIndex: number; endIndex: number; isComplete: boolean } {
  try {
    const startMatch = text.match(pattern.startPattern);
    
    if (!startMatch) {
      console.log(`❌ Section "${sectionName}": Start pattern not found`);
      return {
        content: '',
        startIndex: -1,
        endIndex: -1,
        isComplete: false,
      };
    }

    const startIndex = startMatch.index!;
    
    // Find end pattern
    const textAfterStart = text.substring(startIndex);
    const endMatch = pattern.endPattern ? textAfterStart.match(pattern.endPattern) : null;
    
    let endIndex: number;
    
    if (endMatch && endMatch.index !== undefined && endMatch.index > 0) {
      endIndex = startIndex + endMatch.index;
    } else {
      // If no end pattern, take next 1000 characters
      endIndex = Math.min(startIndex + 1000, text.length);
    }

    const content = text.substring(startIndex, endIndex).trim();
    
    console.log(`✓ Section "${sectionName}": Extracted ${content.length} characters`);

    // Consider section complete if we extracted content > 50 characters
    const isComplete = content.length > 50;

    return {
      content,
      startIndex,
      endIndex,
      isComplete,
    };
  } catch (error) {
    console.error(`Error extracting section "${sectionName}":`, error);
    return {
      content: '',
      startIndex: -1,
      endIndex: -1,
      isComplete: false,
    };
  }
}

/**
 * Determina la prioridad máxima de las recomendaciones
 */
function getMaxPriority(
  recommendations: MappedSection['recommendations']
): 'high' | 'medium' | 'low' | null {
  if (recommendations.length === 0) return null;
  
  if (recommendations.some(r => r.priority === 'high')) return 'high';
  if (recommendations.some(r => r.priority === 'medium')) return 'medium';
  return 'low';
}

/**
 * Encuentra la sección que mejor coincide con una recomendación
 */
function findMatchingSection(
  mappedSections: MappedSection[],
  recommendationSection: string
): MappedSection | undefined {
  const recLower = recommendationSection.toLowerCase();
  console.log(`\n🔍 Finding match for recommendation: "${recommendationSection}"`);

  // STEP 1: Exact match
  let match = mappedSections.find(s => s.sectionName.toLowerCase() === recLower);
  
  if (match) {
    console.log(`  ✓ Exact match: "${match.sectionName}"`);
    return match;
  }

  // STEP 2: Explicit keyword mappings (prevent mismatches)
  const explicitMappings: Record<string, string> = {
    // Budget/ROI keywords → Presupuesto y Recursos
    'presupuesto': 'Presupuesto y Recursos',
    'budget': 'Presupuesto y Recursos',
    'roi esperado': 'Presupuesto y Recursos',
    'roi': 'Presupuesto y Recursos',
    'recursos': 'Presupuesto y Recursos',
    'retorno sobre la inversión': 'Presupuesto y Recursos',
    
    // Team keywords → Interesados
    'equipo del proyecto': 'Interesados',
    'team': 'Interesados',
    'interesados': 'Interesados',
    'stakeholder': 'Interesados',
    'stakeholders': 'Interesados',
    'roles clave': 'Interesados',
    'miembros del equipo': 'Interesados',
    
    // Risk keywords → Supuestos y Riesgos
    'riesgos': 'Supuestos y Riesgos',
    'supuestos': 'Supuestos y Riesgos',
    'risk': 'Supuestos y Riesgos',
    'assumptions': 'Supuestos y Riesgos',
    'atenciones': 'Supuestos y Riesgos',
    
    // Purpose keywords → Propósito y Justificación
    'propósito': 'Propósito y Justificación',
    'justificación': 'Propósito y Justificación',
    'business case': 'Propósito y Justificación',
    'hypothesis': 'Propósito y Justificación',
    'contexto y antecedentes': 'Propósito y Justificación',
    
    // Objectives keywords → Objetivos y Criterios de Éxito
    'objetivos': 'Objetivos y Criterios de Éxito',
    'criterios de éxito': 'Objetivos y Criterios de Éxito',
    'success criteria': 'Objetivos y Criterios de Éxito',
    'objetivo principal': 'Objetivos y Criterios de Éxito',
    
    // Scope keywords → Requisitos de Alto Nivel
    'alcance': 'Requisitos de Alto Nivel',
    'requisitos': 'Requisitos de Alto Nivel',
    'scope': 'Requisitos de Alto Nivel',
    'requisitos de alto nivel': 'Requisitos de Alto Nivel',
    
    // Strategy keywords → Propósito y Justificación
    'alineación con estrategia': 'Propósito y Justificación',
    'strategic alignment': 'Propósito y Justificación',
    
    // Dates/Authorization → Autorización
    'fechas clave': 'Autorización',
    'control de cambios': 'Autorización',
    'autorización': 'Autorización',
    'versión': 'Autorización',
    
    // Transition → Presupuesto y Recursos
    'transición a operación': 'Presupuesto y Recursos',
    'transición': 'Presupuesto y Recursos',
  };

  // Check explicit mappings
  for (const [keyword, targetSection] of Object.entries(explicitMappings)) {
    if (recLower.includes(keyword)) {
      match = mappedSections.find(s => s.sectionName === targetSection);
      if (match) {
        console.log(`  ✓ Explicit mapping: "${keyword}" → "${match.sectionName}"`);
        return match;
      }
    }
  }

  // STEP 3: Fuzzy contains match
  match = mappedSections.find(s => 
    s.sectionName.toLowerCase().includes(recLower) || 
    recLower.includes(s.sectionName.toLowerCase())
  );
  
  if (match) {
    console.log(`  ✓ Fuzzy match: "${match.sectionName}"`);
    return match;
  }

  console.log(`  ✗ No match found`);
  return undefined;
}

/**
 * Mapea el texto del charter a secciones PMI y combina con análisis Claude
 * Usa claudeAnalysis.sections como fuente de verdad
 */
export function mapCharterToSections(
  extractedText: string,
  claudeAnalysis: ClaudeAnalysis
): MappedSection[] {
  console.log('=== Starting Section Mapping ===');
  console.log('Project Type:', claudeAnalysis.projectType);
  console.log('Project Stage:', claudeAnalysis.projectStage);
  console.log('Using Claude analysis results as source of truth');
  
  // Helper function to infer severity from confidence and found status
  const inferSeverity = (found: boolean, confidence: 'high' | 'medium' | 'low'): 'low' | 'medium' | 'high' => {
    if (!found) return 'high'; // Missing sections are high severity
    if (confidence === 'low') return 'high'; // Low confidence = high severity
    if (confidence === 'medium') return 'medium';
    return 'low'; // High confidence = low severity
  };
  
  // STEP 1: Use Claude analysis sections as the source of truth
  const mappedSections: MappedSection[] = claudeAnalysis.sections.map((section) => {
    console.log(`Processing section: ${section.name}`, {
      found: section.found,
      confidence: section.confidence,
      completeness: section.completeness
    });

    // Extract content for this section using patterns (for display purposes only)
    const pattern = SECTION_PATTERNS[section.name];
    let content = '';
    let startIndex = -1;
    let endIndex = -1;

    if (pattern && extractedText && extractedText.trim().length > 0) {
      const extracted = extractSectionWithPattern(extractedText, section.name, pattern);
      content = extracted.content;
      // Rough indices for display
      if (content.length > 0) {
        const contentStart = extractedText.indexOf(content.substring(0, Math.min(50, content.length)));
        startIndex = contentStart !== -1 ? contentStart : extracted.startIndex;
        endIndex = startIndex !== -1 ? startIndex + content.length : extracted.endIndex;
      } else {
        startIndex = extracted.startIndex;
        endIndex = extracted.endIndex;
      }
    }

    return {
      sectionName: section.name,
      content: content || 'Sección no encontrada en el documento',
      startIndex,
      endIndex,
      hasRecommendations: false, // Will be updated in STEP 2
      recommendations: [],
      isComplete: section.found, // Use Claude analysis result as source of truth
      confidence: section.confidence, // From Claude analysis
      severity: inferSeverity(section.found, section.confidence), // Inferred from confidence
      maxPriority: null, // Will be calculated in STEP 2
    };
  });
  
  // STEP 2: Link recommendations from Claude to sections
  console.log('=== Linking Recommendations ===');
  console.log('Total recommendations from Claude:', claudeAnalysis.recommendations.length);

  claudeAnalysis.recommendations.forEach((rec, index) => {
    console.log(`Recommendation ${index + 1}:`, {
      priority: rec.priority,
      section: rec.section,
      issue: rec.issue.substring(0, 50) + (rec.issue.length > 50 ? '...' : ''),
    });

    const matchingSection = findMatchingSection(mappedSections, rec.section);

    if (matchingSection) {
      console.log(`  ✓ Matched to section: ${matchingSection.sectionName}`);
      matchingSection.recommendations.push({
        priority: rec.priority,
        issue: rec.issue,
        suggestion: rec.suggestion,
      });
      matchingSection.hasRecommendations = true;
    } else {
      console.log(`  ✗ No matching section found for: "${rec.section}"`);
    }
  });

  // STEP 3: Calculate maxPriority for each section after linking recommendations
  mappedSections.forEach(ms => {
    ms.maxPriority = getMaxPriority(ms.recommendations);
  });

  // Log final state for verification
  console.log('=== Final Section State ===');
  mappedSections.forEach(ms => {
    console.log(`Section "${ms.sectionName}":`, {
      isComplete: ms.isComplete,
      confidence: ms.confidence,
      severity: ms.severity,
      hasRecommendations: ms.hasRecommendations,
      recommendationCount: ms.recommendations.length,
      contentLength: ms.content.length,
      maxPriority: ms.maxPriority,
    });
  });

  return mappedSections;
}
