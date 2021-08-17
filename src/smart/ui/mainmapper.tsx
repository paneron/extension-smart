/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useState } from 'react';

import ModelDiagram from './mapper/ModelDiagram';
import { ModelType } from '../model/editormodel';
import { createMapProfile, MapProfile } from './mapper/mapmodel';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import { Button, ControlGroup } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import MapperFileMenu from './menu/mapperfile';
import { createPageHistory } from '../model/history';
import { MapperState } from '../model/state';
import { createNewEditorModel } from '../utils/EditorFactory';
import { createEditorModelWrapper } from '../model/modelwrapper';

const initModel = createNewEditorModel();
const initModelWrapper = createEditorModelWrapper(initModel);

const ModelMapper: React.FC<{
  isVisible: boolean;
  className?: string;
}> = ({ isVisible, className }) => {
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

  const toolbar = (
    <ControlGroup>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <MapperFileMenu
            mapProfile={mapProfile}
            setMapProfile={setMapProfile}
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
            mapProfile={mapProfile}
            setMapProfile={setMapProfile}
          />
          <ModelDiagram
            modelProps={referenceProps}
            setProps={setRefProps}
            className={className}
            mapProfile={mapProfile}
            setMapProfile={setMapProfile}
          />
        </div>
      </Workspace>
    );
  }
  return <></>;
};

export default ModelMapper;
