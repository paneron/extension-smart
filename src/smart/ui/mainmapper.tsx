/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext, useState } from 'react';

import ModelDiagram from './mapper/ModelDiagram';
import { EditorModel, ModelType } from '../model/editormodel';
import {
  createMapProfile,
  createNewMapSet,
  getMappings,
  MapProfile,
  MapSet,
} from './mapper/mapmodel';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import { Button, ControlGroup } from '@blueprintjs/core';
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
  }

  function onRefModelChanged(model: EditorModel) {
    referenceProps.modelWrapper.model = model;
    updateMapStyle({ model: model });
    updateMapEdges(referenceProps.modelWrapper, implementProps.modelWrapper, mapProfile, selected, setMapEdges);
  }

  function onMapProfileChanged(mp: MapProfile) {
    setMapProfile(mp);
    updateMapStyle({ mp: mp });
    updateMapEdges(referenceProps.modelWrapper, implementProps.modelWrapper, mp, selected, setMapEdges);
  }

  function onImpModelChanged(model: EditorModel) {
    setMapProfile({ id: model.meta.namespace, mapSet: {} });
    implementProps.modelWrapper.model = model;
    updateMapEdges(referenceProps.modelWrapper, implementProps.modelWrapper, mapProfile, selected, setMapEdges);
  }

  function onSelectionChange(select:MapperSelectedInterface) {
    setSelected(select);
    updateMapEdges(referenceProps.modelWrapper, implementProps.modelWrapper, mapProfile, select, setMapEdges);
  }

  function onImpPropsChange(state:MapperState) {
    setImplProps(state);
    updateMapEdges(referenceProps.modelWrapper, state.modelWrapper, mapProfile, selected, setMapEdges);
  }

  function onRefPropsChange(state:MapperState) {
    setRefProps(state);
    updateMapEdges(state.modelWrapper, implementProps.modelWrapper, mapProfile, selected, setMapEdges);
  }

  function onMove() {
    setMapEdges(updatePosMapEdges(mapEdges));
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

  if (isVisible) {
    return (
      <Workspace className={className} toolbar={toolbar}>
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
        <MappingCanvus mapEdges={mapEdges} />
      </Workspace>
    );
  }
  return <></>;
};

export default ModelMapper;
