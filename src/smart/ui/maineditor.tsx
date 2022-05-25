/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, {
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import ReactFlow, {
  Controls,
  OnLoadParams,
  ReactFlowProvider,
  isNode,
  Connection,
  Edge,
} from 'react-flow-renderer';

import {
  Button,
  ControlGroup,
  Dialog,
  HotkeyConfig,
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
  getEditorReactFlowElementsFrom,
} from '../model/modelwrapper';
import {
  getBreadcrumbsActions,
  HistoryItem,
  RepoHistory,
} from '../model/history';
import {
  EdgeTypes,
  EditorState,
  EditorViewOption,
  isModelWrapper,
  NodeTypes,
  ReferenceContent,
} from '../model/States';
import { EditorDataClass } from '../model/editormodel';
import EditorFileMenu from './menu/EditorFileMenu';
import {
  DataVisibilityButton,
  EdgeEditButton,
  IdVisibleButton,
} from './control/buttons';
import NewComponentPane from './control/newComponentPane';
import {
  DOCVERSION,
  DragAndDropImportRefType,
  DragAndDropNewFormatType,
  NewComponentTypes,
} from '../utils/constants';
import { getAddComponentAction } from '../utils/ModelAddComponentHandler';
import { EdgePackage } from '../model/FlowContainer';
import MGDButton from '../MGDComponents/MGDButton';
import { MGDButtonType } from '../../css/MGDButton';
import {
  dialog_layout,
  dialog_layout__full,
  multi_model_container,
  react_flow_container_layout,
  sidebar_layout,
} from '../../css/layout';
import { checkId, genDCIdByRegId, Logger } from '../utils/ModelFunctions';
import LegendPane from './common/description/LegendPane';
import {
  getHighlightedStyleById,
  getHighlightedSVGColorById,
  SearchResultStyles,
} from '../utils/SearchFunctions';
import { MMELRole } from '../serialize/interface/supportinterface';
import ModelReferenceView from './editreference/ModelReferenceView';
import DocumentReferenceView from './editreference/DocumentReferenceView';
import { RefTextSelection } from '../model/selectionImport';
import ImportFromSelectionButton from './popover/ImportFromSelectionButton';
import { DataType } from '../serialize/interface/baseinterface';
import EditorEditMenu from './menu/EditorEditMenu';
import {
  COMMITMSG,
  getPathByNS,
  JSONToMMEL,
  MMELToSerializable,
  RepoFileType,
} from '../utils/repo/io';
import { MMELJSON } from '../model/json';
import { MMELRepo, RepoIndex, repoIndexPath } from '../model/repo';
import { setValueToIndex } from '../utils/repo/CommonFunctions';
import EditorReferenceMenuButton from './menu/EditorReferenceMenuButton';
import { indexModel } from '../model/mapmodel';
import { MMELDocument } from '../model/document';
import { LoadingContainer } from './common/Loading';
import { createNewComment } from '../utils/Comments';
import EditorViewMenu from './menu/EditorViewMenu';
import { EditorAction } from '../model/editor/state';
import {
  addCommentCommand,
  deleteCommentCommand,
  resolveCommentCommand,
} from '../model/editor/commands/comment';
import {
  drillUpCommand,
  pageChangeCommand,
  replaceHisCommand,
} from '../model/editor/commands/history';
import {
  dragCommand,
  newEdgeCommand,
  removeEdgeCommand,
} from '../model/editor/commands/page';
import SearchComponentPane from './sidebar/search';
import { SelectedNodeDescription } from './sidebar/selected';
import BasicSettingPane from './control/settings';
import { addRoleCommand } from '../model/editor/commands/role';
import { addRegistryCommand } from '../model/editor/commands/data';
import { RegistryCombined } from '../model/editor/components/element/registry';
import { importElmCommand } from '../model/editor/commands/import';
import { ChangeLog } from '../model/changelog';
import ChangeLogDialog from './control/ChangeLogViewer';

const ModelEditor: React.FC<{
  isVisible: boolean;
  className?: string;
  setClickListener: (f: (() => void)[]) => void;
  state: EditorState;
  redo?: () => void;
  undo?: () => void;
  copy?: () => void;
  paste?: () => void;
  setSelectedId: (id: string | undefined) => void;
  repo?: MMELRepo;
  index: RepoIndex;
  act: (x: EditorAction) => void;
  setUndoListener: (x: (() => void) | undefined) => void;
  clearRedo: () => void;
  changelog: ChangeLog;
}> = ({
  isVisible,
  className,
  setClickListener,
  state,
  redo,
  undo,
  copy,
  paste,
  setSelectedId,
  repo,
  index,
  act,
  setUndoListener,
  clearRedo,
  changelog,
}) => {
  const { useObjectData, updateObjects, useRemoteUsername } =
    useContext(DatasetContext);

  const canvusRef: RefObject<HTMLDivElement> = React.createRef();

  const { usePersistentDatasetStateReducer } = useContext(DatasetContext);

  const Sidebar = useMemo(
    () => makeSidebar(usePersistentDatasetStateReducer!),
    []
  );

  const [reactFlow, setReactFlow] = useState<OnLoadParams | null>(null);
  const [settingOpen, openSetting] = useState<boolean>(false);
  const [reference, setReference] = useState<ReferenceContent | undefined>(
    undefined
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<Set<string>>(
    new Set<string>()
  );
  const [selectionImport, setSImport] = useState<RefTextSelection | undefined>(
    undefined
  );
  const [toaster] = useState<IToaster>(Toaster.create());
  const [isImportRoleOpen, setIsImportRoleOpen] = useState<boolean>(false);
  const [isImportRegOpen, setIsImportRegOpen] = useState<boolean>(false);
  const [view, setView] = useState<EditorViewOption>({
    dvisible          : true,
    edgeDeleteVisible : false,
    idVisible         : false,
    commentVisible    : true,
  });
  const [mainRepo, setMainRepo] = useState<string | undefined>(undefined);
  const [refrepo, setRefRepo] = useState<string | undefined>(undefined);
  const [repoHis, setRepoHis] = useState<RepoHistory>([]);
  const [isChangeOpen, setChangeOpen] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{
    id: string;
    x: number;
    y: number;
  }>({
    id : '',
    x  : 0,
    y  : 0,
  });

  Logger.log('Logs', changelog);

  const userData = useRemoteUsername();
  const username =
    userData === undefined ||
    userData.value === undefined ||
    userData.value.username === undefined
      ? 'Anonymous'
      : userData.value.username;

  const repoPath = getPathByNS(repo ? repo.ns : '', RepoFileType.MODEL);
  const refPath = getPathByNS(refrepo ?? '', RepoFileType.MODEL);

  const repoRefFile = useObjectData({
    objectPaths : refrepo !== undefined ? [refPath] : [],
  });
  if (refrepo !== undefined && !repoRefFile.isUpdating) {
    const data = repoRefFile.value.data[refPath];
    const item = index[refrepo];
    if (data && item) {
      if (item.type === 'Imp' || item.type === 'Ref') {
        const json = data as MMELJSON;
        const model = JSONToMMEL(json);
        const mw = createEditorModelWrapper(model);
        indexModel(mw.model);
        setReference(mw);
      } else {
        const doc = data as MMELDocument;
        if (doc && doc.version !== DOCVERSION) {
          alert(
            `Warning: Document version not matched\nDocument version of the file:${doc.version}`
          );
          doc.version = DOCVERSION;
        }
        setReference(doc);
      }
      setRefRepo(undefined);
    }
  }

  if (repo === undefined && mainRepo !== undefined) {
    setMainRepo(undefined);
  }

  const model = state.model;

  const elements = getEditorReactFlowElementsFrom(
    state.page,
    model,
    index,
    view,
    onProcessClick,
    removeEdge,
    getStyleById,
    getSVGColorById,
    addCommentToModel,
    toggleCommentResolved,
    deleteComment
  );

  async function saveRepo() {
    if (repo && updateObjects && isVisible) {
      const repoChangePath = getPathByNS(repo.ns, RepoFileType.HISTORY);
      const meta = model.meta;
      const task = updateObjects({
        commitMessage              : COMMITMSG,
        _dangerouslySkipValidation : true,
        objectChangeset            : {
          [repoPath] : {
            newValue : MMELToSerializable(state.model),
          },
          [repoIndexPath] : {
            newValue : setValueToIndex(index, repo.ns, {
              namespace : repo.ns,
              shortname : meta.shortname,
              title     : meta.title,
              date      : new Date(),
              type      : 'Imp',
            }),
          },
          [repoChangePath] : {
            newValue : changelog,
          },
        },
      });
      task
        .then(() =>
          toaster.show({
            message : 'Model saved',
            intent  : 'success',
          })
        )
        .catch(e => {
          Logger.log(e.message);
          Logger.log(e.stack);
        });
    }
  }

  function onLoad(params: OnLoadParams) {
    setReactFlow(params);
    params.fitView();
  }

  function addCommentToModel(msg: string, pid: string, parent?: string) {
    const m = createNewComment(model.comments, username, msg);
    act(addCommentCommand(m, pid, parent));
  }

  function toggleCommentResolved(cid: string) {
    const com = model.comments[cid];
    act(resolveCommentCommand(com));
  }

  function deleteComment(cid: string, pid: string, parent?: string) {
    act(deleteCommentCommand(cid, pid, parent));
  }

  function toggleDataVisibility() {
    setView({ ...view, dvisible : !view.dvisible });
  }

  function toggleEdgeDelete() {
    setView({ ...view, edgeDeleteVisible : !view.edgeDeleteVisible });
  }

  function onProcessClick(pageid: string, processid: string): void {
    act(pageChangeCommand(pageid, processid));
  }

  function drillUp(): void {
    act(drillUpCommand());
  }

  function onDrop(event: React.DragEvent<unknown>) {
    event.preventDefault();
    if (canvusRef.current !== null && reactFlow !== null) {
      const reactFlowBounds = canvusRef.current.getBoundingClientRect();
      const type = event.dataTransfer.getData(DragAndDropNewFormatType);
      const refid = event.dataTransfer.getData(DragAndDropImportRefType);

      const pos = reactFlow.project({
        x : event.clientX - reactFlowBounds.left,
        y : event.clientY - reactFlowBounds.top,
      });
      if (type !== '') {
        const action = getAddComponentAction(
          state.page,
          state.model.elements,
          type as NewComponentTypes,
          pos,
          selectionImport ? selectionImport.text : undefined
        );
        act(action);
      } else if (
        refid !== '' &&
        reference !== undefined &&
        isModelWrapper(reference)
      ) {
        const rmodel = reference.model;
        act(importElmCommand(refid, rmodel, pos.x, pos.y, state.page));
      }
    }
  }

  function removeEdge(id: string) {
    act(removeEdgeCommand(state.page, id));
  }

  function connectHandle(x: Edge<EdgePackage> | Connection) {
    if (x.source !== null && x.target !== null) {
      const page = model.pages[state.page];
      const s = page.childs[x.source];
      const t = page.childs[x.target];
      if (s && t) {
        const action = newEdgeCommand(page, s.element, t.element);
        act(action);
      }
    }
  }

  function onPageAndHistroyChange(selected: string, history: HistoryItem[]) {
    setSelected(selected);
    act(replaceHisCommand(history));
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

  function importRole(id: string, data: string) {
    const role: MMELRole = {
      id,
      name     : data,
      datatype : DataType.ROLE,
    };
    act(addRoleCommand(role));
  }

  function importRegistry(id: string, data: string) {
    const newdc: EditorDataClass = {
      attributes    : {},
      id,
      datatype      : DataType.DATACLASS,
      objectVersion : 'Editor',
      rdcs          : new Set<string>(),
      mother        : id,
    };
    const combined: RegistryCombined = { ...newdc, title : data };
    act(addRegistryCommand(combined));
  }

  function setHis(newHis: RepoHistory) {
    if (newHis.length > 0) {
      const last = newHis[newHis.length - 1];
      setRefRepo(last.ns);
      setRepoHis(newHis);
    }
  }

  function goToNextModel(x: MMELRepo) {
    setRefRepo(x.ns);
    setRepoHis([...repoHis, x]);
  }

  function selectRefRepo(x: MMELRepo) {
    setRefRepo(x.ns);
    setRepoHis([x]);
  }

  function selectReference(x: ReferenceContent | undefined) {
    setReference(x);
    setRefRepo(undefined);
    setRepoHis([]);
  }

  const hotkeys: HotkeyConfig[] = [
    {
      combo        : 'ctrl+s',
      global       : true,
      label        : 'Save',
      allowInInput : true,
      onKeyDown    : saveRepo,
    },
  ];

  const referenceMenu = (
    <>
      <EditorReferenceMenuButton
        setReference={selectReference}
        reference={reference}
        isRepo={repo !== undefined}
        setRefRepo={selectRefRepo}
        index={index}
      />
      {(selectionImport !== undefined ||
        isImportRoleOpen ||
        isImportRegOpen) && (
        <>
          <ImportFromSelectionButton
            title="Role ID"
            validTest={x => checkId(x, model.roles)}
            valueTitle="Role name"
            value={selectionImport !== undefined ? selectionImport.text : ''}
            isOpen={isImportRoleOpen}
            setIsOpen={setIsImportRoleOpen}
            iconName="person"
            buttonText="Import as Role"
            save={importRole}
          />
          <ImportFromSelectionButton
            title="Registy ID"
            validTest={x =>
              checkId(x, model.elements) &&
              checkId(genDCIdByRegId(x), model.elements, true)
            }
            valueTitle="Registry name"
            value={selectionImport !== undefined ? selectionImport.text : ''}
            isOpen={isImportRegOpen}
            setIsOpen={setIsImportRegOpen}
            iconName="cube"
            buttonText="Import as Registry"
            save={importRegistry}
          />
        </>
      )}
    </>
  );

  const toolbar = (
    <ControlGroup>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <EditorFileMenu
            model={model}
            openSetting={() => openSetting(true)}
            openChangeLog={() => setChangeOpen(true)}
            onRepoSave={saveRepo}
          />
        }
      >
        <Button>Model</Button>
      </Popover2>
      <Popover2
        minimal
        placement="bottom-start"
        content={<EditorEditMenu {...{ redo, undo, copy, paste }} />}
      >
        <Button>Edit</Button>
      </Popover2>
      <Popover2
        minimal
        placement="bottom-start"
        content={<EditorViewMenu viewOption={view} setViewOption={setView} />}
      >
        <Button>View</Button>
      </Popover2>
      {reference === undefined && referenceMenu}
      <MGDButton
        type={MGDButtonType.Primary}
        disabled={state.history.length <= 1}
        onClick={drillUp}
      >
        Drill up
      </MGDButton>
    </ControlGroup>
  );

  const breadcrumbs = getBreadcrumbsActions(state.history, act);

  const sidebar = (
    <Sidebar
      stateKey={`editor-sidebar-${jsx.length}`}
      css={sidebar_layout}
      title="Item metadata"
      blocks={[
        {
          key     : 'selected-node',
          title   : 'Selected node',
          content : (
            <SelectedNodeDescription
              model={model}
              page={state.page}
              act={act}
              provision={selectionImport}
              onSelect={setSelectedId}
              setUndoListener={setUndoListener}
              clearRedo={clearRedo}
            />
          ),
        },
        {
          key     : 'create-node',
          title   : 'Add components',
          content : <NewComponentPane />,
        },
        {
          key     : 'search-node',
          title   : 'Search components',
          content : (
            <SearchComponentPane
              model={state.model}
              onChange={onPageAndHistroyChange}
              resetSearchElements={resetSearchElements}
            />
          ),
        },
      ]}
    />
  );

  useEffect(() => {
    return function () {
      setReference(undefined);
    };
  }, [repo]);

  function nodeDrag(id: string) {
    if (reactFlow !== null) {
      for (const flowNode of reactFlow.getElements()) {
        if (flowNode.id === id && dragStart.id === id && isNode(flowNode)) {
          const action = dragCommand(state.page, model, flowNode, dragStart);
          act(action);
        }
      }
    }
  }

  function startDrag(id: string) {
    if (reactFlow !== null) {
      for (const flowNode of reactFlow.getElements()) {
        if (flowNode.id === id && isNode(flowNode)) {
          setDragStart({ id, x : flowNode.position.x, y : flowNode.position.y });
        }
      }
    }
  }

  if (isVisible) {
    return (
      <HotkeysTarget2 hotkeys={hotkeys}>
        <div css={multi_model_container}>
          {isChangeOpen && (
            <ChangeLogDialog
              log={changelog}
              onClose={() => setChangeOpen(false)}
            />
          )}
          {settingOpen && (
            <Dialog
              isOpen={settingOpen}
              title="Settings"
              css={[dialog_layout, dialog_layout__full]}
              onClose={() => openSetting(false)}
              canEscapeKeyClose={false}
              canOutsideClickClose={false}
            >
              <BasicSettingPane model={model} act={act} />
            </Dialog>
          )}
          <ReactFlowProvider>
            <Workspace
              {...{ className, toolbar, sidebar }}
              navbarProps={{ breadcrumbs }}
              style={{ flex : 3 }}
            >
              <div css={react_flow_container_layout}>
                <ReactFlow
                  elements={elements}
                  {...{ onLoad, onDrop, onDragOver }}
                  onConnect={connectHandle}
                  nodesConnectable={true}
                  snapToGrid={true}
                  snapGrid={[10, 10]}
                  nodeTypes={NodeTypes}
                  edgeTypes={EdgeTypes}
                  ref={canvusRef}
                  onNodeDragStop={(e, node) => nodeDrag(node.id)}
                  onNodeDragStart={(e, node) => startDrag(node.id)}
                >
                  <Controls>
                    <DataVisibilityButton
                      isOn={view.dvisible}
                      onClick={toggleDataVisibility}
                    />
                    <EdgeEditButton
                      isOn={view.edgeDeleteVisible}
                      onClick={toggleEdgeDelete}
                    />
                    <IdVisibleButton
                      isOn={view.idVisible}
                      onClick={() =>
                        setView({ ...view, idVisible : !view.idVisible })
                      }
                    />
                  </Controls>
                </ReactFlow>
                {searchResult.size > 0 && (
                  <LegendPane list={SearchResultStyles} onLeft={false} />
                )}
              </div>
            </Workspace>
          </ReactFlowProvider>

          {reference !== undefined &&
            (refrepo !== undefined ? (
              <LoadingContainer label="Loading..." size={3} />
            ) : isModelWrapper(reference) ? (
              <ModelReferenceView
                className={className}
                model={reference.model}
                page={reference.page}
                setModelWrapper={setReference}
                menuControl={referenceMenu}
                index={index}
                repoHis={repoHis}
                setRepoHis={setHis}
                goToNextModel={goToNextModel}
              />
            ) : (
              <DocumentReferenceView
                className={className}
                document={reference}
                menuControl={referenceMenu}
                setClickListener={setClickListener}
                setPImport={setSImport}
              />
            ))}
        </div>
      </HotkeysTarget2>
    );
  }
  return <div></div>;
};

function onDragOver(event: React.DragEvent<HTMLDivElement>) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

export default ModelEditor;
