export type IssuerSnapshot = {
  name: string; logo: string; address: string; phone: string; email: string; registration: string;
  taxNumber: string; bankName: string; accountName: string; accountNumber: string; branch: string;
  swiftCode: string; companyDetails: string; paymentMethods: string[]; paymentInstructions: string;
  signerName: string; signerTitle: string; signatureMode: "text" | "image"; signatureImage: string; showSignature: boolean;
  physicalAddress?: string; postalAddress?: string;
  numberingScheme?: string;
};

export const defaultIssuer: IssuerSnapshot = {
  name: "FlexTech Media", logo: "/assets/backgrounds/SVG/SVG/flex-dark.svg", address: "Windhoek, Namibia",
  phone: "+264 81 227 1574", email: "info@martinmukoya.com", registration: "CC/2024/00337", taxNumber: "",
  bankName: "Standard Bank", accountName: "FlexTech Media", accountNumber: "60005541734", branch: "082172",
  swiftCode: "SBNMNANX", companyDetails: "Reg. No. CC/2024/00337\nERF 234, Silver Avenue, Tamariskia, Swakopmund",
  paymentMethods: ["Bank transfer", "Blue Wallet", "Wallet", "EasyWallet", "Cheque"],
  paymentInstructions: "Payment by bank transfer. Use the document number as your reference.",
  signerName: "Martin Mukoya", signerTitle: "Managing Director", signatureMode: "text", signatureImage: "", showSignature: true,
  numberingScheme: "QUO/INV/REC-YYYY-XXXXXXXX",
};

export const personalIssuer: IssuerSnapshot = {
  name: "Martin Mukoya", logo: "", address: "Windhoek, Namibia",
  phone: "+264 81 494 2473", email: "martinmukoya@gmail.com", registration: "", taxNumber: "",
  bankName: "", accountName: "", accountNumber: "", branch: "",
  swiftCode: "", companyDetails: "", paymentMethods: [], paymentInstructions: "",
  signerName: "Martin Mukoya", signerTitle: "", signatureMode: "text", signatureImage: "", showSignature: true,
  numberingScheme: "",
};