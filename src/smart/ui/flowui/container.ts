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
import { SerializedStyles } from '@emotion/react';

export interface EdgeContainer {
  id: string;
  source: string;
  target: string;
  type: string;
  data: EdgePackage;
  animated: boolean;
  label: string;
}

export interface EdgePackage {
  id: string;
  removeEdge: (id: string) => void;
}

export interface DataLinkContainer {
  id: string;
  source: string;
  target: string;
  data: DataLinkNodeData;
  type: string;
  animated: boolean;
}

export interface DataLinkNodeData {
  isLinkBetweenData: boolean;
}

export type EdtiorNodeWithInfoCallback = EditorNode & NodeCallBack;

export interface NodeCallBack {
  modelType: ModelType;
  onProcessClick: (pageid: string, processid: string) => void;
  getRoleById: (id: string) => MMELRole | null;
  setMapping: (fromid: string, toid: string) => void;
  getMapStyleClassById?: (id: string) => SerializedStyles;
  setSelectedId?: (id: string) => void;
  hasMapping?: (id: string) => boolean;
}

export interface NodeContainer {
  id: string;
  data: EdtiorNodeWithInfoCallback;
  type: string;
  position: XYPosition;
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
    type: 'datalink',
    animated: true,
    data: {
      isLinkBetweenData: isEditorData(s) && isEditorData(t),
    },
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
  getMapStyleClassById?: (id: string) => SerializedStyles;
  setSelectedId?: (id: string) => void;
  hasMapping?: (id: string) => boolean;
}): NodeCallBack {
  const {
    type,
    model,
    onProcessClick,
    setMapping = () => {},
    getMapStyleClassById,
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
    getMapStyleClassById: getMapStyleClassById,
    setSelectedId: setSelectedId,
    hasMapping: hasMapping,
  };
}
