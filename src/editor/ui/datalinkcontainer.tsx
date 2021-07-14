import { CSSProperties } from 'react';
import { ArrowHeadType } from 'react-flow-renderer';
import { DataType, MMELNode } from '../serialize/interface/baseinterface';

export class DataLinkContainer {
  id: string;
  source = '';
  target = '';
  type = 'default';
  arrowHeadType: ArrowHeadType = ArrowHeadType.ArrowClosed;
  animated = true;
  label = '';
  style: CSSProperties = {};
  isHidden = false;

  constructor(s: MMELNode, t: MMELNode) {
    this.id = s.id + '#datato#' + t.id;
    this.source = s.id;
    this.target = t.id;
    if (isData(s) && isData(t)) {
      this.style.stroke = '#f6ab6c';
    }
  }
}

function isData(x: MMELNode): boolean {
  return x.datatype == DataType.DATACLASS || x.datatype == DataType.REGISTRY;
}
