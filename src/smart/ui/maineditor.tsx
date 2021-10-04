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
  createNewEditorModel,
  createSubprocessComponent,
} from '../utils/EditorFactory';
import {
  EdgeTypes,
  EditorState,
  isModelWrapper,
  NodeTypes,
  ReferenceContent,
} from '../model/States';
import { EditorModel, isEditorData, isEditorNode } from '../model/editormodel';
import EditorFileMenu from './menu/EditorFileMenu';
import { SelectedNodeDescription } from './sidebar/selected';
import {
  DiagPackage,
  DiagTypes,
  IDiagAction,
  MyDiag,
  SetDiagAction,
} from './dialog/dialogs';
import { DataVisibilityButton, EdgeEditButton } from './control/buttons';
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
import { getRootName, Logger } from '../utils/ModelFunctions';
import LegendPane from './common/description/LegendPane';
import {
  getHighlightedStyleById,
  getHighlightedSVGColorById,
  SearchResultStyles,
} from '../utils/SearchFunctions';
import { MMELMetadata } from '../serialize/interface/supportinterface';
import EditorReferenceMenu from './menu/EditorReferenceMenu';
import ModelReferenceView from './editreference/ModelReferenceView';
import { addProcessIfNotFound } from '../utils/ModelImport';

const initModel = createNewEditorModel();
const initModelWrapper = createEditorModelWrapper(initModel);

const ModelEditor: React.FC<{
  isVisible: boolean;
  className?: string;
}> = ({ isVisible, className }) => {
  const { logger } = useContext(DatasetContext);

  Logger.logger = logger!;

  const canvusRef: RefObject<HTMLDivElement> = React.createRef();

  const { usePersistentDatasetStateReducer } = useContext(DatasetContext);

  const Sidebar = useMemo(
    () => makeSidebar(usePersistentDatasetStateReducer!),
    []
  );

  const [state, setState] = useState<EditorState>({
    dvisible: true,
    modelWrapper: initModelWrapper,
    history: createPageHistory(initModelWrapper),
    edgeDeleteVisible: false,
  });
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
  const [toaster] = useState<IToaster>(Toaster.create());

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
    setState({
      ...state,
      modelWrapper: {
        ...state.modelWrapper,
        model: { ...model },
      },
    });
    setDialogType(null);
  }

  function setDiag(
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) {
    const props: IDiagAction = {
      nodeType: nodeType,
      model: state.modelWrapper.model,
      page: state.modelWrapper.page,
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

  function toggleEdgeDelete() {
    setState({ ...state, edgeDeleteVisible: !state.edgeDeleteVisible });
  }

  function setNewModelWrapper(mw: ModelWrapper) {
    setState({ ...state, history: createPageHistory(mw), modelWrapper: mw });
  }

  function setModelWrapper(mw: ModelWrapper) {
    setState({ ...state, modelWrapper: mw });
  }

  function onMetaChanged(meta: MMELMetadata) {
    state.history.items[0].pathtext = getRootName(meta);
    state.modelWrapper.model.meta = meta;
    setState({ ...state });
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

  function removeEdge(id: string) {
    deleteEdge(state.modelWrapper.model, state.modelWrapper.page, id);
    setState({ ...state });
  }

  function drillUp(): void {
    if (state.history.items.length > 0) {
      saveLayout();
      state.modelWrapper.page = popPage(state.history);
      setState({ ...state });
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
          state.modelWrapper,
          type as NewComponentTypes,
          pos
        );
        setState({
          ...state,
          modelWrapper: {
            ...state.modelWrapper,
            model: { ...model },
          },
        });
      } else if (
        refid !== '' &&
        reference !== undefined &&
        isModelWrapper(reference)
      ) {
        const model = state.modelWrapper.model;
        const page = model.pages[state.modelWrapper.page];

        const process = addProcessIfNotFound(
          state.modelWrapper,
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
        setState({
          ...state,
          modelWrapper: {
            ...state.modelWrapper,
            model: { ...model },
          },
        });
      }
    }
  }

  function connectHandle(x: Edge<EdgePackage> | Connection) {
    if (x.source !== null && x.target !== null) {
      const mw = state.modelWrapper;
      const page = mw.model.pages[mw.page];
      mw.model.pages[mw.page] = addEdge(
        page,
        mw.model.elements,
        x.source,
        x.target
      );
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

  const referenceMenu = (
    <Popover2
      minimal
      placement="bottom-start"
      content={<EditorReferenceMenu setReference={setReference} />}
    >
      <MGDButton>Reference model</MGDButton>
    </Popover2>
  );

  const toolbar = (
    <ControlGroup>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <EditorFileMenu
            setModelWrapper={setNewModelWrapper}
            getLatestLayout={saveLayout}
            setDialogType={setDialogType}
          />
        }
      >
        <MGDButton>Model</MGDButton>
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

  if (isVisible) {
    const diagProps = dialogPack.type === null ? null : MyDiag[dialogPack.type];
    return (
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
              modelwrapper={state.modelWrapper}
              setModelWrapper={setModelWrapper}
              onMetaChanged={onMetaChanged}
              callback={dialogPack.callback}
              cancel={() => {
                setDialogType(null);
              }}
              msg={dialogPack.msg}
              showMsg={showMsg}
            />
          </Dialog>
        )}
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
                elements={getEditorReactFlowElementsFrom(
                  state.modelWrapper,
                  state.dvisible,
                  state.edgeDeleteVisible,
                  onProcessClick,
                  removeEdge,
                  getStyleById,
                  getSVGColorById
                )}
                onLoad={onLoad}
                onDrop={onDrop}
                onDragOver={onDragOver}
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
                </Controls>
              </ReactFlow>
              {searchResult.size > 0 && (
                <LegendPane list={SearchResultStyles} onLeft={false} />
              )}
            </div>
          </Workspace>
        </ReactFlowProvider>

        {reference !== undefined && isModelWrapper(reference) ? (
          <ModelReferenceView
            className={className}
            modelWrapper={reference}
            setModelWrapper={setReference}
            menuControl={referenceMenu}
          />
        ) : (
          <></>
        )}
      </div>
    );
  }
  return <div></div>;
};

function onDragOver(event: React.DragEvent<HTMLDivElement>) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

export default ModelEditor;
