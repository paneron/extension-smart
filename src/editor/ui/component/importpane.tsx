/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { ChangeEvent, RefObject, useContext } from 'react';
import { textToMMEL } from '../../serialize/MMEL';
import { StateMan } from '../interface/state';
import * as shape from '../util/shapes';
import { MyTopRightButtons } from './unit/closebutton';

const ref: RefObject<HTMLSelectElement> = React.createRef();

const ImportPane: React.FC<StateMan> = (sm: StateMan) => {
  const { logger, requestFileFromFilesystem, useDecodedBlob } =
    useContext(DatasetContext);

  const state = sm.state;

  const importModelFromFile = (result: string) => {
    logger?.log('Importing model');
    try {
      const model = textToMMEL(result);
      state.imodel = model;
      state.namespace = state.imodel.meta.namespace;
      logger?.log('Imported model', model);
      sm.setState(state);
    } catch (e) {
      logger?.log('Failed to import model', e);
    }
  };

  const updateNamespace = (e: ChangeEvent<HTMLInputElement>) => {
    state.namespace = e.target.value;
    sm.setState(state);
  };

  const elms: Array<JSX.Element> = [
    <option key="option-1" value={''}>
      {''}
    </option>,
  ];
  if (state.imodel.processes.length > 0) {
    elms.push(
      <option key="option-2" value={'*'}>
        {'*'}
      </option>
    );
  }
  state.imodel.processes.map((p, index) => {
    elms.push(
      <option key={'option' + index} value={p.id}>
        {p.id}
      </option>
    );
  });

  const close = () => {
    state.importvisible = false;
    sm.setState(state);
  };

  const onChange = () => {
    if (ref.current !== null) {
      state.importing = ref.current.value;
      sm.setState(state);
    }
  };

  async function importFileSelected(
    readModel: (x: string) => void
  ): Promise<void> {
    if (!requestFileFromFilesystem) {
      throw new Error('File import function not availbale');
    }
    if (!useDecodedBlob) {
      throw new Error('Blob decode function not availbale');
    }

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
          const fileDataAsString = useDecodedBlob({ blob: fileData }).asString;
          logger?.log('Requesting file: Decoded blob', fileDataAsString);
          readModel(fileDataAsString);
        } else {
          logger?.log('Requesting file: No file data received');
          console.error('Import file: no file data received');
        }
      }
    );
  }

  return (
    <ComponentBar>
      <Container>
        Measurement import is not yet implemented
        <MyTopRightButtons onClick={() => close()}>X</MyTopRightButtons>
        <button onClick={() => importFileSelected(importModelFromFile)}>
          Open Model
        </button>
        Namespace
        <input
          type="text"
          value={state.namespace}
          onChange={e => updateNamespace(e)}
        />
      </Container>
      <Container>
        Import process
        <select
          key="ui#selectImportProcess"
          ref={ref}
          value={state.importing}
          onChange={() => onChange()}
        >
          {' '}
          {elms}{' '}
        </select>
        {state.importing !== '' ? (
          <Unit onDragStart={event => onDragStart(event, 'import')} draggable>
            {' '}
            {
              <shape.ProcessBox>
                {' '}
                {state.importing === '*' ? 'Entire model' : state.importing}{' '}
              </shape.ProcessBox>
            }{' '}
          </Unit>
        ) : (
          ''
        )}
      </Container>
    </ComponentBar>
  );
};

const onDragStart = (event: React.DragEvent<HTMLDivElement>, msg: string) => {
  if (event.dataTransfer !== null) {
    event.dataTransfer.setData('application/modeleditor', msg);
    event.dataTransfer.effectAllowed = 'move';
  }
};

const ComponentBar = styled.footer`
  position: absolute;
  width: 90%;
  height: 15%;
  bottom: 0;
  right: 0;
  background-color: white;
  border-style: solid;
  font-size: 12px;
  overflow-y: auto;
  text-align: center;
  z-index: 101;
`;

const Unit = styled.div`
  padding: 10px;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50%;
`;

export default ImportPane;
