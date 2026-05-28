import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TriageStep } from "@/hooks/useTriageFlow";

const conclusionLabels: Record<string, string> = {
  transfer: "Transbordo",
  schedule: "Agendar",
  discard: "Descartar",
};

interface Props {
  step: TriageStep;
  index: number;
  onEdit: (s: TriageStep) => void;
  onDelete: (id: string) => void;
}

export function StepListItem({ step, index, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="group flex items-start gap-3 rounded-lg border bg-card p-4 hover:border-primary/40 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab touch-none text-muted-foreground hover:text-foreground"
        aria-label="Arrastar"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground line-clamp-2">{step.question}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs">
            {step.field_type === "list" ? "Múltipla escolha" : "Texto livre"}
          </Badge>
          {step.is_required && (
            <Badge variant="secondary" className="text-xs">
              Obrigatório
            </Badge>
          )}
          {step.conclusion_action && (
            <Badge className="text-xs">{conclusionLabels[step.conclusion_action]}</Badge>
          )}
          {step.field_type === "list" && step.options.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {step.options.length} opções
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="ghost" onClick={() => onEdit(step)} aria-label="Editar">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(step.id)}
          aria-label="Excluir"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
