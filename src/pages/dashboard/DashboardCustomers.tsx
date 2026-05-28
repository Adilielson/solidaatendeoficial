import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Users, Plus, Trash2, Phone, Mail } from "lucide-react";
import { useCustomers, useCustomerPurchases } from "@/hooks/useCustomers";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";

const formatCurrency = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (d: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const segmentOf = (ltv: number, totalPurchases: number) => {
  if (totalPurchases === 0) return { label: "Lead", color: "bg-muted text-muted-foreground" };
  if (ltv >= 5000 || totalPurchases >= 5)
    return { label: "VIP", color: "bg-primary/15 text-primary border-primary/30" };
  if (totalPurchases >= 2)
    return { label: "Regular", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" };
  return { label: "Novo", color: "bg-green-500/15 text-green-400 border-green-500/30" };
};

const DashboardCustomers = () => {
  const { customers, loading, refetch, companyId } = useCustomers();
  const { products } = useProducts();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        (c.name ?? "").toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
    );
  }, [customers, search]);

  const totals = useMemo(() => {
    const totalLtv = customers.reduce((s, c) => s + c.ltv, 0);
    const buyers = customers.filter((c) => c.total_purchases > 0).length;
    return { totalLtv, buyers, total: customers.length };
  }, [customers]);

  const selected = customers.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Central de Clientes
          </h1>
          <p className="text-sm text-muted-foreground">
            Histórico, LTV e contatos identificados automaticamente pela IA via WhatsApp.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase">Total de Clientes</p>
          <p className="text-2xl font-semibold mt-1">{totals.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase">Compradores</p>
          <p className="text-2xl font-semibold mt-1">{totals.buyers}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase">LTV total</p>
          <p className="text-2xl font-semibold mt-1 text-primary">{formatCurrency(totals.totalLtv)}</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Nenhum cliente encontrado. Conforme a IA atender pelo WhatsApp, eles aparecerão aqui automaticamente.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead className="text-right">Compras</TableHead>
                <TableHead className="text-right">LTV</TableHead>
                <TableHead>Último contato</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const seg = segmentOf(c.ltv, c.total_purchases);
                return (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => setSelectedId(c.id)}>
                    <TableCell>
                      <div className="font-medium">{c.name ?? "Sem nome"}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={seg.color}>{seg.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{c.total_purchases}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(c.ltv)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(c.last_contact_at)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(c.id);
                        }}
                      >
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <CustomerDetail
              customer={selected}
              products={products}
              companyId={companyId ?? ""}
              onAdded={refetch}
              onClose={() => setSelectedId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function CustomerDetail({
  customer,
  products,
  companyId,
  onAdded,
  onClose,
}: {
  customer: ReturnType<typeof useCustomers>["customers"][number];
  products: ReturnType<typeof useProducts>["products"];
  companyId: string;
  onAdded: () => void;
  onClose: () => void;
}) {
  const { purchases, loading, create, remove } = useCustomerPurchases(customer.id);
  const [productId, setProductId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("sale");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      toast.error("Selecione um produto");
      return;
    }
    const amt = parseFloat(amount.replace(",", ".")) || Number(product.price ?? 0);
    setSubmitting(true);
    const { error } = await create({
      company_id: companyId,
      contact_id: customer.id,
      product_id: product.id,
      product_name: product.name,
      amount: amt,
      purchase_type: type,
      notes: notes || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Erro ao registrar");
    } else {
      toast.success("Registrado com sucesso");
      setProductId("");
      setAmount("");
      setNotes("");
      onAdded();
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{customer.name ?? "Sem nome"}</DialogTitle>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground pt-1">
          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{customer.phone}</span>
          {customer.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{customer.email}</span>}
        </div>
      </DialogHeader>

      <div className="grid grid-cols-3 gap-3 py-3">
        <Card className="p-3">
          <p className="text-[10px] uppercase text-muted-foreground">Compras</p>
          <p className="text-lg font-semibold">{customer.total_purchases}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] uppercase text-muted-foreground">LTV</p>
          <p className="text-lg font-semibold text-primary">{formatCurrency(customer.ltv)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] uppercase text-muted-foreground">Último contato</p>
          <p className="text-sm font-medium">{formatDate(customer.last_contact_at)}</p>
        </Card>
      </div>

      <div className="space-y-3 border-t border-border pt-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4" /> Registrar compra/agendamento
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <Label className="text-xs">Produto/Serviço</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} {p.price ? `— ${formatCurrency(Number(p.price))}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Valor (R$)</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
          </div>
          <div>
            <Label className="text-xs">Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">Venda</SelectItem>
                <SelectItem value="appointment">Agendamento</SelectItem>
                <SelectItem value="subscription">Assinatura</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Observações (opcional)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleAdd} disabled={submitting || !productId} className="w-full">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar"}
        </Button>
      </div>

      <div className="border-t border-border pt-3">
        <h4 className="text-sm font-semibold mb-2">Histórico</h4>
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
        ) : purchases.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Sem registros ainda.</p>
        ) : (
          <div className="space-y-1 max-h-48 overflow-auto">
            {purchases.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm border border-border rounded-md px-3 py-2">
                <div>
                  <div className="font-medium">{p.product_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(p.occurred_at)} · {p.purchase_type}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">{formatCurrency(Number(p.amount))}</span>
                  <Button size="icon" variant="ghost" onClick={() => remove(p.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Fechar</Button>
      </DialogFooter>
    </>
  );
}

export default DashboardCustomers;
