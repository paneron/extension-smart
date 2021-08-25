/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx, css } from '@emotion/react';
import React, { useContext, useState } from 'react';

import ModelDiagram from './mapper/ModelDiagram';
import {
  EditorApproval,
  EditorModel,
  EditorProcess,
  ModelType,
} from '../model/editormodel';
import {
  createMapProfile,
  createNewMapSet,
  getMappings,
  MappingMeta,
  MapProfile,
  MapSet,
} from './mapper/mapmodel';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import {
  ControlGroup,
  Dialog,
  HotkeyConfig,
  HotkeysTarget2,
} from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import MapperFileMenu from './menu/mapperfile';
import { createPageHistory } from '../model/history';
import {
  MapperSelectedInterface,
  MapperState,
  MapperViewOption,
} from '../model/state';
import { createNewEditorModel } from '../utils/EditorFactory';
import { createEditorModelWrapper } from '../model/modelwrapper';
import {
  calculateMapping,
  MapEdgeResult,
  MapResultType,
  updateMapEdges,
  updatePosMapEdges,
} from './mapper/MappingCalculator';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { Logger } from '../utils/commonfunctions';
import MappingCanvus from './mapper/mappingCanvus';
import MapperOptionMenu from './menu/mapperOptionMenu';
import { EditMPropsInterface } from './dialog/dialogs';
import MappingEditPage from './edit/mappingedit';
import DocTemplatePane from './doctemplate/doctemplatepane';
import MGDButton from '../MGDComponents/MGDButton';

const initModel = createNewEditorModel();
const initModelWrapper = createEditorModelWrapper(initModel);

const ModelMapper: React.FC<{
  isVisible: boolean;
  className?: string;
}> = ({ isVisible, className }) => {
  const { logger } = useContext(DatasetContext);

  Logger.logger = logger!;

  const [mapProfile, setMapProfile] = useState<MapProfile>(createMapProfile());
  const [viewOption, setViewOption] = useState<MapperViewOption>({
    dataVisible: true,
    legVisible: true,
    docVisible: false,
  });
  const [implementProps, setImplProps] = useState<MapperState>({
    modelWrapper: { ...initModelWrapper },
    history: createPageHistory(initModelWrapper),
    modelType: ModelType.IMP,
  });
  const [referenceProps, setRefProps] = useState<MapperState>({
    modelWrapper: { ...initModelWrapper },
    history: createPageHistory(initModelWrapper),
    modelType: ModelType.REF,
  });
  const [selected, setSelected] = useState<MapperSelectedInterface>({
    modelType: ModelType.IMP,
    selected: '',
  });
  const [mapResult, setMapResult] = useState<MapResultType>({});

  const [mapEdges, setMapEdges] = useState<MapEdgeResult[]>([]);

  const [editMappingProps, setEditMProps] = useState<EditMPropsInterface>({
    from: '',
    to: '',
  });

  const refmodel = referenceProps.modelWrapper.model;
  const refns =
    refmodel.meta.namespace === '' ? 'defaultns' : refmodel.meta.namespace;
  if (mapProfile.mapSet[refns] === undefined) {
    mapProfile.mapSet[refns] = createNewMapSet(refns);
  }
  const mapSet = mapProfile.mapSet[refns];

  function updateMapStyle({ model = refmodel, mp = mapProfile }) {
    setMapResult(calculateMapping(model, getMappings(mp, refns)));
  }

  function onMapSetChanged(ms: MapSet) {
    const newProfile: MapProfile = {
      ...mapProfile,
      mapSet: { ...mapProfile.mapSet, [ms.id]: ms },
    };
    setMapProfile(newProfile);
    updateMapStyle({ mp: newProfile });
    updateMapEdges(
      referenceProps.modelWrapper,
      implementProps.modelWrapper,
      newProfile,
      selected,
      setMapEdges
    );
  }

  function onRefModelChanged(model: EditorModel) {
    referenceProps.modelWrapper.model = model;
    updateMapStyle({ model: model });
  }

  function onMapProfileChanged(mp: MapProfile) {
    setMapProfile(mp);
    updateMapStyle({ mp: mp });
    updateMapEdges(
      referenceProps.modelWrapper,
      implementProps.modelWrapper,
      mp,
      selected,
      setMapEdges
    );
  }

  function onImpModelChanged(model: EditorModel) {
    onMapProfileChanged({ id: model.meta.namespace, mapSet: {}, docs: {} });
    implementProps.modelWrapper.model = model;
  }

  function onSelectionChange(select: MapperSelectedInterface) {
    setSelected(select);
    updateMapEdges(
      referenceProps.modelWrapper,
      implementProps.modelWrapper,
      mapProfile,
      select,
      setMapEdges
    );
  }

  function onImpPropsChange(state: MapperState) {
    setImplProps(state);
  }

  function onRefPropsChange(state: MapperState) {
    setRefProps(state);
  }

  function onMove() {
    setMapEdges(updatePosMapEdges(mapEdges));
  }

  function onMappingEdit(from: string, to: string) {
    setEditMProps({ from, to });
  }

  function onMappingChange(update: MappingMeta | null) {
    if (update !== null) {
      mapProfile.mapSet[
        referenceProps.modelWrapper.model.meta.namespace
      ].mappings[editMappingProps.from][editMappingProps.to] = update;
      setMapProfile({ ...mapProfile });
    }
    setEditMProps({
      from: '',
      to: '',
    });
  }

  function onMappingDelete() {
    const { from, to } = editMappingProps;
    const mapSet =
      mapProfile.mapSet[referenceProps.modelWrapper.model.meta.namespace];
    delete mapSet.mappings[from][to];
    if (Object.keys(mapSet.mappings[from]).length === 0) {
      delete mapSet.mappings[from];
    }
    setMapProfile({ ...mapProfile });
    setEditMProps({
      from: '',
      to: '',
    });
    updateMapStyle({ mp: mapProfile });
    updateMapEdges(
      referenceProps.modelWrapper,
      implementProps.modelWrapper,
      mapProfile,
      selected,
      setMapEdges
    );
  }

  if (!isVisible && selected.selected !== '') {
    onSelectionChange({
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

  const mapEditPage =
    editMappingProps.from !== '' && editMappingProps.to !== '' ? (
      <MappingEditPage
        from={
          implementProps.modelWrapper.model.elements[editMappingProps.from] as
            | EditorProcess
            | EditorApproval
        }
        to={
          referenceProps.modelWrapper.model.elements[editMappingProps.to] as
            | EditorProcess
            | EditorApproval
        }
        data={
          mapProfile.mapSet[refns].mappings[editMappingProps.from][
            editMappingProps.to
          ]
        }
        onDelete={onMappingDelete}
        onChange={onMappingChange}
      />
    ) : (
      <></>
    );

  const hotkeys: HotkeyConfig[] = [
    {
      combo: 'esc',
      global: true,
      label: 'cancel view mapping',
      onKeyDown: () =>
        onSelectionChange({
          modelType: ModelType.IMP,
          selected: '',
        }),
    },
  ];

  if (isVisible) {
    return (
      <HotkeysTarget2 hotkeys={hotkeys}>
        <Workspace className={className} toolbar={toolbar}>
          <Dialog
            isOpen={editMappingProps.from !== '' || viewOption.docVisible}
            title={
              editMappingProps.from !== '' ? 'Edit Mapping' : 'Report template'
            }
            css={css`
              width: calc(100vw - 60px);              
              padding-bottom: 0;
              & > :last-child {
                overflow-y: auto;
                padding: 20px;
              }
            `}
            onClose={
              editMappingProps.from !== ''
                ? () =>
                    setEditMProps({
                      from: '',
                      to: '',
                    })
                : () => setViewOption({ ...viewOption, docVisible: false })
            }
            canEscapeKeyClose={false}
            canOutsideClickClose={false}
          >
            {editMappingProps.from !== '' ? (
              mapEditPage
            ) : (
              <DocTemplatePane
                mapProfile={mapProfile}
                setMapProfile={setMapProfile}
                refModel={referenceProps.modelWrapper.model}
                impModel={implementProps.modelWrapper.model}
              />
            )}
          </Dialog>
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
            }}
          >
            <ModelDiagram
              modelProps={implementProps}
              viewOption={viewOption}
              setProps={onImpPropsChange}
              className={className}
              mapSet={mapSet}
              onMapSetChanged={onMapSetChanged}
              onModelChanged={onImpModelChanged}
              setSelected={onSelectionChange}
              onMove={onMove}
            />
            <ModelDiagram
              modelProps={referenceProps}
              viewOption={viewOption}
              setProps={onRefPropsChange}
              className={className}
              mapSet={mapSet}
              onMapSetChanged={onMapSetChanged}
              mapResult={mapResult}
              onModelChanged={onRefModelChanged}
              setSelected={onSelectionChange}
              onMove={onMove}
            />
          </div>
          <MappingCanvus mapEdges={mapEdges} onMappingEdit={onMappingEdit} />
        </Workspace>
      </HotkeysTarget2>
    );
  }
  return <></>;
};

export default ModelMapper;
