"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { Button } from "@/components/ui/button";

const input = "h-10 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--background)] px-3 text-sm font-normal outline-none focus:border-[color:var(--primary)]";

type Initial = {
  id: string;
  bookingId: string;
  type: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  customerCompany: string | null;
  customerAddress: string | null;
  validUntil: string;
  dueDate: string;
  discountAmount: string;
  additionalCharges: string;
  taxRate: string;
  notes: string | null;
  paymentTerms: string | null;
  lines: Array<{ description: string; category: string; quantity: string; unitPrice: string }>;
};

const documentTypeOptions = [
  { value: "QUOTE", label: "Quotation" },
  { value: "INVOICE", label: "Invoice" }
];

export function DraftDocumentEditor({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [lines, setLines] = useState(initial.lines);
  const [saving, setSaving] = useState(false);

  function setLine(i: number, key: string, value: string) {
    setLines(current => current.map((line, n) => n === i ? { ...line, [key]: value } : line));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const response = await fetch(`/api/admin/documents/${initial.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...f, bookingId: initial.bookingId, lines })
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) return toast.error(payload.error || "Draft could not be saved");
    toast.success("Draft updated");
    router.push(`/admin/documents/${initial.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">Type
          <DashboardSelect
            name="type"
            defaultValue={initial.type}
            options={documentTypeOptions}
            className={input}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">Customer
          <input name="customerName" required defaultValue={initial.customerName} className={input} />
        </label>
        <label className="grid gap-2 text-sm font-bold">Email
          <input name="customerEmail" type="email" defaultValue={initial.customerEmail || ""} className={input} />
        </label>
        <label className="grid gap-2 text-sm font-bold">Phone
          <input name="customerPhone" defaultValue={initial.customerPhone || ""} className={input} />
        </label>
        <label className="grid gap-2 text-sm font-bold">Company
          <input name="customerCompany" defaultValue={initial.customerCompany || ""} className={input} />
        </label>
        <label className="grid gap-2 text-sm font-bold">Address
          <input name="customerAddress" defaultValue={initial.customerAddress || ""} className={input} />
        </label>
        <label className="grid gap-2 text-sm font-bold">Valid until
          <input name="validUntil" type="date" defaultValue={initial.validUntil} className={input} />
        </label>
        <label className="grid gap-2 text-sm font-bold">Due date
          <input name="dueDate" type="date" defaultValue={initial.dueDate} className={input} />
        </label>
      </div>
      <div className="grid gap-2">
        <div className="flex justify-between">
          <h2 className="font-bold">Line items</h2>
          <Button type="button" variant="secondary" size="sm" onClick={() => setLines([...lines, { description: "", category: "service", quantity: "1", unitPrice: "0" }])}>
            <Plus size={15} className="inline" /> Add
          </Button>
        </div>
        {lines.map((line, i) => (
          <div key={i} className="grid gap-2 rounded-xl bg-[color:var(--surface-soft)] p-3 md:grid-cols-[1fr_140px_90px_130px_36px]">
            <input aria-label={`Line ${i + 1} description`} value={line.description} onChange={e => setLine(i, "description", e.target.value)} className={input} />
            <input aria-label={`Line ${i + 1} category`} value={line.category} onChange={e => setLine(i, "category", e.target.value)} className={input} />
            <input aria-label={`Line ${i + 1} quantity`} type="number" step="0.001" value={line.quantity} onChange={e => setLine(i, "quantity", e.target.value)} className={input} />
            <input aria-label={`Line ${i + 1} unit price`} type="number" step="0.01" value={line.unitPrice} onChange={e => setLine(i, "unitPrice", e.target.value)} className={input} />
            <Button type="button" variant="ghost" size="icon" disabled={lines.length === 1} onClick={() => setLines(lines.filter((_, n) => n !== i))} aria-label="Remove line item">
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-bold">Additional charges
          <input name="additionalCharges" type="number" step="0.01" defaultValue={initial.additionalCharges} className={input} />
        </label>
        <label className="grid gap-2 text-sm font-bold">Discount
          <input name="discountAmount" type="number" step="0.01" defaultValue={initial.discountAmount} className={input} />
        </label>
        <label className="grid gap-2 text-sm font-bold">Tax %
          <input name="taxRate" type="number" step="0.01" defaultValue={initial.taxRate} className={input} />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">Notes
          <textarea name="notes" defaultValue={initial.notes || ""} className={`${input} min-h-24 py-3`} />
        </label>
        <label className="grid gap-2 text-sm font-bold">Payment terms
          <textarea name="paymentTerms" defaultValue={initial.paymentTerms || ""} className={`${input} min-h-24 py-3`} />
        </label>
      </div>
      <Button disabled={saving} className="rounded-xl bg-[color:var(--primary)] px-5 py-3 text-sm font-bold text-white">
        {saving ? "Saving..." : "Save draft"}
      </Button>
    </form>
  );
}