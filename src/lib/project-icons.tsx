import {
  AlertCircle, BarChart3, Boxes, BriefcaseBusiness, Building2, CheckCircle2, Clock3, Code2,
  CreditCard, Database, FileText, Globe2, Headphones, HelpCircle, LayoutDashboard, Lightbulb,
  MessageCircleMore, PackageCheck, Settings, ShieldCheck, ShoppingBag, Smartphone, Trophy,
  UserRound, Users, Workflow, Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const projectIconMap = {
  industry: BriefcaseBusiness, client: Building2, timeline: Clock3, role: UserRound, deliverables: PackageCheck,
  problem: AlertCircle, solution: Lightbulb, outcome: Trophy, products: Boxes, speed: Zap,
  enquiries: MessageCircleMore, security: ShieldCheck, catalogue: ShoppingBag, dashboard: LayoutDashboard,
  users: Users, payments: CreditCard, documents: FileText, settings: Settings, automation: Workflow,
  analytics: BarChart3, website: Globe2, mobile: Smartphone, database: Database, code: Code2,
  support: Headphones, custom: HelpCircle, auto: HelpCircle
} as const satisfies Record<string, LucideIcon>;

export type ProjectIconKey = keyof typeof projectIconMap;
export const projectIconOptions: Array<{ value: ProjectIconKey; label: string }> = [
  ["auto", "Auto"], ["catalogue", "Products / catalogue"], ["dashboard", "Dashboard"],
  ["enquiries", "Messages / enquiries"], ["security", "Security"], ["users", "Users"],
  ["payments", "Payments"], ["documents", "Documents"], ["speed", "Speed"],
  ["automation", "Automation"], ["analytics", "Analytics"], ["website", "Website"],
  ["mobile", "Mobile"], ["database", "Database"], ["code", "Code"], ["support", "Support"]
].map(([value, label]) => ({ value: value as ProjectIconKey, label }));

const rules: Array<[ProjectIconKey, string[]]> = [
  ["catalogue", ["catalogue", "catalog", "shop", "store", "e-commerce", "product"]],
  ["dashboard", ["dashboard", "admin", "management", "control panel"]],
  ["enquiries", ["enquiry", "enquiries", "message", "contact", "whatsapp", "chat"]],
  ["security", ["security", "permission", "role", "access", "protected"]],
  ["payments", ["payment", "receipt", "invoice", "quotation", "transaction"]],
  ["speed", ["fast", "faster", "speed", "performance", "quick"]],
  ["automation", ["automation", "workflow", "process", "follow-up"]],
  ["analytics", ["analytics", "report", "insight", "statistics", "tracking"]],
  ["database", ["database", "data", "centralised", "centralized", "record"]]
];

export function resolveProjectIcon(iconKey: string | undefined, text: string, section?: ProjectIconKey): LucideIcon {
  if (iconKey && iconKey !== "auto" && iconKey in projectIconMap) return projectIconMap[iconKey as ProjectIconKey];
  if (section && section in projectIconMap) return projectIconMap[section];
  const normalized = text.toLowerCase();
  const inferred = rules.find(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)))?.[0];
  return inferred ? projectIconMap[inferred] : CheckCircle2;
}
