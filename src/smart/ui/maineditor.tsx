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

const initModel = createNewEditorModel();
const initModelWrapper = createEditorModelWrapper(initModel);

const ModelEditor: React.FC<{
  isVisible: boolean;
  className?: string;
  setClickListener: (f: (() => void)[]) => void;
}> = ({ isVisible, className, setClickListener }) => {
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
  const [selectionImport, setSImport] = useState<RefTextSelection | undefined>(
    undefined
  );
  const [toaster] = useState<IToaster>(Toaster.create());

  const mw = state.modelWrapper;
  const model = mw.model;

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
        ...mw,
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
    model.meta = meta;
    setState({ ...state });
  }

  function onPageChange(updated: PageHistory, newPage: string) {
    saveLayout();
    state.history = updated;
    mw.page = newPage;
    setState({ ...state });
  }

  function onProcessClick(pageid: string, processid: string): void {
    saveLayout();
    mw.page = pageid;
    logger?.log('Go to page', pageid);
    addToHistory(state.history, mw.page, processid);
    setState({ ...state });
  }

  function removeEdge(id: string) {
    deleteEdge(model, mw.page, id);
    setState({ ...state });
  }

  function drillUp(): void {
    if (state.history.items.length > 0) {
      saveLayout();
      mw.page = popPage(state.history);
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
        const model = addComponentToModel(mw, type as NewComponentTypes, pos);
        setState({
          ...state,
          modelWrapper: {
            ...mw,
            model: { ...model },
          },
        });
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
        setState({
          ...state,
          modelWrapper: {
            ...mw,
            model: { ...model },
          },
        });
      }
    }
  }

  function connectHandle(x: Edge<EdgePackage> | Connection) {
    if (x.source !== null && x.target !== null) {
      const page = model.pages[mw.page];
      model.pages[mw.page] = addEdge(page, model.elements, x.source, x.target);
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
      modelWrapper: { ...mw, page: pageid },
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

  const referenceMenu = (
    <>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <EditorReferenceMenu
            setReference={setReference}
            isCloseEnabled={reference !== undefined}
          />
        }
      >
        <MGDButton>Reference model</MGDButton>
      </Popover2>
      {selectionImport !== undefined && (
        <>
          <ImportFromSelectionButton
            title="Role ID"
            validTest={x => checkId(x, model.roles)}
            valueTitle="Role name"
            value={selectionImport.text}
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
            value={selectionImport.text}
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
              provision={selectionImport}
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
    );
  }
  return <div></div>;
};

function onDragOver(event: React.DragEvent<HTMLDivElement>) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

export default ModelEditor;
