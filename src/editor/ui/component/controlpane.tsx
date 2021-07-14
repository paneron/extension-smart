import styled from '@emotion/styled';
import React, { ChangeEvent, CSSProperties, RefObject } from 'react';
import { MMELFactory } from '../../runtime/modelComponentCreator';
import { MMELModel } from '../../serialize/interface/model';
import { MMELToText, textToMMEL } from '../../serialize/MMEL';
import { StateMan } from '../interface/state';
import { ModelWrapper } from '../model/modelwrapper';
import { functionCollection } from '../util/function';
import { MyTopRightButtons } from './unit/closebutton';

const modelfile: RefObject<HTMLInputElement> = React.createRef();
const modelfilename: RefObject<HTMLInputElement> = React.createRef();

const ControlPane: React.FC<StateMan> = (sm: StateMan) => {
  const state = sm.state;

  const css: CSSProperties = {
    display: state.cvisible ? 'inline' : 'none',
  };

  const readModelFromFile = (result: string) => {
    console.debug('Read model from file');
    state.history.clear();
    const model = textToMMEL(result);
    state.modelWrapper = new ModelWrapper(model);
    sm.setState(state);
  };

  const newModel = () => {
    state.history.clear();
    state.modelWrapper = new ModelWrapper(MMELFactory.createNewModel());
    sm.setState(state);
  };

  const exportModel = (fn: string | undefined): void => {
    functionCollection.saveLayout();
    const blob = new Blob([MMELToText(state.modelWrapper.model)], {
      type: 'text/plain',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fn == undefined ? 'default.mmel' : fn;
    a.click();
  };

  const close = () => {
    state.cvisible = false;
    sm.setState(state);
  };

  const exportJSON = (fn: string | undefined) => {
    functionCollection.saveLayout();
    const blob = new Blob([MMELToJSON(state.modelWrapper.model)], {
      type: 'text/plain',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    if (fn == null) {
      fn = 'default.json';
    } else {
      fn = fn.replaceAll('.mmel', '.json');
    }
    a.download = fn;
    a.click();
  };

  const exportXML = (fn: string | undefined) => {
    functionCollection.saveLayout();
    const blob = new Blob([MMELToXML(state.modelWrapper.model)], {
      type: 'text/plain',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    if (fn == null) {
      fn = 'default.xml';
    } else {
      fn = fn.replaceAll('.mmel', '.xml');
    }
    a.download = fn;
    a.click();
  };

  return (
    <ControlBar style={css}>
      <MyTopRightButtons onClick={() => close()}>X</MyTopRightButtons>

      <button onClick={() => modelfile.current?.click()}>Load Model</button>
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
      <input
        type="file"
        accept=".mmel"
        onChange={e => modelFileSelected(e, readModelFromFile)}
        ref={modelfile}
        style={{ display: 'none' }}
      />
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

function modelFileSelected(
  e: ChangeEvent<HTMLInputElement>,
  readModel: (x: string) => void
): void {
  const flist = e.target.files;
  if (flist != undefined && flist.length > 0) {
    flist[0].text().then(result => {
      readModel(result);
    });
  }
  const name = e.target.value.split('\\');
  if (modelfilename.current != undefined) {
    modelfilename.current.value = name[name.length - 1];
  }
  e.target.value = '';
}

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
  if (m.root != null) {
    out += `<root>${ObjectToXML(m.root, visited)}</root>`;
  }
  out += '</mmel>';
  return out;
}

function ObjectToXML(x: Object, visited: Set<Object>): string {
  if (visited.has(x)) {
    const entries = Object.entries(x);
    for (const [k, o] of entries) {
      if (k == 'id') {
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
      if (o == null) {
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
    if (y == null) {
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
