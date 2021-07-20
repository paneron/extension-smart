/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext } from 'react';
import { Menu, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { MMELFactory } from '../../../runtime/modelComponentCreator';
import { StateMan } from '../../interface/state';
import { ModelWrapper } from '../../model/modelwrapper';
import { MMELToText, textToMMEL } from '../../../serialize/MMEL';
import { MMELModel } from '../../../serialize/interface/model';

const FileMenu: React.FC<{ sm: StateMan }> = function ({ sm }) {
  const {
    logger,
    getBlob,
    useDecodedBlob,
    writeFileToFilesystem,
    requestFileFromFilesystem,
  } = useContext(DatasetContext);

  const canOpen = requestFileFromFilesystem && useDecodedBlob;
  const canSave = getBlob && writeFileToFilesystem;

  // New
  function handleNew() {
    sm.state.history.clear();
    sm.state.modelWrapper = new ModelWrapper(MMELFactory.createNewModel());
    sm.setState(sm.state);
  }

  // Open
  function parseModel(data: string) {
    logger?.log('Importing model');
    try {
      const model = textToMMEL(data);
      sm.state.history.clear();
      sm.state.modelWrapper = new ModelWrapper(model);
      logger?.log('Loaded model');
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

  // Export
  function getExportHandler(exportFunc: (m: MMELModel) => string) {
    return async () => {
      const fileData = exportFunc(sm.state.modelWrapper.model);

      if (getBlob && writeFileToFilesystem) {
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
      } else {
        throw new Error('File export function(s) are not provided');
      }
    };
  }

  return (
    <Menu>
      <MenuItem text="New" onClick={handleNew} icon="document" />
      <MenuItem
        text="Open…"
        disabled={!canOpen}
        onClick={handleOpen}
        icon="document-open"
      />
      <MenuItem
        text="Save…"
        onClick={getExportHandler(MMELToText)}
        disabled={!canSave}
        icon="floppy-disk"
      />
      <MenuItem
        text="Export"
        icon="export"
        disabled={!canSave}
        children={EXPORT_FORMATS.map(format => (
          <MenuItem
            text={`Export to ${format}`}
            disabled={!canSave}
            onClick={getExportHandler(EXPORT_HANDLERS[format])}
          />
        ))}
      />
    </Menu>
  );
};

export default FileMenu;

const EXPORT_FORMATS = ['XML', 'JSON'] as const;

type ExportFormat = typeof EXPORT_FORMATS[number];

const EXPORT_HANDLERS: Record<ExportFormat, (m: MMELModel) => string> = {
  XML: mmelToXML,
  JSON: mmelToJSON,
};

function mmelToJSON(m: MMELModel): string {
  return JSON.stringify(m);
}

function mmelToXML(m: MMELModel): string {
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
