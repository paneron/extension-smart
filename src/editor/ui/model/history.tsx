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

interface Breadcrumb {
  label: JSX.Element;
  onNavigate: () => void;
}

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

  getBreadcrumbs(
    sm: StateMan | ModelViewStateMan,
    goUpToLevel: (i: number) => void
  ): Breadcrumb[] {
    const name =
      sm.state.modelWrapper.model.meta.namespace === ''
        ? 'root'
        : sm.state.modelWrapper.model.meta.namespace;
    const breadcrumbs: Breadcrumb[] = [
      { label: <>{name}</>, onNavigate: () => goUpToLevel(-1) },
    ];
    for (let i = 0; i < this.history.length; i++) {
      breadcrumbs.push({
        label: <>{this.pathtext[i]}</>,
        onNavigate: () => goUpToLevel(i),
      });
    }
    return breadcrumbs;
  }

  // TODO: Move path formatting into a React component.
  getPath(sm: StateMan): JSX.Element {
    const goToPage = (i: number) => {
      functionCollection.saveLayout();
      const page = sm.state.history.popUntil(i);
      sm.state.modelWrapper.page = page;
      sm.setState(sm.state);
    };
    return (
      <>
        {this.getBreadcrumbs(sm, goToPage).map((bc, idx) => (
          <React.Fragment key={idx}>
            <button onClick={bc.onNavigate}>{bc.label}</button>
            <span> / </span>
          </React.Fragment>
        ))}
      </>
    );
  }
  getMapperPath(sm: ModelViewStateMan): JSX.Element {
    const goToPage = (i: number) => {
      MapperFunctions.saveLayout(sm);
      const page = sm.state.history.popUntil(i);
      sm.state.modelWrapper.page = page;
      MapperFunctions.updateMapRef(sm);
      sm.setState(sm.state);
    };
    return (
      <>
        {this.getBreadcrumbs(sm, goToPage).map((bc, idx) => (
          <React.Fragment key={idx}>
            <button onClick={bc.onNavigate}>{bc.label}</button>
            <span> / </span>
          </React.Fragment>
        ))}
      </>
    );
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
