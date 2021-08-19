import { Handle, NodeProps, Position } from 'react-flow-renderer';
import styled from '@emotion/styled';
import { CSSProperties, FC } from 'react';
import {
  EditorApproval,
  EditorEGate,
  EditorNode,
  EditorProcess,
  EditorSignalEvent,
  isEditorRegistry,
  ModelType,
} from '../../model/editormodel';
import { NodeCallBack } from './container';
import React from 'react';
import {
  DatacubeShape,
  EgateShape,
  EndShape,
  ProcessBox,
  SignalCatchShape,
  StartShape,
  TimerShape,
} from './shapes';
import { Tooltip2 } from '@blueprintjs/popover2';
import { Button } from '@blueprintjs/core';
import { MapViewButtonToolTip } from '../mapper/MappingCalculator';

const handlecss: CSSProperties = {
  borderRadius: '5px!important',
  width: '19px!important',
  height: '19px!important',
  background: 'whitesmoke!important',
  border: '1px solid black!important',
};

export const Datacube: FC<NodeProps> = function ({ data }) {
  const node = data as EditorNode;
  const label = isEditorRegistry(node) ? node.title : node.id;
  const color = 'none';
  return (
    <>
      <Handle type="source" position={Position.Bottom} style={handlecss} />
      <Handle type="target" position={Position.Top} style={handlecss} />
      <DatacubeShape color={color} />
      <LongLabel>{label}</LongLabel>
    </>
  );
};

export const ProcessComponent: FC<NodeProps> = function ({ data }) {
  const process = data as EditorProcess;
  const callback = data as NodeCallBack;
  const actor = callback.getRoleById(process.actor);
  const PB = ProcessBox[callback.modelType];
  return (
    <>
      <Handle type='source' position={Position.Bottom} style={handlecss} />
      <PB
        content={process.name === '' ? process.id : process.name}
        pid={process.id}
        style={callback.getMapStyleById(process.id)}        
        setMapping={callback.setMapping}
        uiref={process.uiref}
      />
      <Handle type='target' position={Position.Top} style={handlecss} />
      {process.page !== '' && (
        <div style={{
          position: 'fixed',
          right: '-10px',
          top: '-10px',
        }}>
          <Tooltip2 content='View subprocess' position='top'>
            <MyButton
              key={process.id + '#subprocessbutton'}
              onClick={() => callback.onProcessClick(process.page, process.id)}            
            >
              {' '}
              +
            </MyButton>
          </Tooltip2>
        </div>
      )}
      {callback.hasMapping !== undefined && callback.hasMapping(process.id) && <ViewMappingbutton
        modelType={callback.modelType}
        id={process.id}
        setSelectedId={callback.setSelectedId!}
      /> }
      {actor !== null && (
        <FirstLabel key={process.id + '#ActorLabel'}>
          {actorIcon}
          {actor.name}
        </FirstLabel>
      )}
    </>
  );
};

export const ApprovalComponent: FC<NodeProps> = function ({ data }) {
  const approval = data as EditorApproval;
  const callback = data as NodeCallBack;
  const actor = callback.getRoleById(approval.actor);
  const approver = callback.getRoleById(approval.approver);
  const PB = ProcessBox[callback.modelType];
  return (
    <>
      <Handle type="source" position={Position.Bottom} style={handlecss} />
      <PB
        content={approval.name === '' ? approval.id : approval.name}
        pid={approval.id}
        style={callback.getMapStyleById(approval.id)}        
        setMapping={callback.setMapping}
        uiref={approval.uiref}
      />
      <Handle type="target" position={Position.Top} style={handlecss} />
      { callback.hasMapping !== undefined && callback.hasMapping(approval.id) && (<ViewMappingbutton
        modelType={callback.modelType}
        id={approval.id}
        setSelectedId={callback.setSelectedId!}
      />) }
      {actor !== null ? (
        approver !== null ? (
          <>
            <FirstLabel key={approval.id + '#ActorLabel'}>
              {actorIcon}
              {actor.name}
            </FirstLabel>
            <SecondLabel key={approval.id + '#ApproverLabel'}>
              {approverIcon}
              {approver.name}
            </SecondLabel>
          </>
        ) : (
          <FirstLabel key={approval.id + '#ActorLabel'}>
            {actorIcon}
            {actor.name}
          </FirstLabel>
        )
      ) : approver !== null ? (
        <FirstLabel key={approval.id + '#ApproverLabel'}>
          {approverIcon}
          {approver.name}
        </FirstLabel>
      ) : (
        <></>
      )}
    </>
  );
};

export const StartComponent: FC<NodeProps> = function () {
  const color = 'none';
  return (
    <>
      <Handle type="source" position={Position.Bottom} style={handlecss} />
      <StartShape color={color} />
    </>
  );
};

export const EndComponent: FC<NodeProps> = function () {
  const color = 'none';
  return (
    <>
      <Handle type="target" position={Position.Top} style={handlecss} />
      <EndShape color={color} />
      <ShortLabel>end</ShortLabel>
    </>
  );
};

export const TimerComponent: FC<NodeProps> = function () {
  const color = 'none';
  return (
    <>
      <Handle type="source" position={Position.Bottom} style={handlecss} />
      <Handle type="target" position={Position.Top} style={handlecss} />
      <TimerShape color={color} />
      <ShortLabel>timer</ShortLabel>
    </>
  );
};

export const EgateComponent: FC<NodeProps> = function ({ data }) {
  const color = 'none';
  const egate = data as EditorEGate;
  return (
    <>
      <Handle type="source" position={Position.Bottom} style={handlecss} />
      <Handle type="target" position={Position.Top} style={handlecss} />
      <EgateShape color={color} />
      <LongLabel>{egate.label}</LongLabel>
    </>
  );
};

export const SignalCatchComponent: FC<NodeProps> = function ({ data }) {
  const scevent = data as EditorSignalEvent;
  const color = 'none';
  return (
    <>
      <Handle type="source" position={Position.Bottom} style={handlecss} />
      <Handle type="target" position={Position.Top} style={handlecss} />
      <SignalCatchShape color={color} />
      <LongLabel>{scevent.id}</LongLabel>
    </>
  );
};

const ViewMappingbutton: React.FC<{
  modelType: ModelType;
  id: string;
  setSelectedId: (id:string) => void
}> = function ({
  modelType,
  id,
  setSelectedId
}) {
  if (modelType == ModelType.IMP || modelType === ModelType.REF) {
    return (      
      <div style={{
        position: 'fixed',
        left: '-10px',
        top: '-10px',
      }}>
        <Tooltip2 content={MapViewButtonToolTip[modelType]} position='top'>
          <Button
            key={id + '#viewmapbutton'}
            icon='link'
            onClick={() => setSelectedId!(id)}
          />            
        </Tooltip2>
      </div>      
    );
  }  
  return <></>
}

const ShortLabel = styled.div`
  position: absolute;
  left: 0px;
  top: 45px;
  width: 40px;
  text-align: center;
  font-size: 10px;
`;

const LongLabel = styled.div`
  position: absolute;
  left: -50px;
  top: 45px;
  width: 140px;
  text-align: center;
  font-size: 10px;
`;

const MyButton = styled.button`  
  font-size: 14px;
  color: green;
`;

const FirstLabel = styled.div`
  position: absolute;
  left: 0px;
  top: 45px;
  width: 140px;
  text-align: center;
  font-size: 10px;
`;

const SecondLabel = styled.div`
  position: absolute;
  left: 0px;
  top: 65px;
  width: 140px;
  text-align: center;
  font-size: 10px;
`;

const ApproverDeco = styled.span`
  font-size: 14px;
  color: green;
`;

const actorIcon = (
  <svg height="15" width="15">
    <circle cx="8" cy="15" r="6" stroke="black" strokeWidth="1" fill="none" />
    <circle cx="8" cy="6" r="3" stroke="black" strokeWidth="1" fill="none" />
  </svg>
);

const approverIcon = <ApproverDeco>{'\u2611'}</ApproverDeco>;
