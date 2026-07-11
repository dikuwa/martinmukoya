import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { PdfDocumentPageBackdrop } from "@/lib/pdf/document-page-backdrop";

Font.register({ family: "Allura", src: "https://fonts.gstatic.com/s/allura/v21/9oRPNYsQpS4zAju_iwgT.ttf" });

const s = StyleSheet.create({
  page: { padding: 38, fontFamily: "Helvetica", fontSize: 9, color: "#252525" },
  row: { flexDirection: "row" },
  between: { flexDirection: "row", justifyContent: "space-between" },
  header: { borderBottom: "1 solid #d8d2c7", paddingBottom: 14, marginBottom: 14 },
  muted: { color: "#777", fontSize: 8 },
  title: { fontSize: 18, fontWeight: 700 },
  subtitle: { color: "#777", fontSize: 10, marginTop: 4 },
  sectionHeading: { fontSize: 11, fontWeight: 700, marginTop: 12, marginBottom: 6, color: "#333" },
  bodyText: { fontSize: 9, lineHeight: 1.5, marginBottom: 4 },
  clause: { fontSize: 9, lineHeight: 1.5, marginBottom: 6, paddingLeft: 10 },
  table: { marginTop: 8 },
  tableRow: { flexDirection: "row", borderBottom: "1 solid #ebe7df", paddingVertical: 4 },
  tableHeaderCell: { fontWeight: 700, fontSize: 8, width: "33.33%", paddingHorizontal: 4 },
  tableCell: { fontSize: 8, width: "33.33%", paddingHorizontal: 4 },
  checkbox: { fontSize: 9, marginBottom: 3 },
  signature: { fontFamily: "Allura", fontSize: 22, lineHeight: 0.82, textAlign: "right", transform: "rotate(-3deg)", marginBottom: -2 },
  footer: { marginTop: "auto", paddingTop: 10, borderTop: "1 solid #ded9cf", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  companyDetails: { width: "55%", color: "#777", fontSize: 7.5, lineHeight: 1.25 },
  signatureWrap: { width: 155, textAlign: "right" },
  pageNumber: { position: "absolute", bottom: 20, right: 38, fontSize: 7, color: "#999" },
  horizontalRule: { borderTop: "1 solid #ddd", marginVertical: 8 },
});

type BusinessDocPdfProps = {
  title: string;
  documentNumber: string | null;
  documentType: string;
  subject: string | null;
  recipientName: string | null;
  companyName: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  contentMarkdown: string;
  senderName: string | null;
  senderRole: string | null;
  baseUrl: string;
  issuerLogo?: string;
  issuerName?: string;
  issuerDetails?: string;
};

function parseLine(line: string, index: number) {
  if (line.startsWith("# ")) return <Text key={index} style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, marginTop: 4 }}>{line.slice(2)}</Text>;
  if (line.startsWith("## ")) return <Text key={index} style={{ fontSize: 12, fontWeight: 700, marginTop: 10, marginBottom: 5, color: "#333" }}>{line.slice(3)}</Text>;
  if (line.startsWith("### ")) return <Text key={index} style={{ fontSize: 10, fontWeight: 700, marginTop: 8, marginBottom: 4 }}>{line.slice(4)}</Text>;
  if (line.startsWith("---")) return <View key={index} style={s.horizontalRule} />;
  if (line.startsWith("- [ ] ")) return <Text key={index} style={s.checkbox}>☐ {line.slice(6)}</Text>;
  if (line.startsWith("- [x] ")) return <Text key={index} style={s.checkbox}>☑ {line.slice(6)}</Text>;
  if (line.startsWith("- ")) return <Text key={index} style={[s.bodyText, { paddingLeft: 12 }]}>• {line.slice(2)}</Text>;
  if (line.startsWith("| ")) return <Text key={index} style={[s.bodyText, { fontFamily: "Courier", fontSize: 8 }]}>{line}</Text>;
  if (line.startsWith("**") && line.endsWith("**")) return <Text key={index} style={{ fontSize: 9, fontWeight: 700, marginBottom: 4 }}>{line.slice(2, -2)}</Text>;
  if (line.trim()) return <Text key={index} style={s.bodyText}>{line}</Text>;
  return <Text key={index} style={{ height: 6 }}> </Text>;
}

export function BusinessDocumentPdf({
  title,
  documentNumber,
  documentType,
  subject,
  recipientName,
  companyName,
  issueDate,
  expiryDate,
  contentMarkdown,
  senderName,
  baseUrl,
  issuerLogo,
  issuerName,
  issuerDetails,
}: BusinessDocPdfProps) {
  const lines = contentMarkdown.split("\n");
  const typeLabel = (documentType || "").replace(/_/g, " ").toLowerCase();

  return (
    <Document title={documentNumber || title}>
      <Page size="A4" style={[s.page, { backgroundColor: "#fffdf8" }]}>
        <PdfDocumentPageBackdrop baseUrl={baseUrl} />

        {/* Header */}
        <View style={s.header}>
          <View style={s.between}>
            <View>
              {issuerLogo && (
                <Image
                  src={issuerLogo.startsWith("http") ? issuerLogo : `${baseUrl}${issuerLogo}`}
                  style={{ width: 130, height: 45, objectFit: "contain" }}
                />
              )}
              <Text style={s.muted}>{issuerName || "FlexTech Media"}</Text>
            </View>
            <View style={{ textAlign: "right" }}>
              <Text style={s.muted}>{typeLabel.toUpperCase()}</Text>
              <Text style={s.title}>{title}</Text>
              {documentNumber && <Text style={s.subtitle}>Ref: {documentNumber}</Text>}
            </View>
          </View>
          <View style={[s.row, { marginTop: 10, gap: 20 }]}>
            {recipientName && (
              <View>
                <Text style={s.muted}>TO</Text>
                <Text style={{ fontSize: 9 }}>{recipientName}</Text>
                {companyName && <Text style={s.muted}>{companyName}</Text>}
              </View>
            )}
            <View>
              <Text style={s.muted}>DATE</Text>
              <Text style={{ fontSize: 9 }}>{issueDate ? new Date(issueDate).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")}</Text>
              {expiryDate && (
                <>
                  <Text style={[s.muted, { marginTop: 4 }]}>VALID UNTIL</Text>
                  <Text style={{ fontSize: 9 }}>{new Date(expiryDate).toLocaleDateString("en-GB")}</Text>
                </>
              )}
            </View>
          </View>
          {subject && <Text style={[s.subtitle, { marginTop: 8 }]}>{subject}</Text>}
        </View>

        {/* Content */}
        <View>{lines.map((line, i) => parseLine(line, i))}</View>

        {/* Signature */}
        {senderName && (
          <View style={{ marginTop: 24, borderTop: "1 solid #ded9cf", paddingTop: 10 }}>
            <Text style={s.signature}>{senderName}</Text>
            <Text style={[{ textAlign: "right", fontWeight: 700, fontSize: 8 }]}>{senderName}</Text>
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
