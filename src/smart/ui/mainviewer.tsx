/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext, useMemo, useState } from 'react';

import ReactFlow, {
  Controls,
  OnLoadParams,
  ReactFlowProvider,
} from 'react-flow-renderer';

import {
  Button,
  ControlGroup,
  IToaster,
  IToastProps,
  Toaster,
} from '@blueprintjs/core';
import makeSidebar from '@riboseinc/paneron-extension-kit/widgets/Sidebar';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';

import {
  createEditorModelWrapper,
  getViewerReactFlowElementsFrom,
  ModelWrapper,
} from '../model/modelwrapper';
import {
  addToHistory,
  createPageHistory,
  getBreadcrumbs,
  PageHistory,
  popPage,
  RepoHistory,
} from '../model/history';
import { createNewEditorModel } from '../utils/EditorFactory';
import {
  EdgeTypes,
  FunModel,
  NodeTypes,
  ViewerOption,
  ViewerState,
} from '../model/States';
import { SelectedNodeDescription } from './sidebar/selected';
import MGDButton from '../MGDComponents/MGDButton';
import { MGDButtonType } from '../../css/MGDButton';
import { react_flow_container_layout, sidebar_layout } from '../../css/layout';
import { DataVisibilityButton, IdVisibleButton } from './control/buttons';
import SearchComponentPane from './sidebar/search';
import {
  getHighlightedStyleById,
  getHighlightedSVGColorById,
} from '../utils/SearchFunctions';
import { handleModelOpen } from '../utils/IOFunctions';
import { SidebarBlockConfig } from '@riboseinc/paneron-extension-kit/widgets/Sidebar/Block';
import ViewToolMenu from './menu/ViewToolMenu';
import MeasureCheckPane from './measurement/MeasurementValidationPane';
import { ViewFunctionInterface } from '../model/ViewFunctionModel';
import LegendPane from './common/description/LegendPane';
import { loadPlugin } from './application/plugin';
import { buildModelLinks, getNamespace, Logger } from '../utils/ModelFunctions';
import ChecklistConfigPane from './checklist/CheckListConfigPane';
import {
  MMELProvision,
  MMELReference,
} from '../serialize/interface/supportinterface';
import { MMELDataAttribute } from '../serialize/interface/datainterface';
import SimulationPane from './sidebar/SimulationPane';
import RegistrySummary from './summary/RegistrySummary';
import ProvisionSettings from './summary/ProvisionSettings';
import VersionTrackerSettingPane from './version/VersionTrackerSetting';
import { getPathByNS, JSONToMMEL, RepoFileType } from '../utils/repo/io';
import { MMELRepo, RepoIndex } from '../model/repo';
import RepoBreadcrumb from './common/description/RepoBreadcrumb';
import ViewOptionMenu from './menu/ViewOptionMenu';
import { MMELJSON } from '../model/json';
import MenuButton from './menu/MenuButton';

const initModel = createNewEditorModel();
const initModelWrapper = createEditorModelWrapper(initModel);

export enum FunctionPage {
  Simulation = 'simulation',
  Parameterized = 'para',
  Measurement = 'measurement',
  Checklist = 'checklist',
  DataSummary = 'datasummary',
  ProvisionSummary = 'provisionsummary',
  VersionViewer = 'version',
}

export const FuntionNames: Record<FunctionPage, string> = {
  [FunctionPage.Simulation]: 'Simulation',
  [FunctionPage.Measurement]: 'Measurement validation',
  [FunctionPage.Parameterized]: 'Parameterized view',
  [FunctionPage.Checklist]: 'Self-assessment checklist',
  [FunctionPage.DataSummary]: 'Registry summary',
  [FunctionPage.ProvisionSummary]: 'Provision summary',
  [FunctionPage.VersionViewer]: 'Edition comparison',
};

const ModelViewer: React.FC<{
  isVisible: boolean;
  className?: string;
  repo: MMELRepo;
  index: RepoIndex;
  linktoAnotherRepo: (x: MMELRepo) => void;
  repoHis: RepoHistory;
  setRepoHis: (x: RepoHistory) => void;
}> = ({
  isVisible,
  className,
  repo,
  index,
  linktoAnotherRepo,
  repoHis,
  setRepoHis,
}) => {
  const { useObjectData, requestFileFromFilesystem } =
    useContext(DatasetContext);

  const { usePersistentDatasetStateReducer } = useContext(DatasetContext);

  const Sidebar = useMemo(
    () => makeSidebar(usePersistentDatasetStateReducer!),
    []
  );

  const [state, setState] = useState<ViewerState>({
    modelWrapper: initModelWrapper,
    history: createPageHistory(initModelWrapper),
  });
  const [viewOption, setViewOption] = useState<ViewerOption>({
    dvisible: true,
    idVisible: false,
    repoBCVisible: true,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<Set<string>>(
    new Set<string>()
  );
  const [funPage, setFunPage] = useState<FunctionPage>(
    FunctionPage.VersionViewer
  );
  const [view, setView] = useState<ViewFunctionInterface | undefined>(
    undefined
  );

  const [toaster] = useState<IToaster>(Toaster.create());
  const [funMS, setFunMS] = useState<FunModel | undefined>(undefined);

  const repoPath = getPathByNS(repo ? repo.ns : '', RepoFileType.MODEL);
  const repoModelFile = useObjectData({
    objectPaths: repo !== undefined ? [repoPath] : [],
  });
  const repoData = repo !== undefined ? repoModelFile.value.data[repoPath] : {};

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
      buildModelLinks(mw.model);
      setModelWrapper(mw);
    }
  }, [repoData, repoModelFile.isUpdating]);

  function showMsg(msg: IToastProps) {
    toaster.show(msg);
  }

  function onLoad(params: OnLoadParams) {
    Logger.log('flow loaded');
    params.fitView();
  }

  function toggleDataVisibility() {
    setViewOption({ ...viewOption, dvisible: !viewOption.dvisible });
  }

  function setModelWrapper(mw: ModelWrapper) {
    setView(undefined);
    setState({ ...state, history: createPageHistory(mw), modelWrapper: mw });
  }

  function onPageChange(updated: PageHistory, newPage: string) {
    if (funMS !== undefined) {
      funMS.history = updated;
      funMS.mw.page = newPage;
      setFunMS({ ...funMS });
    } else {
      state.history = updated;
      state.modelWrapper.page = newPage;
      setState({ ...state });
    }
  }

  function onProcessClick(pageid: string, processid: string): void {
    if (
      view !== undefined &&
      view.navigationEnabled !== undefined &&
      !view.navigationEnabled
    ) {
      toaster.show({
        message: view.navigationErrorMsg ?? 'Error',
        intent: 'danger',
      });
    } else {
      onNavigationDown(pageid, processid);
    }
  }

  function onNavigationDown(pageid: string, processid: string): void {
    Logger.log('Go to page', pageid);
    if (funMS !== undefined) {
      const mw = funMS.mw;
      addToHistory(funMS.history, mw.page, processid);
      setFunMS({ mw: { ...mw, page: pageid }, history: funMS.history });
    } else {
      const mw = state.modelWrapper;
      mw.page = pageid;
      addToHistory(state.history, mw.page, processid);
      setState({ ...state });
    }
  }

  function onNavigationUp(): void {
    if (funMS !== undefined) {
      if (funMS.history.items.length > 0) {
        funMS.mw.page = popPage(funMS.history);
        setFunMS({ ...funMS });
      }
    } else {
      if (state.history.items.length > 0) {
        state.modelWrapper.page = popPage(state.history);
        setState({ ...state });
      }
    }
  }

  function drillUp(): void {
    if (
      view !== undefined &&
      view.navigationEnabled !== undefined &&
      !view.navigationEnabled
    ) {
      toaster.show({
        message: view.navigationErrorMsg ?? 'Error',
        intent: 'danger',
      });
    } else {
      onNavigationUp();
    }
  }

  function onPageAndHistroyChange(
    selected: string,
    pageid: string,
    history: PageHistory
  ) {
    setSelected(selected);
    if (funMS !== undefined) {
      setFunMS({
        history,
        mw: { ...funMS.mw, page: pageid },
      });
    } else {
      setState({
        ...state,
        history,
        modelWrapper: { ...state.modelWrapper, page: pageid },
      });
    }
  }

  function getStyleById(id: string) {
    return view !== undefined
      ? funMS !== undefined
        ? view.getStyleById(id, funMS.mw.page, view.data)
        : view.getStyleById(id, mw.page, view.data)
      : getHighlightedStyleById(id, selected, searchResult);
  }

  function getSVGColorById(id: string) {
    return view !== undefined
      ? funMS !== undefined
        ? view.getSVGColorById(id, funMS.mw.page, view.data)
        : view.getSVGColorById(id, mw.page, view.data)
      : getHighlightedSVGColorById(id, selected, searchResult);
  }

  function resetSearchElements(set: Set<string>) {
    setSelected(null);
    setSearchResult(set);
  }

  function getEdgeColor(id: string): string {
    if (view !== undefined && view.getEdgeColor !== undefined) {
      return view.getEdgeColor(
        id,
        funMS !== undefined ? funMS.mw.page : state.modelWrapper.page,
        view.data
      );
    }
    return '';
  }

  function isEdgeAnimated(id: string): boolean {
    if (view !== undefined && view.isEdgeAnimated !== undefined) {
      return view.isEdgeAnimated(
        id,
        funMS !== undefined ? funMS.mw.page : state.modelWrapper.page,
        view.data
      );
    }
    return false;
  }

  function popHis() {
    if (repoHis.length > 1) {
      const newHis = [...repoHis];
      newHis.pop();
      setRepoHis(newHis);
    }
  }

  const mw = state.modelWrapper;
  const model = mw.model;
  const namespace = getNamespace(model);

  const FunPages: Record<FunctionPage, SidebarBlockConfig> = {
    [FunctionPage.Simulation]: {
      key: FunctionPage.Simulation,
      title: FuntionNames[FunctionPage.Simulation],
      collapsedByDefault: false,
      content: (
        <SimulationPane
          model={model}
          setView={setView}
          page={state.modelWrapper.page}
          history={state.history}
          drillUp={onNavigationUp}
          goToPage={onNavigationDown}
        />
      ),
    },
    [FunctionPage.Measurement]: {
      key: FunctionPage.Measurement,
      title: FuntionNames[FunctionPage.Measurement],
      collapsedByDefault: false,
      content: (
        <MeasureCheckPane model={model} setView={setView} showMsg={showMsg} />
      ),
    },
    [FunctionPage.Parameterized]: {
      key: FunctionPage.Parameterized,
      title: FuntionNames[FunctionPage.Parameterized],
      collapsedByDefault: false,
      content: (
        <MeasureCheckPane
          model={model}
          setView={setView}
          showMsg={showMsg}
          branchOnly
        />
      ),
    },
    [FunctionPage.Checklist]: {
      key: FunctionPage.Checklist,
      title: FuntionNames[FunctionPage.Checklist],
      collapsedByDefault: false,
      content: <ChecklistConfigPane setView={setView} model={model} />,
    },
    [FunctionPage.DataSummary]: {
      key: FunctionPage.DataSummary,
      title: FuntionNames[FunctionPage.DataSummary],
      collapsedByDefault: false,
      content: (
        <RegistrySummary
          model={model}
          onChange={onPageAndHistroyChange}
          resetSearchElements={resetSearchElements}
        />
      ),
    },
    [FunctionPage.ProvisionSummary]: {
      key: FunctionPage.ProvisionSummary,
      title: FuntionNames[FunctionPage.ProvisionSummary],
      collapsedByDefault: false,
      content: <ProvisionSettings model={model} />,
    },
    [FunctionPage.VersionViewer]: {
      key: FunctionPage.VersionViewer,
      title: FuntionNames[FunctionPage.VersionViewer],
      collapsedByDefault: false,
      content: (
        <VersionTrackerSettingPane
          mw={{ ...mw }}
          history={funMS !== undefined ? funMS.history : state.history}
          setView={setView}
          setFunctionalState={setFunMS}
        />
      ),
    },
  };

  const ViewStyleComponentDesc: React.FC<{ id: string }> | undefined =
    view !== undefined && view.ComponentToolTip !== undefined
      ? function ({ id }) {
          const SD = view.ComponentToolTip!;
          return (
            <SD
              id={id}
              pageid={funMS !== undefined ? funMS.mw.page : mw.page}
              data={view.data}
            />
          );
        }
      : undefined;

  const ViewStartEndComponentDesc: React.FC<{ id: string }> | undefined =
    view !== undefined && view.StartEndToolTip !== undefined
      ? function ({ id }) {
          const SD = view.StartEndToolTip!;
          return (
            <SD
              id={id}
              pageid={funMS !== undefined ? funMS.mw.page : mw.page}
              data={view.data}
            />
          );
        }
      : undefined;

  const NodeAddon: React.FC<{ id: string }> | undefined =
    view !== undefined && view.NodeAddon !== undefined
      ? function ({ id }) {
          const Addon = view.NodeAddon!;
          return (
            <Addon
              element={model.elements[id]}
              pageid={mw.page}
              data={view.data}
            />
          );
        }
      : undefined;

  const CustomAttribute:
    | React.FC<{
        att: MMELDataAttribute;
        getRefById?: (id: string) => MMELReference | null;
        dcid: string;
      }>
    | undefined =
    view !== undefined && view.CustomAttribute !== undefined
      ? function (props) {
          const Custom = view.CustomAttribute!;
          return <Custom {...props} data={view.data} />;
        }
      : undefined;

  const CustomProvision:
    | React.FC<{
        provision: MMELProvision;
        getRefById?: (id: string) => MMELReference | null;
      }>
    | undefined =
    view !== undefined && view.CustomProvision !== undefined
      ? function (props) {
          const Custom = view.CustomProvision!;
          return <Custom {...props} data={view.data} />;
        }
      : undefined;

  const viewMenu = (
    <ViewOptionMenu viewOption={viewOption} setViewOption={setViewOption} />
  );

  const toolbar = (
    <ControlGroup>
      {repo === undefined && (
        <>
          <Button
            onClick={() =>
              handleModelOpen({
                setModelWrapper,
                requestFileFromFilesystem,
                indexModel: buildModelLinks,
              })
            }
          >
            Open Model
          </Button>
          <Button onClick={() => setModelWrapper({ ...initModelWrapper })}>
            Close
          </Button>
        </>
      )}
      <MenuButton
        content={<ViewToolMenu funPage={funPage} setFunPage={setFunPage} />}
        text="Tools"
      />
      <MenuButton content={viewMenu} text="View" />
      <MGDButton
        type={MGDButtonType.Primary}
        disabled={
          funMS !== undefined
            ? funMS.history.items.length <= 1
            : state.history.items.length <= 1
        }
        onClick={drillUp}
      >
        Drill up
      </MGDButton>
      {repoHis.length > 1 && (
        <MGDButton type={MGDButtonType.Secondary} onClick={popHis}>
          Previous model
        </MGDButton>
      )}
    </ControlGroup>
  );

  const breadcrumbs = getBreadcrumbs(
    funMS !== undefined ? funMS.history : state.history,
    onPageChange
  );

  const selectedSideBlockConfig: SidebarBlockConfig = {
    key: 'selected-node',
    title: 'Selected node',
    content: (
      <SelectedNodeDescription
        modelWrapper={funMS !== undefined ? funMS.mw : state.modelWrapper}
        CustomAttribute={CustomAttribute}
        CustomProvision={CustomProvision}
      />
    ),
  };

  const searchSideBlockConfig: SidebarBlockConfig = {
    key: 'search-node',
    title: 'Search components',
    content: (
      <SearchComponentPane
        model={funMS !== undefined ? funMS.mw.model : state.modelWrapper.model}
        onChange={onPageAndHistroyChange}
        resetSearchElements={resetSearchElements}
      />
    ),
  };

  const normalblocks = [
    selectedSideBlockConfig,
    FunPages[funPage],
    searchSideBlockConfig,
  ];

  const psetting = loadPlugin(namespace);
  const plugin =
    psetting !== undefined
      ? {
          key: psetting.key,
          title: psetting.title,
          content: (
            <psetting.Content
              model={state.modelWrapper.model}
              showMsg={showMsg}
              setView={setView}
            />
          ),
        }
      : undefined;
  const addonblocks =
    plugin !== undefined ? [plugin, ...normalblocks] : normalblocks;

  const sidebar = (
    <Sidebar
      stateKey={`viewer-sidebar-${jsx.length}`}
      css={sidebar_layout}
      title="Item metadata"
      blocks={addonblocks}
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
              elements={getViewerReactFlowElementsFrom(
                funMS !== undefined ? funMS.mw : state.modelWrapper,
                index,
                viewOption.dvisible,
                onProcessClick,
                getStyleById,
                getSVGColorById,
                viewOption.idVisible,
                linktoAnotherRepo,
                view !== undefined && view.ComponentToolTip !== undefined
                  ? ViewStyleComponentDesc
                  : undefined,
                NodeAddon,
                view !== undefined && view.getEdgeColor !== undefined
                  ? getEdgeColor
                  : undefined,
                view !== undefined && view.isEdgeAnimated !== undefined
                  ? isEdgeAnimated
                  : undefined,
                ViewStartEndComponentDesc
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
                  isOn={viewOption.dvisible}
                  onClick={toggleDataVisibility}
                />
                <IdVisibleButton
                  isOn={viewOption.idVisible}
                  onClick={() =>
                    setViewOption({
                      ...viewOption,
                      idVisible: !viewOption.idVisible,
                    })
                  }
                />
              </Controls>
            </ReactFlow>
            {view !== undefined && view.legendList !== undefined && (
              <LegendPane list={view.legendList} onLeft={false} />
            )}
            {repoHis.length > 1 && viewOption.repoBCVisible && (
              <RepoBreadcrumb repoHis={repoHis} setRepoHis={setRepoHis} />
            )}
          </div>
        </Workspace>
      </ReactFlowProvider>
    );
  }
  return <div></div>;
};

export default ModelViewer;
