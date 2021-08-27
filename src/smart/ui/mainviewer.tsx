/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext, useMemo, useState } from 'react';

import ReactFlow, {
  Controls,
  OnLoadParams,
  ReactFlowProvider,
  isNode,  
} from 'react-flow-renderer';

import { ControlGroup, Dialog } from '@blueprintjs/core';
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
  createNewEditorModel,
  createSubprocessComponent,
} from '../utils/EditorFactory';
import { EdgeTypes, EditorState, NodeTypes } from '../model/state';
import {
  EditorModel,
  EditorProcess,
  isEditorData,
  isEditorNode,
} from '../model/editormodel';
import FileMenu from './menu/file';
import { SelectedNodeDescription } from './sidebar/selected';
import {
  DiagPackage,
  DiagTypes,
  IDiagAction,
  MyDiag,
  SetDiagAction,
} from './dialog/dialogs';
import {
  DeletableNodeTypes,  
  EditableNodeTypes,
  EditAction,  
} from '../utils/constants';
import {  
  createNewPage,
} from '../utils/ModelAddComponentHandler';
import MGDButton from '../MGDComponents/MGDButton';
import { MGDButtonType } from '../../css/MGDButton';
import {
  dialog_layout,
  dialog_layout__full,
  react_flow_container_layout,
  sidebar_layout,
} from '../../css/layout';
import { DataVisibilityButton } from './control/buttons';

const initModel = createNewEditorModel();
const initModelWrapper = createEditorModelWrapper(initModel);

const ModelViewer: React.FC<{
  isVisible: boolean;
  className?: string;
}> = ({ isVisible, className }) => {
  const { logger } = useContext(DatasetContext);

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
    id: string
  ) {
    const props: IDiagAction = {
      nodeType: nodeType,
      model: state.modelWrapper.model,
      page: state.modelWrapper.page,
      id: id,
      setModelAfterDelete: (model: EditorModel) => {
        setModelAfterDelete(model);
      },
    };
    saveLayout();
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

  function setNewModelWrapper(mw: ModelWrapper) {
    setState({ ...state, history: createPageHistory(mw), modelWrapper: mw });
  }

  function setModelWrapper(mw: ModelWrapper) {
    setState({ ...state, modelWrapper: mw });
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

  function onSubprocessClick(pid: string): void {
    const model = { ...state.modelWrapper.model };
    const process = model.elements[pid] as EditorProcess;
    process.page = createNewPage(model);
    setState({
      ...state,
      modelWrapper: { ...state.modelWrapper, model: model },
    });
  }  

  function drillUp(): void {
    if (state.history.items.length > 0) {
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
            setNewModelWrapper={setNewModelWrapper}
            getLatestLayout={saveLayout}
            setDialogType={setDialogType}
          />
        }
      >
        <MGDButton>Workspace</MGDButton>
      </Popover2>
      <MGDButton
        type={MGDButtonType.Primary}
        disabled={state.history.items.length <= 1}
        onClick={drillUp}
      >
        Drill up
      </MGDButton>
    </ControlGroup>
  );

  const breadcrumbs = getBreadcrumbs(state.history, onPageChange);

  const sidebar = (
    <Sidebar
      stateKey="opened-register-item"
      css={sidebar_layout}
      title="Item metadata"
      blocks={[
        {
          key: 'selected-node',
          title: 'Selected node',
          content: (
            <SelectedNodeDescription
              model={state.modelWrapper.model}
              pageid={state.modelWrapper.page}
              setDialog={setDiag}
              onSubprocessClick={onSubprocessClick}
            />
          ),
        },        
      ]}
    />
  );

  if (isVisible) {
    const diagProps = dialogPack.type === null ? null : MyDiag[dialogPack.type];
    return (
      <ReactFlowProvider>
        {diagProps !== null && (
          <Dialog
            isOpen={dialogPack !== null}
            title={diagProps.title}
            css={
              diagProps.fullscreen ? [dialog_layout, dialog_layout__full] : ''
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
          <div css={react_flow_container_layout}>
            <ReactFlow
              key="MMELModel"
              elements={getReactFlowElementsFrom(
                state.modelWrapper,
                state.dvisible,
                state.edgeDeleteVisible,
                onProcessClick,
                ()=>{}
              )}
              onLoad={onLoad}                    
              nodesConnectable={false}
              snapToGrid={true}
              snapGrid={[10, 10]}
              nodeTypes={NodeTypes}
              edgeTypes={EdgeTypes}              
            >
              <Controls>
                <DataVisibilityButton
                  isOn={state.dvisible}
                  onClick={toggleDataVisibility}                  
                />                
              </Controls>
            </ReactFlow>
          </div>
        </Workspace>
      </ReactFlowProvider>
    );
  }
  return <div></div>;
};

export default ModelViewer;
