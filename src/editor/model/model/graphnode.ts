import { Subprocess } from './flow/subprocess';

export abstract class GraphNode {
  id = '';

  isAdded = false;

  pages = new Set<Subprocess>();

  parent: Array<GraphNode> = [];

  constructor(id: string) {
    this.id = id;
  }
}
