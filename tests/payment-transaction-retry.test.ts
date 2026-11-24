import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { Prisma } from "../src/generated/prisma/client";

const code = ts.transpileModule(readFileSync("src/lib/payment-transaction.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

for (const [kind, failures, attempts] of [
  ["TransactionWriteConflict", 1, 2],
  ["TransactionWriteConflict", 3, 3],
  ["DatabaseAccessDenied", 1, 1],
] as const) {
  test(`commit error ${kind} after ${failures} failure(s) uses ${attempts} transaction(s)`, async () => {
    const error = Object.assign(new Error(kind, { cause: { kind } }), { name: "DriverAdapterError" });
    let calls = 0;
    const db = { async $transaction(operation: () => Promise<number>) {
      const result = await operation();
      if (++calls <= failures) throw error;
      return result;
    } };
    const exports = {} as typeof import("../src/lib/payment-transaction");
    vm.runInNewContext(code, { exports, Error, require: (name: string) =>
      name === "@/lib/db" ? { db } : { Prisma },
    });
    const result = exports.runPaymentTransaction(async () => calls + 1);
    if (attempts > failures) assert.equal(await result, attempts);
    else await assert.rejects(result, (caught: unknown) => caught === error);
    assert.equal(calls, attempts);
  });
}
