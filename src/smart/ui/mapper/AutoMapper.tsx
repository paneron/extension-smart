import { Button, IToastProps, Text } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React from 'react';
import { CSSProperties, useContext, useState } from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import MGDHeading from '../../MGDComponents/MGDHeading';
import { MapProfile } from '../../model/mapmodel';
import { ModelWrapper } from '../../model/modelwrapper';
import { handleMappingOpen, handleModelOpen } from '../../utils/IOFunctions';
import { mapAI } from '../../utils/map/MappingCalculator';
import { getNamespace } from '../../utils/ModelFunctions';

const centeredLayout: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const rightAlignedLayout: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
};

const AutoMapper: React.FC<{
  refNamespace: string;
  impNamespace: string;
  mapProfile: MapProfile;
  onClose: () => void;
  showMessage: (msg: IToastProps) => void;
  setMapProfile: (mp: MapProfile) => void;
}> = function ({
  refNamespace,
  impNamespace,
  onClose,
  showMessage,
  mapProfile,
  setMapProfile,
}) {
  const { requestFileFromFilesystem, logger } = useContext(DatasetContext);

  const [mw, setMW] = useState<ModelWrapper | undefined>(undefined);
  const [mapping, setMapping] = useState<MapProfile | undefined>(undefined);

  const isValid: boolean = mw !== undefined && mapping !== undefined;

  async function handleOpenModel() {
    handleModelOpen({
      setModelWrapper: setMW,
      requestFileFromFilesystem,
      logger,
    });
  }

  async function handleOpenMapping() {
    handleMappingOpen({
      onMapProfileChanged: setMapping,
      requestFileFromFilesystem,
    });
  }

  function onDiscovery() {
    if (mapping !== undefined && mw !== undefined) {
      const [newMP, summary] = mapAI(
        mapProfile,
        mapping,
        mw.model,
        refNamespace
      );
      showMessage({
        message: summary,
        intent: 'success',
      });
      setMapProfile(newMP);
      onClose();
    }
  }

  return (
    <MGDDisplayPane>
      <MGDHeading>
        Auto discover mapping from {impNamespace} to {refNamespace} using an
        intermediate model
      </MGDHeading>
      <fieldset>
        <legend>Intermediate model</legend>
        <div style={centeredLayout}>
          <Text>Model file:</Text>
          <Button
            intent={mw !== undefined ? 'success' : 'danger'}
            onClick={handleOpenModel}
          >
            {mw !== undefined ? 'Model set' : 'Model not set'}
          </Button>
          {mw !== undefined && <Text>Namespace: {getNamespace(mw.model)}</Text>}
        </div>
        <div style={centeredLayout}>
          <Text>Mapping file:</Text>
          <Button
            intent={mapping !== undefined ? 'success' : 'danger'}
            onClick={handleOpenMapping}
          >
            {mapping !== undefined ? 'Mapping set' : 'Mapping not set'}
          </Button>
        </div>
        <div style={rightAlignedLayout}>
          <Button large disabled={!isValid} onClick={onDiscovery}>
            Start discovery
          </Button>
        </div>
      </fieldset>
    </MGDDisplayPane>
  );
};

export default AutoMapper;
