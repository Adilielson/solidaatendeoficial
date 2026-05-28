import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, ListChecks, Send, Pencil, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTriageFlow, type TriageStep } from "@/hooks/useTriageFlow";
import { StepListItem } from "@/components/dashboard/triage/StepListItem";
import { StepEditorDialog } from "@/components/dashboard/triage/StepEditorDialog";

const DashboardTriage = () => {
  const {
    flow,
    steps,
    loading,
    error,
    renameFlow,
    publish,
    unpublish,
    upsertStep,
    deleteStep,
    reorderSteps,
  } = useTriageFlow();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<TriageStep | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = steps.findIndex((s) => s.id === active.id);
    const newIndex = steps.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    reorderSteps(arrayMove(steps, oldIndex, newIndex));
  };

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (s: TriageStep) => {
    setEditing(s);
    setEditorOpen(true);
  };

  const handlePublish = async () => {
    if (steps.length === 0) {
      toast({
        title: "Adicione pelo menos uma pergunta antes de publicar",
        variant: "destructive",
      });
      return;
    }
    try {
      await publish();
      toast({ title: "Fluxo publicado", description: "A IA já está usando o novo fluxo." });
    } catch (e) {
      toast({
        title: "Erro ao publicar",
        description: e instanceof Error ? e.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleSaveName = async () => {
    const name = nameDraft.trim();
    if (!name || !flow) return setRenaming(false);
    try {
      await renameFlow(name);
      setRenaming(false);
    } catch (e) {
      toast({ title: "Erro ao renomear", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteStep(deleteId);
      setDeleteId(null);
    } catch (e) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {renaming ? (
              <>
                <Input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  maxLength={80}
                  className="h-8 text-2xl font-bold w-auto"
                />
                <Button size="icon" variant="ghost" onClick={handleSaveName}>
                  <Check className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-foreground">
                  {flow?.name ?? "Fluxo de triagem"}
                </h1>
                {flow && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setNameDraft(flow.name);
                      setRenaming(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {flow?.is_active ? (
                  <Badge>Publicado</Badge>
                ) : (
                  <Badge variant="secondary">Rascunho</Badge>
                )}
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Defina as perguntas que a IA fará para qualificar leads no WhatsApp.
          </p>
        </div>

        <div className="flex gap-2">
          {flow?.is_active && (
            <Button variant="outline" onClick={() => unpublish()}>
              Despublicar
            </Button>
          )}
          <Button onClick={handlePublish} disabled={!flow || flow.is_active}>
            <Send className="h-4 w-4" />
            {flow?.is_active ? "Publicado" : "Publicar"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : steps.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ListChecks className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Nenhuma pergunta ainda</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Crie a primeira pergunta para começar a qualificar leads.
            </p>
          </div>
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            Criar primeira pergunta
          </Button>
        </div>
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {steps.map((s, i) => (
                  <StepListItem
                    key={s.id}
                    step={s}
                    index={i}
                    onEdit={openEdit}
                    onDelete={(id) => setDeleteId(id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button variant="outline" className="w-full" onClick={openNew}>
            <Plus className="h-4 w-4" />
            Adicionar pergunta
          </Button>
        </>
      )}

      <StepEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        step={editing}
        onSave={upsertStep}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pergunta?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardTriage;
