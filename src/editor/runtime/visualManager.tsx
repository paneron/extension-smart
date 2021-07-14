import { MMELNode } from '../serialize/interface/baseinterface';

export class VisualManager {
  added: Set<MMELNode> = new Set<MMELNode>();

  reset() {
    this.added.clear();
  }

  add(x: MMELNode) {
    this.added.add(x);
  }

  has(x: MMELNode): boolean {
    return this.added.has(x);
  }
}
