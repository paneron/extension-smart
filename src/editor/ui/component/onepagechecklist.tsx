/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { useContext } from 'react';
import { MODAILITYOPTIONS } from '../../runtime/idManager';
import { ISearch, StateMan } from '../interface/state';
import { MyTopRightButtons } from './unit/closebutton';

const OnePageChecklist: React.FC<{ sm: StateMan; cond: ISearch }> = ({
  sm,
  cond,
}) => {
  const { getBlob, writeFileToFilesystem } = useContext(DatasetContext);

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

  mw.model.processes.forEach(p => {
    if (
      cond.actor === '' ||
      (p.actor !== null && p.actor.name === cond.actor)
    ) {
      p.provision.forEach(s => {
        const index = MODAILITYOPTIONS.indexOf(s.modality);
        if (index >= 0 && cond.modality[index]) {
          s.ref.forEach(r => {
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
        }
      });
    }
  });

  if (cond.actor === '') {
    mw.model.regs.forEach(reg => {
      if (reg.data !== null) {
        reg.data.attributes.forEach(a => {
          const index = MODAILITYOPTIONS.indexOf(a.modality);
          if (index >= 0 && cond.modality[index]) {
            a.ref.forEach(ref => {
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
          }
        });
      }
    });

    mw.model.dataclasses.forEach(dc => {
      if (mw.dlman.get(dc).mother === null) {
        dc.attributes.forEach(a => {
          const index = MODAILITYOPTIONS.indexOf(a.modality);
          if (index >= 0 && cond.modality[index]) {
            a.ref.forEach(ref => {
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
          }
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
          for (const g of ng.children) {
            if (g.id === currentid) {
              found = g;
              break;
            }
          }
          if (found === null) {
            found = new CLGroup(currentid);
            ng.children.push(found);
          }
          ng = found;
        }
        ng.provisions = c;
      }
    });
  });

  docs.forEach((d, index) => {
    elms.push(<h1 key={'ui#checklist#doc' + index}>{d.id}</h1>);
    recursiveAdd(d, 0, index, elms);
  });

  const exportJSON = async (docs: CLGroup[]) => {
    const container = { documents: docs };
    const json = JSON.stringify(container);
    await exportFile(json);
  };

  const exportXML = async (docs: CLGroup[]) => {
    const xml: string =
      '<documents>' + getXMLElementFromArray('document', docs) + '</documents>';
    await exportFile(xml);
  };

  async function exportFile(fileData: string) {
    if (!getBlob || !writeFileToFilesystem) {
      throw new Error('File export function(s) are not provided');
    }
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
    <DisplayPane>
      <MyTopRightButtons onClick={() => close()}>X</MyTopRightButtons>
      <button onClick={() => exportJSON(docs)}>Export JSON</button>
      <button onClick={() => exportXML(docs)}>Export XML</button>
      {elms}
    </DisplayPane>
  );
};

function ObjectToXML(x: Object): string {
  const entries = Object.entries(x);
  let out = '';
  for (const [k, o] of entries) {
    if (Array.isArray(o)) {
      out += getXMLElementFromArray(k, o);
    } else {
      let content: string;
      if (o === null) {
        content = 'null';
      } else if (typeof o === 'object') {
        content = ObjectToXML(o);
      } else {
        content = o;
      }
      out += `<${k}>${content}</${k}>`;
    }
  }
  return out;
}

function getXMLElementFromArray(tag: string, array: Array<Object>): string {
  let out = '';
  for (const y of array) {
    let content: string;
    if (y === null) {
      content = 'null';
    } else if (typeof y === 'object') {
      content = ObjectToXML(y);
    } else {
      content = y;
    }
    out += `<${tag}>${content}</${tag}>`;
  }
  return out;
}

function recursiveAdd(
  g: CLGroup,
  level: number,
  docindex: number,
  elms: Array<JSX.Element>
) {
  const opt: Array<JSX.Element> = [];
  g.provisions.forEach((s, index) => {
    opt.push(
      <li key={'ui#checklist#doc' + docindex + 'provision' + index}> {s} </li>
    );
  });
  elms.push(
    <ul key={'ui#checklist#doc' + docindex + 'provisionlist' + g.id}>{opt}</ul>
  );
  if (g.children.length > 0) {
    g.children.forEach(c => {
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
  children: Array<CLGroup>;
  provisions: Array<string>;

  constructor(x: string) {
    this.id = x;
    this.children = [];
    this.provisions = [];
  }
}

export default OnePageChecklist;
