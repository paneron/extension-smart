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
  ControlGroup,
  Dialog,
  HotkeysProvider,
  HotkeysTarget2,
  IToaster,
  IToastProps,
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
  createPageHistory,
  getBreadcrumbs,
  PageHistory,
  popPage,
} from '../model/history';
import {
  createRegistry,
  createSubprocessComponent,
} from '../utils/EditorFactory';
import {
  EdgeTypes,
  EditorState,
  isModelWrapper,
  NodeTypes,
  ReferenceContent,
} from '../model/States';
import {
  EditorDataClass,
  EditorModel,
  isEditorData,
  isEditorNode,
} from '../model/editormodel';
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
  DragAndDropImportRefType,
  DragAndDropNewFormatType,
  EditableNodeTypes,
  EditAction,
  NewComponentTypes,
} from '../utils/constants';
import {
  addComponentToModel,
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
import {
  checkId,
  genDCIdByRegId,
  getRootName,
  Logger,
} from '../utils/ModelFunctions';
import LegendPane from './common/description/LegendPane';
import {
  getHighlightedStyleById,
  getHighlightedSVGColorById,
  SearchResultStyles,
} from '../utils/SearchFunctions';
import {
  MMELMetadata,
  MMELRole,
} from '../serialize/interface/supportinterface';
import EditorReferenceMenu from './menu/EditorReferenceMenu';
import ModelReferenceView from './editreference/ModelReferenceView';
import { addProcessIfNotFound } from '../utils/ModelImport';
import DocumentReferenceView from './editreference/DocumentReferenceView';
import { RefTextSelection } from '../model/selectionImport';
import ImportFromSelectionButton from './popover/ImportFromSelectionButton';
import { DataType } from '../serialize/interface/baseinterface';
import EditorEditMenu from './menu/EditorEditMenu';
import {
  getPathByNS,
  JSONToMMEL,
  MMELToSerializable,
  RepoFileType,
} from '../utils/repo/io';
import { MMELJSON } from '../model/json';
import { MMELRepo, RepoIndex, repoIndexPath } from '../model/repo';
import {
  createEmptyIndex,
  setValueToIndex,
} from '../utils/repo/CommonFunctions';

const ModelEditor: React.FC<{
  isVisible: boolean;
  className?: string;
  setClickListener: (f: (() => void)[]) => void;
  state: EditorState;
  setState: (x: EditorState, rh: boolean) => void;
  redo?: () => void;
  undo?: () => void;
  copy?: () => void;
  paste?: () => void;
  setSelectedId: (id: string | undefined) => void;
  isBSIEnabled?: boolean;
  repo?: MMELRepo;
  resetHistory: () => void;
}> = ({
  isVisible,
  className,
  setClickListener,
  state,
  setState,
  redo,
  undo,
  copy,
  paste,
  setSelectedId,
  isBSIEnabled,
  repo,
  resetHistory,
}) => {
  const { logger, useObjectData, updateObjects } = useContext(DatasetContext);

  Logger.logger = logger!;

  const canvusRef: RefObject<HTMLDivElement> = React.createRef();

  const { usePersistentDatasetStateReducer } = useContext(DatasetContext);

  const Sidebar = useMemo(
    () => makeSidebar(usePersistentDatasetStateReducer!),
    []
  );

  const [rfInstance, setRfInstance] = useState<OnLoadParams | null>(null);
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
  const [idVisible, setIdVisible] = useState<boolean>(false);

  const repoPath = getPathByNS(repo ? repo.ns : '', RepoFileType.MODEL);
  const repoModelFile = useObjectData({
    objectPaths: repo !== undefined ? [repoIndexPath, repoPath] : [],
  });
  const repoData = repo !== undefined ? repoModelFile.value.data[repoPath] : {};
  const repoIndex: RepoIndex | null =
    repo !== undefined
      ? (repoModelFile.value.data[repoIndexPath] as RepoIndex)
      : createEmptyIndex();

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
      setState(
        { ...state, history: createPageHistory(mw), modelWrapper: mw },
        false
      );
      resetHistory();
    }
  }, [repoData, repoModelFile.isUpdating]);

  const mw = state.modelWrapper;
  const model = mw.model;

  async function saveRepo() {
    if (repo && updateObjects && isVisible) {
      saveLayout();
      const meta = model.meta;
      const task = updateObjects({
        commitMessage: 'Updating concept',
        _dangerouslySkipValidation: true,
        objectChangeset: {
          [repoPath]: {
            newValue: MMELToSerializable(state.modelWrapper.model),
          },
          [repoIndexPath]: {
            newValue: setValueToIndex(repoIndex!, repo.ns, {
              namespace: repo.ns,
              shortname: meta.shortname,
              title: meta.title,
              date: new Date(),
              type: 'Imp',
            }),
          },
        },
      });
      task.then(() =>
        toaster.show({
          message: 'Model saved',
          intent: 'success',
        })
      );
    }
  }

  function showMsg(msg: IToastProps) {
    toaster.show(msg);
  }

  function onLoad(params: OnLoadParams) {
    logger?.log('flow loaded');
    setRfInstance(params);
    params.fitView();
  }

  function setDialogType(x: DiagTypes | null) {
    setDialogPack({ ...dialogPack, type: x });
  }

  function setModelAfterDelete(model: EditorModel) {
    setState(
      {
        ...state,
        modelWrapper: {
          ...mw,
          model: { ...model },
        },
      },
      true
    );
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
      page: mw.page,
      id: id,
      setModelAfterDelete,
    };
    saveLayout();
    setDialogPack(SetDiagAction[action](props));
  }

  function saveLayout() {
    logger?.log('Save Layout');
    if (rfInstance !== null) {
      for (const x of rfInstance.getElements()) {
        const data = x.data;
        const page = model.pages[mw.page];
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
    return mw;
  }

  function toggleDataVisibility() {
    if (state.dvisible) {
      saveLayout();
    }
    setState({ ...state, dvisible: !state.dvisible }, false);
  }

  function toggleEdgeDelete() {
    setState({ ...state, edgeDeleteVisible: !state.edgeDeleteVisible }, false);
  }

  function setNewModelWrapper(mw: ModelWrapper) {
    setState(
      { ...state, history: createPageHistory(mw), modelWrapper: mw },
      true
    );
  }

  function setModelWrapper(mw: ModelWrapper) {
    setState({ ...state, modelWrapper: mw }, true);
  }

  function onMetaChanged(meta: MMELMetadata) {
    state.history.items[0].pathtext = getRootName(meta);
    model.meta = meta;
    setState({ ...state }, true);
  }

  function onPageChange(updated: PageHistory, newPage: string) {
    saveLayout();
    state.history = updated;
    mw.page = newPage;
    setState({ ...state }, true);
  }

  function onProcessClick(pageid: string, processid: string): void {
    saveLayout();
    mw.page = pageid;
    logger?.log('Go to page', pageid);
    addToHistory(state.history, mw.page, processid);
    setState({ ...state }, true);
  }

  function removeEdge(id: string) {
    deleteEdge(model, mw.page, id);
    setState({ ...state }, true);
  }

  function drillUp(): void {
    if (state.history.items.length > 0) {
      saveLayout();
      mw.page = popPage(state.history);
      setState({ ...state }, true);
    }
  }

  function onDrop(event: React.DragEvent<unknown>) {
    event.preventDefault();
    if (canvusRef.current !== null && rfInstance !== null) {
      const reactFlowBounds = canvusRef.current.getBoundingClientRect();
      const type = event.dataTransfer.getData(DragAndDropNewFormatType);
      const refid = event.dataTransfer.getData(DragAndDropImportRefType);

      const pos = rfInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      if (type !== '') {
        const model = addComponentToModel(
          mw,
          type as NewComponentTypes,
          pos,
          selectionImport !== undefined ? selectionImport.text : undefined
        );
        setState(
          {
            ...state,
            modelWrapper: {
              ...mw,
              model: { ...model },
            },
          },
          true
        );
      } else if (
        refid !== '' &&
        reference !== undefined &&
        isModelWrapper(reference)
      ) {
        const page = model.pages[mw.page];

        const process = addProcessIfNotFound(
          mw,
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
        setState(
          {
            ...state,
            modelWrapper: {
              ...mw,
              model: { ...model },
            },
          },
          true
        );
      }
    }
  }

  function connectHandle(x: Edge<EdgePackage> | Connection) {
    if (x.source !== null && x.target !== null) {
      const page = model.pages[mw.page];
      model.pages[mw.page] = addEdge(page, model.elements, x.source, x.target);
      setState({ ...state }, true);
    }
  }

  function onPageAndHistroyChange(
    selected: string,
    pageid: string,
    history: PageHistory
  ) {
    setSelected(selected);
    setState(
      {
        ...state,
        history,
        modelWrapper: { ...mw, page: pageid },
      },
      true
    );
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
      ...mw,
      model: { ...model, roles: { ...model.roles, [id]: role } },
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
      ...mw,
      model: {
        ...model,
        elements: { ...model.elements, [id]: newreg, [dcid]: newdc },
      },
    });
  }

  const hotkeys = [
    {
      combo: 'ctrl+s',
      global: true,
      label: 'Save',
      onKeyDown: saveRepo,
    },
  ];

  const referenceMenu = (
    <>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <EditorReferenceMenu
            setReference={setReference}
            isBSIEnabled={isBSIEnabled}
            isCloseEnabled={reference !== undefined}
          />
        }
      >
        <MGDButton>Reference model</MGDButton>
      </Popover2>
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
              setModelWrapper: setNewModelWrapper,
              getLatestLayout: saveLayout,
              setDialogType,
              isRepoMode: repo !== undefined,
              onRepoSave: saveRepo,
            }}
          />
        }
      >
        <MGDButton>Model</MGDButton>
      </Popover2>
      <Popover2
        minimal
        placement="bottom-start"
        content={<EditorEditMenu {...{ redo, undo, copy, paste }} />}
      >
        <MGDButton>Edit</MGDButton>
      </Popover2>
      {reference === undefined && referenceMenu}
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
              modelWrapper={state.modelWrapper}
              setDialog={setDiag}
              setModel={m =>
                setModelWrapper({ ...state.modelWrapper, model: m })
              }
              provision={selectionImport}
              getLatestLayoutMW={saveLayout}
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
              model={state.modelWrapper.model}
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
      saveLayout();
    },
    [isVisible]
  );

  useEffect(
    () => () => {
      setReference(undefined);
    },
    [repo]
  );

  if (isVisible) {
    const diagProps = dialogPack.type === null ? null : MyDiag[dialogPack.type];
    return (
      <HotkeysProvider>
        <HotkeysTarget2 hotkeys={hotkeys}>
          <div css={multi_model_container}>
            {diagProps !== null && (
              <Dialog
                isOpen={dialogPack !== null}
                title={diagProps.title}
                css={
                  diagProps.fullscreen
                    ? [dialog_layout, dialog_layout__full]
                    : ''
                }
                onClose={() => setDialogType(null)}
                canEscapeKeyClose={false}
                canOutsideClickClose={false}
              >
                <diagProps.Panel
                  {...{ setModelWrapper, onMetaChanged, showMsg }}
                  modelwrapper={state.modelWrapper}
                  callback={dialogPack.callback}
                  cancel={() => {
                    setDialogType(null);
                  }}
                  repo={repo}
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
                    key="MMELModel"
                    elements={getEditorReactFlowElementsFrom(
                      state.modelWrapper,
                      state.dvisible,
                      state.edgeDeleteVisible,
                      onProcessClick,
                      removeEdge,
                      getStyleById,
                      getSVGColorById,
                      idVisible
                    )}
                    {...{ onLoad, onDrop, onDragOver }}
                    onConnect={connectHandle}
                    nodesConnectable={true}
                    snapToGrid={true}
                    snapGrid={[10, 10]}
                    nodeTypes={NodeTypes}
                    edgeTypes={EdgeTypes}
                    ref={canvusRef}
                  >
                    <Controls>
                      <DataVisibilityButton
                        isOn={state.dvisible}
                        onClick={toggleDataVisibility}
                      />
                      <EdgeEditButton
                        isOn={state.edgeDeleteVisible}
                        onClick={toggleEdgeDelete}
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

            {reference !== undefined &&
              (isModelWrapper(reference) ? (
                <ModelReferenceView
                  className={className}
                  modelWrapper={reference}
                  setModelWrapper={setReference}
                  menuControl={referenceMenu}
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
      </HotkeysProvider>
    );
  }
  return <div></div>;
};

function onDragOver(event: React.DragEvent<HTMLDivElement>) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

export default ModelEditor;
