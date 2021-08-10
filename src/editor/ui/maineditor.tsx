/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx, css } from '@emotion/react';
import React, { RefObject, useContext, useMemo, useState } from 'react';

import ReactFlow, {
  Controls,
  OnLoadParams,
  ReactFlowProvider,
  isNode,
  Connection,
  Edge,
} from 'react-flow-renderer';

import { Button, ControlGroup, Dialog } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';

import makeSidebar from '@riboseinc/paneron-extension-kit/widgets/Sidebar';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';

import {
  createEditorModelWrapper,
  getReactFlowElementsFrom,
  ModelWrapper,
} from '../model/modelwrapper';
import {
  addToHistory,
  createPageHistory,
  getBreadcrumbs,
  PageHistory,
  popPage,
} from '../model/history';
import {
  createNewModel,
  createSubprocessComponent,
} from '../utils/EditorFactory';
import { EdgeTypes, EditorState, NodeTypes } from '../model/state';
import { EditorModel, isEditorData, isEditorNode } from '../model/editormodel';
import FileMenu from './menu/file';
import { SelectedNodeDescription } from './sidebar/selected';
import {
  DiagPackage,
  DiagTypes,
  IDiagAction,
  MyDiag,
  SetDiagAction,
} from './dialog/dialogs';
import { CustomizedControlButton as IconControlButton } from './control/buttons';
import NewComponentPane from './control/newComponentPane';
import {
  DeletableNodeTypes,
  DragAndDropFormatType,
  EditableNodeTypes,
  EditAction,
  NewComponentTypes,
} from '../utils/constants';
import {
  addComponentToModel,
  addEdge,
} from '../utils/ModelAddComponentHandler';
import { EdgePackage } from './flowui/container';
import { deleteEdge } from '../utils/ModelRemoveComponentHandler';

const initModel = createNewModel();
const initModelWrapper = createEditorModelWrapper(initModel);

const ModelEditor: React.FC<{
  isVisible: boolean;
  className?: string;
}> = ({ isVisible, className }) => {
  const { logger } = useContext(DatasetContext);
  const canvusRef: RefObject<HTMLDivElement> = React.createRef();

  const { usePersistentDatasetStateReducer } = useContext(DatasetContext);

  const Sidebar = useMemo(
    () => makeSidebar(usePersistentDatasetStateReducer!),
    []
  );

  const [state, setState] = useState<EditorState>({
    dvisible: true,
    modelWrapper: initModelWrapper,
    history: createPageHistory(initModelWrapper),
    edgeDeleteVisible: false,
  });
  const [rfInstance, setRfInstance] = useState<OnLoadParams | null>(null);
  const [dialogPack, setDialogPack] = useState<DiagPackage>({
    type: null,
    callback: () => {},
    msg: '',
  });

  function onLoad(params: OnLoadParams) {
    logger?.log('flow loaded');
    setRfInstance(params);
    params.fitView();
  }

  function setDialogType(x: DiagTypes | null) {
    setDialogPack({ ...dialogPack, type: x });
  }

  function setModelAfterDelete(model: EditorModel) {
    setState({
      ...state,
      modelWrapper: { ...state.modelWrapper, model: model },
    });
    setDialogType(null);
  }

  function setDiag(
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string,
    resetSelection: () => void
  ) {
    const props: IDiagAction = {
      nodeType: nodeType,
      model: state.modelWrapper.model,
      page: state.modelWrapper.page,
      id: id,
      setModelAfterDelete: (model: EditorModel) => {
        setModelAfterDelete(model);
        resetSelection();
      },
    };
    const x = SetDiagAction[action](props);
    logger?.log(x);
    setDialogPack(SetDiagAction[action](props));
  }

  function saveLayout() {
    logger?.log('Save Layout');
    if (rfInstance !== null) {
      for (const x of rfInstance.getElements()) {
        const data = x.data;
        const mw = state.modelWrapper;
        const page = mw.model.pages[mw.page];
        if (isNode(x) && isEditorNode(data)) {
          const node = isEditorData(data)
            ? page.data[data.id]
            : page.childs[data.id];
          if (node !== undefined) {
            node.x = x.position.x;
            node.y = x.position.y;
          } else {
            const nc = createSubprocessComponent(data.id);
            if (isEditorData(data)) {
              page.data[data.id] = nc;
            } else {
              page.childs[data.id] = nc;
            }
            nc.x = x.position.x;
            nc.y = x.position.y;
          }
        }
      }
    }
    return state.modelWrapper;
  }

  function toggleDataVisibility() {
    if (state.dvisible) {
      saveLayout();
    }
    setState({ ...state, dvisible: !state.dvisible });
  }

  function toggleEdgeDelete() {
    setState({ ...state, edgeDeleteVisible: !state.edgeDeleteVisible });
  }

  function setNewModelWrapper(mw: ModelWrapper) {
    setState({ ...state, history: createPageHistory(mw), modelWrapper: mw });
  }

  function setModelWrapper(mw: ModelWrapper) {
    setState({ ...state, modelWrapper: mw });
  }

  function onDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  function onPageChange(updated: PageHistory, newPage: string) {
    saveLayout();
    state.history = updated;
    state.modelWrapper.page = newPage;
    setState({ ...state });
  }

  function onProcessClick(pageid: string, processid: string): void {
    saveLayout();
    const mw = state.modelWrapper;
    mw.page = pageid;
    logger?.log('Go to page', pageid);
    addToHistory(state.history, mw.page, processid);
    setState({ ...state });
  }

  function removeEdge(id: string) {
    deleteEdge(state.modelWrapper.model, state.modelWrapper.page, id);
    setState({ ...state });
  }

  function drillUp(): void {
    if (state.history.items.length > 0) {
      saveLayout();
      state.modelWrapper.page = popPage(state.history);
      setState({ ...state });
    }
  }

  function onDrop(event: React.DragEvent<any>) {
    event.preventDefault();
    if (canvusRef.current !== null && rfInstance !== null) {
      const reactFlowBounds = canvusRef.current.getBoundingClientRect();
      const type = event.dataTransfer.getData(DragAndDropFormatType);
      const pos = rfInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const model = addComponentToModel(
        state.modelWrapper,
        type as NewComponentTypes,
        pos
      );
      setState({ ...state, modelWrapper: { ...state.modelWrapper, model } });
    }
  }

  function connectHandle(x: Edge<EdgePackage> | Connection) {
    if (x.source !== null && x.target !== null) {
      const mw = state.modelWrapper;
      const page = mw.model.pages[mw.page];
      mw.model.pages[mw.page] = addEdge(
        page,
        mw.model.elements,
        x.source,
        x.target
      );
      setState({ ...state });
    }
  }

  const toolbar = (
    <ControlGroup>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <FileMenu
            setNewModelWrapper={setNewModelWrapper}
            getLatestLayout={saveLayout}
            setDialogType={setDialogType}
          />
        }
      >
        <Button>Workspace</Button>
      </Popover2>
      <Button disabled={state.history.items.length <= 1} onClick={drillUp}>
        Drill up
      </Button>
    </ControlGroup>
  );

  const breadcrumbs = getBreadcrumbs(state.history, onPageChange);

  const sidebar = (
    <Sidebar
      stateKey="opened-register-item"
      css={css`
        width: 280px;
        z-index: 1;
      `}
      title="Item metadata"
      blocks={[
        {
          key: 'selected-node',
          title: 'Selected node',
          content: <SelectedNodeDescription />,
        },
        {
          key: 'create-node',
          title: 'Add components',
          content: <NewComponentPane />,
        },
      ]}
    />
  );

  let ret: JSX.Element;
  if (isVisible) {
    const diagProps = dialogPack.type === null ? null : MyDiag[dialogPack.type];
    ret = (
      <ReactFlowProvider>
        {diagProps !== null && (
          <Dialog
            isOpen={dialogPack !== null}
            title={diagProps.title}
            css={
              diagProps.fullscreen
                ? css`
                    width: calc(100vw - 60px);
                    min-height: calc(100vh - 60px);
                    padding-bottom: 0;
                    & > :last-child {
                      overflow-y: auto;
                      padding: 20px;
                    }
                  `
                : ''
            }
            onClose={() => setDialogType(null)}
            canEscapeKeyClose={false}
            canOutsideClickClose={false}
          >
            <diagProps.Panel
              modelwrapper={state.modelWrapper}
              setModelWrapper={setModelWrapper}
              callback={dialogPack.callback}
              cancel={() => {
                setDialogType(null);
              }}
              msg={dialogPack.msg}
            />
          </Dialog>
        )}
        <Workspace
          className={className}
          toolbar={toolbar}
          sidebar={sidebar}
          navbarProps={{ breadcrumbs }}
        >
          <div
            css={css`
              flex: 1;
              position: relative;
            `}
          >
            <ReactFlow
              key="MMELModel"
              elements={getReactFlowElementsFrom(
                state.modelWrapper,
                state.dvisible,
                state.edgeDeleteVisible,
                onProcessClick,
                removeEdge,
                setDiag
              )}
              onLoad={onLoad}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onConnect={connectHandle}
              nodesConnectable={true}
              snapToGrid={true}
              snapGrid={[10, 10]}
              nodeTypes={NodeTypes}
              edgeTypes={EdgeTypes}
              ref={canvusRef}
            >
              <Controls>
                <IconControlButton
                  isOn={state.dvisible}
                  onClick={toggleDataVisibility}
                  icon="cube"
                />
                <IconControlButton
                  isOn={state.edgeDeleteVisible}
                  onClick={toggleEdgeDelete}
                  icon="link"
                />
              </Controls>
            </ReactFlow>
          </div>
        </Workspace>
      </ReactFlowProvider>
    );
  } else {
    ret = <div></div>;
  }
  return ret;
};

export default ModelEditor;
