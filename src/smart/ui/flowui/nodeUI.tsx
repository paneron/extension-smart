/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';
import { FC } from 'react';
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
import { MapViewButtonToolTip } from '../mapper/MappingCalculator';
import MGDButton from '../../MGDComponents/MGDButton';
import React from 'react';
import { handlecss } from '../../../css/visual';
import {
  shame__approver_deco,
  shame__label,
  shame__label__long,
  shame__label__nudge,
  shame__label__short,
} from '../../../css/shame';
import { Text } from '@blueprintjs/core';
import {
  view_mapping_button_layout,
  view_subprocess_button_layout,
} from '../../../css/layout';
import PopoverWrapper from '../popover/PopoverWrapper';

export const Datacube: FC<NodeProps> = function ({ data }) {
  const node = data as EditorNode;
  const callback = data as NodeCallBack;
  const SD = callback.ComponentShortDescription;
  const label = isEditorRegistry(node) ? node.title : node.id;
  const color = 'none';
  return (
    <>
      <Handle type="source" position={Position.Bottom} css={handlecss} />
      <Handle type="target" position={Position.Top} css={handlecss} />
      <PopoverWrapper id={node.id} SD={SD}>
        <DatacubeShape color={color} />
      </PopoverWrapper>
      <div css={[shame__label, shame__label__long]}>{label}</div>
    </>
  );
};

export const ProcessComponent: FC<NodeProps> = function ({ data }) {
  const process = data as EditorProcess;
  const callback = data as NodeCallBack;
  const actor = callback.getRoleById(process.actor);
  const PB = ProcessBox[callback.modelType];  
  const SD = callback.ComponentShortDescription;

  return (
    <>
      <Handle type="source" position={Position.Bottom} css={handlecss} />
      <PopoverWrapper id={process.id} SD={SD}>
        <PB
          content={process.name === '' ? process.id : process.name}
          pid={process.id}
          styleClass={
            callback.getMapStyleClassById
              ? callback.getMapStyleClassById(process.id)
              : undefined
          }
          setMapping={callback.setMapping}
          uiref={process.uiref}
        />
      </PopoverWrapper>
      <Handle type="target" position={Position.Top} css={handlecss} />
      {process.page !== '' && (
        <div css={view_subprocess_button_layout}>
          <Tooltip2 content="View subprocess" position="top">
            <MGDButton
              key={process.id + '#subprocessbutton'}
              onClick={() => callback.onProcessClick(process.page, process.id)}
              icon="plus"
            />
          </Tooltip2>
        </div>
      )}
      {callback.hasMapping !== undefined && callback.hasMapping(process.id) && (
        <ViewMappingbutton
          modelType={callback.modelType}
          id={process.id}
          setSelectedId={callback.setSelectedId!}
        />
      )}
      {actor !== null && (
        <div css={[shame__label]} key={process.id + '#ActorLabel'}>
          {actorIcon}
          {actor.name}
        </div>
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
  const SD = callback.ComponentShortDescription;

  return (
    <>
      <Handle type="source" position={Position.Bottom} css={handlecss} />
      <PopoverWrapper id={approval.id} SD={SD}>
        <PB
          content={approval.name === '' ? approval.id : approval.name}
          pid={approval.id}
          styleClass={
            callback.getMapStyleClassById
              ? callback.getMapStyleClassById(approval.id)
              : undefined
          }
          setMapping={callback.setMapping}
          uiref={approval.uiref}
        />
      </PopoverWrapper>        
      <Handle type="target" position={Position.Top} css={handlecss} />
      {callback.hasMapping !== undefined &&
        callback.hasMapping(approval.id) && (
          <ViewMappingbutton
            modelType={callback.modelType}
            id={approval.id}
            setSelectedId={callback.setSelectedId!}
          />
        )}
      {actor !== null ? (
        approver !== null ? (
          <>
            <div css={[shame__label]} key={approval.id + '#ActorLabel'}>
              {actorIcon}
              {actor.name}
            </div>
            <div
              css={[shame__label, shame__label__nudge]}
              key={approval.id + '#ApproverLabel'}
            >
              {approverIcon}
              {approver.name}
            </div>
          </>
        ) : (
          <div css={[shame__label]} key={approval.id + '#ActorLabel'}>
            {actorIcon}
            {actor.name}
          </div>
        )
      ) : approver !== null ? (
        <div css={[shame__label]} key={approval.id + '#ApproverLabel'}>
          {approverIcon}
          {approver.name}
        </div>
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
      <Handle type="source" position={Position.Bottom} css={handlecss} />
      <StartShape color={color} />
    </>
  );
};

export const EndComponent: FC<NodeProps> = function () {
  const color = 'none';
  return (
    <>
      <Handle type="target" position={Position.Top} css={handlecss} />
      <EndShape color={color} />
      <div css={[shame__label, shame__label__short]}>end</div>
    </>
  );
};

export const TimerComponent: FC<NodeProps> = function ({ data }) {
  const callback = data as NodeCallBack;
  const color = 'none';
  const SD = callback.ComponentShortDescription;  
  return (
    <>
      <Handle type="source" position={Position.Bottom} css={handlecss} />
      <Handle type="target" position={Position.Top} css={handlecss} />
      <PopoverWrapper id={data.id} SD={SD}>
        <TimerShape color={color} />
      </PopoverWrapper>       
      <div css={[shame__label, shame__label__short]}>timer</div>
    </>
  );
};

export const EgateComponent: FC<NodeProps> = function ({ data }) {
  const egate = data as EditorEGate;
  const callback = data as NodeCallBack;
  const SD = callback.ComponentShortDescription;
  const color = 'none';  
  
  return (
    <>
      <Handle type="source" position={Position.Bottom} css={handlecss} />
      <Handle type="target" position={Position.Top} css={handlecss} />
      <PopoverWrapper id={egate.id} SD={SD}>
        <EgateShape color={color} />
      </PopoverWrapper>      
      <div css={[shame__label, shame__label__long]}>
        <Text ellipsize={true}>{egate.label}</Text>
      </div>
    </>
  );
};

export const SignalCatchComponent: FC<NodeProps> = function ({ data }) {
  const scevent = data as EditorSignalEvent;
  const callback = data as NodeCallBack;
  const SD = callback.ComponentShortDescription;
  const color = 'none';
  return (
    <>
      <Handle type="source" position={Position.Bottom} css={handlecss} />
      <Handle type="target" position={Position.Top} css={handlecss} />
      <PopoverWrapper id={scevent.id} SD={SD}>
        <SignalCatchShape color={color} />
      </PopoverWrapper>          
      <div css={[shame__label, shame__label__long]}>{scevent.id}</div>
    </>
  );
};

const ViewMappingbutton: React.FC<{
  modelType: ModelType;
  id: string;
  setSelectedId: (id: string) => void;
}> = function ({ modelType, id, setSelectedId }) {
  if (modelType === ModelType.IMP || modelType === ModelType.REF) {
    return (
      <div css={view_mapping_button_layout}>
        <Tooltip2 content={MapViewButtonToolTip[modelType]} position="top">
          <MGDButton
            key={id + '#viewmapbutton'}
            icon="link"
            onClick={() => setSelectedId(id)}
          />
        </Tooltip2>
      </div>
    );
  }
  return <></>;
};

const actorIcon = (
  <svg height="15" width="15">
    <circle cx="8" cy="15" r="6" stroke="black" strokeWidth="1" fill="none" />
    <circle cx="8" cy="6" r="3" stroke="black" strokeWidth="1" fill="none" />
  </svg>
);

const approverIcon = <span css={shame__approver_deco}>{'\u2611'}</span>;
