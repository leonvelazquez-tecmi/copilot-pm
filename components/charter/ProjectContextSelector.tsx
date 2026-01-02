'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Info } from 'lucide-react';

export type ProjectType = 'strategic' | 'operational';
export type ProjectStage = 'shaping' | 'draft' | 'ready';

interface ProjectContextSelectorProps {
  projectType: ProjectType | null;
  projectStage: ProjectStage | null;
  onProjectTypeChange: (type: ProjectType) => void;
  onProjectStageChange: (stage: ProjectStage) => void;
}

export default function ProjectContextSelector({
  projectType,
  projectStage,
  onProjectTypeChange,
  onProjectStageChange
}: ProjectContextSelectorProps) {
  const isComplete = projectType !== null && projectStage !== null;

  return (
    <Card className="border-zinc-700 bg-zinc-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-zinc-100">
          <Info className="h-5 w-5 text-blue-400" />
          Contexto del Proyecto
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Para darte el mejor análisis, necesitamos entender el tipo y etapa de tu proyecto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-zinc-100">
            ¿Qué tipo de proyecto es?
          </Label>
          <RadioGroup
            value={projectType || ''}
            onValueChange={(value) => onProjectTypeChange(value as ProjectType)}
          >
            <div className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
              projectType === 'strategic'
                ? 'border-blue-500 bg-blue-950/30 shadow-sm'
                : 'border-zinc-700 hover:border-zinc-600'
            }`}>
              <RadioGroupItem value="strategic" id="strategic" className={`mt-1 ${projectType === 'strategic' ? 'border-blue-500 text-blue-500' : ''}`} />
              <div className="flex-1">
                <Label htmlFor="strategic" className="cursor-pointer">
                  <span className="font-semibold text-zinc-100">Estratégico</span>
                  <span className="text-xs text-zinc-400 ml-2">(Innovación/Exploración)</span>
                </Label>
                <p className="text-sm text-zinc-400 mt-1">
                  Proyectos de innovación, cambio organizacional, nuevos modelos educativos, 
                  exploración de oportunidades. Validación de hipótesis.
                </p>
              </div>
            </div>

            <div className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
              projectType === 'operational'
                ? 'border-blue-500 bg-blue-950/30 shadow-sm'
                : 'border-zinc-700 hover:border-zinc-600'
            }`}>
              <RadioGroupItem value="operational" id="operational" className={`mt-1 ${projectType === 'operational' ? 'border-blue-500 text-blue-500' : ''}`} />
              <div className="flex-1">
                <Label htmlFor="operational" className="cursor-pointer">
                  <span className="font-semibold text-zinc-100">Operativo</span>
                  <span className="text-xs text-zinc-400 ml-2">(Mejora/Optimización)</span>
                </Label>
                <p className="text-sm text-zinc-400 mt-1">
                  Optimización de procesos, mejora de eficiencia, reducción de costos, 
                  implementación de sistemas. ROI cuantificable.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Project Stage Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-zinc-100">
            ¿En qué etapa está el proyecto?
          </Label>
          <RadioGroup
            value={projectStage || ''}
            onValueChange={(value) => onProjectStageChange(value as ProjectStage)}
          >
            <div className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
              projectStage === 'shaping'
                ? 'border-blue-500 bg-blue-950/30 shadow-sm'
                : 'border-zinc-700 hover:border-zinc-600'
            }`}>
              <RadioGroupItem value="shaping" id="shaping" className={`mt-1 ${projectStage === 'shaping' ? 'border-blue-500 text-blue-500' : ''}`} />
              <div className="flex-1">
                <Label htmlFor="shaping" className="cursor-pointer">
                  <span className="font-semibold text-zinc-100">Shaping</span>
                  <span className="text-xs text-zinc-400 ml-2">(0-30% completo)</span>
                </Label>
                <p className="text-sm text-zinc-400 mt-1">
                  Explorando la idea, definiendo el problema, identificando stakeholders. 
                  Todavía no hay presupuesto detallado ni fechas firmes.
                </p>
              </div>
            </div>

            <div className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
              projectStage === 'draft'
                ? 'border-blue-500 bg-blue-950/30 shadow-sm'
                : 'border-zinc-700 hover:border-zinc-600'
            }`}>
              <RadioGroupItem value="draft" id="draft" className={`mt-1 ${projectStage === 'draft' ? 'border-blue-500 text-blue-500' : ''}`} />
              <div className="flex-1">
                <Label htmlFor="draft" className="cursor-pointer">
                  <span className="font-semibold text-zinc-100">Draft</span>
                  <span className="text-xs text-zinc-400 ml-2">(30-60% completo)</span>
                </Label>
                <p className="text-sm text-zinc-400 mt-1">
                  Diseñando la solución, estimando recursos, formando el equipo. 
                  La mayoría de secciones están definidas pero necesitan refinamiento.
                </p>
              </div>
            </div>

            <div className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
              projectStage === 'ready'
                ? 'border-blue-500 bg-blue-950/30 shadow-sm'
                : 'border-zinc-700 hover:border-zinc-600'
            }`}>
              <RadioGroupItem value="ready" id="ready" className={`mt-1 ${projectStage === 'ready' ? 'border-blue-500 text-blue-500' : ''}`} />
              <div className="flex-1">
                <Label htmlFor="ready" className="cursor-pointer">
                  <span className="font-semibold text-zinc-100">Ready</span>
                  <span className="text-xs text-zinc-400 ml-2">(60-90% completo)</span>
                </Label>
                <p className="text-sm text-zinc-400 mt-1">
                  Listo para aprobación del comité. Todas las secciones completas, 
                  presupuesto definido, equipo asignado, fechas confirmadas.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Completion Status */}
        {isComplete && (
          <div className="rounded-lg border border-green-500/50 bg-green-950/20 p-3">
            <p className="text-sm text-green-400">
              ✓ Contexto seleccionado. Ahora puedes subir tu charter para análisis personalizado.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

