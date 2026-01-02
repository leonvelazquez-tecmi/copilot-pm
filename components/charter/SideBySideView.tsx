'use client';

import { ClaudeAnalysis } from '@/lib/api/claudeCharterAnalyzer';
import { mapCharterToSections, MappedSection } from './SectionMapping';
import BeforeAfterCard from './BeforeAfterCard';

interface SideBySideViewProps {
  extractedText: string;
  claudeAnalysis: ClaudeAnalysis;
}

export function SideBySideView({
  extractedText,
  claudeAnalysis
}: SideBySideViewProps) {
  const sections = mapCharterToSections(
    extractedText,
    claudeAnalysis
  );

  return (
    <div className="space-y-4 p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-zinc-100 mb-2">
          Vista Comparativa
        </h2>
        <p className="text-sm text-zinc-400">
          Compara tu charter actual con las recomendaciones específicas basadas en estándares PMI y metodologías reconocidas.
        </p>
      </div>

      {/* Render each section as a before/after card */}
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <BeforeAfterCard
            key={idx}
            section={section}
            projectType={claudeAnalysis.projectType}
          />
        ))}
      </div>
    </div>
  );
}
