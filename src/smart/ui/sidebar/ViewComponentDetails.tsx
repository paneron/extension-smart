/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import {
  EditorDataClass,
  EditorModel,
  EditorRegistry,
  EditorSubprocess,
  getEditorDataClassById,
  getEditorNoteById,
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
import { EditorNodeWithInfoCallback } from '../../model/FlowContainer';
import { DataType } from '../../serialize/interface/baseinterface';
import { MMELDataAttribute } from '../../serialize/interface/datainterface';
import { MMELEdge } from '../../serialize/interface/flowcontrolinterface';
import {
  MMELNote,
  MMELProvision,
  MMELReference,
} from '../../serialize/interface/supportinterface';
import { SelectableNodeTypes } from '../../utils/constants';
import { DescribeApproval } from '../common/description/approval';
import {
  DescribeEGate,
  DescribeEnd,
  DescribeSignalCatch,
  DescribeStart,
  DescribeTimer,
} from '../common/description/ComponentDescription';
import { DescribeDC, DescribeRegistry } from '../common/description/data';
import { DescribeProcess } from '../common/description/process';

const NODE_DETAIL_VIEWS: Record<
  SelectableNodeTypes,
  React.FC<{
    node: EditorNodeWithInfoCallback;
    getRefById: (id: string) => MMELReference | null;
    getRegistryById: (id: string) => EditorRegistry | null;
    getDCById: (id: string) => EditorDataClass | null;
    getProvisionById: (id: string) => MMELProvision | null;
    getNoteById: (id: string) => MMELNote | null;
    getOutgoingEdgesById: (id: string) => MMELEdge[];
    CustomAttribute?: React.FC<{
      att: MMELDataAttribute;
      getRefById?: (id: string) => MMELReference | null;
      dcid: string;
    }>;
    CustomProvision?: React.FC<{
      provision: MMELProvision;
      getRefById?: (id: string) => MMELReference | null;
    }>;
  }>
> = {
  [DataType.DATACLASS]: ({ node, getRefById, CustomAttribute }) =>
    isEditorDataClass(node) ? (
      <DescribeDC
        dc={node as EditorDataClass}
        getRefById={getRefById}
        CustomAttribute={CustomAttribute}
      />
    ) : (
      <></>
    ),
  [DataType.REGISTRY]: ({ node, getRefById, getDCById, CustomAttribute }) =>
    isEditorRegistry(node) ? (
      <DescribeRegistry
        reg={node}
        getRefById={getRefById}
        getDataClassById={getDCById}
        CustomAttribute={CustomAttribute}
      />
    ) : (
      <></>
    ),
  [DataType.STARTEVENT]: () => <DescribeStart />,
  [DataType.ENDEVENT]: () => <DescribeEnd />,
  [DataType.TIMEREVENT]: ({ node }) =>
    isEditorTimerEvent(node) ? <DescribeTimer timer={node} /> : <></>,
  [DataType.SIGNALCATCHEVENT]: ({ node }) =>
    isEditorSignalEvent(node) ? <DescribeSignalCatch scEvent={node} /> : <></>,
  [DataType.EGATE]: ({ node, getOutgoingEdgesById }) =>
    isEditorEgate(node) ? (
      <DescribeEGate egate={node} getOutgoingEdgesById={getOutgoingEdgesById} />
    ) : (
      <></>
    ),
  [DataType.APPROVAL]: ({ node, getRefById, getRegistryById }) =>
    isEditorApproval(node) ? (
      <DescribeApproval
        app={node}
        getRefById={getRefById}
        getRegistryById={getRegistryById}
        getRoleById={node.getRoleById}
      />
    ) : (
      <></>
    ),
  [DataType.PROCESS]: ({
    node,
    getProvisionById,
    getRefById,
    getNoteById,
    CustomProvision,
  }) =>
    isEditorProcess(node) ? (
      <DescribeProcess
        process={node}
        getProvisionById={getProvisionById}
        getRefById={getRefById}
        getNoteById={getNoteById}
        CustomProvision={CustomProvision}
        {...node}
      />
    ) : (
      <></>
    ),
};

export const Describe: React.FC<{
  node: EditorNodeWithInfoCallback;
  model: EditorModel;
  page: EditorSubprocess;
  CustomAttribute?: React.FC<{
    att: MMELDataAttribute;
    getRefById?: (id: string) => MMELReference | null;
    dcid: string;
  }>;
  CustomProvision?: React.FC<{
    provision: MMELProvision;
    getRefById?: (id: string) => MMELReference | null;
  }>;
}> = function ({ node, model, page, CustomAttribute, CustomProvision }) {
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

  function getNoteById(id: string): MMELNote | null {
    return getEditorNoteById(model, id);
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
      getOutgoingEdgesById={getOutgoingEdgesById}
      getNoteById={getNoteById}
      CustomAttribute={CustomAttribute}
      CustomProvision={CustomProvision}
    />
  );
};
