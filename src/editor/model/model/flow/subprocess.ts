import { GraphNode } from '../graphnode';
import * as tokenizer from '../../util/tokenizer';
import { IDRegistry } from '../../util/IDRegistry';
import { Edge } from './edge';
import { StartEvent } from '../event/startevent';

export class Subprocess {
  id = '';
  childs: Array<SubprocessComponent> = [];
  edges: Array<Edge> = [];
  data: Array<SubprocessComponent> = [];

  map = new Map<string, SubprocessComponent>();
  start: SubprocessComponent | null = null;

  constructor(id: string, data: string) {
    this.id = id;
    if (data != '') {
      const t: Array<string> = tokenizer.tokenizePackage(data);
      let i = 0;
      while (i < t.length) {
        const command: string = t[i++];
        if (i < t.length) {
          if (command == 'elements') {
            this.readElements(tokenizer.removePackage(t[i++]));
          } else if (command == 'process_flow') {
            this.readEdges(tokenizer.removePackage(t[i++]));
          } else if (command == 'data') {
            this.readData(tokenizer.removePackage(t[i++]));
          } else {
            console.error(
              'Parsing error: subprocess. ID ' +
                id +
                ': Unknown keyword ' +
                command
            );
          }
        } else {
          console.error(
            'Parsing error: subprocess. ID ' +
              id +
              ': Expecting value for ' +
              command
          );
        }
      }
    }
  }

  readElements(data: string) {
    const t: Array<string> = tokenizer.tokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const name: string = t[i++];
      if (i < t.length) {
        const id = name.trim();
        const nc = new SubprocessComponent(id, t[i++]);
        this.childs.push(nc);
        this.map.set(id, nc);
      } else {
        console.error(
          'Parsing error: elements in subprocess. Expecting value for ' + name
        );
      }
    }
  }

  readData(data: string) {
    const t: Array<string> = tokenizer.tokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const name: string = t[i++];
      if (i < t.length) {
        const id = name.trim();
        const nc = new SubprocessComponent(id, t[i++]);
        this.data.push(nc);
        this.map.set(id, nc);
      } else {
        console.error(
          'Parsing error: data in subprocess. Expecting value for ' + name
        );
      }
    }
  }

  readEdges(data: string) {
    const t: Array<string> = tokenizer.tokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const id: string = t[i++];
      if (i < t.length) {
        this.edges.push(new Edge(id.trim(), t[i++]));
      } else {
        console.error(
          'Parsing error: edges in subprocess. Expecting value for ' + id
        );
      }
    }
  }

  resolve(idreg: IDRegistry): void {
    this.childs.forEach(x => {
      x.resolve(idreg);
      if (x.element instanceof StartEvent) {
        this.start = x;
      }
      if (x.element != null) {
        x.element.pages.add(this);
      }
    });
    this.edges.forEach(x => x.resolve(this.map));
    this.data.forEach(x => {
      x.resolve(idreg);
      if (x.element != null) {
        x.element.pages.add(this);
      }
    });
  }

  toModel(): string {
    let out: string = 'subprocess ' + this.id + ' {\n';
    out += '  elements {\n';
    this.childs.forEach(x => {
      out += x.toModel();
    });
    out += '  }\n';
    out += '  process_flow {\n';
    this.edges.forEach(e => {
      out += e.toModel();
    });
    out += '  }\n';
    out += '  data {\n';
    this.data.forEach(d => {
      out += d.toModel();
    });
    out += '  }\n';
    out += '}\n';
    return out;
  }
}

export class SubprocessComponent {
  element: GraphNode | null = null;
  x = 0;
  y = 0;

  elmtext = '';

  child: Array<Edge> = [];
  parent: Array<GraphNode> = [];

  isDone = false;

  constructor(elm: string, data: string) {
    this.elmtext = elm;
    const t: Array<string> = tokenizer.tokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command == 'x') {
          this.x = parseFloat(t[i++]);
        } else if (command == 'y') {
          this.y = parseFloat(t[i++]);
        } else {
          console.error(
            'Parsing error: components in subprocess. Element ' +
              elm +
              ': Unknown keyword ' +
              command
          );
        }
      } else {
        console.error(
          'Parsing error: edges in subprocess. Expecting value for ' + command
        );
      }
    }
  }

  resolve(idreg: IDRegistry) {
    const x = idreg.getObject(this.elmtext);
    if (x instanceof GraphNode) {
      this.element = x;
    } else {
      console.error(
        'Error in resolving IDs in from for graph node ' + this.elmtext
      );
    }
  }

  toModel(): string {
    if (this.element == null) {
      return '';
    }
    let out: string = '    ' + this.element.id + ' {\n';
    out += '      x ' + this.x + '\n';
    out += '      y ' + this.y + '\n';
    out += '    }\n';
    return out;
  }
}
