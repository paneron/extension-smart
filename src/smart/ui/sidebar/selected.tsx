/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { useStoreState, Elements, isNode } from 'react-flow-renderer';
import { DataType } from '../../serialize/interface/baseinterface';
import {
  MMELProvision,
  MMELReference,
} from '../../serialize/interface/supportinterface';
import { EdtiorNodeWithInfoCallback } from '../../model/FlowContainer';
import {
  EditorDataClass,
  EditorModel,
  EditorRegistry,
  getEditorDataClassById,
  getEditorProvisionById,
  getEditorRefById,
  getEditorRegistryById,
  isEditorApproval,
  isEditorDataClass,
  isEditorEgate,
  isEditorProcess,
  isEditorRegistry,
  isEditorSignalEvent,
  isEditorTimerEvent,
} from '../../model/editormodel';
import { ProcessQuickEdit } from './processquickedit';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
  SelectableNodeTypes,
} from '../../utils/constants';
import MGDSidebar from '../../MGDComponents/MGDSidebar';
import {
  DescribeApproval,
  DescribeDC,
  DescribeEGate,
  DescribeEnd,
  DescribeRegistry,
  DescribeSignalCatch,
  DescribeStart,
  DescribeTimer,
} from '../common/description/ComponentDescription';

export const SelectedNodeDescription: React.FC<{
  model: EditorModel;
  pageid: string;
  setDialog?: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
  onSubprocessClick?: (pid: string) => void;
}> = function ({ model, setDialog, onSubprocessClick, pageid }) {
  const selected = useStoreState(store => store.selectedElements);

  const elm: EdtiorNodeWithInfoCallback | null = getSelectedElement(selected);

  function getSelectedElement(
    selected: Elements<any> | null
  ): EdtiorNodeWithInfoCallback | null {
    if (selected !== null && selected.length > 0) {
      const s = selected[0];
      const page = model.pages[pageid];
      if (
        isNode(s) &&
        page !== undefined &&
        (page.childs[s.id] !== undefined || page.data[s.id] !== undefined) &&
        model.elements[s.id] !== undefined
      ) {
        return {
          ...(s.data as EdtiorNodeWithInfoCallback),
          ...model.elements[s.id],
        };
      }
    }
    return null;
  }

  return (
    <MGDSidebar>
      {elm !== null ? (
        <Describe
          node={elm}
          model={model}
          setDialog={setDialog}
          onSubprocessClick={onSubprocessClick}
        />
      ) : (
        'Nothing is selected'
      )}
    </MGDSidebar>
  );
};

const NODE_DETAIL_VIEWS: Record<
  SelectableNodeTypes,
  React.FC<{
    node: EdtiorNodeWithInfoCallback;
    getRefById: (id: string) => MMELReference | null;
    getRegistryById: (id: string) => EditorRegistry | null;
    getDCById: (id: string) => EditorDataClass | null;
    getProvisionById: (id: string) => MMELProvision | null;
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
  [DataType.EGATE]: ({ node, setDialog }) =>
    isEditorEgate(node) ? (
      <DescribeEGate egate={node} setDialog={setDialog} />
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
}> = function ({ node, model, setDialog, onSubprocessClick }) {
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
    />
  );
};
