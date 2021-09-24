import { XYPosition } from 'react-flow-renderer';
import { MMELEdge } from '../serialize/interface/flowcontrolinterface';
import {
  EditorModel,
  EditorNode,
  getEditorRoleById,
  isEditorData,
  ModelType,
} from './editormodel';
import { MMELtoFlowEntries } from './States';
import { MMELRole } from '../serialize/interface/supportinterface';
import { SerializedStyles } from '@emotion/react';
import React from 'react';

export interface EdgeContainer {
  id: string;
  source: string;
  target: string;
  type: string;
  data: EdgePackage;
  animated: boolean;
}

export interface EdgePackage {
  id: string;
  condition: string;
  removeEdge: (id: string) => void;
  getColor?: (id: string) => string;
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
  getStyleClassById?: (id: string) => SerializedStyles;
  getSVGColorById?: (id: string) => string;
  setSelectedId?: (id: string) => void;
  hasMapping?: (id: string) => boolean;
  ComponentShortDescription?: React.FC<{ id: string }>;
  MappingList?: React.FC<{ id: string }>;
  onDataWorkspaceActive?: (id: string) => void;
  NodeAddon?: React.FC<{ id: string }>;
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
  removeEdge: (id: string) => void = () => {},
  getEdgeColor?: (id: string) => string,
  isAnimated?: (id: string) => boolean
): EdgeContainer {
  return {
    id: e.id,
    source: e.from,
    target: e.to,
    type: e.from === e.to ? 'self' : 'normal',
    data: {
      id: isDelete ? e.id : '',
      condition: e.description,
      removeEdge: removeEdge,
      getColor: getEdgeColor,
    },
    animated: isAnimated !== undefined ? isAnimated(e.id) : false,
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

export function getEditorNodeCallBack(props: {
  type: ModelType;
  model: EditorModel;
  onProcessClick: (pageid: string, processid: string) => void;
  setMapping?: (fromid: string, toid: string) => void;
  getStyleClassById?: (id: string) => SerializedStyles;
  setSelectedId?: (id: string) => void;
  hasMapping?: (id: string) => boolean;
  ComponentShortDescription?: React.FC<{ id: string }>;
  MappingList?: React.FC<{ id: string }>;
  getSVGColorById?: (id: string) => string;
  onDataWorkspaceActive?: (id: string) => void;
  NodeAddon?: React.FC<{ id: string }>;
}): NodeCallBack {
  const {
    type,
    model,
    onProcessClick,
    setMapping = () => {},
    getStyleClassById,
    getSVGColorById,
    setSelectedId,
    hasMapping,
    ComponentShortDescription,
    MappingList,
    onDataWorkspaceActive,
    NodeAddon,
  } = props;

  function getRoleById(id: string): MMELRole | null {
    return getEditorRoleById(model, id);
  }

  return {
    modelType: type,
    getRoleById,
    onProcessClick,
    setMapping,
    getStyleClassById,
    getSVGColorById,
    setSelectedId,
    hasMapping,
    ComponentShortDescription,
    MappingList,
    onDataWorkspaceActive,
    NodeAddon,
  };
}
