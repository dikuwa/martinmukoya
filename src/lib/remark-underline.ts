type MarkdownNode = {
  type: string;
  value?: string;
  data?: { hName?: string };
  children?: MarkdownNode[];
};

/** Render the editor's small, controlled <u>...</u> output as a real element. */
export function remarkUnderline() {
  return (tree: unknown) => {
    const visit = (node: MarkdownNode) => {
      const children = node.children;
      if (!children) return;

      for (let index = 0; index < children.length; index += 1) {
        if (children[index]?.type === "html" && children[index]?.value?.toLowerCase() === "<u>") {
          const closeIndex = children.findIndex((child, candidate) => candidate > index && child.type === "html" && child.value?.toLowerCase() === "</u>");
          if (closeIndex > index) {
            const underlined: MarkdownNode = { type: "underline", data: { hName: "u" }, children: children.slice(index + 1, closeIndex) };
            children.splice(index, closeIndex - index + 1, underlined);
          }
        }
        visit(children[index]);
      }
    };
    visit(tree as MarkdownNode);
  };
}
