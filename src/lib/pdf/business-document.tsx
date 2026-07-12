import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { PdfDocumentPageBackdrop } from "@/lib/pdf/document-page-backdrop";

Font.register({ family: "Allura", src: "https://fonts.gstatic.com/s/allura/v21/9oRPNYsQpS4zAju_iwgT.ttf" });

const s = StyleSheet.create({
  page: { padding: 38, fontFamily: "Helvetica", fontSize: 9, color: "#252525" },
  row: { flexDirection: "row" },
  between: { flexDirection: "row", justifyContent: "space-between" },
  muted: { color: "#777", fontSize: 8 },
  title: { fontSize: 18, fontWeight: 700 },
  subtitle: { color: "#777", fontSize: 10, marginTop: 4 },
  bodyText: { fontSize: 9, lineHeight: 1.5, marginBottom: 4 },
  checkbox: { fontSize: 9, marginBottom: 3 },
  signature: { fontFamily: "Allura", fontSize: 22, lineHeight: 0.82, textAlign: "right", transform: "rotate(-3deg)", marginBottom: -2 },
  footer: { marginTop: 24, paddingTop: 10, borderTop: "1 solid #ded9cf", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  companyDetails: { width: "55%", color: "#777", fontSize: 7.5, lineHeight: 1.25 },
  signatureWrap: { width: 155, textAlign: "right" },
  pageNumber: { position: "absolute", bottom: 20, right: 38, fontSize: 7, color: "#999" },
  divider: { borderTop: "1 solid #ded9cf", marginVertical: 10 },
  sectionHeading: { fontSize: 11, fontWeight: 700, marginTop: 12, marginBottom: 6, color: "#333" },
  table: { marginTop: 8 },
  tableRow: { flexDirection: "row", borderBottom: "1 solid #ebe7df", paddingVertical: 4 },
  tableHeaderCell: { fontWeight: 700, fontSize: 8, width: "33.33%", paddingHorizontal: 4 },
  tableCell: { fontSize: 8, width: "33.33%", paddingHorizontal: 4 },
});

type BusinessDocPdfProps = {
  title: string;
  documentNumber: string | null;
  documentType: string;
  subject: string | null;
  recipientName: string | null;
  companyName: string | null;
  recipientEmail?: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  contentMarkdown: string;
  senderName: string | null;
  senderRole: string | null;
  baseUrl: string;
  issuerLogo?: string;
  issuerName?: string;
  issuerDetails?: string;
  issuerPhone?: string;
  issuerEmail?: string;
};

const docTypeLabels: Record<string, string> = {
  PROPOSAL: "PROPOSAL", SERVICE_AGREEMENT: "SERVICE AGREEMENT",
  WEB_DESIGN_CONTRACT: "WEB DESIGN CONTRACT", MAINTENANCE_AGREEMENT: "MAINTENANCE AGREEMENT",
  HOSTING_AGREEMENT: "HOSTING AGREEMENT", SCOPE_OF_WORK: "SCOPE OF WORK",
  PROJECT_BRIEF: "PROJECT BRIEF", CHANGE_REQUEST: "CHANGE REQUEST",
  PROJECT_HANDOVER: "PROJECT HANDOVER", CLIENT_ACCEPTANCE: "CLIENT ACCEPTANCE",
  BUSINESS_LETTER: "BUSINESS LETTER", PAYMENT_REMINDER: "PAYMENT REMINDER",
  OVERDUE_NOTICE: "OVERDUE NOTICE", MEETING_SUMMARY: "MEETING SUMMARY",
  PROGRESS_REPORT: "PROGRESS REPORT", AUDIT_REPORT: "AUDIT REPORT",
  MAINTENANCE_REPORT: "MAINTENANCE REPORT", NDA: "CONFIDENTIALITY AGREEMENT",
  CUSTOM: "DOCUMENT",
};

/** Render text with inline **bold** markers — splits into bold/normal spans */
function InlineBoldText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return (
    <Text>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <Text key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</Text>;
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

function parseLine(line: string, index: number) {
  if (line.startsWith("# ")) return <Text key={index} style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, marginTop: 4 }}>{line.slice(2)}</Text>;
  if (line.startsWith("## ")) return <Text key={index} style={{ fontSize: 12, fontWeight: 700, marginTop: 10, marginBottom: 5, color: "#333" }}>{line.slice(3)}</Text>;
  if (line.startsWith("### ")) return <Text key={index} style={{ fontSize: 10, fontWeight: 700, marginTop: 8, marginBottom: 4 }}>{line.slice(4)}</Text>;
  if (line.startsWith("---")) return <View key={index} style={s.divider} />;
  if (line.startsWith("- [ ] ")) return <Text key={index} style={s.checkbox}>☐ {line.slice(6)}</Text>;
  if (line.startsWith("- [x] ")) return <Text key={index} style={s.checkbox}>☑ {line.slice(6)}</Text>;
  if (line.startsWith("- ")) return <Text key={index} style={[s.bodyText, { paddingLeft: 12 }]}>• {line.slice(2)}</Text>;
  if (line.startsWith("| ")) return <Text key={index} style={[s.bodyText, { fontFamily: "Courier", fontSize: 8 }]}>{line}</Text>;
  if (line.trim()) return <Text key={index} style={s.bodyText}><InlineBoldText text={line} /></Text>;
  return <Text key={index} style={{ height: 6 }}> </Text>;
}

export function BusinessDocumentPdf({
  title,
  documentNumber,
  documentType,
  subject,
  recipientName,
  companyName,
  recipientEmail,
  issueDate,
  expiryDate,
  contentMarkdown,
  senderName,
  senderRole,
  baseUrl,
  issuerLogo,
  issuerName,
  issuerDetails,
  issuerPhone,
  issuerEmail,
}: BusinessDocPdfProps) {
  const lines = contentMarkdown.split("\n");
  const typeLabel = docTypeLabels[documentType] || documentType;
  const formattedIssueDate = issueDate
    ? new Date(issueDate).toLocaleDateString("en-GB")
    : new Date().toLocaleDateString("en-GB");

  return (
    <Document title={documentNumber || title}>
      <Page size="A4" style={[s.page, { backgroundColor: "#fffdf8" }]}>
        <PdfDocumentPageBackdrop baseUrl={baseUrl} />

        {/* FIRST ROW: Logo left, Contact right */}
        <View style={s.between}>
          <View>
            {issuerLogo && (
              <Image
                src={issuerLogo.startsWith("http") ? issuerLogo : `${baseUrl}${issuerLogo}`}
                style={{ width: 130, height: 45, objectFit: "contain" }}
              />
            )}
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={[s.muted, { fontSize: 7, fontWeight: 700, marginBottom: 2 }]}>CONTACT</Text>
            <Text style={{ fontSize: 8 }}>{issuerPhone || ""}</Text>
            <Text style={{ fontSize: 8 }}>{issuerEmail || ""}</Text>
          </View>
        </View>

        {/* First divider */}
        <View style={s.divider} />

        {/* SECOND ROW: TO left, DATE right */}
        <View style={s.row}>
          <View style={{ width: "50%" }}>
            <Text style={[s.muted, { fontWeight: 700 }]}>TO</Text>
            {recipientName && <Text style={{ fontSize: 9, fontWeight: 700, marginTop: 2 }}>{recipientName}</Text>}
            {companyName && <Text style={s.muted}>{companyName}</Text>}
            {recipientEmail && <Text style={s.muted}>{recipientEmail}</Text>}
          </View>
          <View style={{ width: "50%", textAlign: "right" }}>
            <Text style={[s.muted, { fontWeight: 700 }]}>DATE</Text>
            <Text style={{ fontSize: 9, marginTop: 2 }}>{formattedIssueDate}</Text>
          </View>
        </View>

        {/* THIRD AREA: Document type, title, reference */}
        <View style={{ marginTop: 14 }}>
          <Text style={[s.muted, { fontWeight: 700, marginBottom: 2 }]}>{typeLabel}</Text>
          <Text style={s.title}>{title}</Text>
          {documentNumber && <Text style={s.subtitle}>Ref: {documentNumber}</Text>}
          {subject && <Text style={[s.subtitle, { marginTop: 6, fontSize: 9 }]}>{subject}</Text>}
          {expiryDate && (
            <Text style={[s.muted, { marginTop: 4 }]}>
              Valid until: {new Date(expiryDate).toLocaleDateString("en-GB")}
            </Text>
          )}
        </View>

        {/* Second divider */}
        <View style={s.divider} />

        {/* Content */}
        <View>{lines.map((line, i) => parseLine(line, i))}</View>

        {/* Signature */}
        {senderName && (
          <View style={{ marginTop: 24, borderTop: "1 solid #ded9cf", paddingTop: 10 }}>
            <View style={s.signatureWrap}>
              <Text style={s.signature}>{senderName}</Text>
            </View>
            <Text style={[{ textAlign: "right", fontWeight: 700, fontSize: 8 }]}>{senderName}</Text>
            {senderRole && <Text style={[s.muted, { textAlign: "right" }]}>{senderRole}</Text>}
          </View>
        )}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.companyDetails}>{issuerDetails || ""}</Text>
        </View>

        {/* Page number */}
        <Text style={s.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
}
