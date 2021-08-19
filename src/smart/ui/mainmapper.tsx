/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx, css } from '@emotion/react';
import React, { useContext, useState } from 'react';

import ModelDiagram from './mapper/ModelDiagram';
import { EditorApproval, EditorModel, EditorProcess, ModelType } from '../model/editormodel';
import {
  createMapProfile,
  createNewMapSet,
  getMappings,
  MappingMeta,
  MapProfile,
  MapSet,
} from './mapper/mapmodel';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import { Button, ControlGroup, Dialog } from '@blueprintjs/core';
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
import { calculateMapping, MapEdgeResult, MapResultType, updateMapEdges, updatePosMapEdges } from './mapper/MappingCalculator';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { Logger } from '../utils/commonfunctions';
import MappingCanvus from './mapper/mappingCanvus';
import MapperOptionMenu from './menu/mapperOptionMenu';
import { editMPropsInterface } from './dialog/dialogs';
import MappingEditPage from './edit/mappingedit';

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

  const [mapEdges, setMapEdges] = useState<MapEdgeResult[]>([])

  const [editMappingProps, setEditMProps] = useState<editMPropsInterface>({
    from: '',
    to: ''
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
      id: mapProfile.id,
      mapSet: { ...mapProfile.mapSet, [ms.id]: ms },
    };
    setMapProfile(newProfile);    
    updateMapStyle({ mp: newProfile });
    updateMapEdges(referenceProps.modelWrapper, implementProps.modelWrapper, newProfile, selected, setMapEdges);
  }

  function onRefModelChanged(model: EditorModel) {
    referenceProps.modelWrapper.model = model;
    updateMapStyle({ model: model });    
  }

  function onMapProfileChanged(mp: MapProfile) {
    setMapProfile(mp);
    updateMapStyle({ mp: mp });    
    updateMapEdges(referenceProps.modelWrapper, implementProps.modelWrapper, mp, selected, setMapEdges);
  }

  function onImpModelChanged(model: EditorModel) {
    setMapProfile({ id: model.meta.namespace, mapSet: {} });
    implementProps.modelWrapper.model = model;
  }

  function onSelectionChange(select:MapperSelectedInterface) {
    setSelected(select);
    updateMapEdges(referenceProps.modelWrapper, implementProps.modelWrapper, mapProfile, select, setMapEdges);
  }

  function onImpPropsChange(state:MapperState) {
    setImplProps(state);    
  }

  function onRefPropsChange(state:MapperState) {
    setRefProps(state);    
  }

  function onMove() {
    setMapEdges(updatePosMapEdges(mapEdges));
  }

  function onMappingEdit(from:string, to:string) {
    setEditMProps({ from, to })
  }

  function onMappingChange(update:MappingMeta | null) {
    if (update !== null) {
      mapProfile.mapSet[referenceProps.modelWrapper.model.meta.namespace].mappings[editMappingProps.from][editMappingProps.to] = update
      setMapProfile({...mapProfile});
    }
    setEditMProps({
      from: '',
      to: ''
    })
  }

  if (!isVisible && selected.selected !== '') {
    setSelected({
      modelType: ModelType.IMP,
      selected: ''
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
        <Button text="Mapping" />
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
        <Button text="View" />
      </Popover2>
    </ControlGroup>
  );

  const mapEditPage = editMappingProps.from !== '' && editMappingProps.to !== '' 
    ? <MappingEditPage
        from={implementProps.modelWrapper.model.elements[editMappingProps.from] as EditorProcess | EditorApproval}
        to={referenceProps.modelWrapper.model.elements[editMappingProps.to] as EditorProcess | EditorApproval}
        data={mapProfile.mapSet[refns].mappings[editMappingProps.from][editMappingProps.to]}
        onChange={onMappingChange}
      />
    : <></>

  if (isVisible) {
    return (
      <Workspace className={className} toolbar={toolbar}>
        <Dialog
          isOpen={editMappingProps.from !== ''}
          title='Edit Mapping'
          css={css`
            width: calc(100vw - 60px);
            min-height: calc(100vh - 60px);
            padding-bottom: 0;
            & > :last-child {
              overflow-y: auto;
              padding: 20px;
            }
          `}
          onClose={() => setEditMProps({
            from: '',
            to: ''
          })}
          canEscapeKeyClose={false}
          canOutsideClickClose={false}
        >
          {mapEditPage}
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
        <MappingCanvus mapEdges={mapEdges} onMappingEdit={onMappingEdit}/>
      </Workspace>
    );
  }
  return <></>;
};

export default ModelMapper;
