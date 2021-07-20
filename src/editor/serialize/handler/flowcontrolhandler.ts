import { DataType, MMELNode } from '../interface/baseinterface';
import {
  MMELEdge,
  MMELEGate,
  MMELSubprocess,
  MMELSubprocessComponent,
  ParsingEdge,
  ParsingSubprocess,
  ParsingSubprocessComponent,
} from '../interface/flowcontrolinterface';
import { MMELremovePackage, MMELtokenizePackage } from '../util/tokenizer';

export function parseEdge(id: string, data: string): ParsingEdge {
  const edge: MMELEdge = {
    datatype: DataType.EDGE,
    id: id,
    from: null,
    to: null,
    description: '',
    condition: '',
  };
  const container: ParsingEdge = {
    content: edge,
    p_from: '',
    p_to: '',
  };

  const t: Array<string> = MMELtokenizePackage(data);
  let i = 0;
  while (i < t.length) {
    const command: string = t[i++];
    if (i < t.length) {
      if (command === 'from') {
        container.p_from = t[i++];
      } else if (command === 'description') {
        edge.description = MMELremovePackage(t[i++]);
      } else if (command === 'condition') {
        edge.condition = MMELremovePackage(t[i++]);
      } else if (command === 'to') {
        container.p_to = t[i++];
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
  return container;
}

export function resolveEdge(
  container: ParsingEdge,
  idreg: Map<string, MMELSubprocessComponent>
): MMELEdge {
  const edge = container.content;
  let x = idreg.get(container.p_from);
  if (x !== undefined) {
    edge.from = x;
  } else {
    throw new Error('Error in resolving IDs in from for egde ' + edge.id);
  }
  x = idreg.get(container.p_to);
  if (x !== undefined) {
    edge.to = x;
  } else {
    throw new Error('Error in resolving IDs in to for egde ' + edge.id);
  }
  return edge;
}

export function parseSubprocess(id: string, data: string): ParsingSubprocess {
  const sub: MMELSubprocess = {
    id: id,
    childs: [],
    edges: [],
    data: [],
    datatype: DataType.SUBPROCESS,
  };
  const container: ParsingSubprocess = {
    content: sub,
    p_childs: [],
    p_data: [],
    p_edges: [],
    map: new Map<string, MMELSubprocessComponent>(),
  };

  if (data !== '') {
    const t: Array<string> = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'elements') {
          readElements(container, MMELremovePackage(t[i++]));
        } else if (command === 'process_flow') {
          readEdges(container, MMELremovePackage(t[i++]));
        } else if (command === 'data') {
          readData(container, MMELremovePackage(t[i++]));
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
  return container;
}

function readElements(sub: ParsingSubprocess, data: string) {
  const t: Array<string> = MMELtokenizePackage(data);
  let i = 0;
  while (i < t.length) {
    const name: string = t[i++];
    if (i < t.length) {
      const id = name.trim();
      const nc = parseSubprocessComponent(id, t[i++]);
      sub.p_childs.push(nc);
      sub.map.set(id, nc.content);
    } else {
      throw new Error(
        'Parsing error: elements in subprocess. Expecting value for ' + name
      );
    }
  }
}

function readData(sub: ParsingSubprocess, data: string) {
  const t: Array<string> = MMELtokenizePackage(data);
  let i = 0;
  while (i < t.length) {
    const name: string = t[i++];
    if (i < t.length) {
      const id = name.trim();
      const nc = parseSubprocessComponent(id, t[i++]);
      sub.p_data.push(nc);
      sub.map.set(id, nc.content);
    } else {
      throw new Error(
        'Parsing error: data in subprocess. Expecting value for ' + name
      );
    }
  }
}

function readEdges(sub: ParsingSubprocess, data: string) {
  const t: Array<string> = MMELtokenizePackage(data);
  let i = 0;
  while (i < t.length) {
    const id: string = t[i++];
    if (i < t.length) {
      sub.p_edges.push(parseEdge(id.trim(), t[i++]));
    } else {
      throw new Error(
        'Parsing error: edges in subprocess. Expecting value for ' + id
      );
    }
  }
}

export function resolveSubprocess(
  container: ParsingSubprocess,
  idreg: Map<string, MMELNode>
): MMELSubprocess {
  const sub: MMELSubprocess = container.content;
  container.p_childs.forEach(x => {
    sub.childs.push(resolveSubprocessComponent(x, idreg));
  });
  container.p_edges.forEach(x => sub.edges.push(resolveEdge(x, container.map)));
  container.p_data.forEach(x => {
    sub.data.push(resolveSubprocessComponent(x, idreg));
  });
  return sub;
}

export function parseSubprocessComponent(
  elm: string,
  data: string
): ParsingSubprocessComponent {
  const com: MMELSubprocessComponent = {
    element: null,
    x: 0,
    y: 0,
    datatype: DataType.SUBPROCESSCOMPONENT,
  };
  const container: ParsingSubprocessComponent = {
    content: com,
    p_element: elm,
  };

  const t: Array<string> = MMELtokenizePackage(data);
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
  return container;
}

export function resolveSubprocessComponent(
  container: ParsingSubprocessComponent,
  idreg: Map<string, MMELNode>
): MMELSubprocessComponent {
  const com: MMELSubprocessComponent = container.content;
  const x = idreg.get(container.p_element);
  if (x !== undefined) {
    com.element = x;
  } else {
    throw new Error(
      'Error in resolving IDs in from for graph node ' + container.p_element
    );
  }
  return com;
}

export function parseEGate(id: string, data: string): MMELEGate {
  const egate: MMELEGate = {
    id: id,
    datatype: DataType.EGATE,
    label: '',
  };
  if (data !== '') {
    const t: Array<string> = MMELtokenizePackage(data);
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
