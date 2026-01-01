export interface SectionStatus {
  name: string;
  found: boolean;
  confidence: 'high' | 'medium' | 'low';
  keywords: string[];
}

export interface ValidationResult {
  completeness: number; // 0-100%
  sections: SectionStatus[];
  missingSections: string[];
  suggestions: string[];
}

// Keywords para cada sección PMI estándar
const SECTION_KEYWORDS: Record<string, string[]> = {
  'Información Básica del Proyecto': [
    'project title', 'project name', 'nombre del proyecto', 'título del proyecto',
    'project manager', 'gerente del proyecto', 'director del proyecto',
    'sponsor', 'patrocinador', 'sponsor del proyecto',
    'date', 'fecha', 'date of approval', 'fecha de aprobación'
  ],
  'Propósito y Justificación': [
    'business case', 'caso de negocio', 'justificación del proyecto',
    'problem statement', 'declaración del problema', 'problema',
    'strategic alignment', 'alineación estratégica', 'justificación',
    'purpose', 'propósito', 'razón del proyecto'
  ],
  'Objetivos y Criterios de Éxito': [
    'objectives', 'objetivos', 'goals', 'metas',
    'smart objectives', 'objetivos smart',
    'deliverables', 'entregables', 'entregables del proyecto',
    'success criteria', 'criterios de éxito', 'kpis', 'indicadores clave'
  ],
  'Requisitos de Alto Nivel': [
    'requirements', 'requisitos', 'requisitos funcionales',
    'functional requirements', 'non-functional requirements',
    'requisitos no funcionales', 'scope', 'alcance',
    'constraints', 'restricciones', 'limitaciones'
  ],
  'Supuestos y Riesgos': [
    'assumptions', 'supuestos', 'suposiciones',
    'risks', 'riesgos', 'riesgos del proyecto',
    'dependencies', 'dependencias', 'dependencias del proyecto'
  ],
  'Presupuesto y Recursos': [
    'budget', 'presupuesto', 'presupuesto del proyecto',
    'resources', 'recursos', 'recursos del proyecto',
    'timeline', 'cronograma', 'tiempo', 'duración',
    'milestones', 'hitos', 'marcos del proyecto'
  ],
  'Interesados': [
    'stakeholders', 'interesados', 'partes interesadas',
    'stakeholder', 'equipo', 'team', 'roles',
    'responsibilities', 'responsabilidades', 'roles y responsabilidades'
  ],
  'Autorización': [
    'approval', 'aprobación', 'autorización',
    'signatures', 'firmas', 'signature', 'firma',
    'authorization', 'autorizado por', 'aprobado por'
  ]
};

/**
 * Valida la estructura de un charter de proyecto basándose en keywords
 * @param extractedText Texto extraído del PDF
 * @returns Resultado de validación con completitud y estado de secciones
 */
export function validateCharterStructure(extractedText: string): ValidationResult {
  if (!extractedText || extractedText.trim().length === 0) {
    return {
      completeness: 0,
      sections: Object.keys(SECTION_KEYWORDS).map(name => ({
        name,
        found: false,
        confidence: 'low',
        keywords: SECTION_KEYWORDS[name]
      })),
      missingSections: Object.keys(SECTION_KEYWORDS),
      suggestions: ['El documento está vacío o no contiene texto válido']
    };
  }

  const normalizedText = extractedText.toLowerCase();
  const sections: SectionStatus[] = [];
  let foundCount = 0;

  // Analizar cada sección
  for (const [sectionName, keywords] of Object.entries(SECTION_KEYWORDS)) {
    const matchedKeywords: string[] = [];
    
    // Buscar keywords en el texto (case-insensitive)
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    }

    // Determinar confianza y si la sección fue encontrada
    let confidence: 'high' | 'medium' | 'low';
    let found: boolean;

    if (matchedKeywords.length >= 3) {
      confidence = 'high';
      found = true;
      foundCount++;
    } else if (matchedKeywords.length >= 1) {
      confidence = 'medium';
      found = true; // Consideramos parcialmente encontrada
      foundCount += 0.5; // Contamos medio punto para parcial
    } else {
      confidence = 'low';
      found = false;
    }

    sections.push({
      name: sectionName,
      found,
      confidence,
      keywords: matchedKeywords
    });
  }

  // Calcular completitud (0-100%)
  const totalSections = Object.keys(SECTION_KEYWORDS).length;
  const completeness = Math.round((foundCount / totalSections) * 100);

  // Identificar secciones faltantes (confidence = 'low')
  const missingSections = sections
    .filter(s => !s.found)
    .map(s => s.name);

  // Generar sugerencias
  const suggestions: string[] = [];
  
  if (missingSections.length > 0) {
    suggestions.push(`Se encontraron ${missingSections.length} sección(es) faltante(s): ${missingSections.join(', ')}`);
    
    // Sugerencias específicas para secciones críticas
    const criticalSections = ['Información Básica del Proyecto', 'Propósito y Justificación', 'Objetivos y Criterios de Éxito'];
    const missingCritical = missingSections.filter(s => criticalSections.includes(s));
    
    if (missingCritical.length > 0) {
      suggestions.push(`Secciones críticas faltantes: ${missingCritical.join(', ')}. Estas secciones son esenciales para un charter completo.`);
    }
  }

  if (completeness < 50) {
    suggestions.push('El charter parece estar incompleto. Considera agregar más secciones según el estándar PMI.');
  } else if (completeness >= 70) {
    suggestions.push('El charter tiene una estructura sólida. Puedes mejorar agregando detalles en las secciones identificadas como parciales.');
  }

  return {
    completeness,
    sections,
    missingSections,
    suggestions
  };
}

