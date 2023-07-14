import { DataType } from '@/interface/baseinterface';
import {
  MMELEdge,
  MMELEGate,
  MMELSubprocess,
  MMELSubprocessComponent,
} from '@/interface/flowcontrolinterface';
import { MMELremovePackage, MMELtokenizePackage } from '@/util/tokenizer';

export function parseEdge(id: string, data: string): MMELEdge {
  const edge: MMELEdge = {
    datatype    : DataType.EDGE,
    id          : id,
    from        : '',
    to          : '',
    description : '',
    condition   : '',
  };

  const t: string[] = MMELtokenizePackage(data);
  let i = 0;
  while (i < t.length) {
    const command: string = t[i++];
    if (i < t.length) {
      if (command === 'from') {
        edge.from = t[i++];
      } else if (command === 'description') {
        edge.description = MMELremovePackage(t[i++]);
      } else if (command === 'condition') {
        edge.condition = MMELremovePackage(t[i++]);
      } else if (command === 'to') {
        edge.to = t[i++];
      } else {
        throw new Error(
          'Parsing error: process flow. ID ' +
            id +
            ': Unknown keyword ' +
            command
        );
      }
    } else {
      throw new Error(
        'Parsing error: process flow. ID ' +
          id +
          ': Expecting value for ' +
          command
      );
    }
  }
  return edge;
}

export function parseSubprocess(id: string, data: string): MMELSubprocess {
  const sub: MMELSubprocess = {
    id       : id,
    childs   : {},
    edges    : {},
    data     : {},
    datatype : DataType.SUBPROCESS,
  };

  if (data !== '') {
    const t: string[] = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'elements') {
          readElements(sub, MMELremovePackage(t[i++]));
        } else if (command === 'process_flow') {
          readEdges(sub, MMELremovePackage(t[i++]));
        } else if (command === 'data') {
          readData(sub, MMELremovePackage(t[i++]));
        } else {
          throw new Error(
            'Parsing error: subprocess. ID ' +
              id +
              ': Unknown keyword ' +
              command
          );
        }
      } else {
        throw new Error(
          'Parsing error: subprocess. ID ' +
            id +
            ': Expecting value for ' +
            command
        );
      }
    }
  }
  return sub;
}

function readElements(sub: MMELSubprocess, data: string) {
  const t: string[] = MMELtokenizePackage(data);
  let i = 0;
  while (i < t.length) {
    const name: string = t[i++];
    if (i < t.length) {
      const id = name.trim();
      const nc = parseSubprocessComponent(id, t[i++]);
      sub.childs[nc.element] = nc;
    } else {
      throw new Error(
        'Parsing error: elements in subprocess. Expecting value for ' + name
      );
    }
  }
}

function readData(sub: MMELSubprocess, data: string) {
  const t: string[] = MMELtokenizePackage(data);
  let i = 0;
  while (i < t.length) {
    const name: string = t[i++];
    if (i < t.length) {
      const id = name.trim();
      const nc = parseSubprocessComponent(id, t[i++]);
      sub.data[nc.element] = nc;
    } else {
      throw new Error(
        'Parsing error: data in subprocess. Expecting value for ' + name
      );
    }
  }
}

function readEdges(sub: MMELSubprocess, data: string) {
  const t: string[] = MMELtokenizePackage(data);
  let i = 0;
  while (i < t.length) {
    const id: string = t[i++];
    if (i < t.length) {
      const edge = parseEdge(id.trim(), t[i++]);
      sub.edges[edge.id] = edge;
    } else {
      throw new Error(
        'Parsing error: edges in subprocess. Expecting value for ' + id
      );
    }
  }
}

export function parseSubprocessComponent(
  elm: string,
  data: string
): MMELSubprocessComponent {
  const com: MMELSubprocessComponent = {
    element  : elm,
    x        : 0,
    y        : 0,
    datatype : DataType.SUBPROCESSCOMPONENT,
  };

  const t: string[] = MMELtokenizePackage(data);
  let i = 0;
  while (i < t.length) {
    const command: string = t[i++];
    if (i < t.length) {
      if (command === 'x') {
        com.x = parseFloat(t[i++]);
      } else if (command === 'y') {
        com.y = parseFloat(t[i++]);
      } else {
        throw new Error(
          'Parsing error: components in subprocess. Element ' +
            elm +
            ': Unknown keyword ' +
            command
        );
      }
    } else {
      throw new Error(
        'Parsing error: edges in subprocess. Expecting value for ' + command
      );
    }
  }
  return com;
}

export function parseEGate(id: string, data: string): MMELEGate {
  const egate: MMELEGate = {
    id       : id,
    datatype : DataType.EGATE,
    label    : '',
  };
  if (data !== '') {
    const t: string[] = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'label') {
          egate.label = MMELremovePackage(t[i++]);
        } else {
          throw new Error(
            'Parsing error: Exclusive gateway. ID ' +
              id +
              ': Unknown keyword ' +
              command
          );
        }
      } else {
        throw new Error(
          'Parsing error: Exclusive gateway. ID ' +
            id +
            ': Expecting value for ' +
            command
        );
      }
    }
  }
  return egate;
}
