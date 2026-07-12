export type TemplateContextValue = unknown;
export type TemplateContext = Record<string, TemplateContextValue>;

function getNestedValue(source: TemplateContext, path: string): unknown {
  return path.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, source);
}

export function resolveTemplatePlaceholders(template: string, context: TemplateContext): string {
  if (!template) return "";
  return template.replace(/{{\s*([a-zA-Z0-9_.-]+)\s*}}/g, (placeholder, key: string) => {
    const value = getNestedValue(context, key);
    if (value === undefined || value === null || value === "") return placeholder;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
    if (value instanceof Date && !Number.isNaN(value.getTime())) return formatDocumentDate(value);
    return placeholder;
  });
}

export function findUnresolvedPlaceholders(content: string): string[] {
  return [...new Set(Array.from(content.matchAll(/{{\s*([a-zA-Z0-9_.-]+)\s*}}/g), (match) => match[1]))];
}

export function formatDocumentDate(value?: string | Date | null): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

type DocumentFormValues = {
  title?: string; subject?: string; companyName?: string; recipientName?: string; recipientEmail?: string;
  recipientPhone?: string; recipientWhatsApp?: string; recipientAddress?: string; senderName?: string; senderRole?: string;
  issueDate?: string | null; expiryDate?: string | null; reviewDate?: string | null;
};

type DocumentLead = { name?: string | null; email?: string | null; company?: string | null; phone?: string | null; whatsAppNumber?: string | null; address?: string | null };
type DocumentProject = { title?: string | null; name?: string | null; description?: string | null; summary?: string | null; outcome?: string | null };
type BusinessIdentity = { name?: string | null; email?: string | null; phone?: string | null; address?: string | null };
type CurrentUser = { name?: string | null; roleTitle?: string | null };

export function buildDocumentTemplateContext(input: {
  values: DocumentFormValues; lead?: DocumentLead | null; project?: DocumentProject | null;
  business?: BusinessIdentity | null; documentReference?: string | null; currentUser?: CurrentUser | null;
}): TemplateContext {
  const { values, lead, project, business, currentUser } = input;
  const reference = input.documentReference || "";
  const issueDate = formatDocumentDate(values.issueDate);
  const expiryDate = formatDocumentDate(values.expiryDate || values.reviewDate);
  const projectName = project?.name || project?.title || values.subject || "";
  const projectDescription = project?.description || project?.summary || "";
  const projectOverview = project?.summary || project?.description || "";
  const expectedOutcome = project?.outcome || "";
  const clientName = values.recipientName || lead?.name || "";
  const clientEmail = values.recipientEmail || lead?.email || "";
  const clientCompany = values.companyName || lead?.company || "";
  const clientPhone = values.recipientPhone || lead?.phone || "";
  const clientWhatsApp = values.recipientWhatsApp || lead?.whatsAppNumber || "";
  const clientAddress = values.recipientAddress || lead?.address || "";
  const senderName = values.senderName || currentUser?.name || "";
  const senderRole = values.senderRole || currentUser?.roleTitle || "";
  const businessName = business?.name || "";

  return {
    document_title: values.title || "", document_subject: values.subject || "",
    proposal_reference: reference, document_reference: reference, issue_date: issueDate,
    expiry_date: expiryDate, review_date: expiryDate, valid_until: expiryDate,
    project_name: projectName, project_overview: projectOverview, project_objective: "", target_audience: "",
    expected_outcome: expectedOutcome, project_description: projectDescription, project_scope: "",
    client_name: clientName, client_contact_name: clientName, recipient_name: clientName,
    recipient_email: clientEmail, client_email: clientEmail, recipient_phone: clientPhone, client_phone: clientPhone,
    recipient_address: clientAddress, client_address: clientAddress,
    company: clientCompany, client_company: clientCompany, phone: clientPhone, whatsapp_number: clientWhatsApp,
    sender_name: senderName, sender_role: senderRole,
    business_name: businessName, business_email: business?.email || "", business_phone: business?.phone || "", business_address: business?.address || "",
    document: { title: values.title || "", subject: values.subject || "", reference, issue_date: issueDate, expiry_date: expiryDate, valid_until: expiryDate },
    project: { name: projectName, overview: projectOverview, objective: "", target_audience: "", expected_outcome: expectedOutcome, description: projectDescription, scope: "" },
    client: { name: clientName, contact_name: clientName, email: clientEmail, company: clientCompany, phone: clientPhone, address: clientAddress, whatsapp_number: clientWhatsApp },
    recipient: { name: clientName, email: clientEmail, company: clientCompany, phone: clientPhone, address: clientAddress, whatsapp_number: clientWhatsApp },
    sender: { name: senderName, role: senderRole },
    business: { name: businessName, email: business?.email || "", phone: business?.phone || "", address: business?.address || "" },
  };
}

export function getTemplateMarkdown(template: Record<string, unknown>): string {
  for (const key of ["defaultBodyMarkdown", "contentMarkdown", "markdown", "content", "body", "templateContent"]) {
    const value = template[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}
