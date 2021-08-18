/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext, useState } from 'react';

import ModelDiagram from './mapper/ModelDiagram';
import { EditorModel, ModelType } from '../model/editormodel';
import { createMapProfile, createNewMapSet, getMappings, MapProfile, MapSet } from './mapper/mapmodel';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import { Button, ControlGroup } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import MapperFileMenu from './menu/mapperfile';
import { createPageHistory } from '../model/history';
import { MapperState } from '../model/state';
import { createNewEditorModel } from '../utils/EditorFactory';
import { createEditorModelWrapper } from '../model/modelwrapper';
import { calculateMapping, MapResultType } from './mapper/MappingCalculator';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { Logger } from '../utils/commonfunctions';
import MappingCanvus from './mapper/mappingcanvus';

const initModel = createNewEditorModel();
const initModelWrapper = createEditorModelWrapper(initModel);

const ModelMapper: React.FC<{
  isVisible: boolean;
  className?: string;
}> = ({ isVisible, className }) => {
  const { logger } = useContext(DatasetContext);

  Logger.logger = logger!;

  const [mapProfile, setMapProfile] = useState<MapProfile>(createMapProfile());
  const [implementProps, setImplProps] = useState<MapperState>({    
    dvisible: true,
    modelWrapper: { ...initModelWrapper },
    history: createPageHistory(initModelWrapper),
    modelType: ModelType.IMP,
  });  
  const [referenceProps, setRefProps] = useState<MapperState>({
    dvisible: true,
    modelWrapper: { ...initModelWrapper },
    history: createPageHistory(initModelWrapper),
    modelType: ModelType.REF,
  });
  const [mapResult, setMapResult] = useState<MapResultType>({});

  const refmodel = referenceProps.modelWrapper.model;
  const refns = refmodel.meta.namespace === '' ? 'defaultns' : refmodel.meta.namespace;
  if (mapProfile.mapSet[refns] === undefined) {
    mapProfile.mapSet[refns] = createNewMapSet(refns);
  }
  const mapSet = mapProfile.mapSet[refns];

  function updateMapStyle({model = refmodel, mp = mapProfile}) {
    setMapResult(calculateMapping(model, getMappings(mp, refns)));
  }

  function onMapSetChanged(ms:MapSet) {
    const newProfile:MapProfile = {
      id: mapProfile.id,
      mapSet: {...mapProfile.mapSet, [ms.id]:ms}
    }
    setMapProfile(newProfile);
    updateMapStyle({mp:newProfile});
  }
  
  function onRefModelChanged(model:EditorModel) {
    updateMapStyle({model:model});
  }

  function onMapProfileChanged(mp:MapProfile) {
    setMapProfile(mp);
    updateMapStyle({mp:mp});
  }

  function onImpModelChanged(model:EditorModel) {    
    setMapProfile({id: model.meta.namespace, mapSet:{}});
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
            setProps={setImplProps}
            className={className}
            mapSet={mapSet}
            onMapSetChanged={onMapSetChanged}
            onModelChanged={onImpModelChanged}
          />
          <ModelDiagram
            modelProps={referenceProps}
            setProps={setRefProps}
            className={className}
            mapSet={mapSet}
            onMapSetChanged={onMapSetChanged}
            mapResult={mapResult}
            onModelChanged={onRefModelChanged}
          />
        </div>
        <MappingCanvus
          mapProfile={mapProfile}
          implWrapper={implementProps.modelWrapper}
          refWrapper={referenceProps.modelWrapper}
        />
      </Workspace>
    );
  }
  return <></>;
};

export default ModelMapper;
