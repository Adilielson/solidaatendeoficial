import { useState, useRef } from "react";
import { useProducts, type Product } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Pencil, Plus, Trash2, Upload, Package, Files, LayoutGrid, List } from "lucide-react";

type FormState = {
  name: string;
  description: string;
  price: string;
  image_url: string;
  is_active: boolean;
};

const empty: FormState = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  is_active: true,
};

export default function DashboardProducts() {
  const { products, loading, create, update, remove, duplicate, uploadImage } = useProducts();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const fileRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: p.price != null ? String(p.price) : "",
      image_url: p.image_url ?? "",
      is_active: p.is_active,
    });
    setOpen(true);
  };

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem máxima: 5MB");
      return;
    }
    setUploading(true);
    const { url, error } = await uploadImage(file);
    setUploading(false);
    if (error || !url) {
      toast.error("Falha no upload da imagem");
      return;
    }
    setForm((f) => ({ ...f, image_url: url }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: form.price ? Number(form.price.replace(",", ".")) : null,
      image_url: form.image_url || null,
      is_active: form.is_active,
    };
    const res = editing
      ? await update(editing.id, payload)
      : await create(payload);
    setSaving(false);
    if (res.error) {
      toast.error("Erro ao salvar produto");
      return;
    }
    toast.success(editing ? "Produto atualizado" : "Produto criado");
    setOpen(false);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const { error } = await remove(toDelete.id);
    if (error) toast.error("Erro ao excluir");
    else toast.success("Produto excluído");
    setToDelete(null);
  };

  const handleDuplicate = async (p: Product) => {
    const { data, error } = await duplicate(p.id);
    if (error || !data) {
      toast.error("Erro ao duplicar");
      return;
    }
    toast.success("Produto duplicado");
    openEdit(data as Product);
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID copiado");
  };

  return (
    <div className="space-y-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Produtos & Serviços</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre seu catálogo. A IA poderá listar e enviar a imagem dos produtos automaticamente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md p-1 mr-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
              title="Visualização em grade"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
              title="Visualização em lista"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> Novo produto
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium">Nenhum produto cadastrado</p>
            <p className="text-sm text-muted-foreground mb-4">
              Comece criando seu primeiro produto ou serviço.
            </p>
            <Button onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" /> Novo produto
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className="overflow-hidden flex flex-col">
              <div className="h-44 bg-muted flex items-center justify-center overflow-hidden border-b">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="h-full w-full object-contain p-2"
                    loading="lazy"
                  />
                ) : (
                  <Package className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-1">{p.name}</CardTitle>
                  <Badge variant={p.is_active ? "default" : "secondary"}>
                    {p.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                {p.price != null && (
                  <p className="text-sm font-semibold text-primary">
                    R$ {p.price.toFixed(2).replace(".", ",")}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                {p.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {p.description}
                  </p>
                )}
                <button
                  onClick={() => copyId(p.id)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono mt-auto"
                  title="Copiar ID do produto"
                >
                  <Copy className="h-3 w-3 shrink-0" />
                  <span className="truncate">{p.id}</span>
                </button>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(p)}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicate(p)}
                    title="Duplicar produto"
                  >
                    <Files className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setToDelete(p)}
                    title="Excluir produto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center overflow-hidden shrink-0 border">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{p.name}</h3>
                      <Badge variant={p.is_active ? "default" : "secondary"} className="h-5 px-1.5 text-[10px]">
                        {p.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      {p.price != null && (
                        <p className="text-sm font-semibold text-primary">
                          R$ {p.price.toFixed(2).replace(".", ",")}
                        </p>
                      )}
                      <button
                        onClick={() => copyId(p.id)}
                        className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-mono"
                        title="Copiar ID do produto"
                      >
                        <Copy className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate max-w-[80px]">{p.id}</span>
                      </button>
                    </div>
                    {p.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p)} title="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDuplicate(p)} title="Duplicar">
                      <Files className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setToDelete(p)} 
                      title="Excluir" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar produto" : "Novo produto"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Imagem</Label>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center overflow-hidden border">
                  {form.image_url ? (
                    <img src={form.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = "";
                  }}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Enviando…" : form.image_url ? "Trocar" : "Enviar imagem"}
                  </Button>
                  {form.image_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Plano Premium"
              />
            </div>

            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                inputMode="decimal"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Ex: 297,00"
              />
            </div>

            <div>
              <Label htmlFor="desc">Descrição</Label>
              <Textarea
                id="desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descrição curta que a IA pode usar..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label className="cursor-pointer">Ativo</Label>
                <p className="text-xs text-muted-foreground">
                  Apenas produtos ativos são oferecidos pela IA.
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>

            {editing && (
              <div className="rounded-md bg-muted/40 p-2 text-xs font-mono flex items-center justify-between gap-2">
                <span className="truncate text-muted-foreground">{editing.id}</span>
                <Button size="sm" variant="ghost" onClick={() => copyId(editing.id)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. "{toDelete?.name}" será removido do catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
