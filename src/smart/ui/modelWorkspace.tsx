/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext, useMemo, useState } from 'react';

import ReactFlow, { Controls, ReactFlowProvider } from 'react-flow-renderer';

import { HotkeysTarget2, IToaster, Toaster } from '@blueprintjs/core';

import makeSidebar from '@riboseinc/paneron-extension-kit/widgets/Sidebar';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';

import {
  getActionReactFlowElementsFrom,
  ModelWrapper,
} from '../model/modelwrapper';
import { createModelHistory, PageHistory } from '../model/history';
import { EdgeTypes, NodeTypes } from '../model/States';
import { SelectedNodeDescription } from './sidebar/selected';
import { DataVisibilityButton, IdVisibleButton } from './control/buttons';
import { react_flow_container_layout, sidebar_layout } from '../../css/layout';
import SearchComponentPane from './sidebar/search_deprecated';
import LegendPane from './common/description/LegendPane';
import {
  getHighlightedStyleById,
  getHighlightedSVGColorById,
  SearchResultStyles,
} from '../utils/SearchFunctions';
import { SMARTModelStore, SMARTWorkspace } from '../model/workspace';
import WorkspaceFileMenu from './menu/WorkspaceFileMenu';
import { WorkspaceDiagPackage, WorkspaceDialog } from './dialog/WorkspaceDiag';
import { getNamespace } from '../utils/ModelFunctions';
import { COMMITMSG, getPathByNS, RepoFileType } from '../utils/repo/io';
import { MMELRepo, RepoIndex } from '../model/repo';
import { EditorModel } from '../model/editormodel';
import { HistoryAction, useHistory } from '../model/editor/history';
import { getBreadcrumbs } from './common/description/fields';

const ModelWorkspace: React.FC<{
  isVisible: boolean;
  className?: string;
  repo: MMELRepo;
  index: RepoIndex;
  model: EditorModel;
  ws: SMARTWorkspace;
}> = ({ isVisible, className, repo, index, model, ws }) => {
  const { updateObjects, usePersistentDatasetStateReducer } =
    useContext(DatasetContext);

  const Sidebar = useMemo(
    () => makeSidebar(usePersistentDatasetStateReducer!),
    []
  );

  const [workspace, setWS] = useState<SMARTWorkspace>(ws);
  const [page, setPage] = useState<string>(model.root);
  const [history, actHistory] = useHistory(createModelHistory(model));

  const mw: ModelWrapper = { page, model, type: 'model' };

  const [selected, setSelected] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<Set<string>>(
    new Set<string>()
  );

  const [diagProps, setDiagProps] = useState<WorkspaceDiagPackage | undefined>(
    undefined
  );
  const [idVisible, setIdVisible] = useState<boolean>(false);
  const [dvisible, setDVisible] = useState<boolean>(true);

  const [toaster] = useState<IToaster>(Toaster.create());

  const workPath = getPathByNS(repo.ns, RepoFileType.WORKSPACE);

  const namespace = getNamespace(model);
  const modelStore: SMARTModelStore = workspace.docs[namespace] ?? {
    id: namespace,
    store: {},
  };

  function toggleDataVisibility() {
    setDVisible(x => !x);
  }

  function onPageChange(action: HistoryAction, newPage: string) {
    setPage(newPage);
    actHistory(action);
  }

  function onProcessClick(pageid: string, processid: string): void {
    const action: HistoryAction = {
      type: 'history',
      act: 'push',
      value: [{ page: pageid, pathtext: processid }],
    };
    setPage(pageid);
    actHistory(action);
  }

  function drillUp(): void {
    if (history.length > 1) {
      const action: HistoryAction = { type: 'history', act: 'pop', value: 1 };
      setPage(history[history.length - 2].page);
      actHistory(action);
    }
  }

  function onPageAndHistroyChange(
    selected: string,
    pageid: string,
    history: PageHistory
  ) {
    setSelected(selected);
    const action: HistoryAction = {
      type: 'history',
      act: 'replace',
      value: history.items,
    };
    actHistory(action);
    setPage(pageid);
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
    const newWS = { ...workspace };
    newWS.docs[namespace] = doc;
    setWS(newWS);
  }

  const toolbar = (
    <WorkspaceFileMenu
      onRepoSave={saveWork}
      setDiagProps={setDiagProps}
      drillUp={drillUp}
    />
  );

  const breadcrumbs = getBreadcrumbs(history, onPageChange);

  const sidebar = (
    <Sidebar
      stateKey={`workspace-sidebar-${jsx.length}`}
      css={sidebar_layout}
      title="Item metadata"
      blocks={[
        {
          key: 'selected-node',
          title: 'Selected node',
          content: <SelectedNodeDescription modelWrapper={mw} />,
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
          [workPath]: { newValue: workspace },
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
      <HotkeysTarget2 hotkeys={hotkeys}>
        <ReactFlowProvider>
          {diagProps && (
            <WorkspaceDialog
              diagProps={diagProps}
              onClose={() => setDiagProps(undefined)}
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
                  mw,
                  index,
                  dvisible,
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
                    isOn={dvisible}
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
    );
  }
  return <div></div>;
};

export default ModelWorkspace;
