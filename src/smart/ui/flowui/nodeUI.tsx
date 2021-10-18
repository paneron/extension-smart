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
} from '../../model/editormodel';
import { NodeCallBack } from '../../model/FlowContainer';
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
import MGDButton from '../../MGDComponents/MGDButton';
import React from 'react';
import { handlecss } from '../../../css/visual';
import {
  shame__label,
  shame__label__long,
  shame__label__noaction,
  shame__label__nudge,
  shame__label__short,
  tooltip__label,
} from '../../../css/shame';
import { flownode_top_left_button_layout } from '../../../css/layout';
import PopoverWrapper from '../popover/PopoverWrapper';
import ViewMappingbutton from '../mapper/viewmapbutton';
import ViewWorkspaceButton from '../workspace/ViewDataWorkspaceButton';
import { Icon } from '@blueprintjs/core';
import NodeIDField from './NodeIDField';

export const Datacube: FC<NodeProps> = function ({ data }) {
  const node = data as EditorNode;
  const callback = data as NodeCallBack;
  const SD = callback.ComponentShortDescription;
  const label = isEditorRegistry(node) ? node.title : node.id;
  const color =
    callback.getSVGColorById !== undefined
      ? callback.getSVGColorById(data.id)
      : 'none';
  const Addon = callback.NodeAddon;
  const onDataWorkspaceActive = callback.onDataWorkspaceActive;
  return (
    <>
      {callback.idVisible && <NodeIDField nodeid={node.id} />}
      <Handle type="source" position={Position.Bottom} css={handlecss} />
      <Handle type="target" position={Position.Top} css={handlecss} />
      {isEditorRegistry(node) && onDataWorkspaceActive !== undefined && (
        <ViewWorkspaceButton onClick={() => onDataWorkspaceActive(node.id)} />
      )}
      <PopoverWrapper id={node.id} SD={SD}>
        <DatacubeShape color={color} />
      </PopoverWrapper>
      <div css={[shame__label, shame__label__long]}>{label}</div>
      {Addon !== undefined && <Addon id={node.id} />}
    </>
  );
};

export const ProcessComponent: FC<NodeProps> = function ({ data }) {
  const process = data as EditorProcess;
  const callback = data as NodeCallBack;
  const actor = callback.getRoleById(process.actor);
  const PB = ProcessBox[callback.modelType];
  const Addon = callback.NodeAddon;
  const SD = callback.ComponentShortDescription;

  return (
    <>
      {callback.idVisible && <NodeIDField nodeid={process.id} wide />}
      <Handle type="source" position={Position.Bottom} css={handlecss} />
      <PopoverWrapper id={process.id} SD={SD}>
        <PB
          content={process.name === '' ? process.id : process.name}
          pid={process.id}
          styleClass={
            callback.getStyleClassById
              ? callback.getStyleClassById(process.id)
              : undefined
          }
          setMapping={callback.setMapping}
          uiref={process.uiref}
        />
      </PopoverWrapper>
      <Handle type="target" position={Position.Top} css={handlecss} />
      {process.page !== '' && (
        <div css={flownode_top_left_button_layout}>
          <Tooltip2 content="View subprocess" position="top">
            <MGDButton
              onClick={() => callback.onProcessClick(process.page, process.id)}
              icon="plus"
            />
          </Tooltip2>
        </div>
      )}
      {process.page !== '' && (
        <div css={flownode_top_left_button_layout}>
          <Tooltip2 content="View subprocess" position="top">
            <MGDButton
              onClick={() => callback.onProcessClick(process.page, process.id)}
              icon="plus"
            />
          </Tooltip2>
        </div>
      )}
      {callback.hasMapping !== undefined &&
        callback.hasMapping(process.id) &&
        callback.MappingList !== undefined && (
          <ViewMappingbutton
            modelType={callback.modelType}
            id={process.id}
            setSelectedId={callback.setSelectedId!}
            MappingList={callback.MappingList}
          />
        )}
      {actor !== null && (
        <div css={[shame__label, shame__label__noaction]}>
          {actorIcon}
          {actor.name}
        </div>
      )}
      {Addon !== undefined && <Addon id={process.id} />}
    </>
  );
};

export const ApprovalComponent: FC<NodeProps> = function ({ data }) {
  const approval = data as EditorApproval;
  const callback = data as NodeCallBack;
  const actor = callback.getRoleById(approval.actor);
  const approver = callback.getRoleById(approval.approver);
  const PB = ProcessBox[callback.modelType];
  const Addon = callback.NodeAddon;
  const SD = callback.ComponentShortDescription;

  return (
    <>
      {callback.idVisible && <NodeIDField nodeid={approval.id} wide />}
      <Handle type="source" position={Position.Bottom} css={handlecss} />
      <PopoverWrapper id={approval.id} SD={SD}>
        <PB
          content={approval.name === '' ? approval.id : approval.name}
          pid={approval.id}
          styleClass={
            callback.getStyleClassById
              ? callback.getStyleClassById(approval.id)
              : undefined
          }
          setMapping={callback.setMapping}
          uiref={approval.uiref}
        />
      </PopoverWrapper>
      <Handle type="target" position={Position.Top} css={handlecss} />
      {callback.hasMapping !== undefined &&
        callback.hasMapping(approval.id) &&
        callback.MappingList !== undefined && (
          <ViewMappingbutton
            modelType={callback.modelType}
            id={approval.id}
            setSelectedId={callback.setSelectedId!}
            MappingList={callback.MappingList}
          />
        )}
      {actor !== null ? (
        approver !== null ? (
          <>
            <div
              css={[shame__label, shame__label__noaction]}
              key={approval.id + '#ActorLabel'}
            >
              {actorIcon}
              {actor.name}
            </div>
            <div
              css={[shame__label, shame__label__noaction, shame__label__nudge]}
              key={approval.id + '#ApproverLabel'}
            >
              {approverIcon}
              {approver.name}
            </div>
          </>
        ) : (
          <div
            css={[shame__label, shame__label__noaction]}
            key={approval.id + '#ActorLabel'}
          >
            {actorIcon}
            {actor.name}
          </div>
        )
      ) : approver !== null ? (
        <div
          css={[shame__label, shame__label__noaction]}
          key={approval.id + '#ApproverLabel'}
        >
          {approverIcon}
          {approver.name}
        </div>
      ) : (
        <></>
      )}
      {Addon !== undefined && <Addon id={approval.id} />}
    </>
  );
};

export const StartComponent: FC<NodeProps> = function ({ data }) {
  const callback = data as NodeCallBack;
  const color =
    callback.getSVGColorById !== undefined
      ? callback.getSVGColorById(data.id)
      : 'none';
  const SD = callback.StartEndShortDescription;
  return (
    <>
      <Handle type="source" position={Position.Bottom} css={handlecss} />
      <PopoverWrapper id={data.id} SD={SD}>
        <StartShape color={color} />
      </PopoverWrapper>
    </>
  );
};

export const EndComponent: FC<NodeProps> = function ({ data }) {
  const callback = data as NodeCallBack;
  const color =
    callback.getSVGColorById !== undefined
      ? callback.getSVGColorById(data.id)
      : 'none';
  const SD = callback.StartEndShortDescription;
  return (
    <>
      <Handle type="target" position={Position.Top} css={handlecss} />
      <PopoverWrapper id={data.id} SD={SD}>
        <EndShape color={color} />
      </PopoverWrapper>
      <div css={[shame__label, shame__label__short]}>end</div>
    </>
  );
};

export const TimerComponent: FC<NodeProps> = function ({ data }) {
  const callback = data as NodeCallBack;
  const color =
    callback.getSVGColorById !== undefined
      ? callback.getSVGColorById(data.id)
      : 'none';
  const SD = callback.ComponentShortDescription;
  return (
    <>
      {callback.idVisible && <NodeIDField nodeid={data.id} />}
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
  const Addon = callback.NodeAddon;
  const color =
    callback.getSVGColorById !== undefined
      ? callback.getSVGColorById(data.id)
      : 'none';

  return (
    <>
      {callback.idVisible && <NodeIDField nodeid={egate.id} />}
      <Handle type="source" position={Position.Bottom} css={handlecss} />
      <Handle type="target" position={Position.Top} css={handlecss} />
      <PopoverWrapper id={egate.id} SD={SD}>
        <EgateShape color={color} />
      </PopoverWrapper>
      <Tooltip2
        content={<div css={tooltip__label}>{egate.label}</div>}
        css={[shame__label, shame__label__long]}
        position="top"
      >
        <div
          style={{
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
          }}
        >
          {egate.label}
        </div>
      </Tooltip2>
      {Addon !== undefined && <Addon id={egate.id} />}
    </>
  );
};

export const SignalCatchComponent: FC<NodeProps> = function ({ data }) {
  const scevent = data as EditorSignalEvent;
  const callback = data as NodeCallBack;
  const SD = callback.ComponentShortDescription;
  const color =
    callback.getSVGColorById !== undefined
      ? callback.getSVGColorById(data.id)
      : 'none';
  return (
    <>
      {callback.idVisible && <NodeIDField nodeid={scevent.id} />}
      <Handle type="source" position={Position.Bottom} css={handlecss} />
      <Handle type="target" position={Position.Top} css={handlecss} />
      <PopoverWrapper id={scevent.id} SD={SD}>
        <SignalCatchShape color={color} />
      </PopoverWrapper>
      <div css={[shame__label, shame__label__long]}>{scevent.id}</div>
    </>
  );
};

const actorIcon = (
  <Icon style={{ width: 15, height: 15, marginRight: 5 }} icon="person" />
);

const approverIcon = (
  <Icon
    style={{ width: 15, height: 15, marginRight: 5 }}
    intent="success"
    icon="endorsed"
  />
);
