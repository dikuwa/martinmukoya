import "server-only";

/* eslint-disable jsx-a11y/alt-text */

import { Image, StyleSheet } from "@react-pdf/renderer";

type BackdropPosition = "top" | "bottom";

const topStyles = StyleSheet.create({
  backdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, width: "100%", height: "100%", objectFit: "contain", opacity: 0.09, objectPosition: "top center" }
});

const bottomStyles = StyleSheet.create({
  backdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, width: "100%", height: "100%", objectFit: "contain", opacity: 0.09, objectPosition: "bottom center" }
});

export function PdfDocumentPageBackdrop({ baseUrl, position = "top" }: { baseUrl: string; position?: BackdropPosition }) {
  return <Image fixed src={`${baseUrl}/assets/backgrounds/PNG/document-backdrop.png`} style={position === "bottom" ? bottomStyles.backdrop : topStyles.backdrop} />;
}
