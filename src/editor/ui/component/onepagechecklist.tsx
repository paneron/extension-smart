/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import { ISearch, StateMan } from '../interface/state';
import { MyTopRightButtons } from './unit/closebutton';

const OnePageChecklist: React.FC<{ sm: StateMan; cond: ISearch }> = ({
  sm,
  cond,
}) => {
  const close = () => {
    sm.state.onepage = false;
    sm.setState(sm.state);
  };

  const data = new Map<string, Map<string, Array<string>>>();
  const mw = sm.state.modelWrapper;
  mw.filterman.documents.forEach((d, x) => {
    if (cond.document === '' || cond.document === x) {
      const m = new Map<string, Array<string>>();
      data.set(x, m);
      mw.filterman.clauses[d].forEach(c => {
        if (cond.clause === '' || cond.clause === c) {
          m.set(c, []);
        }
      });
    }
  });
  const elms: Array<JSX.Element> = [];

  mw.model.processes.map(p => {
    if (
      cond.actor === '' ||
      (p.actor !== null && p.actor.name === cond.actor)
    ) {
      p.provision.map(s => {
        s.ref.map(r => {
          if (
            cond.document === '' ||
            (cond.document === r.document &&
              (cond.clause === '' || cond.clause === r.clause))
          ) {
            const doc = data.get(r.document);
            if (doc === undefined) {
              console.error('Reference document not found');
            } else {
              const clause = doc.get(r.clause);
              if (clause === undefined) {
                console.error('Reference clause not found');
              } else {
                let out = '';
                if (p.actor !== null && s.modality !== '') {
                  out += p.actor.name + ' ' + s.modality + ' ';
                }
                out += s.condition;
                clause.push(out);
              }
            }
          }
        });
      });
    }
  });

  if (cond.actor === '') {
    mw.model.regs.map(reg => {
      if (reg.data !== null) {
        reg.data.attributes.map(a => {
          a.ref.map(ref => {
            if (
              cond.document === '' ||
              (cond.document === ref.document &&
                (cond.clause === '' || cond.clause === ref.clause))
            ) {
              const doc = data.get(ref.document);
              if (doc === undefined) {
                console.error('Reference document not found');
              } else {
                const clause = doc.get(ref.clause);
                if (clause === undefined) {
                  console.error('Reference clause not found');
                } else {
                  let out = 'Documented information (' + reg.title + ') ';
                  if (a.modality !== '') {
                    out += a.modality + ' ';
                  }
                  out += 'include ' + a.definition;
                  clause.push(out);
                }
              }
            }
          });
        });
      }
    });

    mw.model.dataclasses.map(dc => {
      if (mw.dlman.get(dc).mother === null) {
        dc.attributes.map(a => {
          a.ref.map(ref => {
            if (
              cond.document === '' ||
              (cond.document === ref.document &&
                (cond.clause === '' || cond.clause === ref.clause))
            ) {
              const doc = data.get(ref.document);
              if (doc === undefined) {
                console.error('Reference document not found');
              } else {
                const clause = doc.get(ref.clause);
                if (clause === undefined) {
                  console.error('Reference clause not found');
                } else {
                  let out = 'Data structure (' + dc.id + ') ';
                  if (a.modality !== '') {
                    out += a.modality + ' ';
                  }
                  out += 'include ' + a.definition;
                  clause.push(out);
                }
              }
            }
          });
        });
      }
    });
  }

  const docs: Array<CLGroup> = [];
  data.forEach((d, did) => {
    const newgroup = new CLGroup(did);
    docs.push(newgroup);
    d.forEach((c, cid) => {
      if (c.length > 0) {
        const parts = cid.split('.');
        let currentid = '';
        let ng = newgroup;
        for (let i = 0; i < parts.length; i++) {
          if (i > 0) {
            currentid += '.';
          }
          currentid += parts[i];
          let found: CLGroup | null = null;
          for (const g of ng.gmember) {
            if (g.id === currentid) {
              found = g;
              break;
            }
          }
          if (found === null) {
            found = new CLGroup(currentid);
            ng.gmember.push(found);
          }
          ng = found;
        }
        ng.items = c;
      }
    });
  });

  docs.forEach((d, index) => {
    elms.push(<h1 key={'ui#checklist#doc' + index}>{d.id}</h1>);
    recursiveAdd(d, 0, index, elms);
  });

  return (
    <DisplayPane>
      <MyTopRightButtons onClick={() => close()}>X</MyTopRightButtons>
      {elms}
    </DisplayPane>
  );
};

function recursiveAdd(
  g: CLGroup,
  level: number,
  docindex: number,
  elms: Array<JSX.Element>
) {
  if (g.gmember.length > 0) {
    g.gmember.forEach(c => {
      if (level === 0) {
        elms.push(
          <h2 key={'ui#checklist#doc' + docindex + 'clause' + c.id}>{c.id} </h2>
        );
      } else if (level === 1) {
        elms.push(
          <h3 key={'ui#checklist#doc' + docindex + 'clause' + c.id}>{c.id} </h3>
        );
      } else {
        elms.push(
          <p key={'ui#checklist#doc' + docindex + 'clause' + c.id}>{c.id} </p>
        );
      }
      recursiveAdd(c, level + 1, docindex, elms);
    });
  }
  const opt: Array<JSX.Element> = [];
  g.items.map((s, index) => {
    opt.push(
      <li key={'ui#checklist#doc' + docindex + 'provision' + index}> {s} </li>
    );
  });
  elms.push(
    <ul key={'ui#checklist#doc' + docindex + 'provisionlist' + g.id}>{opt}</ul>
  );
}

const DisplayPane = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  bottom: 0;
  left: 0;
  background: white;
  font-size: 12px;
  overflow-y: auto;
  border-style: solid;
  z-index: 110;
`;

class CLGroup {
  id: string;
  gmember: Array<CLGroup>;
  items: Array<string>;

  constructor(x: string) {
    this.id = x;
    this.gmember = [];
    this.items = [];
  }
}

export default OnePageChecklist;
