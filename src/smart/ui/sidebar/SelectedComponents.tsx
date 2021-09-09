/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { EditorDataClass, EditorModel, EditorRegistry, EditorSubprocess, getEditorDataClassById, getEditorProvisionById, getEditorRefById, getEditorRegistryById, isEditorApproval, isEditorDataClass, isEditorEgate, isEditorProcess, isEditorRegistry, isEditorSignalEvent, isEditorTimerEvent } from '../../model/editormodel';
import { EdtiorNodeWithInfoCallback } from '../../model/FlowContainer';
import { DataType } from '../../serialize/interface/baseinterface';
import { MMELEdge } from '../../serialize/interface/flowcontrolinterface';
import { MMELProvision, MMELReference } from '../../serialize/interface/supportinterface';
import { DeletableNodeTypes, EditableNodeTypes, EditAction, SelectableNodeTypes } from '../../utils/constants';
import { DescribeApproval, DescribeDC, DescribeEGate, DescribeEnd, DescribeRegistry, DescribeSignalCatch, DescribeStart, DescribeTimer } from '../common/description/ComponentDescription';
import { ProcessQuickEdit } from './processquickedit';

const NODE_DETAIL_VIEWS: Record<
  SelectableNodeTypes,
  React.FC<{
    node: EdtiorNodeWithInfoCallback;
    getRefById: (id: string) => MMELReference | null;
    getRegistryById: (id: string) => EditorRegistry | null;
    getDCById: (id: string) => EditorDataClass | null;
    getProvisionById: (id: string) => MMELProvision | null;
    getOutgoingEdgesById: (id: string) => MMELEdge[];
    setDialog?: (
      nodeType: EditableNodeTypes | DeletableNodeTypes,
      action: EditAction,
      id: string
    ) => void;
    onSubprocessClick?: (pid: string) => void;    
  }>
> = {
  [DataType.DATACLASS]: ({ node, getRefById }) =>
    isEditorDataClass(node) ? (
      <DescribeDC dc={node as EditorDataClass} getRefById={getRefById} />
    ) : (
      <></>
    ),
  [DataType.REGISTRY]: ({ node, getRefById, getDCById }) =>
    isEditorRegistry(node) ? (
      <DescribeRegistry
        reg={node}
        getRefById={getRefById}
        getDataClassById={getDCById}
      />
    ) : (
      <></>
    ),
  [DataType.STARTEVENT]: () => <DescribeStart />,
  [DataType.ENDEVENT]: ({ node, setDialog }) => (
    <DescribeEnd end={node} setDialog={setDialog} />
  ),
  [DataType.TIMEREVENT]: ({ node, setDialog }) =>
    isEditorTimerEvent(node) ? (
      <DescribeTimer timer={node} setDialog={setDialog} />
    ) : (
      <></>
    ),
  [DataType.SIGNALCATCHEVENT]: ({ node, setDialog }) =>
    isEditorSignalEvent(node) ? (
      <DescribeSignalCatch scEvent={node} setDialog={setDialog} />
    ) : (
      <></>
    ),
  [DataType.EGATE]: ({ node, setDialog, getOutgoingEdgesById }) =>
    isEditorEgate(node) ? (
      <DescribeEGate egate={node} setDialog={setDialog} getOutgoingEdgesById={getOutgoingEdgesById}/>
    ) : (
      <></>
    ),
  [DataType.APPROVAL]: ({ node, getRefById, getRegistryById, setDialog }) =>
    isEditorApproval(node) ? (
      <DescribeApproval
        app={node}
        getRefById={getRefById}
        getRegistryById={getRegistryById}
        getRoleById={node.getRoleById}
        setDialog={setDialog}
      />
    ) : (
      <></>
    ),
  [DataType.PROCESS]: ({
    node,
    getProvisionById,
    getRefById,
    setDialog,
    onSubprocessClick,
  }) =>
    isEditorProcess(node) ? (
      <ProcessQuickEdit
        process={node}
        getProvisionById={getProvisionById}
        getRefById={getRefById}
        setDialog={setDialog}
        onSubprocessClick={onSubprocessClick}
        {...node}
      />
    ) : (
      <></>
    ),
};

export const Describe: React.FC<{
  node: EdtiorNodeWithInfoCallback;
  model: EditorModel;
  setDialog?: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
  onSubprocessClick?: (pid: string) => void;
  page: EditorSubprocess;
}> = function ({ node, model, setDialog, onSubprocessClick, page }) {
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

  function getOutgoingEdgesById(id: string): MMELEdge[] {
    return Object.values(page.edges).filter(e => e.from === id);
  }

  const View = NODE_DETAIL_VIEWS[node.datatype as SelectableNodeTypes];
  return (
    <View
      node={node}
      getRefById={getRefById}
      getRegistryById={getRegistryById}
      getDCById={getDCById}
      getProvisionById={getProvisionById}
      setDialog={setDialog}
      onSubprocessClick={onSubprocessClick}
      getOutgoingEdgesById={getOutgoingEdgesById}
    />
  );
};