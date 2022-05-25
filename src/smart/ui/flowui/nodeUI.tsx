import { Handle, NodeProps, Position } from 'react-flow-renderer';
import { FC, useState } from 'react';
import {
  EditorApproval,
  EditorEGate,
  EditorNode,
  EditorProcess,
  EditorSignalEvent,
  isEditorRegistry,
  isMMELTable,
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
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';

import {
  shameLabel,
  shameLabelLong,
  shameLabelNoAction,
  shameLabelNudge,
  shameLabelShort,
  tooltipLabel,
} from '../../../css/shame';
import { flownodeTopLeftButtonLayout } from '../../../css/layout';
import PopoverWrapper from '../popover/PopoverWrapper';
import ViewMappingbutton from '../mapper/viewmapbutton';
import ViewWorkspaceButton from '../workspace/ViewDataWorkspaceButton';
import { Button, Classes, Dialog, Icon } from '@blueprintjs/core';
import NodeIDField from './NodeIDField';
import {
  MMELFigure,
  MMELTable,
} from '../../serialize/interface/supportinterface';
import NonTextReferenceList from '../popover/NonTextReferenceList';
import TableViewer from '../common/description/TableViewer';
import FigureViewer from '../common/description/FigureViewer';
import LinksList from '../popover/LinksList';
import { handleCSS } from '../../../css/visual';
import NodeComment from '../comment/NodeComment';

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
      <Handle type="source" position={Position.Bottom} style={handleCSS} />
      <Handle type="target" position={Position.Top} style={handleCSS} />
      {isEditorRegistry(node) && onDataWorkspaceActive !== undefined && (
        <ViewWorkspaceButton onClick={() => onDataWorkspaceActive(node.id)} />
      )}
      <PopoverWrapper id={node.id} SD={SD}>
        <DatacubeShape color={color} />
      </PopoverWrapper>
      <div style={{ ...shameLabel, ...shameLabelLong }}>{label}</div>
      {Addon !== undefined && <Addon id={node.id} />}
    </>
  );
};

export const ProcessComponent: FC<NodeProps> = function ({ data }) {
  const [show, setShow] = useState<MMELTable | MMELFigure | undefined>(
    undefined
  );

  const process = data as EditorProcess;
  const callback = data as NodeCallBack;
  const actor = callback.getRoleById(process.actor);
  const PB = ProcessBox[callback.modelType];
  const Addon = callback.NodeAddon;
  const SD = callback.ComponentShortDescription;
  const refs: (MMELTable | MMELFigure)[] = [];
  for (const t of process.tables) {
    const tab = callback.getTableById(t);
    if (tab !== undefined) {
      refs.push(tab);
    }
  }
  for (const f of process.figures) {
    const fig = callback.getFigById(f);
    if (fig !== undefined) {
      refs.push(fig);
    }
  }
  const { addComment, toggleCommentResolved, deleteComment } = callback;

  return (
    <>
      {callback.idVisible && <NodeIDField nodeid={process.id} wide />}
      {callback.commentVisible &&
        addComment &&
        toggleCommentResolved &&
        deleteComment && (
        <NodeComment
          cids={process.comments}
          getCommentById={callback.getCommentById}
          addComment={(msg, parent) => addComment(msg, process.id, parent)}
          toggleCommentResolved={toggleCommentResolved}
          deleteComment={(x, parent) => deleteComment(x, process.id, parent)}
        />
      )}
      <Handle type="source" position={Position.Bottom} style={handleCSS} />
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
      <Handle type="target" position={Position.Top} style={handleCSS} />
      {refs.length > 0 && (
        <div
          style={{
            position : 'fixed',
            right    : -10,
            bottom   : -10,
          }}
        >
          <Popover2
            content={<NonTextReferenceList refs={refs} setShow={setShow} />}
          >
            <Tooltip2 content="View tables/figures" position="top">
              <Button small icon="th" />
            </Tooltip2>
          </Popover2>
        </div>
      )}
      {process.links.size > 0 && (
        <div
          style={{
            position : 'fixed',
            left     : -10,
            bottom   : -10,
          }}
        >
          <Popover2
            content={
              <LinksList
                links={process.links}
                getLinkById={callback.getLinkById}
                index={callback.index}
                goToNextModel={callback.goToNextModel}
              />
            }
          >
            <Tooltip2 content="View links" position="top">
              <Button small icon="link" />
            </Tooltip2>
          </Popover2>
        </div>
      )}
      {process.page !== '' && (
        <div style={flownodeTopLeftButtonLayout}>
          <Tooltip2 content="View subprocess" position="top">
            <Button
              small
              icon="plus"
              onClick={() => callback.onProcessClick(process.page, process.id)}
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
        <div style={{ ...shameLabel, ...shameLabelNoAction }}>
          {actorIcon}
          {actor.name}
        </div>
      )}
      {Addon !== undefined && <Addon id={process.id} />}
      <Dialog
        style={{
          width     : '95vw',
          maxHeight : '90vh',
        }}
        isOpen={show !== undefined}
        onClose={() => setShow(undefined)}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        title={show !== undefined ? show.title : ''}
      >
        <div
          className={Classes.DIALOG_BODY}
          style={{
            display       : 'flex',
            flexDirection : 'column',
            alignItems    : 'center',
            overflowX     : 'visible',
            overflowY     : 'auto',
          }}
        >
          {show !== undefined ? (
            isMMELTable(show) ? (
              <TableViewer table={show} />
            ) : (
              <FigureViewer fig={show} />
            )
          ) : (
            <></>
          )}
        </div>
      </Dialog>
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
      <Handle type="source" position={Position.Bottom} style={handleCSS} />
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
      <Handle type="target" position={Position.Top} style={handleCSS} />
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
            <div style={{ ...shameLabel, ...shameLabelNoAction }}>
              {actorIcon}
              {actor.name}
            </div>
            <div
              style={{
                ...shameLabel,
                ...shameLabelNoAction,
                ...shameLabelNudge,
              }}
            >
              {approverIcon}
              {approver.name}
            </div>
          </>
        ) : (
          <div style={{ ...shameLabel, ...shameLabelNoAction }}>
            {actorIcon}
            {actor.name}
          </div>
        )
      ) : approver !== null ? (
        <div style={{ ...shameLabel, ...shameLabelNoAction }}>
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
      <Handle type="source" position={Position.Bottom} style={handleCSS} />
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
      <Handle type="target" position={Position.Top} style={handleCSS} />
      <PopoverWrapper id={data.id} SD={SD}>
        <EndShape color={color} />
      </PopoverWrapper>
      <div style={{ ...shameLabel, ...shameLabelShort }}>end</div>
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
      <Handle type="source" position={Position.Bottom} style={handleCSS} />
      <Handle type="target" position={Position.Top} style={handleCSS} />
      <PopoverWrapper id={data.id} SD={SD}>
        <TimerShape color={color} />
      </PopoverWrapper>
      <div style={{ ...shameLabel, ...shameLabelShort }}>timer</div>
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
      <Handle type="source" position={Position.Bottom} style={handleCSS} />
      <Handle type="target" position={Position.Top} style={handleCSS} />
      <PopoverWrapper id={egate.id} SD={SD}>
        <EgateShape color={color} />
      </PopoverWrapper>
      <div style={{ width : 0, height : 0 }}>
        <Tooltip2
          content={<div style={tooltipLabel}>{egate.label}</div>}
          position="top"
        >
          <div
            style={{
              ...shameLabel,
              ...shameLabelLong,
              flex            : 1,
              display         : '-webkit-box',
              WebkitLineClamp : 2,
              overflow        : 'hidden',
              WebkitBoxOrient : 'vertical',
            }}
          >
            {egate.label}
          </div>
        </Tooltip2>
      </div>
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
      <Handle type="source" position={Position.Bottom} style={handleCSS} />
      <Handle type="target" position={Position.Top} style={handleCSS} />
      <PopoverWrapper id={scevent.id} SD={SD}>
        <SignalCatchShape color={color} />
      </PopoverWrapper>
      <div style={{ ...shameLabel, ...shameLabelLong }}>{scevent.id}</div>
    </>
  );
};

const actorIcon = (
  <Icon style={{ width : 15, height : 15, marginRight : 5 }} icon="person" />
);

const approverIcon = (
  <Icon
    style={{ width : 15, height : 15, marginRight : 5 }}
    intent="success"
    icon="endorsed"
  />
);
