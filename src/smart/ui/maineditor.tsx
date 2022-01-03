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
  ModelWrapper,
} from '../model/modelwrapper';
import {
  addToHistory,
  getBreadcrumbs,
  PageHistory,
  popPage,
  RepoHistory,
} from '../model/history';
import {
  createRegistry,
  createSubprocessComponent,
} from '../utils/EditorFactory';
import {
  EdgeTypes,
  EditorState,
  EditorViewOption,
  isModelWrapper,
  NodeTypes,
  ReferenceContent,
} from '../model/States';
import { EditorDataClass, EditorModel } from '../model/editormodel';
import EditorFileMenu from './menu/EditorFileMenu';
import { SelectedNodeDescription } from './sidebar/selected';
import {
  DiagPackage,
  DiagTypes,
  IDiagAction,
  MyDiag,
  SetDiagAction,
} from './dialog/dialogs';
import {
  DataVisibilityButton,
  EdgeEditButton,
  IdVisibleButton,
} from './control/buttons';
import NewComponentPane from './control/newComponentPane';
import {
  DeletableNodeTypes,
  DOCVERSION,
  DragAndDropImportRefType,
  DragAndDropNewFormatType,
  EditableNodeTypes,
  EditAction,
  NewComponentTypes,
} from '../utils/constants';
import {
  getaddComponentAction,
  addEdge,
} from '../utils/ModelAddComponentHandler';
import { EdgePackage } from '../model/FlowContainer';
import { deleteEdge } from '../utils/ModelRemoveComponentHandler';
import MGDButton from '../MGDComponents/MGDButton';
import { MGDButtonType } from '../../css/MGDButton';
import {
  dialog_layout,
  dialog_layout__full,
  multi_model_container,
  react_flow_container_layout,
  sidebar_layout,
} from '../../css/layout';
import SearchComponentPane from './sidebar/search';
import { checkId, genDCIdByRegId, Logger } from '../utils/ModelFunctions';
import LegendPane from './common/description/LegendPane';
import {
  getHighlightedStyleById,
  getHighlightedSVGColorById,
  SearchResultStyles,
} from '../utils/SearchFunctions';
import { MMELRole } from '../serialize/interface/supportinterface';
import ModelReferenceView from './editreference/ModelReferenceView';
import { addProcessIfNotFound } from '../utils/ModelImport';
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
import { ModelAction } from '../model/editor/model';

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
}) => {
  const { useObjectData, updateObjects, useRemoteUsername } =
    useContext(DatasetContext);

  const canvusRef: RefObject<HTMLDivElement> = React.createRef();

  const { usePersistentDatasetStateReducer } = useContext(DatasetContext);

  const Sidebar = useMemo(
    () => makeSidebar(usePersistentDatasetStateReducer!),
    []
  );

  const [reactFlow, setRfInstance] = useState<OnLoadParams | null>(null);
  const [dialogPack, setDialogPack] = useState<DiagPackage>({
    type: null,
    callback: () => {},
    msg: '',
  });
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
    dvisible: true,
    edgeDeleteVisible: false,
    idVisible: false,
    commentVisible: true,
  });
  const [mainRepo, setMainRepo] = useState<string | undefined>(undefined);
  const [refrepo, setRefRepo] = useState<string | undefined>(undefined);
  const [repoHis, setRepoHis] = useState<RepoHistory>([]);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

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
    objectPaths: refrepo !== undefined ? [refPath] : [],
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
  const mw: ModelWrapper = { page: state.page, model, type: 'model' };

  async function saveRepo() {
    if (repo && updateObjects && isVisible) {
      const meta = model.meta;
      const task = updateObjects({
        commitMessage: COMMITMSG,
        _dangerouslySkipValidation: true,
        objectChangeset: {
          [repoPath]: {
            newValue: MMELToSerializable(state.model),
          },
          [repoIndexPath]: {
            newValue: setValueToIndex(index, repo.ns, {
              namespace: repo.ns,
              shortname: meta.shortname,
              title: meta.title,
              date: new Date(),
              type: 'Imp',
            }),
          },
        },
      });
      task
        .then(() =>
          toaster.show({
            message: 'Model saved',
            intent: 'success',
          })
        )
        .catch(e => {
          Logger.log(e.message);
          Logger.log(e.stack);
        });
    }
  }

  function onLoad(params: OnLoadParams) {
    setRfInstance(params);
    params.fitView();
  }

  function setDialogType(x: DiagTypes | null) {
    setDialogPack({ ...dialogPack, type: x });
  }

  function setModelAfterDelete(model: EditorModel) {
    // setState(
    //   {
    //     ...state,
    //     model: { ...model },
    //   },
    //   true
    // );
    setDialogType(null);
  }

  function setDiag(
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) {
    const props: IDiagAction = {
      nodeType: nodeType,
      model: model,
      page: state.page,
      id: id,
      setModelAfterDelete,
    };
    setDialogPack(SetDiagAction[action](props));
  }

  // function saveLayout(): ModelWrapper {
  //   Logger.log('Save Layout');
  //   if (reactFlow !== null) {
  //     for (const x of reactFlow.getElements()) {
  //       const data = x.data;
  //       const page = model.pages[state.page];
  //       if (isNode(x) && isEditorNode(data)) {
  //         const node = isEditorData(data)
  //           ? page.data[data.id]
  //           : page.childs[data.id];
  //         if (node !== undefined) {
  //           node.x = x.position.x;
  //           node.y = x.position.y;
  //         } else {
  //           const nc = createSubprocessComponent(data.id);
  //           if (isEditorData(data)) {
  //             page.data[data.id] = nc;
  //           } else {
  //             page.childs[data.id] = nc;
  //           }
  //           nc.x = x.position.x;
  //           nc.y = x.position.y;
  //         }
  //       }
  //     }
  //   }
  //   return { page: state.page, model, type: 'model' };
  // }

  function addCommentToModel(msg: string, pid: string, parent?: string) {
    const m = createNewComment(model.comments, username, msg);
    const action: ModelAction = {
      type: 'model',
      act: 'comment',
      task: 'add',
      value: [m],
      attach: {
        id: pid,
        parent,
      },
    };
    act(action);
  }

  function toggleCommentResolved(cid: string) {
    const com = model.comments[cid];
    const action: ModelAction = {
      type: 'model',
      act: 'comment',
      task: 'edit',
      id: cid,
      value: { ...com, resolved: !com.resolved },
    };
    act(action);
  }

  function deleteComment(cid: string, pid: string, parent?: string) {
    const action: ModelAction = {
      type: 'model',
      act: 'comment',
      task: 'delete',
      value: [cid],
      attach: {
        id: pid,
        parent,
      },
    };
    act(action);
  }

  function toggleDataVisibility() {
    setView({ ...view, dvisible: !view.dvisible });
  }

  function toggleEdgeDelete() {
    setView({ ...view, edgeDeleteVisible: !view.edgeDeleteVisible });
  }

  function setModelWrapper(mw: ModelWrapper) {
    // setState({ ...state, model: mw.model, page: mw.page }, true);
  }

  function onPageChange(updated: PageHistory, newPage: string) {
    state.history = updated.items;
    state.page = newPage;
    // setState({ ...state }, true);
  }

  function onProcessClick(pageid: string, processid: string): void {
    state.page = pageid;
    Logger.log('Go to page', pageid);
    addToHistory({ items: state.history }, state.page, processid);
    // setState({ ...state }, true);
  }

  function removeEdge(id: string) {
    deleteEdge(model, state.page, id);
    // setState({ ...state }, true);
  }

  function drillUp(): void {
    if (state.history.length > 0) {
      state.page = popPage({ items: state.history });
      // setState({ ...state }, true);
    }
  }

  function onDrop(event: React.DragEvent<unknown>) {
    event.preventDefault();
    if (canvusRef.current !== null && reactFlow !== null) {
      const reactFlowBounds = canvusRef.current.getBoundingClientRect();
      const type = event.dataTransfer.getData(DragAndDropNewFormatType);
      const refid = event.dataTransfer.getData(DragAndDropImportRefType);

      const pos = reactFlow.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      if (type !== '') {
        const action = getaddComponentAction(
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
        // import is not done yet
        const page = model.pages[state.page];

        const process = addProcessIfNotFound(
          { page: state.page, model: state.model, type: 'model' },
          reference,
          refid,
          {},
          {},
          {},
          page.id
        );

        const nc = createSubprocessComponent(process.id);
        nc.x = pos.x;
        nc.y = pos.y;

        page.childs[process.id] = nc;
        // setState(
        //   {
        //     ...state,
        //     model: { ...model },
        //   },
        //   true
        // );
      }
    }
  }

  function connectHandle(x: Edge<EdgePackage> | Connection) {
    if (x.source !== null && x.target !== null) {
      const page = model.pages[state.page];
      model.pages[state.page] = addEdge(
        page,
        model.elements,
        x.source,
        x.target
      );
      // setState({ ...state }, true);
    }
  }

  function onPageAndHistroyChange(
    selected: string,
    pageid: string,
    history: PageHistory
  ) {
    setSelected(selected);
    // setState(
    //   {
    //     ...state,
    //     history: history.items,
    //     page: pageid,
    //   },
    //   true
    // );
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
      name: data,
      datatype: DataType.ROLE,
    };
    setModelWrapper({
      page: state.page,
      model: { ...model, roles: { ...model.roles, [id]: role } },
      type: 'model',
    });
  }

  function importRegistry(id: string, data: string) {
    const dcid = genDCIdByRegId(id);
    const newreg = createRegistry(id);
    const newdc: EditorDataClass = {
      attributes: {},
      id: dcid,
      datatype: DataType.DATACLASS,
      added: false,
      pages: new Set<string>(),
      objectVersion: 'Editor',
      rdcs: new Set<string>(),
      mother: id,
    };
    newreg.data = dcid;
    newreg.title = data;
    setModelWrapper({
      page: state.page,
      model: {
        ...model,
        elements: { ...model.elements, [id]: newreg, [dcid]: newdc },
      },
      type: 'model',
    });
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
      combo: 'ctrl+s',
      global: true,
      label: 'Save',
      allowInInput: true,
      onKeyDown: saveRepo,
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
            {...{
              getLatestLayout: () => mw,
              setDialogType,
              onRepoSave: saveRepo,
            }}
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

  const breadcrumbs = getBreadcrumbs({ items: state.history }, onPageChange);

  const sidebar = (
    <Sidebar
      stateKey={`editor-sidebar-${jsx.length}`}
      css={sidebar_layout}
      title="Item metadata"
      blocks={[
        {
          key: 'selected-node',
          title: 'Selected node',
          content: (
            <SelectedNodeDescription
              modelWrapper={mw}
              setDialog={setDiag}
              setModel={m => setModelWrapper({ ...mw, model: m })}
              provision={selectionImport}
              getLatestLayoutMW={() => mw}
              onSelect={setSelectedId}
            />
          ),
        },
        {
          key: 'create-node',
          title: 'Add components',
          content: <NewComponentPane />,
        },
        {
          key: 'search-node',
          title: 'Search components',
          content: (
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

  useEffect(
    () => () => {
      setReference(undefined);
    },
    [repo]
  );

  function nodeDrag(id: string) {
    if (reactFlow !== null) {
      for (const flowNode of reactFlow.getElements()) {
        if (flowNode.id === id && isNode(flowNode)) {
          const action: ModelAction = {
            type: 'model',
            act: 'pages',
            task: 'move',
            page: state.page,
            node: flowNode.id,
            x: flowNode.position.x,
            y: flowNode.position.y,
            fromx: dragStart.x,
            fromy: dragStart.y,
          };
          act(action);
        }
      }
    }
  }

  function startDrag(id: string) {
    if (reactFlow !== null) {
      for (const flowNode of reactFlow.getElements()) {
        if (flowNode.id === id && isNode(flowNode)) {
          setDragStart({ x: flowNode.position.x, y: flowNode.position.y });
        }
      }
    }
  }

  if (isVisible) {
    const diagProps = dialogPack.type === null ? null : MyDiag[dialogPack.type];
    return (
      <HotkeysTarget2 hotkeys={hotkeys}>
        <div css={multi_model_container}>
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
                {...{ setModelWrapper }}
                act={act}
                state={state}
                callback={dialogPack.callback}
                cancel={() => setDialogType(null)}
                msg={dialogPack.msg}
              />
            </Dialog>
          )}
          <ReactFlowProvider>
            <Workspace
              {...{ className, toolbar, sidebar }}
              navbarProps={{ breadcrumbs }}
              style={{ flex: 3 }}
            >
              <div css={react_flow_container_layout}>
                <ReactFlow
                  elements={getEditorReactFlowElementsFrom(
                    mw,
                    index,
                    view.dvisible,
                    view.edgeDeleteVisible,
                    onProcessClick,
                    removeEdge,
                    getStyleById,
                    getSVGColorById,
                    view.idVisible,
                    view.commentVisible,
                    addCommentToModel,
                    toggleCommentResolved,
                    deleteComment
                  )}
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
                        setView({ ...view, idVisible: !view.idVisible })
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
                modelWrapper={reference}
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
