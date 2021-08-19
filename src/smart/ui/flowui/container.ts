import { CSSProperties } from 'react';
import { XYPosition } from 'react-flow-renderer';
import { MMELEdge } from '../../serialize/interface/flowcontrolinterface';
import {
  EditorModel,
  EditorNode,
  getEditorRoleById,
  isEditorData,
  ModelType,
} from '../../model/editormodel';
import { MMELtoFlowEntries } from '../../model/state';
import { MMELRole } from '../../serialize/interface/supportinterface';

export interface EdgeContainer {
  id: string;
  source: string;
  target: string;
  type: string;
  label: string;
  data: EdgePackage;

  animated: boolean;
  style: CSSProperties;
}

export type EdtiorNodeWithInfoCallback = EditorNode & NodeCallBack;

export interface NodeCallBack {
  modelType: ModelType;
  style?: CSSProperties;
  onProcessClick: (pageid: string, processid: string) => void;
  getRoleById: (id: string) => MMELRole | null;
  setMapping: (fromid: string, toid: string) => void;
  getMapStyleById: (id: string) => CSSProperties;
  setSelectedId?: (id: string) => void;
  hasMapping?: (id: string) => boolean;
}

export interface EdgePackage {
  id: string;
  removeEdge: (id: string) => void;
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
  animated: boolean;
  label: string;
  style: CSSProperties;
}

export function createEdgeContainer(
  e: MMELEdge,
  isDelete = false,
  removeEdge: (id: string) => void = () => {}
): EdgeContainer {
  return {
    id: e.id,
    source: e.from,
    target: e.to,
    type: e.from === e.to ? 'self' : 'normal',
    label: conditionExtract(e.description),
    data: {
      id: isDelete ? e.id : '',
      removeEdge: removeEdge,
    },
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

export function getEditorNodeCallBack(props: {
  type: ModelType;
  model: EditorModel;
  onProcessClick: (pageid: string, processid: string) => void;
  setMapping?: (fromid: string, toid: string) => void;
  getMapStyleById: (id: string) => CSSProperties;
  setSelectedId?: (id: string) => void;
  hasMapping?: (id: string) => boolean;
}): NodeCallBack {
  const {
    type,
    model,
    onProcessClick,
    setMapping = () => {},
    getMapStyleById = () => ({}),
    setSelectedId,
    hasMapping,
  } = props;

  function getRoleById(id: string): MMELRole | null {
    return getEditorRoleById(model, id);
  }

  return {
    modelType: type,
    getRoleById: getRoleById,
    onProcessClick: onProcessClick,
    setMapping: setMapping,
    getMapStyleById: getMapStyleById,
    setSelectedId: setSelectedId,
    hasMapping: hasMapping,
  };
}
