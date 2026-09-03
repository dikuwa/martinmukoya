import { Allura } from "next/font/google";
import { formatNad } from "@/lib/financial";
import type { IssuerSnapshot } from "@/lib/issuer-constants";
import { DocumentPageBackdrop } from "@/components/documents/document-page-backdrop";
const allura=Allura({weight:"400",subsets:["latin"],display:"swap"});
type Line={id:string;description:string;category:string|null;quantity:unknown;unitPrice:unknown;amount:unknown};
export type PreviewDocument={number:string|null;type:string;status:string;customerName:string;customerEmail:string|null;customerPhone:string|null;customerCompany:string|null;customerAddress:string|null;issuerSnapshot:unknown;currency:string;validUntil:Date|null;dueDate:Date|null;discountAmount:unknown;additionalCharges:unknown;taxRate:unknown;subtotal:unknown;taxAmount:unknown;total:unknown;notes:string|null;paymentTerms:string|null;issuedAt:Date|null;createdAt:Date;booking:{number:string;projectDescription:string};lineItems:Line[];payments?:Array<{amount:unknown;reversedAt:Date|null}>;receiptForPayment?:{number:string;method:string;reference:string|null;paidAt:Date}|null;invoiceTotal?:unknown;balanceAfter?:unknown};

export function FinancialDocumentPreview({document}:{document:PreviewDocument}){
  const issuer=document.issuerSnapshot as IssuerSnapshot; const paid=document.payments?.filter(p=>!p.reversedAt).reduce((s,p)=>s+Number(p.amount),0)||Number(document.receiptForPayment?document.total:0); const balance=Math.max(0,Number(document.total)-paid);
  const methods=Array.isArray(issuer.paymentMethods)?issuer.paymentMethods:[]; const details=issuer.companyDetails||[issuer.registration&&`Reg. No. ${issuer.registration}`,issuer.taxNumber&&`Tax No. ${issuer.taxNumber}`].filter(Boolean).join("\n");
  const isReceipt=document.type==="RECEIPT";
  const invoiceTotal=Number(document.invoiceTotal||0);
  const balanceAfter=Number(document.balanceAfter||0);

  return <article className="relative isolate mx-auto w-full max-w-[900px] overflow-hidden rounded-sm border border-[#ddd8cf] bg-[#fffdf8] p-6 text-[#242424] shadow-sm [&>*:not(img)]:relative [&>*:not(img)]:z-10 md:p-10">
    <DocumentPageBackdrop />
    {document.status==="DRAFT"?<div className="pointer-events-none absolute inset-0 grid place-items-center text-7xl font-black tracking-widest text-black/[0.045] -rotate-12">DRAFT</div>:null}

    {/* Header */}
    <header className="flex flex-col gap-4 border-b border-[#ded9cf] pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <img src={issuer.logo} alt={issuer.name} className="h-10 max-w-40 object-contain object-left sm:h-14 sm:max-w-52"/>
        <p className="mt-2 text-xs text-[#777]">{issuer.address}</p>
      </div>
      <div className="shrink-0 text-left sm:text-right">
        <p className="text-xs uppercase tracking-[.2em] text-[#777]">{document.type}</p>
        <h1 className="mt-1 break-all text-xl font-extrabold sm:text-2xl">{document.number||"Draft"}</h1>
        <p className="mt-1 text-xs text-[#777]">{document.issuedAt?`Issued ${document.issuedAt.toLocaleDateString("en-GB")}`:`Created ${document.createdAt.toLocaleDateString("en-GB")}`}</p>
      </div>
    </header>

    {/* Customer / Project / Contact */}
    <section className="grid gap-5 border-b border-[#ded9cf] py-5 md:grid-cols-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#777]">Customer</p>
        <p className="mt-1 font-bold">{document.customerName}</p>
        <p className="text-xs text-[#666]">{document.customerCompany}</p>
        <p className="text-xs text-[#666]">{document.customerEmail}</p>
        <p className="text-xs text-[#666]">{document.customerPhone}</p>
      </div>
      <div className="md:text-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#777]">Project</p>
        <p className="mt-1 text-sm font-semibold">{document.booking.projectDescription}</p>
        <p className="mt-1 text-xs text-[#666]">{document.booking.number}</p>
      </div>
      <div className="md:text-right">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#777]">Contact</p>
        <p className="mt-1 text-xs">{issuer.phone}</p>
        <p className="text-xs">{issuer.email}</p>
        {document.dueDate?<p className="mt-2 text-xs font-bold">Due {document.dueDate.toLocaleDateString("en-GB")}</p>:null}
        {document.validUntil?<p className="mt-2 text-xs font-bold">Valid until {document.validUntil.toLocaleDateString("en-GB")}</p>:null}
      </div>
    </section>

    {/* Line items table */}
    <div className="mt-6 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-y border-[#ded9cf] bg-[#f6f2ea] text-xs">
          <tr>
            <th className="px-3 py-3">Description</th>
            <th className="px-3 py-3 text-right">Qty</th>
            <th className="px-3 py-3 text-right">Unit price</th>
            <th className="px-3 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {document.lineItems.map(line=>(
            <tr key={line.id} className="border-b border-[#ebe7df]">
              <td className="px-3 py-3">
                <strong>{line.description}</strong>
                {line.category?<small className="ml-2 text-[#777]">{line.category}</small>:null}
              </td>
              <td className="px-3 py-3 text-right">{String(line.quantity)}</td>
              <td className="px-3 py-3 text-right">{formatNad(String(line.unitPrice))}</td>
              <td className="px-3 py-3 text-right font-bold">{formatNad(String(line.amount))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Totals — branch for receipts vs invoices/quotes */}
    {isReceipt ? (
      <div className="ml-auto mt-4 w-full max-w-sm text-sm">
        <div className="flex justify-between py-1">
          <span>Subtotal</span>
          <span>{formatNad(String(document.subtotal))}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-[#bbb] py-2 text-base font-black">
          <span>Amount paid</span>
          <span>{formatNad(String(document.total))}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Invoice total</span>
          <span>{formatNad(String(invoiceTotal))}</span>
        </div>
        {balanceAfter > 0.001 ? (
          <div className="flex justify-between py-1 font-bold text-red-600">
            <span>Balance remaining</span>
            <span>{formatNad(String(balanceAfter))}</span>
          </div>
        ) : (
          <div className="flex justify-between py-1 font-bold text-emerald-600">
            <span>Paid in full</span>
            <span>✓</span>
          </div>
        )}
      </div>
    ) : (
      <div className="ml-auto mt-4 w-full max-w-sm text-sm">
        <div className="flex justify-between py-1">
          <span>Subtotal</span>
          <span>{formatNad(String(document.subtotal))}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Additional charges</span>
          <span>{formatNad(String(document.additionalCharges))}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Discount</span>
          <span>− {formatNad(String(document.discountAmount))}</span>
        </div>
        {Number(document.taxRate)>0?<div className="flex justify-between py-1">
          <span>Tax ({String(document.taxRate)}%)</span>
          <span>{formatNad(String(document.taxAmount))}</span>
        </div>:null}
        <div className="mt-1 flex justify-between border-t border-[#bbb] py-2 text-base font-black">
          <span>Total</span>
          <span>{formatNad(String(document.total))}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Paid</span>
          <span>{formatNad(paid)}</span>
        </div>
        <div className="flex justify-between py-1 font-bold text-[color:var(--primary)]">
          <span>Balance due</span>
          <span>{formatNad(balance)}</span>
        </div>
      </div>
    )}

    {/* Banking details / Payment info — branch for receipts */}
    {isReceipt ? (
      <section className="mt-6 rounded border border-[#ded9cf] p-3">
        <h3 className="text-[11px] font-extrabold uppercase tracking-wider">Payment details</h3>
        <dl className="mt-2 grid grid-cols-[105px_1fr] gap-x-2 text-[11px] leading-4">
          <dt>Method</dt>
          <dd>{document.receiptForPayment?.method||"—"}</dd>
          {document.receiptForPayment?.reference ? (
            <>
              <dt>Reference</dt>
              <dd>{document.receiptForPayment.reference}</dd>
            </>
          ) : null}
          <dt>Paid on</dt>
          <dd>{document.receiptForPayment?.paidAt ? new Date(document.receiptForPayment.paidAt).toLocaleDateString("en-GB") : document.issuedAt ? document.issuedAt.toLocaleDateString("en-GB") : "—"}</dd>
        </dl>
        <p className="mt-3 text-[11px] italic text-[#444]">Thank you for your payment.</p>
      </section>
    ) : (
      <section className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded border border-[#ded9cf] p-3">
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider">Banking details</h3>
          <dl className="mt-2 grid grid-cols-[105px_1fr] gap-x-2 text-[11px] leading-4">
            <dt>Account</dt><dd>{issuer.accountName||"Contact issuer"}</dd>
            <dt>Bank</dt><dd>{issuer.bankName||"—"}</dd>
            <dt>Account no.</dt><dd>{issuer.accountNumber||"Contact issuer"}</dd>
            <dt>Branch</dt><dd>{issuer.branch||"—"}</dd>
            {issuer.swiftCode?<><dt>SWIFT</dt><dd>{issuer.swiftCode}</dd></>:null}
          </dl>
        </div>
        <div className="rounded border border-[#ded9cf] p-3">
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider">Payment methods</h3>
          {methods.length?<ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] leading-4">{methods.map(method=><li key={method}>• {method}</li>)}</ul>:null}
          <p className="mt-2 text-[11px] leading-4 text-[#666]">{issuer.paymentInstructions}</p>
        </div>
      </section>
    )}

    {/* Notes / Payment terms */}
    {document.notes||document.paymentTerms ? (
      <section className="mt-4 grid gap-3 text-xs md:grid-cols-2">
        {document.notes?<div><strong>Notes</strong><p className="mt-1 whitespace-pre-wrap">{document.notes}</p></div>:null}
        {document.paymentTerms?<div><strong>Payment terms</strong><p className="mt-1 whitespace-pre-wrap">{document.paymentTerms}</p></div>:null}
      </section>
    ) : null}

    {/* Footer / Signature */}
    <footer className="mt-5 flex items-end justify-between gap-5 border-t border-[#ded9cf] pt-4">
      <p className="max-w-[55%] whitespace-pre-line text-[10px] leading-[13px] text-[#777]">{details}</p>
      {issuer.showSignature ? (
        <div className="min-w-44 text-right">
          {issuer.signatureMode==="image"&&issuer.signatureImage ? (
            <img src={issuer.signatureImage} alt={`${issuer.signerName} signature`} className="ml-auto -mb-1 h-10 w-36 -rotate-3 object-contain object-right"/>
          ) : (
            <div className={`${allura.className} -mb-1 -rotate-3 text-[23px] leading-[22px]`}>{issuer.signerName}</div>
          )}
          <p className="text-xs font-semibold">{issuer.signerName}</p>
          <p className="text-[10px] text-[#777]">{issuer.signerTitle}</p>
        </div>
      ) : null}
    </footer>
    {/* Bottom backdrop */}
    <DocumentPageBackdrop position="bottom" />
  </article>
}
