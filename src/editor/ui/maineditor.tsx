/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx, css } from '@emotion/react';
import React, {
  CSSProperties,
  RefObject,
  useContext,
  useMemo,
  useState,
} from 'react';

import ReactFlow, {
  Controls,
  OnLoadParams,
  ReactFlowProvider,
  isNode,
  ControlButton,
  //useZoomPanHelper,
} from 'react-flow-renderer';

import { Button, ControlGroup, Dialog } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';

import makeSidebar from '@riboseinc/paneron-extension-kit/widgets/Sidebar';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';

// import { SelectedNodeDescription } from './component/infopane';
// import ControlPane from './component/controlpane';
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
import {
  EditorSubprocess,
  isEditorData,
  isEditorNode,
} from '../model/editormodel';
import FileMenu from './menu/file';
import { SelectedNodeDescription } from './sidebar/selected';
import { DiagTypes, MyDiag } from '../model/dialog';
// import {
//   edgeTypes,
//   ISearch,
//   IState,
//   nodeTypes,
//   SearchMan,
//   StateMan,
// } from './interface/state';
// import NewComponentPane from './component/newcomponentpane';
// import BasicSettingPane from './component/basicsetting';
// import FilterPane from './component/filterpane';
// import { functionCollection } from './util/function';
// import RepoEditPane from './component/edit/repoedit';
// import OnePageChecklist from './component/onepagechecklist';
// import EditProcessPage from './component/processedit';
// import EditApprovalPage from './component/approvaledit';
// import { EditSCEventPage, EditTimerPage } from './component/eventedit';
// import { IEdgeLabel } from './interface/datainterface';
// import { EditEGatePage } from './component/editEgate';
// import SimulationPage from './component/simulationpane';
// import ImportPane from './component/importpane';
// import AIPane from './component/aipane';
// import MeasureCheckPane from './component/measurementcheckpane';
// import LegendPane from './util/legendpane';
// import { DataType, MMELNode } from '../serialize/interface/baseinterface';
// import { MMELFactory } from '../runtime/modelComponentCreator';
// import { ProgressManager } from './util/progressmanager';
// import {
//   MMELEGate,
//   MMELSubprocess,
// } from '../serialize/interface/flowcontrolinterface';
// import { MMELRegistry } from '../serialize/interface/datainterface';
// import {
//   MMELApproval,
//   MMELProcess,
// } from '../serialize/interface/processinterface';
// import {
//   MMELSignalCatchEvent,
//   MMELTimerEvent,
// } from '../serialize/interface/eventinterface';
// import { NodeData } from './nodecontainer';
// import IndexPane from './component/IndexPane';
// import { DataIndexer } from './util/datasearchmanager';
// import { MODAILITYOPTIONS } from '../runtime/idManager';

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
    nvisible: false,
    aivisible: false,
    edgeDeleteVisible: false,
    importvisible: false,
  });
  const [rfInstance, setRfInstance] = useState<OnLoadParams | null>(null);
  const [dialogType, setDialogType] = useState<DiagTypes | null>(null);

  function onLoad(params: OnLoadParams) {
    logger?.log('flow loaded');
    setRfInstance(params);
    params.fitView();
  }

  function saveLayout() {
    logger?.log('Save Layout');
    if (rfInstance !== null) {
      for (const x of rfInstance.getElements()) {
        const data = x.data;
        const mw = state.modelWrapper;
        const page = mw.page;
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
    state.dvisible = !state.dvisible;
    if (!state.dvisible) {
      saveLayout();
    }
    setState({ ...state });
  }

  function setModelWrapper(mw: ModelWrapper) {
    setState({ ...state, history: createPageHistory(mw), modelWrapper: mw });
  }

  function onDragOver(event: React.DragEvent<any>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  function onPageChange(updated: PageHistory, newPage: EditorSubprocess) {
    saveLayout();
    state.history = updated;
    state.modelWrapper.page = newPage;
    setState({ ...state });
  }

  function onProcessClick(pageid: string, processid: string): void {
    saveLayout();
    const mw = state.modelWrapper;
    mw.page = mw.model.pages[pageid];
    logger?.log('Go to page', pageid);
    addToHistory(state.history, mw.page, processid);
    setState({ ...state });
  }

  function drillUp(): void {
    if (state.history.history.length > 0) {
      saveLayout();
      state.modelWrapper.page = popPage(state.history);
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
            setModelWrapper={setModelWrapper}
            saveModel={saveLayout}
            setDialogType={setDialogType}
          />
        }
      >
        <Button>Workspace</Button>
      </Popover2>
      <Button disabled={state.history.history.length <= 1} onClick={drillUp}>
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
      ]}
    />
  );

  let ret: JSX.Element;
  if (isVisible) {
    const diagProps = dialogType === null ? null : MyDiag[dialogType];
    ret = (
      <ReactFlowProvider>
        {diagProps !== null && (
          <Dialog
            isOpen={dialogType !== null}
            title={diagProps.title}
            css={css`
              width: calc(100vw - 60px);
              height: calc(100vh - 60px);
              padding-bottom: 0;
              & > :last-child {
                overflow-y: auto;
                padding: 20px;
              }
            `}
            onClose={() => setDialogType(null)}
            canEscapeKeyClose={false}
            canOutsideClickClose={false}
          >
            <diagProps.Panel
              modelwrapper={state.modelWrapper}
              setModelWrapper={setModelWrapper}
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
                onProcessClick
              )}
              onLoad={onLoad}
              onDragOver={onDragOver}
              snapToGrid={true}
              snapGrid={[10, 10]}
              nodeTypes={NodeTypes}
              edgeTypes={EdgeTypes}
              ref={canvusRef}
            >
              <Controls>
                <ControlButton
                  style={getStyle(state.dvisible)}
                  onClick={() => toggleDataVisibility()}
                >
                  {' '}
                  Dat{' '}
                </ControlButton>
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

function getStyle(on: boolean): CSSProperties {
  return on ? { background: '#3d3' } : {};
}

export default ModelEditor;
