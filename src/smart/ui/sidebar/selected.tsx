/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { CSSProperties } from 'react';
import {
  useStoreState,
  Elements,
  isNode,
  useStoreActions,
} from 'react-flow-renderer';
import { DataType } from '../../serialize/interface/baseinterface';
import { MMELDataAttribute } from '../../serialize/interface/datainterface';
import {
  MMELProvision,
  MMELReference,
  MMELRole,
} from '../../serialize/interface/supportinterface';
import { EdtiorNodeWithInfoCallback, NodeCallBack } from '../flowui/container';
import {
  EditorApproval,
  EditorDataClass,
  EditorEGate,
  EditorEndEvent,
  EditorModel,
  EditorRegistry,
  EditorSignalEvent,
  EditorTimerEvent,
  getEditorDataClassById,
  getEditorProvisionById,
  getEditorRefById,
  getEditorRegistryById,  
  isEditorAppproval,
  isEditorDataClass,
  isEditorEgate,
  isEditorProcess,
  isEditorRegistry,
  isEditorSignalEvent,
  isEditorTimerEvent,
  ModelType,
} from '../../model/editormodel';
import { ProcessQuickEdit } from './processquickedit';
import { toRefSummary } from '../../utils/commonfunctions';
import { DeletableNodeTypes, EditableNodeTypes, EditAction, SelectableNodeTypes } from '../../utils/constants';
import { Button, ButtonGroup } from '@blueprintjs/core';

export const SelectedNodeDescription: React.FC<{
  model: EditorModel;
  setDialog?: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string,
    resetSelection: () => void
  ) => void;
  onSubprocessClick?: (pid: string) => void;  
}> = function ({
  model,
  setDialog,
  onSubprocessClick = () => {alert('Not implemented')},  
}) {
  const selected = useStoreState(store => store.selectedElements);
  const setSelectedElements = useStoreActions(
    actions => actions.setSelectedElements
  );
  const elm: EdtiorNodeWithInfoCallback | null = getSelectedElement(selected);

  function getSelectedElement(
    selected: Elements<any> | null
  ): EdtiorNodeWithInfoCallback | null {
    if (selected !== null && selected.length > 0) {
      const s = selected[0];
      if (isNode(s)) {
        return s.data as EdtiorNodeWithInfoCallback;
      }
    }
    return null;
  }

  function resetSelection() {
    setSelectedElements([]);
  }

  return (
    <div style={{maxHeight: '70vh' }}>
      {elm !== null ? (                
        <Describe node={elm} 
          resetSelection={resetSelection}
          model={model}
          setDialog={setDialog}
          onSubprocessClick={onSubprocessClick}
        />                
      ) : (
        'Nothing is selected'
      )}
    </div>
  );
};

const NODE_DETAIL_VIEWS: Record<
  SelectableNodeTypes,
  React.FC<{
    node: EdtiorNodeWithInfoCallback;
    resetSelection: () => void;    
    getRefById: (id: string) => MMELReference | null;
    getRegistryById: (id: string) => EditorRegistry | null;
    getDCById: (id: string) => EditorDataClass | null;
    getProvisionById: (id: string) => MMELProvision | null;
    setDialog?: (
      nodeType: EditableNodeTypes | DeletableNodeTypes,
      action: EditAction,
      id: string,
      resetSelection: () => void
    ) => void;
    onSubprocessClick: (pid: string) => void;
  }>
> = {
  [DataType.DATACLASS]: ({ node, getRefById }) =>
    isEditorDataClass(node) ? (
      <DescribeDC dc={node as EditorDataClass} getRefById={getRefById} />
    ) : (
      <></>
    ),
  [DataType.REGISTRY]: ({ node, getRefById, getDCById }) =>
    isEditorRegistry(node) ? <DescribeRegistry reg={node} getRefById={getRefById} getDataClassById={getDCById} /> : <></>,
  [DataType.STARTEVENT]: () => <DescribeStart />,
  [DataType.ENDEVENT]: ({ node, resetSelection, setDialog=()=>alert('Not implemeted') }) => (
    <DescribeEnd end={node} resetSelection={resetSelection} setDialog={setDialog} />
  ),
  [DataType.TIMEREVENT]: ({ node, resetSelection, setDialog=()=>alert('Not implemeted') }) =>
    isEditorTimerEvent(node) ? (
      <DescribeTimer timer={node} resetSelection={resetSelection} setDialog={setDialog} />
    ) : (
      <></>
    ),
  [DataType.SIGNALCATCHEVENT]: ({ node, resetSelection, setDialog=()=>alert('Not implemeted') }) =>
    isEditorSignalEvent(node) ? (
      <DescribeSignalCatch scEvent={node} resetSelection={resetSelection} setDialog={setDialog}/>
    ) : (
      <></>
    ),
  [DataType.EGATE]: ({ node, resetSelection, setDialog=()=>alert('Not implemeted') }) =>
    isEditorEgate(node) ? (
      <DescribeEGate egate={node} resetSelection={resetSelection} setDialog={setDialog} />
    ) : (
      <></>
    ),
  [DataType.APPROVAL]: ({ node, resetSelection, getRefById, getRegistryById, setDialog=()=>alert('Not implemeted') }) =>
    isEditorAppproval(node) ? (
      <DescribeApproval 
        app={node} 
        resetSelection={resetSelection} 
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
    resetSelection, 
    getProvisionById, 
    getRefById, 
    setDialog=()=>alert('Not implemeted'),
    onSubprocessClick
  }) =>
    isEditorProcess(node) ? (
      <ProcessQuickEdit
        process={node}
        getProvisionById={getProvisionById}
        getRefById={getRefById}        
        resetSelection={resetSelection}
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
  model: EditorModel
  resetSelection: () => void;
  setDialog?: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string,
    resetSelection: () => void
  ) => void;
  onSubprocessClick: (pid: string) => void;
}> = function ({ node, model, resetSelection, setDialog, onSubprocessClick }) {

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
      resetSelection={resetSelection}
      getRefById={getRefById}
      getRegistryById={getRegistryById}
      getDCById={getDCById}
      getProvisionById={getProvisionById}
      setDialog={setDialog}
      onSubprocessClick={onSubprocessClick}
    />);
};

export const RemoveButton: React.FC<{
  cid: string;
  callback: () => void;
}> = function ({ cid, callback }) {
  return (
    <Button
      key={'ui#button#removeButton#' + cid}
      icon="delete"
      intent="danger"
      text="Remove"
      onClick={() => callback()}
    />
  );
};

export const EditButton: React.FC<{
  cid: string;
  callback: () => void;
}> = function ({ cid, callback }) {
  return (
    <Button
      key={'ui#button#editComponent#' + cid}
      icon="edit"
      text="Edit"
      onClick={() => callback()}
    />
  );
};

const ApprovalRecordList: React.FC<{
  regs: EditorRegistry[];
  pid: string;
}> = function ({ regs, pid }) {
  return (
    <>
      {regs.length > 0 ? (
        <>
          <p key={pid + '#approvalRecordLabel'}>Appproval record(s):</p>
          <ul key={pid + '#approvalList'}>
            {regs.map(reg => (
              <li key={pid + '#approvalRecord#' + reg.id}> {reg.title} </li>
            ))}
          </ul>
        </>
      ) : (
        ''
      )}
    </>
  );
};

export const ReferenceList: React.FC<{
  refs: Set<string>;
  pid: string;
  getRefById: (id: string) => MMELReference | null;
}> = function ({ refs, pid, getRefById }) {
  const ref: MMELReference[] = [];
  refs.forEach(r => {
    const ret = getRefById(r);
    if (ret !== null) {
      ref.push(ret);
    }
  });
  return (
    <>
      {refs.size > 0 ? (
        <>
          <p key={pid + '#referenceLabel'}>Reference:</p>
          <ul key={pid + '#referenceList'}>
            {ref.map(r => (
              <li key={r.id}> {toRefSummary(r)} </li>
            ))}
          </ul>
        </>
      ) : (
        ''
      )}
    </>
  );
};

const AttributeList: React.FC<{
  attributes: Record<string, MMELDataAttribute>;
  dcid: string;
  getRefById: (id: string) => MMELReference | null;
}> = function ({ attributes, dcid, getRefById }) {
  return (
    <>
      {Object.keys(attributes).length > 0 ? (
        <>
          <p key={dcid + '#attributesLabel'}> Attributes: </p>
          <ul key={dcid + '#attributeList'}>
            {Object.entries(attributes).map(([v, att]) => (
              <li key={v}>
                {' '}
                <DescribeAttribute att={att} getRefById={getRefById} />{' '}
              </li>
            ))}
          </ul>
        </>
      ) : (
        ''
      )}
    </>
  );
};

export const DescriptionItem: React.FC<{
  id: string;
  label: string;
  value: string;
  css?: CSSProperties;
}> = function ({ id, label, value, css }): JSX.Element {
  return (
    <p key={id}>
      {' '}
      {label}:{css !== undefined ? <span style={css}> {value}</span> : value}{' '}
    </p>
  );
};

export const ActorDescription: React.FC<{
  role: MMELRole | null;
  id: string;
  label: string;
}> = function ({ role, id, label }): JSX.Element {
  return (
    <>
      {' '}
      {role !== null ? (
        <DescriptionItem id={id} label={label} value={role.name} />
      ) : (
        <></>
      )}{' '}
    </>
  );
};

export const NonEmptyFieldDescription: React.FC<{
  id: string;
  label: string;
  value: string;
  css?: CSSProperties;
}> = function ({ id, label, value, css }): JSX.Element {
  return (
    <>
      {' '}
      {value !== '' ? (
        <DescriptionItem id={id} label={label} value={value} css={css} />
      ) : (
        ''
      )}{' '}
    </>
  );
};

const DescribeStart: React.FC = function () {
  return <span key="ui#startlabel"> Start event </span>;
};

const DescribeEnd: React.FC<{
  end: EditorEndEvent & NodeCallBack;
  resetSelection: () => void;
  setDialog: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string,
    resetSelection: () => void
  ) => void;
}> = function ({ end, resetSelection, setDialog }): JSX.Element {
  return (
    <>
      {end.modelType === ModelType.EDIT && (
        <RemoveButton
          cid={end.id}
          callback={() =>
            setDialog(
              DataType.ENDEVENT,
              EditAction.DELETE,
              end.id,
              resetSelection
            )
          }
        />
      )}
      <p key={'ui#endlabel#' + end.id}> End event </p>
    </>
  );
};

const DescribeApproval: React.FC<{
  app: EditorApproval & NodeCallBack;
  getRoleById: (id: string) => MMELRole | null;
  getRefById: (id: string) => MMELReference | null;
  getRegistryById: (id: string) => EditorRegistry | null;
  resetSelection: () => void;
  setDialog: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string,
    resetSelection: () => void
  ) => void;
}> = function ({
  app,
  getRoleById,
  getRefById,
  getRegistryById,
  resetSelection,
  setDialog
}) {
  const regs: EditorRegistry[] = [];
  app.records.forEach(r => {
    const ret = getRegistryById(r);
    if (ret !== null) {
      regs.push(ret);
    }
  });
  return (
    <>
      {app.modelType === ModelType.EDIT && (
        <ButtonGroup>
          <EditButton
            cid={app.id}
            callback={() =>
              setDialog(
                DataType.APPROVAL,
                EditAction.EDIT,
                app.id,
                resetSelection
              )
            }
          />
          <RemoveButton
            cid={app.id}
            callback={() =>
              setDialog(
                DataType.APPROVAL,
                EditAction.DELETE,
                app.id,
                resetSelection
              )
            }
          />
        </ButtonGroup>
      )}
      <DescriptionItem
        id={app.id + '#approvalLabel'}
        label="Approval"
        value={app.id}
      />
      <DescriptionItem
        id={app.id + '#nameLabel'}
        label="Name"
        value={app.name}
      />
      <ActorDescription
        role={getRoleById(app.actor)}
        id={app.id + '#actorLabel'}
        label="Actor"
      />
      <ActorDescription
        role={getRoleById(app.approver)}
        id={app.id + '#approverLabel'}
        label="Approver"
      />
      <NonEmptyFieldDescription
        id={app.id + '#modalityLabel'}
        label="Modality"
        value={app.modality}
      />
      <ApprovalRecordList regs={regs} pid={app.id} />
      <ReferenceList refs={app.ref} pid={app.id} getRefById={getRefById} />
    </>
  );
};

const DescribeEGate: React.FC<{
  egate: EditorEGate & NodeCallBack;
  resetSelection: () => void;
  setDialog: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string,
    resetSelection: () => void
  ) => void;
}> = function ({ egate, resetSelection, setDialog }) {
  return (
    <>
      {egate.modelType === ModelType.EDIT && (
        <ButtonGroup>
          <EditButton
            cid={egate.id}
            callback={() =>
              setDialog(
                DataType.EGATE,
                EditAction.EDIT,
                egate.id,
                resetSelection
              )
            }
          />
          <RemoveButton
            cid={egate.id}
            callback={() =>
              setDialog(
                DataType.EGATE,
                EditAction.DELETE,
                egate.id,
                resetSelection
              )
            }
          />
        </ButtonGroup>
      )}
      <DescriptionItem
        id={egate.id + '#egate'}
        label="Exclusive Gateway"
        value={egate.id}
      />
      <DescriptionItem
        id={egate.id + '#egateLabel'}
        label="Contents"
        value={egate.label}
      />
    </>
  );
};

const DescribeSignalCatch: React.FC<{
  scEvent: EditorSignalEvent & NodeCallBack;
  resetSelection: () => void;
  setDialog: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string,
    resetSelection: () => void
  ) => void;
}> = function ({ scEvent, resetSelection, setDialog }) {
  return (
    <>
      {scEvent.modelType === ModelType.EDIT && (
        <ButtonGroup>
          <EditButton
            cid={scEvent.id}
            callback={() =>
              setDialog(
                DataType.SIGNALCATCHEVENT,
                EditAction.EDIT,
                scEvent.id,
                resetSelection
              )
            }
          />
          <RemoveButton
            cid={scEvent.id}
            callback={() =>
              setDialog(
                DataType.SIGNALCATCHEVENT,
                EditAction.DELETE,
                scEvent.id,
                resetSelection
              )
            }
          />
        </ButtonGroup>
      )}
      <DescriptionItem
        id={scEvent.id + '#signalCatchLabel'}
        label="Signal Catch Event"
        value={scEvent.id}
      />
      <DescriptionItem
        id={scEvent.id + '#signalLabel'}
        label="Signal"
        value={scEvent.signal}
      />
    </>
  );
};

const DescribeTimer: React.FC<{
  timer: EditorTimerEvent & NodeCallBack;
  resetSelection: () => void;
  setDialog: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string,
    resetSelection: () => void
  ) => void;
}> = function ({ timer, resetSelection, setDialog }) {
  return (
    <>
      {timer.modelType === ModelType.EDIT && (
        <ButtonGroup>
          <EditButton
            cid={timer.id}
            callback={() =>
              setDialog(
                DataType.TIMEREVENT,
                EditAction.EDIT,
                timer.id,
                resetSelection
              )
            }
          />
          <RemoveButton
            cid={timer.id}
            callback={() =>
              setDialog(
                DataType.TIMEREVENT,
                EditAction.DELETE,
                timer.id,
                resetSelection
              )
            }
          />
        </ButtonGroup>
      )}
      <DescriptionItem
        id={timer.id + '#timerLabel'}
        label="Timer Event"
        value={timer.id}
      />
      <NonEmptyFieldDescription
        id={timer.id + '#timerTypeLabel'}
        label="Type"
        value={timer.modelType}
      />
      <NonEmptyFieldDescription
        id={timer.id + '#timerParaLabel'}
        label="Parameter"
        value={timer.para}
      />
    </>
  );
};

const DescribeRegistry: React.FC<{
  reg: EditorRegistry;
  getRefById: (id: string) => MMELReference | null;
  getDataClassById: (id: string) => EditorDataClass | null;
}> = function ({ reg, getRefById, getDataClassById }) {
  const dc = getDataClassById(reg.data);
  return (
    <>
      <DescriptionItem
        id={reg.id + '#registryLabel'}
        label="Title"
        value={reg.title}
      />
      {dc !== null && <DescribeDC dc={dc} getRefById={getRefById} />}
    </>
  );
};

const DescribeDC: React.FC<{
  dc: EditorDataClass;
  getRefById: (id: string) => MMELReference | null;
}> = function ({ dc, getRefById }) {
  return (
    <>
      <AttributeList
        attributes={dc.attributes}
        dcid={dc.id}
        getRefById={getRefById}
      />
    </>
  );
};

const DescribeAttribute: React.FC<{
  att: MMELDataAttribute;
  getRefById: (id: string) => MMELReference | null;
}> = function ({ att, getRefById }) {
  const css: CSSProperties = {};
  if (att.modality === 'SHALL') {
    css.textDecorationLine = 'underline';
  }
  return (
    <>
      <DescriptionItem
        css={css}
        id={att.id + '#attributeIDLabel'}
        label="Attribute ID"
        value={att.id}
      />
      <NonEmptyFieldDescription
        css={css}
        id={att.id + '#attributeTypeLabel'}
        label="Type"
        value={att.type}
      />
      <NonEmptyFieldDescription
        css={css}
        id={att.id + '#attributeCardinalityLabel'}
        label="Cardinality"
        value={att.cardinality}
      />
      <NonEmptyFieldDescription
        css={css}
        id={att.id + '#attributeModalityLabel'}
        label="Modality"
        value={att.modality}
      />
      <NonEmptyFieldDescription
        css={css}
        id={att.id + '#attributeDefinitionLabel'}
        label="Definition"
        value={att.definition}
      />
      <ReferenceList refs={att.ref} pid={att.id} getRefById={getRefById} />
    </>
  );
};
