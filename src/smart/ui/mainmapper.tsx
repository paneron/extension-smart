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

import ModelDiagram from './mapper/ModelDiagram';
import {
  EditorApproval,
  EditorModel,
  EditorProcess,
  EditorSubprocess,
  getEditorNodeInfoById,
  ModelType,
} from '../model/editormodel';
import {
  buildHistoryMap,
  createMapProfile,
  createNewMapSet,
  getMappings,
  indexModel,
  MappingMeta,
  MapProfile,
  MapSet,
} from '../model/mapmodel';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
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
import MapperFileMenu from './menu/MapperFileMenu';
import { createPageHistory, PageHistory } from '../model/history';
import {
  isModelWrapper,
  MapperSelectedInterface,
  MapperState,
  MapperViewOption,
} from '../model/States';
import { createNewEditorModel } from '../utils/EditorFactory';
import { createEditorModelWrapper, ModelWrapper } from '../model/modelwrapper';
import {
  calculateMapping,
  filterMappings,
  filterMappingsForDocument,
} from '../utils/map/MappingCalculator';
import MappingCanvus from './mapper/mappingCanvus';
import MapperOptionMenu from './menu/mapperOptionMenu';
import { EditMPropsInterface } from './dialog/dialogs';
import MappingEditPage from './edit/mappingedit';
import DocTemplatePane from './reporttemplate/doctemplatepane';
import MGDButton from '../MGDComponents/MGDButton';
import { dialog_layout, multi_model_container } from '../../css/layout';
import { vertical_line } from '../../css/components';
import { findPageContainingElement } from '../utils/SearchFunctions';
import { getDocumentMetaById } from '../utils/DocumentFunctions';
import AutoMapper from './mapper/AutoMapper';
import { getNamespace } from '../utils/ModelFunctions';
import {
  getPathByNS,
  JSONContext,
  JSONToMMEL,
  RepoFileType,
} from '../utils/repo/io';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { MMELJSON } from '../model/json';
import { MMELRepo, RepoIndex, repoIndexPath } from '../model/repo';
import RepoMapMainView from './mapper/repo/RepoMapMainView';
import { LoadingContainer } from './common/Loading';
import { MMELDocument } from '../model/document';

const initModel = createNewEditorModel();
const initModelWrapper = createEditorModelWrapper(initModel);

const lineref: RefObject<HTMLDivElement> = React.createRef();

const ModelMapper: React.FC<{
  isVisible: boolean;
  className?: string;
  repo?: MMELRepo;
}> = ({ isVisible, className, repo }) => {
  const { useObjectData, updateObjects } = useContext(DatasetContext);

  const [mapProfile, setMapProfile] = useState<MapProfile>(createMapProfile());
  const [viewOption, setViewOption] = useState<MapperViewOption>({
    dataVisible: true,
    legVisible: true,
    docVisible: false,
    mapAIVisible: false,
    idVisible: false,
    repoMapVisible: false,
    repoLegendVisible: true,
  });
  const [implementProps, setImplProps] = useState<MapperState>({
    modelWrapper: { ...initModelWrapper },
    history: createPageHistory(initModelWrapper),
    modelType: ModelType.IMP,
    historyMap: {},
  });
  const [referenceProps, setRefProps] = useState<MapperState>({
    modelWrapper: { ...initModelWrapper },
    history: createPageHistory(initModelWrapper),
    modelType: ModelType.REF,
    historyMap: {},
  });
  const [selected, setSelected] = useState<MapperSelectedInterface>({
    modelType: ModelType.IMP,
    selected: '',
  });

  const [editMappingProps, setEditMProps] = useState<EditMPropsInterface>({
    from: '',
    to: '',
  });
  const [toaster] = useState<IToaster>(Toaster.create());
  const [refrepo, setRefRepo] = useState<string | undefined>(undefined);

  const repoPath = getPathByNS(repo ? repo.ns : '', RepoFileType.MODEL);
  const mapPath = getPathByNS(repo ? repo.ns : '', RepoFileType.MAP);
  const refPath = getPathByNS(refrepo ?? '', RepoFileType.MODEL);
  const repoModelFile = useObjectData({
    objectPaths: repo !== undefined ? [repoPath, mapPath] : [],
  });
  const repoData = repo !== undefined ? repoModelFile.value.data[repoPath] : {};
  const mapData = repo !== undefined ? repoModelFile.value.data[mapPath] : {};
  const repoRefFile = useObjectData({
    objectPaths: refrepo !== undefined ? [repoIndexPath, refPath] : [],
  });
  if (refrepo !== undefined && !repoRefFile.isUpdating) {
    const index = repoRefFile.value.data[repoIndexPath] as RepoIndex;
    if (index !== undefined) {
      const data = repoRefFile.value.data[refPath];
      const item = index[refrepo];
      if (item !== undefined) {
        if (item.type === 'Imp' || item.type === 'Ref') {
          const json = data as MMELJSON;
          const model = JSONToMMEL(json);
          const mw = createEditorModelWrapper(model);
          indexModel(mw.model);
          onRefPropsChange({
            ...referenceProps,
            history: createPageHistory(mw),
            modelWrapper: mw,
            historyMap: buildHistoryMap(mw),
          });
        } else {
          const doc = data as MMELDocument;
          onRefPropsChange({
            history: { items: [] },
            historyMap: {},
            modelWrapper: doc,
            modelType: referenceProps.modelType,
          });
        }
        setSelected({
          modelType: referenceProps.modelType,
          selected: '',
        });
      }
      setRefRepo(undefined);
    }
  }

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
      indexModel(mw.model);
      setImplProps({
        ...implementProps,
        history: createPageHistory(mw),
        modelWrapper: mw,
        historyMap: buildHistoryMap(mw),
      });
      if (mapData !== undefined && mapData !== null) {
        const mapPro = mapData as MapProfile;
        setMapProfile(mapPro);
      } else {
        setMapProfile({
          '@context': JSONContext,
          '@type': 'MMEL_MAP',
          id: getNamespace(mw.model),
          mapSet: {},
          docs: {},
        });
      }
    }
  }, [repoData, repoModelFile.isUpdating]);

  const impMW = implementProps.modelWrapper as ModelWrapper;
  const refMW = referenceProps.modelWrapper;

  const impmodel = impMW.model;
  const refns = isModelWrapper(refMW) ? getNamespace(refMW.model) : refMW.id;
  if (mapProfile.mapSet[refns] === undefined) {
    mapProfile.mapSet[refns] = createNewMapSet(refns);
  }
  const mapSet = mapProfile.mapSet[refns];
  const impPage = impmodel.pages[impMW.page];

  const mapEdges = useMemo(
    () =>
      isModelWrapper(refMW)
        ? filterMappings(
            mapSet,
            impPage,
            refMW.model.pages[refMW.page],
            selected,
            impmodel.elements,
            refMW.model.elements
          )
        : filterMappingsForDocument(
            mapSet,
            impPage,
            refMW,
            selected,
            impmodel.elements
          ),
    [
      mapSet,
      impPage,
      isModelWrapper(refMW) ? refMW.model.pages[refMW.page] : refMW,
      selected,
    ]
  );

  const mapResult = useMemo(
    () =>
      isModelWrapper(refMW)
        ? calculateMapping(refMW.model, getMappings(mapProfile, refns))
        : undefined,
    [isModelWrapper(refMW) ? refMW.model : refMW, mapProfile]
  );

  function showMessage(msg: IToastProps) {
    toaster.show(msg);
  }

  function onMapSetChanged(ms: MapSet) {
    const newProfile: MapProfile = {
      ...mapProfile,
      mapSet: { ...mapProfile.mapSet, [ms.id]: ms },
    };
    setMapProfile(newProfile);
  }

  function onMapProfileChanged(mp: MapProfile) {
    setMapProfile(mp);
  }

  function onImpModelChanged(model: EditorModel) {
    onMapProfileChanged({
      '@context': JSONContext,
      '@type': 'MMEL_MAP',
      id: getNamespace(model),
      mapSet: {},
      docs: {},
    });
    impMW.model = model;
  }

  function onImpClose() {
    setImplProps({
      modelWrapper: { ...initModelWrapper },
      history: createPageHistory(initModelWrapper),
      modelType: ModelType.IMP,
      historyMap: {},
    });
  }

  function onRefClose() {
    setRefProps({
      modelWrapper: { ...initModelWrapper },
      history: createPageHistory(initModelWrapper),
      modelType: ModelType.REF,
      historyMap: {},
    });
  }

  function onImpPropsChange(state: MapperState) {
    setImplProps(state);
  }

  function onRefPropsChange(state: MapperState) {
    setRefProps(state);
  }

  function onMappingEdit(from: string, to: string) {
    setEditMProps({ from, to });
  }

  function onMappingChange(update: MappingMeta | null) {
    if (update !== null) {
      mapProfile.mapSet[refns].mappings[editMappingProps.from][
        editMappingProps.to
      ] = update;
      setMapProfile({ ...mapProfile });
    }
    setEditMProps({
      from: '',
      to: '',
    });
  }

  function onMappingDelete() {
    const { from, to } = editMappingProps;
    const mapSet = mapProfile.mapSet[refns];
    delete mapSet.mappings[from][to];
    mapSet.mappings[from] = { ...mapSet.mappings[from] };
    if (Object.keys(mapSet.mappings[from]).length === 0) {
      delete mapSet.mappings[from];
    }
    mapSet.mappings = { ...mapSet.mappings };
    setMapProfile({ ...mapProfile });
    setEditMProps({
      from: '',
      to: '',
    });
  }

  function onResetMapping() {
    const mapset = mapProfile.mapSet;
    const newMS: Record<string, MapSet> = {
      ...mapset,
      [refns]: { id: refns, mappings: {} },
    };
    const newProfile: MapProfile = { ...mapProfile, mapSet: newMS };
    setMapProfile(newProfile);
  }

  function onImpNavigate(id: string) {
    const page = findPageContainingElement(impmodel, id);
    const hm = implementProps.historyMap;
    processNavigate(page, setImplProps, implementProps, hm);
  }

  function onRefNavigate(id: string) {
    if (isModelWrapper(refMW)) {
      const page = findPageContainingElement(refMW.model, id);
      const hm = referenceProps.historyMap;
      processNavigate(page, setRefProps, referenceProps, hm);
    }
  }

  function processNavigate(
    page: EditorSubprocess | null,
    setProps: (s: MapperState) => void,
    props: MapperState,
    hm?: Record<string, PageHistory>
  ) {
    if (
      page !== null &&
      hm !== undefined &&
      hm[page.id] !== undefined &&
      isModelWrapper(props.modelWrapper)
    ) {
      setProps({
        ...props,
        modelWrapper: { ...props.modelWrapper, page: page.id },
        history: { items: [...hm[page.id].items] },
      });
    } else {
      alert('Target not found');
    }
  }

  function onMapImport() {
    setViewOption({ ...viewOption, mapAIVisible: true });
  }

  function closeDialog() {
    setViewOption({ ...viewOption, docVisible: false, mapAIVisible: false });
  }

  if (!isVisible && selected.selected !== '') {
    setSelected({
      modelType: ModelType.IMP,
      selected: '',
    });
  }

  const toolbar = (
    <ControlGroup>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <MapperFileMenu
            mapProfile={mapProfile}
            onMapProfileChanged={onMapProfileChanged}
            onMapImport={onMapImport}
            isRepoMode={repo !== undefined}
            onRepoSave={saveMapping}
            onResetMapping={onResetMapping}
          />
        }
      >
        <MGDButton> Mapping </MGDButton>
      </Popover2>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <MapperOptionMenu
            viewOption={viewOption}
            setOptions={setViewOption}
            isRepo={repo !== undefined}
          />
        }
      >
        <MGDButton> View </MGDButton>
      </Popover2>
      <MGDButton
        onClick={() => setViewOption({ ...viewOption, docVisible: true })}
      >
        Report
      </MGDButton>
    </ControlGroup>
  );

  const mapEditPage = editMappingProps.from !== '' &&
    editMappingProps.to !== '' && (
      <MappingEditPage
        from={
          impmodel.elements[editMappingProps.from] as
            | EditorProcess
            | EditorApproval
        }
        to={
          isModelWrapper(refMW)
            ? (refMW.model.elements[editMappingProps.to] as
                | EditorProcess
                | EditorApproval)
            : {
                id: editMappingProps.to,
                name: getDocumentMetaById(refMW, editMappingProps.to),
              }
        }
        data={
          mapProfile.mapSet[refns].mappings[editMappingProps.from][
            editMappingProps.to
          ]
        }
        onDelete={onMappingDelete}
        onChange={onMappingChange}
      />
    );

  const hotkeys = [
    {
      combo: 'ctrl+s',
      global: true,
      label: 'Save Mapping',
      onKeyDown: saveMapping,
    },
  ];

  async function saveMapping() {
    if (repo && updateObjects && isVisible) {
      const task = updateObjects({
        commitMessage: 'Updating concept',
        _dangerouslySkipValidation: true,
        objectChangeset: {
          [mapPath]: { newValue: mapProfile },
        },
      });
      task.then(() =>
        toaster.show({
          message: 'Mapping saved',
          intent: 'success',
        })
      );
    }
  }

  function clean() {
    onRefClose();
  }

  useEffect(() => clean, [repo]);

  if (isVisible) {
    return (
      <HotkeysProvider>
        <HotkeysTarget2 hotkeys={hotkeys}>
          <Workspace className={className} toolbar={toolbar}>
            <Dialog
              isOpen={
                editMappingProps.from !== '' ||
                viewOption.docVisible ||
                viewOption.mapAIVisible
              }
              title={
                editMappingProps.from !== ''
                  ? 'Edit Mapping'
                  : viewOption.docVisible
                  ? 'Report template'
                  : 'Auto mapper (transitive mapping)'
              }
              css={dialog_layout}
              onClose={
                editMappingProps.from !== ''
                  ? () =>
                      setEditMProps({
                        from: '',
                        to: '',
                      })
                  : closeDialog
              }
              canEscapeKeyClose={false}
              canOutsideClickClose={false}
            >
              {editMappingProps.from !== '' ? (
                mapEditPage
              ) : viewOption.docVisible ? (
                isModelWrapper(refMW) && (
                  <DocTemplatePane
                    mapProfile={mapProfile}
                    setMapProfile={setMapProfile}
                    refModel={refMW.model}
                    impModel={impmodel}
                  />
                )
              ) : (
                <AutoMapper
                  refNamespace={refns}
                  impNamespace={getNamespace(impmodel)}
                  showMessage={showMessage}
                  onClose={closeDialog}
                  mapProfile={mapProfile}
                  setMapProfile={setMapProfile}
                />
              )}
            </Dialog>
            <div css={multi_model_container}>
              <ModelDiagram
                modelProps={implementProps}
                viewOption={viewOption}
                setProps={onImpPropsChange}
                className={className}
                mapSet={mapSet}
                onMapSetChanged={onMapSetChanged}
                onModelChanged={onImpModelChanged}
                setSelected={setSelected}
                onMappingEdit={onMappingEdit}
                issueNavigationRequest={
                  isModelWrapper(refMW) ? onRefNavigate : undefined
                }
                getPartnerModelElementById={
                  isModelWrapper(refMW)
                    ? id => getEditorNodeInfoById(refMW.model, id)
                    : id => getDocumentMetaById(refMW, id)
                }
                onClose={onImpClose}
                isRepoMode={repo !== undefined}
              />
              <div ref={lineref} css={vertical_line} />
              {refrepo !== undefined ? (
                <LoadingContainer label="Loading..." />
              ) : (
                <ModelDiagram
                  modelProps={referenceProps}
                  viewOption={viewOption}
                  setProps={onRefPropsChange}
                  className={className}
                  mapSet={mapSet}
                  onMapSetChanged={onMapSetChanged}
                  mapResult={mapResult}
                  setSelected={setSelected}
                  onMappingEdit={onMappingEdit}
                  issueNavigationRequest={onImpNavigate}
                  getPartnerModelElementById={id =>
                    getEditorNodeInfoById(impmodel, id)
                  }
                  onClose={onRefClose}
                  isRepoMode={repo !== undefined}
                  setRefRepo={setRefRepo}
                />
              )}
            </div>
            <MappingCanvus mapEdges={mapEdges} line={lineref} />
            <RepoMapMainView
              isVisible={repo !== undefined && viewOption.repoMapVisible}
              viewOption={viewOption}
              repo={repo}
              loadModel={setRefRepo}
              onClose={() =>
                setViewOption({ ...viewOption, repoMapVisible: false })
              }
            />
          </Workspace>
        </HotkeysTarget2>
      </HotkeysProvider>
    );
  }
  return <></>;
};

export default ModelMapper;
