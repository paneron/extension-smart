import { CSSProperties } from 'react';
import { ArrowHeadType } from 'react-flow-renderer';
import { MMELEdge } from '../serialize/interface/flowcontrolinterface';

export class EdgeContainer {
  id: string;
  source = '';
  target = '';
  type: string;
  arrowHeadType: ArrowHeadType = ArrowHeadType.ArrowClosed;
  label = '';
  data: EdgeData;

  animated = false;
  style: CSSProperties = { stroke: 'black' };

  constructor(e: MMELEdge) {
    this.id = e.id;
    if (e.from !== null && e.from.element !== null) {
      this.source = e.from.element.id;
    }
    if (e.to !== null && e.to.element !== null) {
      this.target = e.to.element.id;
    }
    if (e.description !== '') {
      this.label = conditionExtract(e.description);
    }
    this.type = e.from === e.to ? 'self' : 'normal';
    this.data = new EdgeData(e);
  }
}

function conditionExtract(l: string): string {
  if (l === 'default') {
    return l;
  } else {
    return 'condition';
  }
}

export class EdgeData {
  represent: MMELEdge;

  constructor(e: MMELEdge) {
    this.represent = e;
  }
}
