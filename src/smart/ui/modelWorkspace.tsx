/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext, useMemo, useState } from 'react';

import ReactFlow, { Controls, ReactFlowProvider } from 'react-flow-renderer';

import {
  ControlGroup,
  HotkeysProvider,
  HotkeysTarget2,
  IToaster,
  Toaster,
} from '@blueprintjs/core';
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
import { ActionState, EdgeTypes, NodeTypes } from '../model/States';
import { SelectedNodeDescription } from './sidebar/selected';
import { DataVisibilityButton, IdVisibleButton } from './control/buttons';
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
import { getNamespace } from '../utils/ModelFunctions';
import {
  COMMITMSG,
  getPathByNS,
  JSONToMMEL,
  RepoFileType,
} from '../utils/repo/io';
import { MMELJSON } from '../model/json';
import { MMELRepo } from '../model/repo';

const initModel = createNewEditorModel();
const initModelWrapper = createEditorModelWrapper(initModel);

const ModelWorkspace: React.FC<{
  isVisible: boolean;
  className?: string;
  repo?: MMELRepo;
}> = ({ isVisible, className, repo }) => {
  const { useObjectData, updateObjects } = useContext(DatasetContext);

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
  const [idVisible, setIdVisible] = useState<boolean>(false);

  const [toaster] = useState<IToaster>(Toaster.create());

  const repoPath = getPathByNS(repo ? repo.ns : '', RepoFileType.MODEL);
  const workPath = getPathByNS(repo ? repo.ns : '', RepoFileType.WORKSPACE);
  const repoModelFile = useObjectData({
    objectPaths: repo !== undefined ? [repoPath, workPath] : [],
  });
  const repoData = repo !== undefined ? repoModelFile.value.data[repoPath] : {};
  const workData = repo !== undefined ? repoModelFile.value.data[workPath] : {};

  useMemo(() => {
    if (
      repo !== undefined &&
      repoData !== null &&
      repoData !== undefined &&
      !repoModelFile.isUpdating
    ) {
      const json = repoData as MMELJSON;
      const model = JSONToMMEL(json);
      const mw = createEditorModelWrapper(model);
      const ws =
        workData !== undefined && workData !== null
          ? (workData as SMARTWorkspace)
          : createNewSMARTWorkspace();
      setState({
        ...state,
        history: createPageHistory(mw),
        modelWrapper: mw,
        workspace: ws,
      });
    }
  }, [repoData, repoModelFile.isUpdating]);

  const model = state.modelWrapper.model;
  const namespace = getNamespace(model);
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

  function onClose() {
    setState({
      dvisible: state.dvisible,
      modelWrapper: initModelWrapper,
      history: createPageHistory(initModelWrapper),
      workspace: createNewSMARTWorkspace(),
    });
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
            onClose={onClose}
            isRepoMode={repo !== undefined}
            onRepoSave={saveWork}
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
            <SelectedNodeDescription modelWrapper={state.modelWrapper} />
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

  const hotkeys = [
    {
      combo: 'ctrl+s',
      global: true,
      label: 'Save Workspace',
      onKeyDown: saveWork,
    },
  ];

  async function saveWork() {
    if (repo && updateObjects && isVisible) {
      const task = updateObjects({
        commitMessage: COMMITMSG,
        _dangerouslySkipValidation: true,
        objectChangeset: {
          [workPath]: { newValue: state.workspace },
        },
      });
      task.then(() =>
        toaster.show({
          message: 'Workspace saved',
          intent: 'success',
        })
      );
    }
  }

  if (isVisible) {
    return (
      <HotkeysProvider>
        <HotkeysTarget2 hotkeys={hotkeys}>
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
                  elements={getActionReactFlowElementsFrom(
                    state.modelWrapper,
                    state.dvisible,
                    onProcessClick,
                    getStyleById,
                    getSVGColorById,
                    onDataWorkspaceActive,
                    idVisible
                  )}
                  onLoad={para => para.fitView()}
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
                    <IdVisibleButton
                      isOn={idVisible}
                      onClick={() => setIdVisible(x => !x)}
                    />
                  </Controls>
                </ReactFlow>
                {searchResult.size > 0 && (
                  <LegendPane list={SearchResultStyles} onLeft={false} />
                )}
              </div>
            </Workspace>
          </ReactFlowProvider>
        </HotkeysTarget2>
      </HotkeysProvider>
    );
  }
  return <div></div>;
};

export default ModelWorkspace;
