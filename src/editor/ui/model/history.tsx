/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import {
  MMELSubprocess,
  //MMELSubprocessComponent,
} from '../../serialize/interface/flowcontrolinterface';
import { StateMan } from '../interface/state';
import { ModelType, ModelViewStateMan } from '../mapper/model/mapperstate';
import { MapperFunctions } from '../mapper/util/helperfunctions';
import { functionCollection } from '../util/function';

export class PageHistory {
  private history: MMELSubprocess[];
  private pathtext: string[];
  modelType: ModelType | null;

  constructor(mt: ModelType | null) {
    this.history = [];
    this.pathtext = [];
    this.modelType = mt;
  }

  clear() {
    this.history = [];
    this.pathtext = [];
  }

  copyContent(p: PageHistory) {
    for (const h of p.history) {
      this.history.push(h);
    }
    for (const t of p.pathtext) {
      this.pathtext.push(t);
    }
  }

  add(x: MMELSubprocess, y: string) {
    this.history.push(x);
    this.pathtext.push(y);
  }

  getPath(sm: StateMan): JSX.Element {
    const goToPage = (i: number) => {
      functionCollection.saveLayout();
      const page = sm.state.history.popUntil(i);
      sm.state.modelWrapper.page = page;
      sm.setState(sm.state);
    };

    const name =
      sm.state.modelWrapper.model.meta.namespace === ''
        ? 'root'
        : sm.state.modelWrapper.model.meta.namespace;
    const elms: JSX.Element[] = [
      <button key={'ui#rootpathbutton'} onClick={() => goToPage(-1)}>
        {name}
      </button>,
    ];
    for (let i = 0; i < this.history.length; i++) {
      elms.push(<span key={'ui#pathseparator' + i}> / </span>);
      elms.push(
        <button key={'ui#pathbutton' + i} onClick={() => goToPage(i)}>
          {this.pathtext[i]}
        </button>
      );
    }
    return <>{elms}</>;
  }

  getMapperPath(sm: ModelViewStateMan): JSX.Element {
    const mw = sm.state.modelWrapper;
    const his = sm.state.history;

    const goToPage = (i: number) => {
      MapperFunctions.saveLayout(sm);
      const page = his.popUntil(i);
      mw.page = page;
      MapperFunctions.updateMapRef(sm);
      sm.setState(sm.state);
    };

    const name =
      mw.model.meta.namespace === '' ? 'root' : mw.model.meta.namespace;
    const elms: JSX.Element[] = [
      <button key={'ui#rootpathbutton'} onClick={() => goToPage(-1)}>
        {name}
      </button>,
    ];
    for (let i = 0; i < this.history.length; i++) {
      elms.push(<span key={'ui#pathseparator' + i}> / </span>);
      elms.push(
        <button key={'ui#pathbutton' + i} onClick={() => goToPage(i)}>
          {this.pathtext[i]}
        </button>
      );
    }
    return <>{elms}</>;
  }

  pop(): MMELSubprocess {
    this.pathtext.pop();
    this.history.pop();
    if (this.history.length > 0) {
      return this.history[this.history.length - 1];
    } else {
      return this.getRootPage();
    }
  }

  top(): MMELSubprocess {
    if (this.history.length > 0) {
      return this.history[this.history.length - 1];
    } else {
      return this.getRootPage();
    }
  }

  getRootPage(): MMELSubprocess {
    let page;
    if (this.modelType === null) {
      page = functionCollection.getStateMan().state.modelWrapper.model.root;
    } else {
      const sm = MapperFunctions.getStateMan(this.modelType);
      page = sm.state.modelWrapper.model.root;
    }
    if (page === null) {
      throw new Error('Root page not found');
    }
    return page;
  }

  popUntil(i: number): MMELSubprocess {
    if (i < 0) {
      this.clear();
      return this.getRootPage();
    }
    while (i + 1 < this.history.length) {
      this.pathtext.pop();
      this.history.pop();
    }
    return this.history[this.history.length - 1];
  }
}
