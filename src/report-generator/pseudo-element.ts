type PseudoAttr = Record<string, string> & { className: string };

type PseudoElementConstructArgs = {
  tag: string;
  attributes?: PseudoAttr;
  children?: PseudoElement[];
  innerHTML?: string;
};

export class PseudoElement {
  private static id = 1;
  private readonly id: string;
  private readonly tag: string;
  private readonly attributes: PseudoAttr;
  private readonly children: PseudoElement[];

  public innerHTML: string = '';
  constructor(args: PseudoElementConstructArgs) {
    this.id = `el${PseudoElement.id++}`;
    const { tag, attributes = { className: '' }, children = [], innerHTML = '' } = args;
    this.tag = tag;
    this.innerHTML = innerHTML;
    this.attributes = { ...attributes };
    this.children = children;
    if (!Array.isArray(children) || children.some((c) => !c.isPE)) {
      throw new Error('Invalid children');
    }
  }

  get isPE() {
    return true;
  }

  // 生成JavaScript代码来引用这个元素
  jsRef(): string {
    return `document.getElementById('${this.id}')`;
  }

  toHTML(): string {
    const innerHTML =
      this.children.length > 0 ? this.children.map((c) => c.toHTML()).join('') : this.innerHTML;
    const attrs = Object.entries(this.attributes)
      .map(([key, value]) => {
        if (key === 'className') {
          return `class="${value}"`;
        } else {
          return `${key}="${value}"`;
        }
      })
      .join(' ');
    return `<${this.tag} id="${this.id}" ${attrs}>${innerHTML}</${this.tag}>`;
  }
}
export const h = (args: PseudoElementConstructArgs) => new PseudoElement(args);
