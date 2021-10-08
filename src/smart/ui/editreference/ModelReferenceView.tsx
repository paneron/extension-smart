/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { ControlGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import makeSidebar from '@riboseinc/paneron-extension-kit/widgets/Sidebar';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import React, { useContext, useMemo, useState } from 'react';
import ReactFlow, { Controls, ReactFlowProvider } from 'react-flow-renderer';
import {
  react_flow_container_layout,
  sidebar_layout,
} from '../../../css/layout';
import { MGDButtonType } from '../../../css/MGDButton';
import MGDButton from '../../MGDComponents/MGDButton';
import {
  addToHistory,
  createPageHistory,
  getBreadcrumbs,
  PageHistory,
  popPage,
} from '../../model/history';
import {
  getEditorReferenceFlowElementsFrom,
  ModelWrapper,
} from '../../model/modelwrapper';
import { EdgeTypes, NodeTypes } from '../../model/States';
import {
  getHighlightedStyleById,
  getHighlightedSVGColorById,
  SearchResultStyles,
} from '../../utils/SearchFunctions';
import LegendPane from '../common/description/LegendPane';
import { DataVisibilityButton, IdVisibleButton } from '../control/buttons';
import SearchComponentPane from '../sidebar/search';
import { SelectedNodeDescription } from '../sidebar/selected';

const ModelReferenceView: React.FC<{
  className?: string;
  modelWrapper: ModelWrapper;
  setModelWrapper: (x: ModelWrapper) => void;
  menuControl: React.ReactNode;
}> = ({ className, modelWrapper, setModelWrapper, menuControl }) => {
  const { usePersistentDatasetStateReducer } = useContext(DatasetContext);

  const Sidebar = useMemo(
    () => makeSidebar(usePersistentDatasetStateReducer!),
    []
  );

  const [history, setHistory] = useState<PageHistory>(
    createPageHistory(modelWrapper)
  );
  const [dvisible, setDVisible] = useState<boolean>(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<Set<string>>(
    new Set<string>()
  );
  const [idVisible, setIdVisible] = useState<boolean>(false);

  function onPageChange(updated: PageHistory, newPage: string) {
    setHistory({ ...updated });
    setModelWrapper({ ...modelWrapper, page: newPage });
  }

  function onPageAndHistroyChange(
    selected: string,
    pageid: string,
    history: PageHistory
  ) {
    setSelected(selected);
    setModelWrapper({ ...modelWrapper, page: pageid });
    setHistory({ items: [...history.items] });
  }

  function resetSearchElements(set: Set<string>) {
    setSelected(null);
    setSearchResult(set);
  }

  function onProcessClick(pageid: string, processid: string): void {
    setModelWrapper({ ...modelWrapper, page: pageid });
    addToHistory(history, pageid, processid);
    setHistory({ ...history });
  }

  function drillUp(): void {
    if (history.items.length > 0) {
      setModelWrapper({ ...modelWrapper, page: popPage(history) });
      setHistory({ ...history });
    }
  }

  function getStyleById(id: string) {
    return getHighlightedStyleById(id, selected, searchResult);
  }

  function getSVGColorById(id: string) {
    return getHighlightedSVGColorById(id, selected, searchResult);
  }

  const toolbar = (
    <ControlGroup>
      {menuControl}
      <MGDButton
        type={MGDButtonType.Secondary}
        disabled={history.items.length <= 1}
        onClick={drillUp}
      >
        Drill up
      </MGDButton>
    </ControlGroup>
  );

  const sidebar = (
    <Sidebar
      stateKey="opened-register-item"
      css={sidebar_layout}
      title="Item metadata"
      blocks={[
        {
          key: 'selected-node',
          title: 'Selected node',
          content: <SelectedNodeDescription modelWrapper={modelWrapper} />,
        },
        {
          key: 'search-node',
          title: 'Search components',
          content: (
            <SearchComponentPane
              model={modelWrapper.model}
              onChange={onPageAndHistroyChange}
              resetSearchElements={resetSearchElements}
            />
          ),
        },
      ]}
    />
  );

  const breadcrumbs = getBreadcrumbs(history, onPageChange);

  return (
    <ReactFlowProvider>
      <Workspace
        className={className}
        toolbar={toolbar}
        sidebar={sidebar}
        navbarProps={{ breadcrumbs }}
        style={{ flex: 3 }}
      >
        <div css={react_flow_container_layout}>
          <ReactFlow
            key="EditorReference"
            elements={getEditorReferenceFlowElementsFrom(
              modelWrapper,
              dvisible,
              onProcessClick,
              getStyleById,
              getSVGColorById,
              idVisible
            )}
            onLoad={params => params.fitView()}
            nodesConnectable={false}
            snapToGrid={true}
            snapGrid={[10, 10]}
            nodeTypes={NodeTypes}
            edgeTypes={EdgeTypes}
            nodesDraggable={false}
            onDragOver={onDragOver}
          >
            <Controls showInteractive={false}>
              <DataVisibilityButton
                isOn={dvisible}
                onClick={() => setDVisible(!dvisible)}
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
  );
};

function onDragOver(event: React.DragEvent<HTMLDivElement>) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

export default ModelReferenceView;
