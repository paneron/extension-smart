/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import React, { CSSProperties, useContext } from 'react';
import { ModelViewStateMan } from '../model/mapperstate';
import { MyTopRightButtons } from '../../component/unit/closebutton';
import { MappingProfile } from '../model/MappingProfile';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { textToMMEL } from '../../../serialize/MMEL';
import { ModelWrapper } from '../../model/modelwrapper';
import { MapperFunctions } from '../util/helperfunctions';

const MapperControlPane: React.FC<{
  sm: ModelViewStateMan;
  elms: Map<string, MappingProfile>;
}> = ({ sm }) => {
  const { logger, useDecodedBlob, requestFileFromFilesystem } =
    useContext(DatasetContext);

  const state = sm.state;

  const css: CSSProperties = {
    display: state.cpvisible ? 'inline' : 'none',
  };

  function parseModel(data: string) {
    logger?.log('Importing model');
    try {
      const model = textToMMEL(data);
      sm.state.history.clear();
      sm.state.modelWrapper = new ModelWrapper(model);
      logger?.log('Loaded model');
      MapperFunctions.setIsMap(false);
      MapperFunctions.updateMapRef(sm);
      sm.setState(sm.state);
    } catch (e) {
      logger?.log('Failed to load model', e);
    }
  }

  async function handleOpen() {
    if (requestFileFromFilesystem && useDecodedBlob) {
      logger?.log('Requesting file');
      requestFileFromFilesystem(
        {
          prompt: 'Choose an MMEL file to import',
          allowMultiple: false,
          filters: [{ name: 'MMEL files', extensions: ['mmel'] }],
        },
        selectedFiles => {
          logger?.log('Requesting file: Got selection', selectedFiles);
          const fileData = Object.values(selectedFiles ?? {})[0];
          if (fileData) {
            const fileDataAsString = useDecodedBlob({
              blob: fileData,
            }).asString;
            logger?.log('Requesting file: Decoded blob', fileDataAsString);
            parseModel(fileDataAsString);
          } else {
            logger?.log('Requesting file: No file data received');
            console.error('Import file: no file data received');
          }
        }
      );
    } else {
      throw new Error('File import function not availbale');
    }
  }

  const close = () => {
    state.cpvisible = false;
    sm.setState(state);
  };

  return (
    <ControlBar style={css}>
      <MyTopRightButtons onClick={() => close()}>X</MyTopRightButtons>

      <button onClick={() => handleOpen()}>Load Model</button>
    </ControlBar>
  );
};

const ControlBar = styled.aside`
  position: absolute;
  width: 25%;
  height: 10%;
  bottom: 0;
  right: 0%;
  background-color: white;
  border-style: solid;
  font-size: 12px;
  overflow-y: auto;
  z-index: 100;
`;

export default MapperControlPane;
