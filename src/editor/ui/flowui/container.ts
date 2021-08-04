import { CSSProperties } from 'react';
import { ArrowHeadType, XYPosition } from 'react-flow-renderer';
import { MMELEdge } from '../../serialize/interface/flowcontrolinterface';
import {
  MMELProvision,
  MMELReference,
  MMELRole,
} from '../../serialize/interface/supportinterface';
import {
  EditorDataClass,
  EditorModel,
  EditorNode,
  EditorRegistry,
  getEditorDataClassById,
  getEditorProvisionById,
  getEditorRefById,
  getEditorRegistryById,
  getEditorRoleById,
  isEditorData,
} from '../../model/editormodel';
import { MMELtoFlowEntries } from '../../model/state';

export interface EdgeContainer {
  id: string;
  source: string;
  target: string;
  type: string;
  arrowHeadType: ArrowHeadType.ArrowClosed;
  label: string;
  data: string;

  animated: boolean;
  style: CSSProperties;
}

export type EdtiorNodeWithInfoCallback = EditorNode & NodeCallBack;

export interface NodeCallBack {
  onProcessClick: (pageid: string, processid: string) => void;
  getRoleById: (id: string) => MMELRole | null;
  getRefById: (id: string) => MMELReference | null;
  getRegistryById: (id: string) => EditorRegistry | null;
  getDataClassById: (id: string) => EditorDataClass | null;
  getProvisionById: (id: string) => MMELProvision | null;
}

export interface NodeContainer {
  id: string;
  data: EdtiorNodeWithInfoCallback;
  type: string;
  position: XYPosition;
}

export interface DataLinkContainer {
  id: string;
  source: string;
  target: string;
  type: string;
  arrowHeadType: ArrowHeadType.ArrowClosed;
  animated: boolean;
  label: string;
  style: CSSProperties;
}

export function createEdgeContainer(e: MMELEdge): EdgeContainer {
  return {
    id: e.id,
    source: e.from,
    target: e.to,
    type: e.from === e.to ? 'self' : 'normal',
    arrowHeadType: ArrowHeadType.ArrowClosed,
    label: conditionExtract(e.condition),
    data: e.id,
    animated: false,
    style: { stroke: 'black' },
  };
}

export function createDataLinkContainer(
  s: EditorNode,
  t: EditorNode
): DataLinkContainer {
  return {
    id: s.id + '#datato#' + t.id,
    source: s.id,
    target: t.id,
    type: 'default',
    arrowHeadType: ArrowHeadType.ArrowClosed,
    animated: true,
    label: '',
    style: isEditorData(s) && isEditorData(t) ? { stroke: '#f6ab6c' } : {},
  };
}

export function createNodeContainer(
  x: EditorNode,
  pos: { x: number; y: number },
  callback: NodeCallBack
): NodeContainer {
  return {
    id: x.id,
    data: {
      ...x,
      ...callback,
    },
    type: MMELtoFlowEntries[x.datatype].flowName,
    position: pos,
  };
}

function conditionExtract(l: string): string {
  if (l === 'default' || l === '') {
    return l;
  } else {
    return 'condition';
  }
}

export function getNodeCallBack(
  model: EditorModel,
  onProcessClick: (pageid: string, processid: string) => void
): NodeCallBack {
  function getRoleById(id: string): MMELRole | null {
    return getEditorRoleById(model, id);
  }

  function getRefById(id: string): MMELReference | null {
    return getEditorRefById(model, id);
  }

  function getRegistryById(id: string): EditorRegistry | null {
    return getEditorRegistryById(model, id);
  }

  function getDCById(id: string): EditorDataClass | null {
    return getEditorDataClassById(model, id);
  }

  function getProvisionById(id: string): MMELProvision | null {
    return getEditorProvisionById(model, id);
  }

  return {
    onProcessClick: onProcessClick,
    getRoleById: getRoleById,
    getRefById: getRefById,
    getRegistryById: getRegistryById,
    getDataClassById: getDCById,
    getProvisionById: getProvisionById,
  };
}
