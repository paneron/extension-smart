/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext, useMemo, useState } from 'react';

import ReactFlow, { Controls, ReactFlowProvider } from 'react-flow-renderer';

import type { IToaster } from '@blueprintjs/core';
import { HotkeysTarget2, Toaster } from '@blueprintjs/core';

import makeSidebar from '@riboseinc/paneron-extension-kit/widgets/Sidebar';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';

import type {
  ModelWrapper } from '@/smart/model/modelwrapper';
import {
  getActionReactFlowElementsFrom
} from '@/smart/model/modelwrapper';
import type { HistoryItem } from '@/smart/model/history';
import { createModelHistory } from '@/smart/model/history';
import { EdgeTypes, NodeTypes } from '@/smart/model/States';
import { DataVisibilityButton, IdVisibleButton } from '@/smart/ui/control/buttons';
import { react_flow_container_layout, sidebar_layout } from '@/css/layout';
import LegendPane from '@/smart/ui/common/description/LegendPane';
import {
  getHighlightedStyleById,
  getHighlightedSVGColorById,
  SearchResultStyles,
} from '@/smart/utils/SearchFunctions';
import type { SMARTModelStore, SMARTWorkspace } from '@/smart/model/workspace';
import WorkspaceFileMenu from '@/smart/ui/menu/WorkspaceFileMenu';
import type { WorkspaceDiagPackage } from '@/smart/ui/dialog/WorkspaceDiag';
import { WorkspaceDialog } from '@/smart/ui/dialog/WorkspaceDiag';
import { getNamespace } from '@/smart/utils/ModelFunctions';
import { COMMITMSG, getPathByNS, RepoFileType } from '@/smart/utils/repo/io';
import type { MMELRepo, RepoIndex } from '@/smart/model/repo';
import type { EditorModel } from '@/smart/model/editormodel';
import type { HistoryAction } from '@/smart/model/editor/history';
import { useHistory } from '@/smart/model/editor/history';
import { getBreadcrumbs } from '@/smart/ui/common/description/fields';
import { SelectedNodeDescription } from '@/smart/ui/sidebar/selected';
import SearchComponentPane from '@/smart/ui/sidebar/search';

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

  const mw: ModelWrapper = { page, model, type : 'model' };

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
    id    : namespace,
    store : {},
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
      type  : 'history',
      act   : 'push',
      value : [{ page : pageid, pathtext : processid }],
    };
    setPage(pageid);
    actHistory(action);
  }

  function drillUp(): void {
    if (history.length > 1) {
      const action: HistoryAction = { type : 'history', act : 'pop', value : 1 };
      setPage(history[history.length - 2].page);
      actHistory(action);
    }
  }

  function onPageAndHistroyChange(selected: string, history: HistoryItem[]) {
    const pageid = history[history.length - 1].page;
    setSelected(selected);
    const action: HistoryAction = {
      type  : 'history',
      act   : 'replace',
      value : history,
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
      regid           : id,
      isFromReactNode : true,
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
          key     : 'selected-node',
          title   : 'Selected node',
          content : <SelectedNodeDescription model={model} page={page} />,
        },
        {
          key     : 'search-node',
          title   : 'Search components',
          content : (
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
      combo     : 'ctrl+s',
      global    : true,
      label     : 'Save Workspace',
      onKeyDown : saveWork,
    },
  ];

  async function saveWork() {
    if (repo && updateObjects && isVisible) {
      const task = updateObjects({
        commitMessage              : COMMITMSG,
        _dangerouslySkipValidation : true,
        objectChangeset            : {
          [workPath] : { newValue : workspace },
        },
      });
      task.then(() =>
        toaster.show({
          message : 'Workspace saved',
          intent  : 'success',
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
                  regid           : id,
                  isFromReactNode : false,
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
