import React from 'react';
import {
  EditorDataClass,
  EditorModel,
  EditorNode,
  EditorRegistry,
  EditorSubprocess,
  getEditorDataClassById,
  getEditorNoteById,
  getEditorProvisionById,
  getEditorRefById,
  getEditorRegistryById,
  getEditorRoleById,
  isEditorApproval,
  isEditorDataClass,
  isEditorEgate,
  isEditorProcess,
  isEditorRegistry,
  isEditorSignalEvent,
  isEditorTimerEvent,
} from '../../model/editormodel';
import { DataType } from '@paneron/libmmel/interface/baseinterface';
import { MMELDataAttribute } from '@paneron/libmmel/interface/datainterface';
import { MMELEdge } from '@paneron/libmmel/interface/flowcontrolinterface';
import {
  MMELNote,
  MMELProvision,
  MMELReference,
  MMELRole,
} from '@paneron/libmmel/interface/supportinterface';
import { SelectableNodeTypes } from '@/smart/utils/constants';
import { DescribeApproval } from '@/smart/ui/common/description/approval';
import {
  DescribeEGate,
  DescribeEnd,
  DescribeSignalCatch,
  DescribeStart,
  DescribeTimer,
} from '../common/description/ComponentDescription';
import { DescribeDC, DescribeRegistry } from '@/smart/ui/common/description/data';
import { DescribeProcess } from '@/smart/ui/common/description/process';

interface Props {
  node: EditorNode;
  getRefById: (id: string) => MMELReference | null;
  getRegistryById: (id: string) => EditorRegistry | null;
  getDCById: (id: string) => EditorDataClass | null;
  getProvisionById: (id: string) => MMELProvision | null;
  getNoteById: (id: string) => MMELNote | null;
  getOutgoingEdgesById: (id: string) => MMELEdge[];
  getRoleById: (id: string) => MMELRole | null;
  CustomAttribute?: React.FC<{
    att: MMELDataAttribute;
    getRefById?: (id: string) => MMELReference | null;
    dcid: string;
  }>;
  CustomProvision?: React.FC<{
    provision: MMELProvision;
    getRefById?: (id: string) => MMELReference | null;
  }>;
}

const NODE_DETAIL_VIEWS: Record<
  SelectableNodeTypes,
  React.FC<Props>
> = {
  [DataType.DATACLASS] : ({ node, getRefById, CustomAttribute }: Props) =>
    isEditorDataClass(node) ? (
      <DescribeDC
        dc={node as EditorDataClass}
        getRefById={getRefById}
        CustomAttribute={CustomAttribute}
      />
    ) : (
      <></>
    ),
  [DataType.REGISTRY] : ({ node, getRefById, getDCById, CustomAttribute }: Props) =>
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
  [DataType.STARTEVENT] : () => <DescribeStart />,
  [DataType.ENDEVENT]   : () => <DescribeEnd />,
  [DataType.TIMEREVENT] : ({ node }: Props) =>
    isEditorTimerEvent(node) ? <DescribeTimer timer={node} /> : <></>,
  [DataType.SIGNALCATCHEVENT] : ({ node }: Props) =>
    isEditorSignalEvent(node) ? <DescribeSignalCatch scEvent={node} /> : <></>,
  [DataType.EGATE] : ({ node, getOutgoingEdgesById }: Props) =>
    isEditorEgate(node) ? (
      <DescribeEGate egate={node} getOutgoingEdgesById={getOutgoingEdgesById} />
    ) : (
      <></>
    ),
  [DataType.APPROVAL] : ({ node, getRefById, getRegistryById, getRoleById }: Props) =>
    isEditorApproval(node) ? (
      <DescribeApproval
        app={node}
        getRefById={getRefById}
        getRegistryById={getRegistryById}
        getRoleById={getRoleById}
      />
    ) : (
      <></>
    ),
  [DataType.PROCESS] : ({
    node,
    getProvisionById,
    getRefById,
    getNoteById,
    getRoleById,
    CustomProvision,
  }: Props) =>
    isEditorProcess(node) ? (
      <DescribeProcess
        process={node}
        getProvisionById={getProvisionById}
        getRefById={getRefById}
        getNoteById={getNoteById}
        CustomProvision={CustomProvision}
        getRoleById={getRoleById}
        {...node}
      />
    ) : (
      <></>
    ),
};

export const Describe: React.FC<{
  node: EditorNode;
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

  function getRoleById(id: string): MMELRole | null {
    return getEditorRoleById(model, id);
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
      getRoleById={getRoleById}
      CustomAttribute={CustomAttribute}
      CustomProvision={CustomProvision}
    />
  );
};
