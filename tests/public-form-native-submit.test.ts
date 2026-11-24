import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const forms = [
  "src/components/public/contact-form.tsx",
  "src/components/public/start-project-wizard.tsx",
];

for (const path of forms) {
  test(`${path} never submits public enquiry fields through native GET`, () => {
    const source = readFileSync(path, "utf8");
    const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const elements: ts.JsxOpeningLikeElement[] = [];

    function walk(node: ts.Node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) elements.push(node);
      ts.forEachChild(node, walk);
    }
    walk(ast);

    const formsFound = elements.filter((node) => node.tagName.getText(ast) === "form");
    assert.equal(formsFound.length, 1, "expected one protected public enquiry form");

    for (const node of formsFound) {
      const method = node.attributes.properties.find(
        (attr): attr is ts.JsxAttribute => ts.isJsxAttribute(attr) && attr.name.getText(ast) === "method"
      );
      assert.ok(method?.initializer && ts.isStringLiteral(method.initializer));
      assert.equal(method.initializer.text.toLowerCase(), "post");
    }
  });

  test(`${path} keeps native submit unavailable before hydration`, () => {
    const source = readFileSync(path, "utf8");
    const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    assert.match(source, /const \[hydrated, setHydrated\] = useState\(false\)/);
    assert.match(source, /useEffect\(\(\) => setHydrated\(true\), \[\]\)/);
    let submitButtons = 0;

    function walk(node: ts.Node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        if (node.tagName.getText(ast) === "Button") {
          const type = node.attributes.properties.find(
            (attr): attr is ts.JsxAttribute => ts.isJsxAttribute(attr) && attr.name.getText(ast) === "type"
          );
          if (type?.initializer && ts.isStringLiteral(type.initializer) && type.initializer.text === "submit") {
            submitButtons++;
            const disabled = node.attributes.properties.find(
              (attr): attr is ts.JsxAttribute => ts.isJsxAttribute(attr) && attr.name.getText(ast) === "disabled"
            );
            assert.ok(disabled?.initializer);
            assert.match(disabled.initializer.getText(ast), /!hydrated/);
          }
        }
      }
      ts.forEachChild(node, walk);
    }
    walk(ast);
    assert.ok(submitButtons > 0, "no submit buttons were checked");
  });
}
