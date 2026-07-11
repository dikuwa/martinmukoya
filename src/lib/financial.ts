export type FinancialLineInput = {
  description: string;
  category?: string | null;
  quantity: string | number;
  unitPrice: string | number;
};

export type CalculatedLine = FinancialLineInput & { amount: string; sortOrder: number };

function scaledInteger(value: string | number, scale: number) {
  const normalized = String(value ?? "0").trim();
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) throw new Error(`Invalid number: ${normalized}`);
  const negative = normalized.startsWith("-");
  const [whole, fraction = ""] = normalized.replace("-", "").split(".");
  const padded = `${fraction}${"0".repeat(scale)}`.slice(0, scale);
  const result = BigInt(whole) * BigInt(10) ** BigInt(scale) + BigInt(padded || "0");
  return negative ? -result : result;
}

function roundDivide(value: bigint, divisor: bigint) {
  const negative = value < BigInt(0);
  const absolute = negative ? -value : value;
  const rounded = (absolute + divisor / BigInt(2)) / divisor;
  return negative ? -rounded : rounded;
}

function centsToString(cents: bigint) {
  const negative = cents < BigInt(0);
  const absolute = negative ? -cents : cents;
  return `${negative ? "-" : ""}${absolute / BigInt(100)}.${String(absolute % BigInt(100)).padStart(2, "0")}`;
}

export function calculateDocumentTotals(input: {
  lines: FinancialLineInput[];
  discountAmount?: string | number;
  additionalCharges?: string | number;
  taxRate?: string | number;
}) {
  if (!input.lines.length) throw new Error("At least one line item is required.");
  const lines: CalculatedLine[] = input.lines.map((line, sortOrder) => {
    if (!line.description.trim()) throw new Error("Every line item needs a description.");
    const quantity = scaledInteger(line.quantity, 3);
    const unitPrice = scaledInteger(line.unitPrice, 2);
    if (quantity <= BigInt(0) || unitPrice < BigInt(0)) throw new Error("Quantities must be positive and prices cannot be negative.");
    return { ...line, description: line.description.trim(), amount: centsToString(roundDivide(quantity * unitPrice, BigInt(1000))), sortOrder };
  });
  const subtotal = lines.reduce((sum, line) => sum + scaledInteger(line.amount, 2), BigInt(0));
  const discount = scaledInteger(input.discountAmount ?? 0, 2);
  const extras = scaledInteger(input.additionalCharges ?? 0, 2);
  const taxBasisPoints = scaledInteger(input.taxRate ?? 0, 2);
  if (discount < BigInt(0) || extras < BigInt(0) || taxBasisPoints < BigInt(0)) throw new Error("Discounts, charges, and tax cannot be negative.");
  const taxable = subtotal + extras - discount;
  if (taxable < BigInt(0)) throw new Error("Discount cannot exceed subtotal plus additional charges.");
  const tax = roundDivide(taxable * taxBasisPoints, BigInt(10000));
  return {
    lines,
    subtotal: centsToString(subtotal),
    discountAmount: centsToString(discount),
    additionalCharges: centsToString(extras),
    taxRate: centsToString(taxBasisPoints),
    taxAmount: centsToString(tax),
    total: centsToString(taxable + tax),
  };
}

export function formatNad(value: string | number) {
  return new Intl.NumberFormat("en-NA", { style: "currency", currency: "NAD", minimumFractionDigits: 2 }).format(Number(value));
}
