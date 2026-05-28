import { useEffect, useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, Package, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { ConclusionAction, FieldType, TriageStep } from "@/hooks/useTriageFlow";
import { useProducts } from "@/hooks/useProducts";
import { stripOptionNumber } from "@/lib/sandboxFormatting";

const schema = z.object({
  question: z.string().trim().min(3, "Pergunta muito curta").max(500, "Máximo 500 caracteres"),
  field_type: z.enum(["text", "list"]),
  is_required: z.boolean(),
  options: z.array(z.string().trim().min(1).max(100)),
  conclusion_action: z.enum(["transfer", "schedule", "discard"]).nullable(),
});

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  step: TriageStep | null;
  onSave: (
    payload: Omit<TriageStep, "id" | "flow_id" | "order_position"> & { id?: string },
  ) => Promise<void>;
}

export function StepEditorDialog({ open, onOpenChange, step, onSave }: Props) {
  const [question, setQuestion] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [isRequired, setIsRequired] = useState(true);
  const [options, setOptions] = useState<string[]>([]);
  const [optionDraft, setOptionDraft] = useState("");
  const [conclusion, setConclusion] = useState<ConclusionAction | "none">("none");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { products, loading: productsLoading } = useProducts();
  const activeProducts = products.filter((p) => p.is_active);

  useEffect(() => {
    if (open) {
      setQuestion(step?.question ?? "");
      setFieldType(step?.field_type ?? "text");
      setIsRequired(step?.is_required ?? true);
      setOptions((step?.options ?? []).map(stripOptionNumber));
      setOptionDraft("");
      setConclusion(step?.conclusion_action ?? "none");
      setErrors({});
    }
  }, [open, step]);

  const addOption = () => {
    const v = stripOptionNumber(optionDraft);
    if (!v) return;
    if (options.length >= 10) return;
    if (options.some((option) => stripOptionNumber(option) === v)) return;
    setOptions([...options, v]);
    setOptionDraft("");
  };

  const removeOption = (i: number) => setOptions(options.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    const parsed = schema.safeParse({
      question,
      field_type: fieldType,
      is_required: isRequired,
      options: fieldType === "list" ? options : [],
      conclusion_action: conclusion === "none" ? null : conclusion,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[i.path.join(".")] = i.message));
      setErrors(errs);
      return;
    }
    if (fieldType === "list" && options.length < 2) {
      setErrors({ options: "Adicione pelo menos 2 opções" });
      return;
    }

    setSaving(true);
    try {
      const d = parsed.data;
      await onSave({
        id: step?.id,
        question: d.question,
        field_type: d.field_type,
        is_required: d.is_required,
        options: d.options,
        conclusion_action: d.conclusion_action,
      });
      onOpenChange(false);
    } catch (e) {
      setErrors({ form: e instanceof Error ? e.message : "Erro ao salvar" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{step ? "Editar pergunta" : "Nova pergunta"}</DialogTitle>
          <DialogDescription>Configure como a IA deve abordar o lead.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Pergunta</Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex.: Qual é o seu orçamento mensal?"
              maxLength={500}
              rows={3}
            />
            {errors.question && <p className="text-xs text-destructive">{errors.question}</p>}
          </div>

          <div className="space-y-2">
            <Label>Tipo de resposta</Label>
            <RadioGroup
              value={fieldType}
              onValueChange={(v) => setFieldType(v as FieldType)}
              className="grid grid-cols-2 gap-2"
            >
              <label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="text" />
                <span className="text-sm">Texto livre</span>
              </label>
              <label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="list" />
                <span className="text-sm">Múltipla escolha</span>
              </label>
            </RadioGroup>
          </div>

          {fieldType === "list" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" />
                    Importar dos seus produtos/serviços
                  </Label>
                  <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                    <Link to="/dashboard/produtos" target="_blank">Gerenciar</Link>
                  </Button>
                </div>
                <div className="rounded-md border max-h-44 overflow-y-auto">
                  {productsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : activeProducts.length === 0 ? (
                    <p className="p-3 text-xs text-muted-foreground text-center">
                      Nenhum produto/serviço cadastrado.{" "}
                      <Link to="/dashboard/produtos" target="_blank" className="text-primary underline">
                        Cadastrar agora
                      </Link>
                    </p>
                  ) : (
                    <div className="divide-y">
                      {activeProducts.map((p) => {
                        const checked = options.some((option) => stripOptionNumber(option) === p.name);
                        return (
                          <label
                            key={p.id}
                            className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/50"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                if (v) {
                                  if (!options.some((option) => stripOptionNumber(option) === p.name)) {
                                    setOptions([...options, p.name]);
                                  }
                                } else {
                                  setOptions(options.filter((option) => stripOptionNumber(option) !== p.name));
                                }
                              }}
                            />
                            <span className="text-sm flex-1 truncate">{p.name}</span>
                            {p.price != null && (
                              <span className="text-xs text-muted-foreground">
                                R$ {Number(p.price).toFixed(2)}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ou adicione opções manualmente</Label>
                <div className="flex gap-2">
                  <Input
                    value={optionDraft}
                    onChange={(e) => setOptionDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addOption();
                      }
                    }}
                    placeholder="Digite uma opção e Enter"
                    maxLength={100}
                  />
                  <Button type="button" size="icon" variant="outline" onClick={addOption}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {options.map((o, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {o}
                      <button onClick={() => removeOption(i)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {errors.options && <p className="text-xs text-destructive">{errors.options}</p>}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Resposta obrigatória</p>
              <p className="text-xs text-muted-foreground">A IA insiste se o lead não responder.</p>
            </div>
            <Switch checked={isRequired} onCheckedChange={setIsRequired} />
          </div>

          <div className="space-y-2">
            <Label>Ação ao concluir esta pergunta</Label>
            <Select value={conclusion} onValueChange={(v) => setConclusion(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma — continuar fluxo</SelectItem>
                <SelectItem value="transfer">Transbordo para atendente</SelectItem>
                <SelectItem value="schedule">Agendar contato</SelectItem>
                <SelectItem value="discard">Descartar lead</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Use para encerrar o fluxo dependendo da resposta (ex.: orçamento baixo → descartar).
            </p>
          </div>

          {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
