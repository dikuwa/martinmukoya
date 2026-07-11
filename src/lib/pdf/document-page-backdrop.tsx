import "server-only";

/* eslint-disable jsx-a11y/alt-text */

import { Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  backdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.06 }
});

export function PdfDocumentPageBackdrop({ baseUrl }: { baseUrl: string }) {
  return <Image fixed src={`${baseUrl}/assets/backgrounds/PNG/document-backdrop.png`} style={styles.backdrop} />;
}
