"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { DashboardDatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Source = { key: string; kind: "booking" | "lead"; id: string; label: string; site: string; name: string; email: string; phone: string; company: string; description: string };
type Invoice = { id: string; label: string; balance: number };
type Line = { description: string; category: string; quantity: string; unitPrice: string };
const input = "h-10 min-w-0 w-full max-w-full rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--background)] px-3 text-sm font-normal outline-none transition-colors focus:border-[color:var(--primary)]";
const field = "grid min-w-0 gap-2 overflow-hidden text-sm font-bold";

const documentTypeOptions = [
  { value: "QUOTE", label: "Quotation" },
  { value: "INVOICE", label: "Invoice" }
];

const paymentMethodOptions = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "CARD", label: "Card" },
  { value: "OTHER", label: "Other" }
];

const categoryOptions = [
  { value: "service", label: "Service" },
  { value: "product", label: "Product" },
  { value: "other", label: "Other" }
];

export function CreateDocumentPanel({ sources, initialBooking, initialLead }: { sources: Source[]; initialBooking?: string; initialLead?: string }) {
  const router = useRouter();
  const [sourceKey, setSourceKey] = useState(initialBooking ? `booking:${initialBooking}` : initialLead ? `lead:${initialLead}` : sources[0]?.key || "");
  const [type, setType] = useState("QUOTE");
  const [lines, setLines] = useState<Line[]>([{ description: "Project services", category: "service", quantity: "1", unitPrice: "0" }]);
  const [saving, setSaving] = useState(false);
  const source = useMemo(() => sources.find(item => item.key === sourceKey), [sources, sourceKey]);

  function updateLine(index: number, key: keyof Line, value: string) {
    setLines(current => current.map((line, i) => i === index ? { ...line, [key]: value } : line));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!source) return;
    setSaving(true);
    const form = new FormData(event.currentTarget);
    let bookingId = source.id;
    if (source.kind === "lead") {
      const conversion = await fetch("/api/admin/bookings/from-lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ leadId: source.id }) });
      const converted = await conversion.json();
      if (!conversion.ok) { setSaving(false); return toast.error(converted.error || "Lead could not be converted"); }
      bookingId = converted.id;
    }
    const body = {
      bookingId, type, customerName: String(form.get("customerName")),
      customerEmail: String(form.get("customerEmail") || "") || null,
      customerPhone: String(form.get("customerPhone") || "") || null,
      customerCompany: String(form.get("customerCompany") || "") || null,
      customerAddress: String(form.get("customerAddress") || "") || null,
      validUntil: String(form.get("validUntil") || "") || null,
      dueDate: String(form.get("dueDate") || "") || null,
      discountAmount: String(form.get("discountAmount") || "0"),
      additionalCharges: String(form.get("additionalCharges") || "0"),
      taxRate: String(form.get("taxRate") || "0"),
      notes: String(form.get("notes") || "") || null,
      paymentTerms: String(form.get("paymentTerms") || "") || null,
      lines
    };
    const response = await fetch("/api/admin/documents", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) return toast.error(payload.error || "Document could not be created");
    toast.success("Draft created");
    router.push(`/admin/documents/${payload.id}`);
    router.refresh();
  }

  return (
    <Card as="form" padding="sm" className="grid min-w-0 gap-6 sm:p-5 lg:p-6" id="new-document" onSubmit={submit}>
      <div>
        <h2 className="font-display text-xl font-black">Create document</h2>
        <p className="text-sm text-[color:var(--text-muted)]">Select a lead or booking, then set the actual scope and price.</p>
      </div>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <label className={field}>Source
          <DashboardSelect
            value={sourceKey}
            onChange={e => setSourceKey(e.target.value)}
            options={sources.map(item => ({ label: item.label, value: item.key }))}
            className={input}
          />
        </label>
        <label className={field}>Document type
          <DashboardSelect
            value={type}
            onChange={e => setType(e.target.value)}
            options={documentTypeOptions}
            className={input}
          />
        </label>
        <label className={field}>Customer
          <input key={`${sourceKey}-name`} name="customerName" defaultValue={source?.name} required className={input} />
        </label>
        <label className={field}>Company
          <input key={`${sourceKey}-company`} name="customerCompany" defaultValue={source?.company} className={input} />
        </label>
        <label className={field}>Email
          <input key={`${sourceKey}-email`} name="customerEmail" type="email" defaultValue={source?.email} className={input} />
        </label>
        <label className={field}>Phone
          <input key={`${sourceKey}-phone`} name="customerPhone" defaultValue={source?.phone} className={input} />
        </label>
        <label className={field}>
          {type === "QUOTE" ? "Valid until" : "Due date"}
          <DashboardDatePicker
            name={type === "QUOTE" ? "validUntil" : "dueDate"}
            className={input}
          />
        </label>
        <label className={field}>Customer address
          <input name="customerAddress" className={input} />
        </label>
      </div>
      <div className="grid min-w-0 gap-3 border-t border-[color:var(--border-subtle)] pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold">Line items</h3>
          <Button type="button" variant="secondary" size="sm" onClick={() => setLines(prev => [...prev, { description: "", category: "service", quantity: "1", unitPrice: "0" }])}>
            <Plus size={15} /> Add line
          </Button>
        </div>
        {lines.map((line, index) => (
          <div key={index} className="grid min-w-0 grid-cols-2 gap-2 rounded-xl bg-[color:var(--surface-soft)] p-3 sm:grid-cols-4 xl:grid-cols-[minmax(10rem,1.5fr)_minmax(7rem,1fr)_minmax(5rem,.6fr)_minmax(7rem,.8fr)_2.5rem]">
            <input value={line.description} onChange={e => updateLine(index, "description", e.target.value)} placeholder="Item description" aria-label="Item description" className={`${input} col-span-2 sm:col-span-4 xl:col-span-1`} />
            <DashboardSelect
              value={line.category}
              onChange={e => updateLine(index, "category", e.target.value)}
              options={categoryOptions}
              aria-label="Item category"
              className={input}
            />
            <input value={line.quantity} onChange={e => updateLine(index, "quantity", e.target.value)} aria-label="Quantity" placeholder="Qty" type="number" min="0" step="0.01" className={input} />
            <input value={line.unitPrice} onChange={e => updateLine(index, "unitPrice", e.target.value)} aria-label="Rate" placeholder="Rate" type="number" min="0" step="0.01" className={input} />
            <Button type="button" variant="ghost" size="icon" className="h-10 w-10 justify-self-end" onClick={() => setLines(current => current.filter((_, i) => i !== index))} aria-label="Remove line item">
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className={field}>Discount amount (N$)
          <input name="discountAmount" defaultValue="0" type="number" min="0" step="0.01" className={input} />
        </label>
        <label className={field}>Additional charges (N$)
          <input name="additionalCharges" defaultValue="0" type="number" min="0" step="0.01" className={input} />
        </label>
        <label className={field}>Tax rate (%)
          <input name="taxRate" defaultValue="0" type="number" min="0" max="100" step="0.01" className={input} />
        </label>
        <label className={field}>Payment terms
          <input name="paymentTerms" placeholder="Net 30" className={input} />
        </label>
        <label className={`${field} sm:col-span-2 xl:col-span-4`}>Notes
          <textarea name="notes" className={`${input} min-h-20 py-3`} />
        </label>
      </div>
      <Button disabled={saving} className="h-11 w-full">
        {saving ? "Creating..." : "Create document"}
      </Button>
    </Card>
  );
}

export function PaymentPanel({ invoices }: { invoices: Invoice[] }) {
  const router = useRouter();
  const [invoiceId, setInvoiceId] = useState(invoices[0]?.id || "");
  const [saving, setSaving] = useState(false);
  const invoice = invoices.find(item => item.id === invoiceId);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    const data = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/admin/payments", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...data, invoiceId }) });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) return toast.error(payload.error || "Payment could not be recorded");
    form.reset();
    toast.success("Payment recorded and receipt issued");
    router.refresh();
  }

  return (
    <Card as="form" padding="sm" className="grid min-w-0 gap-4 overflow-hidden sm:p-5 lg:sticky lg:top-5" onSubmit={submit}>
      <div>
        <h2 className="font-display text-xl font-black">Record payment</h2>
        <p className="text-sm text-[color:var(--text-muted)]">A receipt is issued automatically.</p>
      </div>
      {invoices.length ? (
        <>
          <label className="grid min-w-0 gap-2 overflow-hidden text-sm font-bold">Invoice
            <DashboardSelect
              value={invoiceId}
              onChange={e => setInvoiceId(e.target.value)}
              options={invoices.map(item => ({ label: item.label, value: item.id }))}
              className={input}
            />
          </label>
          <label className="grid min-w-0 gap-2 overflow-hidden text-sm font-bold">Amount (N$)
            <input name="amount" required type="number" min="0.01" max={invoice?.balance} step="0.01" className={input} />
          </label>
          <label className="grid min-w-0 gap-2 overflow-hidden text-sm font-bold">Method
            <DashboardSelect
              name="method"
              options={paymentMethodOptions}
              className={input}
            />
          </label>
          <label className="grid min-w-0 gap-2 overflow-hidden text-sm font-bold">Reference
            <input name="reference" className={input} />
          </label>
          <label className="grid min-w-0 gap-2 overflow-hidden text-sm font-bold">Payment date
            <DashboardDatePicker
              name="paidAt"
              className={input}
            />
          </label>
          <label className="grid min-w-0 gap-2 overflow-hidden text-sm font-bold">Notes
            <textarea name="notes" className={`${input} min-h-20 py-3`} />
          </label>
          <Button disabled={saving} className="rounded-xl bg-[color:var(--primary)] px-5 py-3 text-sm font-bold text-white">
            {saving ? "Recording..." : "Record payment"}
          </Button>
        </>
      ) : (
        <p className="rounded-xl bg-[color:var(--surface-soft)] p-4 text-sm text-[color:var(--text-muted)]">No outstanding issued invoices.</p>
      )}
    </Card>
  );
}

export function RegisterLink({ href, primary, secondary, trailing }: { href: string; primary: string; secondary: string; trailing: string }) {
  return <Link href={href} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-[color:var(--border-subtle)] px-4 py-3 text-sm last:border-0 hover:bg-[color:var(--surface-soft)]"><span className="min-w-0"><strong className="block truncate">{primary}</strong><small className="mt-0.5 block break-words text-[color:var(--text-muted)]">{secondary}</small></span><span className="whitespace-nowrap font-semibold tabular-nums">{trailing}</span></Link>;
}
