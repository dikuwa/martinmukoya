"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { IssuerSnapshot } from "@/lib/issuer-constants";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { DashboardCheckbox } from "@/components/ui/dashboard-checkbox";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const input = "h-10 min-w-0 w-full rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--background)] px-3 text-sm font-normal outline-none focus:border-[color:var(--primary)]";
const fields: Array<[keyof IssuerSnapshot, string]> = [
  ["name", "Issuer name"], ["logo", "Logo path or URL"], ["address", "Display address"], ["phone", "Phone"],
  ["email", "Email"], ["registration", "Registration number"], ["taxNumber", "Tax number"],
  ["bankName", "Bank"], ["accountName", "Account name"], ["accountNumber", "Account number"],
  ["branch", "Branch code"], ["swiftCode", "SWIFT code"], ["signerName", "Signer name"], ["signerTitle", "Signer title"]
];

const signatureModeOptions = [
  { value: "text", label: "Generated signature text" },
  { value: "image", label: "Uploaded signature image" }
];

export function FinanceSettingsForm({ initial }: { initial: IssuerSnapshot }) {
  const [saving, setSaving] = useState(false);
  const [methods, setMethods] = useState(initial.paymentMethods.length ? initial.paymentMethods : [""]);
  const [signatureMode, setSignatureMode] = useState<"text" | "image">(initial.signatureMode || "text");
  const [signatureImage, setSignatureImage] = useState(initial.signatureImage || "");
  const [showSignature, setShowSignature] = useState(initial.showSignature);

  function moveMethod(index: number, direction: -1 | 1) {
    setMethods(current => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget;
    setSaving(true);
    const form = new FormData(formElement);
    const data = Object.fromEntries(form);
    const response = await fetch("/api/admin/finance-settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...data, paymentMethods: methods.map(item => item.trim()).filter(Boolean), signatureMode, signatureImage, showSignature })
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) return toast.error(payload.error || "Settings could not be saved");
    toast.success("Financial identity saved and applied to all existing documents");
  }

  return (
    <Card as="form" padding="lg" className="grid gap-6" onSubmit={submit}>
      <section className="grid gap-5 md:grid-cols-2">
        <h2 className="font-display text-xl font-black md:col-span-2">Company identity</h2>
        {fields.slice(0, 7).map(([name, label]) => (
          <label key={name} className="grid gap-2 text-sm font-bold">
            {label}
            <input name={name} defaultValue={String(initial[name] ?? "")} required={["name", "logo", "email"].includes(name)} className={input} />
          </label>
        ))}
        <label className="grid gap-2 text-sm font-bold md:col-span-2">
          Compact company details
          <textarea name="companyDetails" defaultValue={initial.companyDetails} placeholder="Reg. No. CC/2024/00337\nERF 234, Silver Avenue, Tamariskia, Swakopmund" className={`${input} min-h-24 py-3`} />
          <span className="text-xs font-normal text-[color:var(--text-muted)]">Shown in small grey text in the document footer.</span>
        </label>
      </section>
      <section className="grid gap-5 border-t border-[color:var(--border-subtle)] pt-6 md:grid-cols-2">
        <h2 className="font-display text-xl font-black md:col-span-2">Banking details</h2>
        {fields.slice(7, 12).map(([name, label]) => (
          <label key={name} className="grid gap-2 text-sm font-bold">
            {label}
            <input name={name} defaultValue={String(initial[name] ?? "")} className={input} />
          </label>
        ))}
      </section>
      <section className="grid gap-4 border-t border-[color:var(--border-subtle)] pt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-black">Accepted payment methods</h2>
            <p className="text-sm text-[color:var(--text-muted)]">Add, remove, and reorder the methods printed on documents.</p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => setMethods(current => [...current, ""])}>
            <Plus size={16} /> Add method
          </Button>
        </div>
        {methods.map((method, index) => (
          <div key={index} className="flex gap-2">
            <input
              aria-label={`Payment method ${index + 1}`}
              value={method}
              onChange={e => setMethods(current => current.map((item, i) => i === index ? e.target.value : item))}
              className={input}
            />
            <Button type="button" variant="ghost" size="icon" disabled={index === 0} aria-label={`Move payment method ${index + 1} up`} onClick={() => moveMethod(index, -1)}>
              <ArrowUp size={16} />
            </Button>
            <Button type="button" variant="ghost" size="icon" disabled={index === methods.length - 1} aria-label={`Move payment method ${index + 1} down`} onClick={() => moveMethod(index, 1)}>
              <ArrowDown size={16} />
            </Button>
            <Button type="button" variant="ghost" size="icon" aria-label={`Remove payment method ${index + 1}`} onClick={() => setMethods(current => current.filter((_, i) => i !== index))}>
              <Trash2 size={17} />
            </Button>
          </div>
        ))}
        <label className="grid gap-2 text-sm font-bold">
          Payment instructions
          <textarea name="paymentInstructions" defaultValue={initial.paymentInstructions} className={`${input} min-h-24 py-3`} />
        </label>
      </section>
      <section className="grid gap-5 border-t border-[color:var(--border-subtle)] pt-6 md:grid-cols-2">
        <h2 className="font-display text-xl font-black md:col-span-2">Document signature</h2>
        {fields.slice(12).map(([name, label]) => (
          <label key={name} className="grid gap-2 text-sm font-bold">
            {label}
            <input name={name} defaultValue={String(initial[name] ?? "")} required className={input} />
          </label>
        ))}
        <label className="grid gap-2 text-sm font-bold">
          Signature style
          <DashboardSelect
            value={signatureMode}
            onChange={e => setSignatureMode(e.target.value as "text" | "image")}
            options={signatureModeOptions}
            className={input}
          />
        </label>
        <DashboardCheckbox
          label="Show signature"
          checked={showSignature}
          onChange={e => setShowSignature(e.target.checked)}
        />
        {signatureMode === "image" ? (
          <div className="md:col-span-2">
            <ImageUploadField
              label="Signature image"
              folder="settings/finance-signature"
              value={signatureImage}
              onChange={setSignatureImage}
              cropAspect={false}
              placeholder="Upload a transparent PNG/WebP or paste its URL"
            />
          </div>
        ) : null}
      </section>
      <Button disabled={saving} className="rounded-xl bg-[color:var(--primary)] px-5 py-3 text-sm font-bold text-white">
        {saving ? "Saving..." : "Save financial identity"}
      </Button>
    </Card>
  );
}
