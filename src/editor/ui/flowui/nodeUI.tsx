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
  return (
    <>
      <Handle type="source" position={Position.Bottom} style={handlecss} />
      <ProcessBox>
        {' '}
        {process.name === '' ? process.id : process.name}{' '}
      </ProcessBox>
      <Handle type="target" position={Position.Top} style={handlecss} />
      {process.page !== '' && (
        <MyButton
          key={process.id + '#subprocessbutton'}
          onClick={() => callback.onProcessClick(process.page, process.id)}
        >
          {' '}
          +
        </MyButton>
      )}
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
  return (
    <>
      <Handle type="source" position={Position.Bottom} style={handlecss} />
      <ProcessBox>
        {' '}
        {approval.name === '' ? approval.id : approval.name}{' '}
      </ProcessBox>
      <Handle type="target" position={Position.Top} style={handlecss} />
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
  position: fixed;
  right: -10px;
  top: -10px;
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
