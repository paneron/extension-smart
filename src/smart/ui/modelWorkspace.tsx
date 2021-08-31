/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext, useMemo, useState } from 'react';

import ReactFlow, {
  Controls,
  OnLoadParams,
  ReactFlowProvider,
} from 'react-flow-renderer';

import { ControlGroup } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';

import makeSidebar from '@riboseinc/paneron-extension-kit/widgets/Sidebar';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';

import {
  createEditorModelWrapper,
  getActionReactFlowElementsFrom,
  ModelWrapper,
} from '../model/modelwrapper';
import {
  addToHistory,
  createPageHistory,
  getBreadcrumbs,
  PageHistory,
  popPage,
} from '../model/history';
import { createNewEditorModel } from '../utils/EditorFactory';
import { ActionState, EdgeTypes, NodeTypes } from '../model/state';
import { SelectedNodeDescription } from './sidebar/selected';
import { DataVisibilityButton } from './control/buttons';
import MGDButton from '../MGDComponents/MGDButton';
import { MGDButtonType } from '../../css/MGDButton';
import { react_flow_container_layout, sidebar_layout } from '../../css/layout';
import SearchComponentPane from './sidebar/search';
import LegendPane from './common/description/LegendPane';
import {
  getHighlightedStyleById,
  getHighlightedSVGColorById,
  SearchResultStyles,
} from '../utils/SearchFunctions';
import {
  createNewSMARTWorkspace,
  SMARTModelStore,
  SMARTWorkspace,
} from '../model/workspace';
import WorkspaceFileMenu from './menu/WorkspaceFileMenu';
import { WorkspaceDiagPackage, WorkspaceDialog } from './dialog/WorkspaceDiag';

const initModel = createNewEditorModel();
const initModelWrapper = createEditorModelWrapper(initModel);

const ModelWorkspace: React.FC<{
  isVisible: boolean;
  className?: string;
}> = ({ isVisible, className }) => {
  const { logger } = useContext(DatasetContext);

  const { usePersistentDatasetStateReducer } = useContext(DatasetContext);

  const Sidebar = useMemo(
    () => makeSidebar(usePersistentDatasetStateReducer!),
    []
  );

  const [state, setState] = useState<ActionState>({
    dvisible: true,
    modelWrapper: initModelWrapper,
    history: createPageHistory(initModelWrapper),
    workspace: createNewSMARTWorkspace(),
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<Set<string>>(
    new Set<string>()
  );

  const [diagProps, setDiagProps] = useState<WorkspaceDiagPackage | null>(null);

  function onLoad(params: OnLoadParams) {
    logger?.log('flow loaded');
    params.fitView();
  }

  const model = state.modelWrapper.model;
  const namespace = model.meta.namespace;
  const modelStore: SMARTModelStore = state.workspace.docs[namespace] ?? {
    id: namespace,
    store: {},
  };

  function toggleDataVisibility() {
    setState({ ...state, dvisible: !state.dvisible });
  }

  function setModelWrapper(mw: ModelWrapper) {
    setState({ ...state, history: createPageHistory(mw), modelWrapper: mw });
  }

  function setWorkspace(ws: SMARTWorkspace) {
    setState({ ...state, workspace: ws });
  }

  function onPageChange(updated: PageHistory, newPage: string) {
    state.history = updated;
    state.modelWrapper.page = newPage;
    setState({ ...state });
  }

  function onProcessClick(pageid: string, processid: string): void {
    const mw = state.modelWrapper;
    mw.page = pageid;
    logger?.log('Go to page', pageid);
    addToHistory(state.history, mw.page, processid);
    setState({ ...state });
  }

  function drillUp(): void {
    if (state.history.items.length > 0) {
      state.modelWrapper.page = popPage(state.history);
      setState({ ...state });
    }
  }

  function onPageAndHistroyChange(
    selected: string,
    pageid: string,
    history: PageHistory
  ) {
    setSelected(selected);
    setState({
      ...state,
      history,
      modelWrapper: { ...state.modelWrapper, page: pageid },
    });
  }

  function getStyleById(id: string) {
    return getHighlightedStyleById(id, selected, searchResult);
  }

  function getSVGColorById(id: string) {
    return getHighlightedSVGColorById(id, selected, searchResult);
  }

  function resetSearchElements(set: Set<string>) {
    setSelected(null);
    setSearchResult(set);
  }

  function onDataWorkspaceActive(id: string) {
    setDiagProps({
      regid: id,
      isFromReactNode: true,
    });
  }

  function setModelStore(doc: SMARTModelStore) {
    const workspace = { ...state.workspace };
    workspace.docs[namespace] = doc;
    setState({ ...state, workspace });
  }

  const toolbar = (
    <ControlGroup>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <WorkspaceFileMenu
            workspace={state.workspace}
            setModelWrapper={setModelWrapper}
            setWorkspace={setWorkspace}
          />
        }
      >
        <MGDButton>Workspace</MGDButton>
      </Popover2>
      <MGDButton
        onClick={() =>
          setDiagProps({
            regid: '',
            isFromReactNode: false,
          })
        }
      >
        Data Registry
      </MGDButton>
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
              model={model}
              pageid={state.modelWrapper.page}
            />
          ),
        },
        {
          key: 'search-node',
          title: 'Search components',
          content: (
            <SearchComponentPane
              model={model}
              onChange={onPageAndHistroyChange}
              resetSearchElements={resetSearchElements}
            />
          ),
        },
      ]}
    />
  );

  if (isVisible) {
    return (
      <ReactFlowProvider>
        {diagProps !== null && (
          <WorkspaceDialog
            diagProps={diagProps}
            onClose={() => setDiagProps(null)}
            modelStore={modelStore}
            setModelStore={setModelStore}
            model={model}
            setRegistry={id =>
              setDiagProps({
                regid: id,
                isFromReactNode: false,
              })
            }
          />
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
              elements={getActionReactFlowElementsFrom(
                state.modelWrapper,
                state.dvisible,
                onProcessClick,
                getStyleById,
                getSVGColorById,
                onDataWorkspaceActive
              )}
              onLoad={onLoad}
              nodesConnectable={false}
              snapToGrid={true}
              snapGrid={[10, 10]}
              nodeTypes={NodeTypes}
              edgeTypes={EdgeTypes}
              nodesDraggable={false}
            >
              <Controls showInteractive={false}>
                <DataVisibilityButton
                  isOn={state.dvisible}
                  onClick={toggleDataVisibility}
                />
              </Controls>
            </ReactFlow>
            {searchResult.size > 0 && (
              <LegendPane list={SearchResultStyles} onLeft={false} />
            )}
          </div>
        </Workspace>
      </ReactFlowProvider>
    );
  }
  return <div></div>;
};

export default ModelWorkspace;
