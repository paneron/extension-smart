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
  EditorModel,
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
  MapProfile,
  MapSet,
} from '../model/mapmodel';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import {
  Button,
  ControlGroup,
  HotkeysProvider,
  HotkeysTarget2,
  IToaster,
  IToastProps,
  Toaster,
} from '@blueprintjs/core';
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
  MapDiffEdgeResult,
  mergeMapProfiles,
} from '../utils/map/MappingCalculator';
import MappingCanvus from './mapper/MappingsCanvus';
import MapperOptionMenu from './menu/mapperOptionMenu';
import { EditMPropsInterface } from './dialog/dialogs';
import { multi_model_container } from '../../css/layout';
import { vertical_line } from '../../css/components';
import { findPageContainingElement } from '../utils/SearchFunctions';
import { getDocumentMetaById } from '../utils/DocumentFunctions';
import { getNamespace } from '../utils/ModelFunctions';
import {
  COMMITMSG,
  getPathByNS,
  JSONContext,
  JSONToMMEL,
  RepoFileType,
} from '../utils/repo/io';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { MMELJSON } from '../model/json';
import { MMELRepo, RepoIndex } from '../model/repo';
import RepoMapMainView from './mapper/repo/RepoMapMainView';
import { LoadingContainer } from './common/Loading';
import { MMELDocument } from '../model/document';
import MapperCompareMenu from './menu/MapperCompareMenu';
import MapperDialog from './popover/MapperDialog';
import { calEdgeDiff } from '../utils/map/MappingDiff';
import { DOCVERSION, MAPVERSION } from '../utils/constants';
import MenuButton from './menu/MenuButton';

const initModel = createNewEditorModel();
const initModelWrapper = createEditorModelWrapper(initModel);

const lineref: RefObject<HTMLDivElement> = React.createRef();

const ModelMapper: React.FC<{
  isVisible: boolean;
  className?: string;
  repo: MMELRepo;
  index: RepoIndex;
}> = ({ isVisible, className, repo, index }) => {
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
  const [mainRepo, setMainRepo] = useState<string | undefined>(undefined);
  const [diffMap, setDiffMap] = useState<MapProfile | undefined>(undefined);

  const repoPath = getPathByNS(repo ? repo.ns : '', RepoFileType.MODEL);
  const mapPath = getPathByNS(repo ? repo.ns : '', RepoFileType.MAP);
  const refPath = getPathByNS(refrepo ?? '', RepoFileType.MODEL);
  const repoModelFile = useObjectData({
    objectPaths: repo !== undefined ? [repoPath, mapPath] : [],
  });
  const repoData = repo !== undefined ? repoModelFile.value.data[repoPath] : {};
  const mapData = repo !== undefined ? repoModelFile.value.data[mapPath] : {};
  const repoRefFile = useObjectData({
    objectPaths: refrepo !== undefined ? [refPath] : [],
  });
  if (refrepo !== undefined && !repoRefFile.isUpdating) {
    const data = repoRefFile.value.data[refPath];
    const item = index[refrepo];
    if (item && data) {
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
        if (doc && doc.version !== DOCVERSION) {
          alert(
            `Warning: Document version not matched\nDocument version of the file:${doc.version}`
          );
          doc.version = DOCVERSION;
        }
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
      setRefRepo(undefined);
    }
  }
  if (repo === undefined && mainRepo !== undefined) {
    setMainRepo(undefined);
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
        if (mapPro.version !== MAPVERSION) {
          alert(
            `Warning: Mapping version not matched\nMapping version of the file:${mapPro.version}`
          );
          mapPro.version = MAPVERSION;
        }
        setMapProfile(mapPro);
      } else {
        setMapProfile({
          '@context': JSONContext,
          '@type': 'MMEL_MAP',
          id: getNamespace(mw.model),
          mapSet: {},
          docs: {},
          version: MAPVERSION,
        });
      }
      setMainRepo(repo.ns);
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
  const diffMapSet = diffMap ? diffMap.mapSet[refns] : undefined;
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

  const compareEdges = useMemo(() => {
    if (diffMapSet) {
      return isModelWrapper(refMW)
        ? filterMappings(
            diffMapSet,
            impPage,
            refMW.model.pages[refMW.page],
            selected,
            impmodel.elements,
            refMW.model.elements
          )
        : filterMappingsForDocument(
            diffMapSet,
            impPage,
            refMW,
            selected,
            impmodel.elements
          );
    } else {
      return undefined;
    }
  }, [
    diffMapSet,
    impPage,
    isModelWrapper(refMW) ? refMW.model.pages[refMW.page] : refMW,
    selected,
  ]);

  const diffEdges: MapDiffEdgeResult[] = useMemo(
    () =>
      compareEdges
        ? calEdgeDiff(mapEdges, compareEdges)
        : mapEdges.map(x => ({ ...x, type: 'new' })),
    [mapEdges, compareEdges]
  );

  const mapResult = useMemo(
    () =>
      isModelWrapper(refMW)
        ? calculateMapping(refMW.model, getMappings(mapProfile, refns))
        : undefined,
    [isModelWrapper(refMW) ? refMW.model : refMW, mapProfile]
  );

  const compareResult = useMemo(
    () =>
      isModelWrapper(refMW) && diffMap
        ? calculateMapping(refMW.model, getMappings(diffMap, refns))
        : undefined,
    [isModelWrapper(refMW) ? refMW.model : refMW, diffMap]
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

  function onMapProfileImported(mp: MapProfile) {
    const newMP = mergeMapProfiles(mapProfile, mp);
    setMapProfile(newMP);
  }

  function onImpModelChanged(model: EditorModel) {
    onMapProfileChanged({
      '@context': JSONContext,
      '@type': 'MMEL_MAP',
      id: getNamespace(model),
      mapSet: {},
      docs: {},
      version: MAPVERSION,
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

  if (!isVisible && selected.selected !== '') {
    setSelected({
      modelType: ModelType.IMP,
      selected: '',
    });
  }

  const mappermenu = (
    <MapperFileMenu
      mapProfile={mapProfile}
      onMapProfileChanged={onMapProfileChanged}
      onMapProfileImported={onMapProfileImported}
      onMapImport={onMapImport}
      onRepoSave={saveMapping}
      onResetMapping={onResetMapping}
      repo={repo}
    />
  );

  const viewmenu = (
    <MapperOptionMenu
      viewOption={viewOption}
      setOptions={setViewOption}
      isRepo={repo !== undefined}
    />
  );

  const compareMenu = (
    <MapperCompareMenu opponent={diffMap} setDiffMap={setDiffMap} />
  );

  const toolbar = (
    <ControlGroup>
      <MenuButton content={mappermenu} text="Mapping" />
      <MenuButton content={viewmenu} text="View" />
      <MenuButton content={compareMenu} text="Compare" />
      {isModelWrapper(refMW) && (
        <Button
          onClick={() => setViewOption({ ...viewOption, docVisible: true })}
        >
          Report
        </Button>
      )}
    </ControlGroup>
  );

  const hotkeys = [
    {
      combo: 'ctrl+s',
      global: true,
      label: `Save Mapping ${jsx.length}`,
      onKeyDown: saveMapping,
    },
  ];

  async function saveMapping() {
    if (repo && updateObjects && isVisible) {
      const task = updateObjects({
        commitMessage: COMMITMSG,
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
    setDiffMap(undefined);
  }

  useEffect(() => clean, [repo]);

  const diagProps = {
    editMappingProps,
    mapProfile,
    refMW,
    setMapProfile,
    setEditMProps,
    viewOption,
    setViewOption,
    showMessage,
    impMW,
    repo,
    index,
  };

  if (isVisible) {
    return (
      <HotkeysProvider>
        <HotkeysTarget2 hotkeys={hotkeys}>
          <Workspace className={className} toolbar={toolbar}>
            <MapperDialog {...diagProps} />
            <div css={multi_model_container}>
              <ModelDiagram
                modelProps={implementProps}
                viewOption={viewOption}
                setProps={onImpPropsChange}
                className={className}
                mapSet={mapSet}
                diffMapSet={diffMapSet}
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
                index={index}
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
                  diffMapSet={diffMapSet}
                  onMapSetChanged={onMapSetChanged}
                  mapResult={mapResult}
                  diffMapResult={compareResult}
                  setSelected={setSelected}
                  onMappingEdit={onMappingEdit}
                  issueNavigationRequest={onImpNavigate}
                  getPartnerModelElementById={id =>
                    getEditorNodeInfoById(impmodel, id)
                  }
                  onClose={onRefClose}
                  isRepoMode={repo !== undefined}
                  setRefRepo={x => setRefRepo(x.ns)}
                  index={index}
                />
              )}
            </div>
            <MappingCanvus mapEdges={diffEdges} line={lineref} />
            <RepoMapMainView
              isVisible={repo !== undefined && viewOption.repoMapVisible}
              viewOption={viewOption}
              repo={repo}
              loadModel={setRefRepo}
              map={mapProfile}
              diffMap={diffMap}
              onClose={() =>
                setViewOption({ ...viewOption, repoMapVisible: false })
              }
              index={index}
            />
          </Workspace>
        </HotkeysTarget2>
      </HotkeysProvider>
    );
  }
  return <></>;
};

export default ModelMapper;
