/** @jsx jsx */
/** @jsxFrag React.Fragment */

// TODO: This is superseded by FileMenu.

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import React, { CSSProperties, RefObject, useContext } from 'react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { MMELFactory } from '../../runtime/modelComponentCreator';
import { MMELModel } from '../../serialize/interface/model';
import { MMELToText, textToMMEL } from '../../serialize/MMEL';
import { StateMan } from '../interface/state';
import { ModelWrapper } from '../model/modelwrapper';
import { functionCollection } from '../util/function';
import { MyTopRightButtons } from './unit/closebutton';

const modelfilename: RefObject<HTMLInputElement> = React.createRef();

const ControlPane: React.FC<StateMan> = (sm: StateMan) => {
  const {
    logger,
    getBlob,
    useDecodedBlob,
    writeFileToFilesystem,
    requestFileFromFilesystem,
  } = useContext(DatasetContext);

  const state = sm.state;

  const css: CSSProperties = {
    display: state.cvisible ? 'inline' : 'none',
  };

  const newModel = () => {
    state.history.clear();
    state.modelWrapper = new ModelWrapper(MMELFactory.createNewModel());
    sm.setState(state);
  };

  const close = () => {
    state.cvisible = false;
    sm.setState(state);
  };

  // Importing

  const readModelFromFile = (result: string) => {
    logger?.log('Importing model');
    try {
      const model = textToMMEL(result);
      state.history.clear();
      state.modelWrapper = new ModelWrapper(model);
      logger?.log('Loaded model');
      sm.setState(state);
    } catch (e) {
      logger?.log('Failed to load model', e);
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

  // Exporting
  // XXX: fn is unused. Is it important?
  const exportModel = async (fn: string | undefined): Promise<void> => {
    functionCollection.saveLayout();
    const mmel = MMELToText(state.modelWrapper.model);
    await exportFile(mmel);
  };
  const exportJSON = async (fn: string | undefined) => {
    functionCollection.saveLayout();
    const json = MMELToJSON(state.modelWrapper.model);
    await exportFile(json);
  };
  const exportXML = async (fn: string | undefined) => {
    functionCollection.saveLayout();
    const xml = MMELToXML(state.modelWrapper.model);
    await exportFile(xml);
  };
  async function exportFile(fileData: string) {
    if (!getBlob || !writeFileToFilesystem) {
      throw new Error('File export function(s) are not provided');
    }
    //const blob = new Blob([fileData], {
    //  type: 'text/plain',
    //});
    const blob = await getBlob(fileData);
    await writeFileToFilesystem({
      dialogOpts: {
        prompt: 'Choose location to save',
        filters: [{ name: 'All files', extensions: ['*'] }],
      },
      bufferData: blob,
    });
  }

  return (
    <ControlBar style={css}>
      <MyTopRightButtons onClick={() => close()}>X</MyTopRightButtons>

      <button onClick={() => importFileSelected(readModelFromFile)}>
        Load Model
      </button>
      <button onClick={() => exportModel(modelfilename.current?.value)}>
        Download Model
      </button>
      <p>
        {' '}
        Download model name:{' '}
        <input
          type="text"
          ref={modelfilename}
          name="modelfn"
          defaultValue="default.mmel"
        />{' '}
      </p>
      <button onClick={() => newModel()}>New Model</button>
      <button onClick={() => exportJSON(modelfilename.current?.value)}>
        {' '}
        Export to JSON{' '}
      </button>
      <button onClick={() => exportXML(modelfilename.current?.value)}>
        {' '}
        Export to XML{' '}
      </button>
    </ControlBar>
  );
};

const ControlBar = styled.aside`
  position: absolute;
  width: 25%;
  height: 30%;
  bottom: 0;
  right: 0%;
  background-color: white;
  border-style: solid;
  font-size: 12px;
  overflow-y: auto;
  z-index: 100;
`;

export default ControlPane;

function MMELToJSON(m: MMELModel): string {
  return JSON.stringify(m);
}

function MMELToXML(m: MMELModel): string {
  let out = '<mmel>';
  const visited = new Set<Object>();
  out += `<meta>${ObjectToXML(m.meta, visited)}</meta>`;
  out += getXMLElementFromArray('role', m.roles, visited);
  out += getXMLElementFromArray('reference', m.refs, visited);
  out += getXMLElementFromArray('event', m.events, visited);
  out += getXMLElementFromArray('gateway', m.gateways, visited);
  out += getXMLElementFromArray('enum', m.enums, visited);
  out += getXMLElementFromArray('dataclass', m.dataclasses, visited);
  out += getXMLElementFromArray('registry', m.regs, visited);
  out += getXMLElementFromArray('measurement', m.vars, visited);
  out += getXMLElementFromArray('approval', m.approvals, visited);
  out += getXMLElementFromArray('provision', m.provisions, visited);
  out += getXMLElementFromArray('process', m.processes, visited);
  out += getXMLElementFromArray('subprocess', m.pages, visited);
  if (m.root !== null) {
    out += `<root>${ObjectToXML(m.root, visited)}</root>`;
  }
  out += '</mmel>';
  return out;
}

function ObjectToXML(x: Object, visited: Set<Object>): string {
  if (visited.has(x)) {
    const entries = Object.entries(x);
    for (const [k, o] of entries) {
      if (k === 'id') {
        return o;
      }
    }
    return 'null';
  }
  visited.add(x);
  const entries = Object.entries(x);
  let out = '';
  for (const [k, o] of entries) {
    if (Array.isArray(o)) {
      getXMLElementFromArray(k, o, visited);
    } else {
      let content: string;
      if (o === null) {
        content = 'null';
      } else if (typeof o === 'object') {
        content = ObjectToXML(o, visited);
      } else {
        content = o;
      }
      out += `<${k}>\n${content}\n</${k}>\n`;
    }
  }
  return out;
}

function getXMLElementFromArray(
  tag: string,
  array: Array<Object>,
  visited: Set<Object>
) {
  let out = '';
  for (const y of array) {
    let content: string;
    if (y === null) {
      content = 'null';
    } else if (typeof y === 'object') {
      content = ObjectToXML(y, visited);
    } else {
      content = y;
    }
    out += `<${tag}>\n${content}\n</${tag}>\n`;
  }
  return out;
}
