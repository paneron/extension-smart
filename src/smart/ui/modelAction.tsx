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
import {
  createNewEditorModel,
  createSubprocessComponent,
} from '../utils/EditorFactory';
import { ActionState, EdgeTypes, NodeTypes } from '../model/state';
import {
  isEditorData,
  isEditorNode,
} from '../model/editormodel';
import { SelectedNodeDescription } from './sidebar/selected';
import { DataVisibilityButton } from './control/buttons';
import MGDButton from '../MGDComponents/MGDButton';
import { MGDButtonType } from '../../css/MGDButton';
import {  
  react_flow_container_layout,
  sidebar_layout,
} from '../../css/layout';
import SearchComponentPane from './sidebar/search';
import LegendPane from './common/description/LegendPane';
import {
  getHighlightedStyleById,
  getHighlightedSVGColorById,
  SearchResultStyles,
} from '../utils/SearchFunctions';
import { createNewSMARTWorkspace, SMARTWorkspace } from '../model/workspace';
import WorkspaceFileMenu from './menu/WorkspaceFileMenu';

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
  const [rfInstance, setRfInstance] = useState<OnLoadParams | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<Set<string>>(
    new Set<string>()
  );

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

  function setModelWrapper(mw: ModelWrapper) {
    setState({ ...state, history: createPageHistory(mw), modelWrapper: mw });
  }  

  function setWorkspace(ws: SMARTWorkspace) {
    setState({ ...state, workspace: ws});
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

  function drillUp(): void {
    if (state.history.items.length > 0) {
      saveLayout();
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
            />
          ),
        },       
        {
          key: 'search-node',
          title: 'Search components',
          content: (
            <SearchComponentPane
              model={state.modelWrapper.model}
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
                getSVGColorById
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
