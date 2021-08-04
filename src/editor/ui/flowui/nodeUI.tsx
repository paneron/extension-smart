import { Handle, NodeProps, Position } from 'react-flow-renderer';
import styled from '@emotion/styled';
import { FC } from 'react';
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

export const Datacube: FC<NodeProps> = function ({ data }) {
  const node = data as EditorNode;
  const label = isEditorRegistry(node) ? node.title : node.id;
  const color = 'none';
  return (
    <>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ borderRadius: 0 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        style={{ borderRadius: 0 }}
      />
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
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ borderRadius: 0 }}
      />
      <ProcessBox>
        {' '}
        {process.name === '' ? process.id : process.name}{' '}
      </ProcessBox>
      <Handle
        type="target"
        position={Position.Top}
        style={{ borderRadius: 0 }}
      />
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
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ borderRadius: 0 }}
      />
      <ProcessBox>
        {' '}
        {approval.name === '' ? approval.id : approval.name}{' '}
      </ProcessBox>
      <Handle
        type="target"
        position={Position.Top}
        style={{ borderRadius: 0 }}
      />
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
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ borderRadius: 0 }}
      />
      <StartShape color={color} />
    </>
  );
};

export const EndComponent: FC<NodeProps> = function () {
  const color = 'none';
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ borderRadius: 0 }}
      />
      <EndShape color={color} />
      <ShortLabel>end</ShortLabel>
    </>
  );
};

export const TimerComponent: FC<NodeProps> = function () {
  const color = 'none';
  return (
    <>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ borderRadius: 0 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        style={{ borderRadius: 0 }}
      />
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
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ borderRadius: 0 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        style={{ borderRadius: 0 }}
      />
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
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ borderRadius: 0 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        style={{ borderRadius: 0 }}
      />
      <SignalCatchShape color={color} />
      <LongLabel>{scevent.id}</LongLabel>
    </>
  );
};

const DatacubeShape: FC<{ color: string }> = function ({ color }) {
  return (
    <svg height="40" width="40">
      <polygon points="3,10 31,10 31,38, 3,38" fill={color} stroke="black" />
      <polygon points="3,10 31,10 39,2, 11,2" fill={color} stroke="black" />
      <polygon points="31,38 31,10 39,2, 39,30" fill={color} stroke="black" />
    </svg>
  );
};

const StartShape: FC<{ color: string }> = function ({ color }) {
  return (
    <svg height="40" width="40">
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="black"
        strokeWidth="2"
        fill={color}
      />
    </svg>
  );
};

const EndShape: FC<{ color: string }> = function ({ color }) {
  return (
    <svg height="40" width="40">
      <circle
        cx="20"
        cy="20"
        r="15"
        stroke="black"
        strokeWidth="5"
        fill={color}
      />
    </svg>
  );
};

const TimerShape: FC<{ color: string }> = function ({ color }) {
  return (
    <svg height="40" width="40">
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="black"
        strokeWidth="2"
        fill={color}
      />
      <circle
        cx="20"
        cy="20"
        r="14"
        stroke="black"
        strokeWidth="2"
        fill={color}
      />
      <line x1="20" y1="20" x2="20" y2="10" stroke="black" strokeWidth="2" />
      <line x1="20" y1="20" x2="24" y2="26" stroke="black" strokeWidth="2" />
    </svg>
  );
};

const EgateShape: FC<{ color: string }> = function ({ color }) {
  return (
    <svg height="40" width="40">
      <polygon
        points="0,20 20,0 40,20, 20,40"
        fill={color}
        stroke="black"
        strokeWidth="2"
      />
    </svg>
  );
};

const SignalCatchShape: FC<{ color: string }> = function ({ color }) {
  return (
    <svg height="40" width="40">
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="black"
        strokeWidth="2"
        fill={color}
      />
      <line x1="10" y1="30" x2="30" y2="30" stroke="black" strokeWidth="2" />
      <line x1="10" y1="30" x2="20" y2="10" stroke="black" strokeWidth="2" />
      <line x1="30" y1="30" x2="20" y2="10" stroke="black" strokeWidth="2" />
    </svg>
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

const ProcessBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 5px;
  border: 1px;
  width: 150px;
  height: 40px;
  font-size: 10px;
  border-style: solid;
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
