"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { DashboardDatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";

type Source = { key: string; kind: "booking" | "lead"; id: string; label: string; site: string; name: string; email: string; phone: string; company: string; description: string };
type Invoice = { id: string; label: string; balance: number };
type Line = { description: string; category: string; quantity: string; unitPrice: string };
const input = "h-10 min-w-0 w-full max-w-full rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--background)] px-3 text-sm font-normal outline-none focus:border-[color:var(--primary)]";

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
    <form id="new-document" onSubmit={submit} className="grid gap-5 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5">
      <div>
        <h2 className="font-display text-xl font-black">Create document</h2>
        <p className="text-sm text-[color:var(--text-muted)]">Select a lead or booking, then set the actual scope and price.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">Source
          <DashboardSelect
            value={sourceKey}
            onChange={e => setSourceKey(e.target.value)}
            options={sources.map(item => ({ label: item.label, value: item.key }))}
            className={input}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">Document type
          <DashboardSelect
            value={type}
            onChange={e => setType(e.target.value)}
            options={documentTypeOptions}
            className={input}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">Customer
          <input key={`${sourceKey}-name`} name="customerName" defaultValue={source?.name} required className={input} />
        </label>
        <label className="grid gap-2 text-sm font-bold">Company
          <input key={`${sourceKey}-company`} name="customerCompany" defaultValue={source?.company} className={input} />
        </label>
        <label className="grid gap-2 text-sm font-bold">Email
          <input key={`${sourceKey}-email`} name="customerEmail" type="email" defaultValue={source?.email} className={input} />
        </label>
        <label className="grid gap-2 text-sm font-bold">Phone
          <input key={`${sourceKey}-phone`} name="customerPhone" defaultValue={source?.phone} className={input} />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          {type === "QUOTE" ? "Valid until" : "Due date"}
          <DashboardDatePicker
            name={type === "QUOTE" ? "validUntil" : "dueDate"}
            className={input}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">Customer address
          <input name="customerAddress" className={input} />
        </label>
      </div>
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Line items</h3>
          <Button type="button" variant="secondary" size="sm" onClick={() => setLines(prev => [...prev, { description: "", category: "service", quantity: "1", unitPrice: "0" }])}>
            Add line
          </Button>
        </div>
        {lines.map((line, index) => (
          <div key={index} className="grid gap-2 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
            <input value={line.description} onChange={e => updateLine(index, "description", e.target.value)} placeholder="Description" className={input} />
            <DashboardSelect
              value={line.category}
              onChange={e => updateLine(index, "category", e.target.value)}
              options={categoryOptions}
              className={input}
            />
            <input value={line.quantity} onChange={e => updateLine(index, "quantity", e.target.value)} type="number" min="0" step="0.01" className={input} />
            <input value={line.unitPrice} onChange={e => updateLine(index, "unitPrice", e.target.value)} type="number" min="0" step="0.01" className={input} />
            <Button type="button" variant="ghost" size="icon" onClick={() => setLines(current => current.filter((_, i) => i !== index))} aria-label="Remove line item">
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">Discount amount (N$)
          <input name="discountAmount" defaultValue="0" type="number" min="0" step="0.01" className={input} />
        </label>
        <label className="grid gap-2 text-sm font-bold">Additional charges (N$)
          <input name="additionalCharges" defaultValue="0" type="number" min="0" step="0.01" className={input} />
        </label>
        <label className="grid gap-2 text-sm font-bold">Tax rate (%)
          <input name="taxRate" defaultValue="0" type="number" min="0" max="100" step="0.01" className={input} />
        </label>
        <label className="grid gap-2 text-sm font-bold">Payment terms
          <input name="paymentTerms" placeholder="Net 30" className={input} />
        </label>
        <label className="grid gap-2 text-sm font-bold md:col-span-2">Notes
          <textarea name="notes" className={`${input} min-h-20 py-3`} />
        </label>
      </div>
      <Button disabled={saving} className="md:col-span-2">
        {saving ? "Creating..." : "Create document"}
      </Button>
    </form>
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
    <form onSubmit={submit} className="grid gap-4 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5">
      <div>
        <h2 className="font-display text-xl font-black">Record payment</h2>
        <p className="text-sm text-[color:var(--text-muted)]">A receipt is issued automatically.</p>
      </div>
      {invoices.length ? (
        <>
          <label className="grid gap-2 text-sm font-bold">Invoice
            <DashboardSelect
              value={invoiceId}
              onChange={e => setInvoiceId(e.target.value)}
              options={invoices.map(item => ({ label: item.label, value: item.id }))}
              className={input}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">Amount (N$)
            <input name="amount" required type="number" min="0.01" max={invoice?.balance} step="0.01" className={input} />
          </label>
          <label className="grid gap-2 text-sm font-bold">Method
            <DashboardSelect
              name="method"
              options={paymentMethodOptions}
              className={input}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">Reference
            <input name="reference" className={input} />
          </label>
          <label className="grid gap-2 text-sm font-bold">Payment date
            <DashboardDatePicker
              name="paidAt"
              className={input}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">Notes
            <textarea name="notes" className={`${input} min-h-20 py-3`} />
          </label>
          <Button disabled={saving} className="rounded-xl bg-[color:var(--primary)] px-5 py-3 text-sm font-bold text-white">
            {saving ? "Recording..." : "Record payment"}
          </Button>
        </>
      ) : (
        <p className="rounded-xl bg-[color:var(--surface-soft)] p-4 text-sm text-[color:var(--text-muted)]">No outstanding issued invoices.</p>
      )}
    </form>
  );
}

export function RegisterLink({ href, primary, secondary, trailing }: { href: string; primary: string; secondary: string; trailing: string }) {
  return <Link href={href} className="grid grid-cols-[1fr_auto] gap-2 border-b border-[color:var(--border-subtle)] px-4 py-3 text-sm last:border-0 hover:bg-[color:var(--surface-soft)]"><span><strong>{primary}</strong><small className="ml-2 text-[color:var(--text-muted)]">{secondary}</small></span><span className="font-semibold">{trailing}</span></Link>;
}
