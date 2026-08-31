import path from "path";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { IssuerSnapshot } from "@/lib/finance-service";
import { formatNad } from "@/lib/financial";
import { PdfDocumentPageBackdrop } from "@/lib/pdf/document-page-backdrop";

Font.register({family:"Allura",src:path.join(process.cwd(),"public/fonts/Allura-Regular.ttf")});

const s=StyleSheet.create({
  page:{padding:38,fontFamily:"Helvetica",fontSize:9,color:"#252525"},
  notesSection:{marginTop:12,padding:10,border:"1 solid #ded9cf"},
  notesHeading:{fontWeight:700,fontSize:8,marginBottom:4},
  notesText:{fontSize:8,lineHeight:1.4,color:"#444"},
  row:{flexDirection:"row"},
  between:{flexDirection:"row",justifyContent:"space-between"},
  header:{borderBottom:"1 solid #d8d2c7",paddingBottom:14},
  logo:{width:130,height:45,objectFit:"contain"},
  muted:{color:"#777",fontSize:8},
  title:{fontSize:18,fontWeight:700},
  section:{paddingVertical:14,borderBottom:"1 solid #ded9cf"},
  third:{width:"33.333%"},
  right:{textAlign:"right"},
  tableHead:{flexDirection:"row",backgroundColor:"#f5f1e9",borderTop:"1 solid #ddd7cd",borderBottom:"1 solid #ddd7cd",padding:7,fontWeight:700},
  tableRow:{flexDirection:"row",borderBottom:"1 solid #ebe7df",padding:7},
  desc:{width:"52%"},
  qty:{width:"12%",textAlign:"right"},
  money:{width:"18%",textAlign:"right"},
  totals:{marginLeft:"auto",marginTop:11,width:260},
  totalRow:{flexDirection:"row",justifyContent:"space-between",paddingVertical:2.5},
  grand:{borderTop:"1 solid #aaa",marginTop:3,paddingTop:5,fontWeight:700,fontSize:11},
  box:{width:"49%",border:"1 solid #ded9cf",padding:10},
  boxHeading:{fontWeight:700,fontSize:8},
  boxText:{fontSize:8,lineHeight:1.35},
  footer:{marginTop:15,paddingTop:10,borderTop:"1 solid #ded9cf",flexDirection:"row",justifyContent:"space-between",alignItems:"flex-end"},
  companyDetails:{width:"55%",color:"#777",fontSize:7.5,lineHeight:1.25},
  signatureWrap:{width:155,textAlign:"right"},
  signature:{fontFamily:"Allura",fontSize:22,lineHeight:0.82,textAlign:"right",transform:"rotate(-3deg)",marginBottom:-2},
  signatureImage:{marginLeft:"auto",width:108,height:32,objectFit:"contain",transform:"rotate(-3deg)",marginBottom:-2},
  watermark:{position:"absolute",top:350,left:120,fontSize:70,color:"#eeeeee",transform:"rotate(-25deg)"},
  /* receipt-specific */
  receiptInfo:{marginTop:8,padding:10,border:"1 solid #ded9cf",borderRadius:3},
  receiptLabel:{fontSize:8,color:"#777",fontWeight:700},
  receiptValue:{fontSize:9,marginTop:2},
  thankYou:{marginTop:10,fontSize:9,color:"#444",fontStyle:"italic"},
});

type PdfDoc=Parameters<typeof import("@/components/admin/financial-document-preview").FinancialDocumentPreview>[0]["document"];

function asset(value:string|undefined,baseUrl:string){
  if(!value) return "";
  return value.startsWith("http")?value:`${baseUrl}${value}`;
}

export function FinancialPdf({document,baseUrl}:{document:PdfDoc;baseUrl:string}){
  const issuer=document.issuerSnapshot as IssuerSnapshot;
  const paid=document.payments?.filter(p=>!p.reversedAt).reduce((sum,p)=>sum+Number(p.amount),0)||Number(document.receiptForPayment?document.total:0);
  const balance=Math.max(0,Number(document.total)-paid);
  const methods=Array.isArray(issuer.paymentMethods)?issuer.paymentMethods:[];
  const details=issuer.companyDetails||[issuer.registration&&`Reg. No. ${issuer.registration}`,issuer.taxNumber&&`Tax No. ${issuer.taxNumber}`].filter(Boolean).join("\n");
  const isReceipt=document.type==="RECEIPT";
  const invoiceTotal=Number((document as Record<string,unknown>).invoiceTotal||0);
  const balanceAfter=Number((document as Record<string,unknown>).balanceAfter||0);

  return (
    <Document title={document.number||"Draft document"}>
      <Page size="A4" style={[s.page,{backgroundColor:"#fffdf8"}]}>
        <PdfDocumentPageBackdrop baseUrl={baseUrl}/>
        {document.status==="DRAFT"?<Text style={s.watermark}>DRAFT</Text>:null}

        {/* Header */}
        <View style={[s.header,s.between]}>
          <View>
            <Image src={asset(issuer.logo,baseUrl)} style={s.logo}/>
            <Text style={s.muted}>{issuer.address}</Text>
          </View>
          <View style={s.right}>
            <Text style={s.muted}>{document.type}</Text>
            <Text style={s.title}>{document.number||"Draft"}</Text>
            <Text style={s.muted}>{document.issuedAt?`Issued ${document.issuedAt.toLocaleDateString("en-GB")}`:"Not issued"}</Text>
          </View>
        </View>

        {/* Customer / Project / Contact */}
        <View style={[s.section,s.row]}>
          <View style={s.third}>
            <Text style={s.muted}>CUSTOMER</Text>
            <Text>{document.customerName}</Text>
            <Text style={s.muted}>{document.customerCompany}</Text>
            <Text style={s.muted}>{document.customerEmail}</Text>
          </View>
          <View style={[s.third,{textAlign:"center"}]}>
            <Text style={s.muted}>PROJECT</Text>
            <Text>{document.booking.projectDescription}</Text>
            <Text style={s.muted}>{document.booking.number}</Text>
          </View>
          <View style={[s.third,s.right]}>
            <Text style={s.muted}>CONTACT</Text>
            <Text>{issuer.phone}</Text>
            <Text>{issuer.email}</Text>
          </View>
        </View>

        {/* Line items table */}
        <View style={{marginTop:15}}>
          <View style={s.tableHead}>
            <Text style={s.desc}>Description</Text>
            <Text style={s.qty}>Qty</Text>
            <Text style={s.money}>Unit price</Text>
            <Text style={s.money}>Amount</Text>
          </View>
          {document.lineItems.map(line=>(
            <View key={line.id} style={s.tableRow}>
              <Text style={s.desc}>{line.description}</Text>
              <Text style={s.qty}>{String(line.quantity)}</Text>
              <Text style={s.money}>{formatNad(String(line.unitPrice))}</Text>
              <Text style={s.money}>{formatNad(String(line.amount))}</Text>
            </View>
          ))}
        </View>

        {/* Totals — branch for receipts vs invoices/quotes */}
        {isReceipt ? (
          <View style={s.totals}>
            <View style={s.totalRow}>
              <Text>Subtotal</Text>
              <Text>{formatNad(String(document.subtotal))}</Text>
            </View>
            <View style={[s.totalRow,s.grand]}>
              <Text>Amount paid</Text>
              <Text>{formatNad(String(document.total))}</Text>
            </View>
            <View style={s.totalRow}>
              <Text>Invoice total</Text>
              <Text>{formatNad(String(invoiceTotal))}</Text>
            </View>
            {balanceAfter > 0.001 ? (
              <View style={s.totalRow}>
                <Text style={{fontWeight:700}}>Balance remaining</Text>
                <Text style={{fontWeight:700,color:"#c00"}}>{formatNad(String(balanceAfter))}</Text>
              </View>
            ) : (
              <View style={s.totalRow}>
                <Text style={{fontWeight:700,color:"#0a7"}}>Paid in full</Text>
                <Text style={{fontWeight:700,color:"#0a7"}}>✓</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={s.totals}>
            <View style={s.totalRow}>
              <Text>Subtotal</Text>
              <Text>{formatNad(String(document.subtotal))}</Text>
            </View>
            <View style={s.totalRow}>
              <Text>Additional charges</Text>
              <Text>{formatNad(String(document.additionalCharges))}</Text>
            </View>
            <View style={s.totalRow}>
              <Text>Discount</Text>
              <Text>- {formatNad(String(document.discountAmount))}</Text>
            </View>
            {Number(document.taxRate)>0 ? (
              <View style={s.totalRow}>
                <Text>Tax ({String(document.taxRate)}%)</Text>
                <Text>{formatNad(String(document.taxAmount))}</Text>
              </View>
            ) : null}
            <View style={[s.totalRow,s.grand]}>
              <Text>Total</Text>
              <Text>{formatNad(String(document.total))}</Text>
            </View>
            <View style={s.totalRow}>
              <Text>Paid</Text>
              <Text>{formatNad(paid)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text>Balance due</Text>
              <Text>{formatNad(balance)}</Text>
            </View>
          </View>
        )}

        {/* Notes */}
        {document.notes ? (
          <View style={s.notesSection}>
            <Text style={s.notesHeading}>NOTES</Text>
            <Text style={s.notesText}>{document.notes}</Text>
          </View>
        ) : null}

        {/* Banking details / Payment info — branch for receipts */}
        {isReceipt ? (
          <View style={[s.receiptInfo,{marginTop:15}]}>
            <Text style={s.boxHeading}>PAYMENT DETAILS</Text>
            <Text style={[s.receiptValue,{marginTop:6}]}>Method: {document.receiptForPayment?.method||"—"}</Text>
            {document.receiptForPayment?.reference ? (
              <Text style={s.receiptValue}>Reference: {document.receiptForPayment.reference}</Text>
            ) : null}
            <Text style={s.receiptValue}>Paid on: {document.receiptForPayment?.paidAt ? new Date(document.receiptForPayment.paidAt).toLocaleDateString("en-GB") : document.issuedAt ? document.issuedAt.toLocaleDateString("en-GB") : "—"}</Text>
            <Text style={s.thankYou}>Thank you for your payment.</Text>
          </View>
        ) : (
          <View style={[s.row,{justifyContent:"space-between",marginTop:15}]}>
            <View style={s.box}>
              <Text style={s.boxHeading}>BANKING DETAILS</Text>
              <Text style={s.boxText}>Account: {issuer.accountName||"Contact issuer"}</Text>
              <Text style={s.boxText}>Bank: {issuer.bankName||"—"}</Text>
              <Text style={s.boxText}>Account no.: {issuer.accountNumber||"Contact issuer"}</Text>
              <Text style={s.boxText}>Branch: {issuer.branch||"—"}</Text>
              {issuer.swiftCode ? <Text style={s.boxText}>SWIFT: {issuer.swiftCode}</Text> : null}
            </View>
            <View style={s.box}>
              <Text style={s.boxHeading}>PAYMENT METHODS</Text>
              {methods.length ? <Text style={s.boxText}>{methods.map(method=>`• ${method}`).join("   ")}</Text> : null}
              <Text style={[s.boxText,{color:"#666",marginTop:4}]}>{issuer.paymentInstructions}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.companyDetails}>{details}</Text>
          {issuer.showSignature ? (
            <View style={s.signatureWrap}>
              {issuer.signatureMode==="image"&&issuer.signatureImage ? (
                <Image src={asset(issuer.signatureImage,baseUrl)} style={s.signatureImage}/>
              ) : (
                <Text style={s.signature}>{issuer.signerName}</Text>
              )}
              <Text style={[s.right,{fontWeight:700,fontSize:8}]}>{issuer.signerName}</Text>
              <Text style={[s.right,s.muted]}>{issuer.signerTitle}</Text>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
