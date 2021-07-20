/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { useContext } from 'react';
import { AIAgent } from '../../ai/aiagent';
import { StateMan } from '../interface/state';
import { MyTopRightButtons } from './unit/closebutton';

const AIPane: React.FC<StateMan> = (sm: StateMan) => {
  const { logger, useDecodedBlob, requestFileFromFilesystem } =
    useContext(DatasetContext);
  const state = sm.state;

  function readModelFromFile(result: string) {
    console.debug('Transforming XML to model');
    state.history.clear();
    state.modelWrapper = AIAgent.xmlToModel(result);
    sm.setState(state);
  }

  function close() {
    state.aivisible = false;
    sm.setState(state);
  }

  async function handleOpen() {
    if (requestFileFromFilesystem && useDecodedBlob) {
      logger?.log('Requesting file');
      requestFileFromFilesystem(
        {
          prompt: 'Choose an XML file to import',
          allowMultiple: false,
          filters: [{ name: 'XML files', extensions: ['xml'] }],
        },
        selectedFiles => {
          logger?.log('Requesting file: Got selection', selectedFiles);
          const fileData = Object.values(selectedFiles ?? {})[0];
          if (fileData) {
            const fileDataAsString = useDecodedBlob({
              blob: fileData,
            }).asString;
            logger?.log('Requesting file: Decoded blob', fileDataAsString);
            readModelFromFile(fileDataAsString);
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

  return (
    <ControlBar>
      <MyTopRightButtons onClick={() => close()}>X</MyTopRightButtons>

      <button onClick={() => handleOpen()}> Transform XML to Model </button>
    </ControlBar>
  );
};

const ControlBar = styled.aside`
  position: absolute;
  width: 20%;
  height: 30%;
  bottom: 0;
  right: 0%;
  background-color: white;
  border-style: solid;
  font-size: 12px;
  overflow-y: auto;
  z-index: 100;
`;

export default AIPane;
