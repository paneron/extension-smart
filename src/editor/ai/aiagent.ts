import { MMELFactory } from '../runtime/modelComponentCreator';
import { MMELSubprocess } from '../serialize/interface/flowcontrolinterface';
import { MMELModel } from '../serialize/interface/model';
import { MMELProcess } from '../serialize/interface/processinterface';
import {
  MMELReference,
  MMELRole,
} from '../serialize/interface/supportinterface';
import { ModelWrapper } from '../ui/model/modelwrapper';
import { XMLParser } from './parser';
import { XMLElement } from './xmlelement';

export class AIAgent {
  static xmlToModel(data: string): ModelWrapper {
    const xml = XMLParser.parse(data);
    const front = xml.getChildByTagName('front');
    const body = xml.getChildByTagName('body');
    const m = MMELFactory.createNewModel();
    const mw = new ModelWrapper(m);

    if (front.length > 0) {
      setMeta(m, front[0]);
    }
    if (body.length > 0 && m.root !== null) {
      const secs = body[0].getChildByTagName('sec');
      secs.forEach(s => {
        if (parseInt(s.getElementValue('label')) >= 4 && m.root !== null) {
          readDetails(s, mw, m.root);
        }
      });
      postCalChildPos(m.root);
    }
    return mw;
  }
}

function postCalChildPos(page: MMELSubprocess) {
  let sx = 50 - 200 * (page.childs.length - 1);
  sx /= 2;
  for (let i = 1; i < page.childs.length; i++) {
    const nc = page.childs[i];
    nc.x = sx;
    nc.y = 100;
    sx += 200;
  }
}

function setMeta(m: MMELModel, xml: XMLElement) {
  m.meta.author = xml.getElementValueByPath(['iso-meta', 'doc-ident', 'sdo']);
  m.meta.edition = xml.getElementValueByPath([
    'iso-meta',
    'std-ident',
    'edition',
  ]);
  m.meta.namespace =
    xml.getElementValueByPath(['iso-meta', 'std-ident', 'originator']) +
    xml.getElementValueByPath(['iso-meta', 'std-ident', 'doc-number']);
  m.meta.schema = 'MMEL 0.1';
  m.meta.title = xml.getElementValueByPath(['iso-meta', 'title-wrap', 'full']);
}

function initPage(mw: ModelWrapper, id: string) {
  const m = mw.model;
  const idreg = mw.idman;
  const page = MMELFactory.createSubprocess(id);
  m.pages.push(page);
  const start = MMELFactory.createStartEvent(idreg.findUniqueID('Start'));
  m.events.push(start);
  idreg.nodes.set(start.id, start);
  const addon = mw.subman.get(page);
  addon.start = MMELFactory.createSubprocessComponent(start);
  addon.start.element = start;
  page.childs.push(addon.start);
  addon.map.set(start.id, addon.start);
  idreg.pages.set(page.id, page);
  return page;
}

function readDetails(sec: XMLElement, mw: ModelWrapper, page: MMELSubprocess) {
  const m = mw.model;
  const secno = sec.getElementValue('label');
  const sectitle = sec.getElementValue('title');
  const idreg = mw.idman;

  const p = MMELFactory.createProcess(idreg.findUniqueID('Clause' + secno));
  p.name = sectitle;
  idreg.nodes.set(p.id, p);
  m.processes.push(p);
  const nc = MMELFactory.createSubprocessComponent(p);
  nc.element = p;
  const paddon = mw.subman.get(page);
  paddon.map.set(p.id, nc);
  page.childs.push(nc);
  const nedge = MMELFactory.createEdge(idreg.findUniqueEdgeID('Edge'));
  idreg.edges.set(nedge.id, nedge);
  nedge.from = paddon.start;
  nedge.to = nc;
  if (paddon.start !== null) {
    mw.comman.get(paddon.start).child.push(nedge);
  }
  page.edges.push(nedge);

  let refadded = false;
  const ref = MMELFactory.createReference(
    'Ref' + secno.replaceAll('.', '-').trim()
  );
  ref.document = m.meta.title;
  ref.clause = secno;

  const roles = new Map<string, number>();

  sec.getChilds().forEach(c => {
    if (c instanceof XMLElement) {
      if (c.tag === 'label' || c.tag === 'title') {
        // already obtained their values. Ignore these parts
      } else if (c.tag === 'sec') {
        if (p.page === null) {
          p.page = initPage(mw, idreg.findUniquePageID('Page'));
        }
        readDetails(c, mw, p.page);
      } else if (c.tag === 'p') {
        refadded = addProvisions(c.toString(), mw, p, ref, refadded, roles);
      } else if (c.tag === 'list') {
        refadded = processList(c, mw, p, ref, refadded, roles);
      } else {
        // Other elements are ignored at the moment
        // like tables, figures, note, etc
      }
    } else {
      console.error('A section shall not have direct text?');
    }
  });
  let max = 0;
  let role = '';
  roles.forEach((c, r) => {
    if (c > max) {
      max = c;
      role = r;
    }
  });
  if (role !== '') {
    let choice: MMELRole | null = null;
    for (const r of m.roles) {
      if (similarMatch(r.name.toLowerCase(), role.toLowerCase())) {
        choice = r;
        break;
      }
    }
    if (choice === null) {
      const idreg = mw.idman;
      choice = MMELFactory.createRole(idreg.findUniqueID('Role'));
      choice.name = role.toLowerCase();
      m.roles.push(choice);
      idreg.roles.set(choice.id, choice);
    }
    p.actor = choice;
  }
  if (p.page !== null) {
    postCalChildPos(p.page);
  }
}

function processList(
  c: XMLElement,
  mw: ModelWrapper,
  p: MMELProcess,
  ref: MMELReference,
  refadded: boolean,
  roles: Map<string, number>
): boolean {
  //const m = mw.model;
  c.getChilds().forEach(gc => {
    if (gc instanceof XMLElement) {
      if (gc.tag === 'list-item') {
        gc.getChilds().forEach(ggc => {
          if (ggc instanceof XMLElement) {
            if (ggc.tag === 'label') {
              // no problem
            } else if (ggc.tag === 'p') {
              refadded = addProvisions(
                ggc.toString(),
                mw,
                p,
                ref,
                refadded,
                roles
              );
            } else if (ggc.tag === 'list') {
              refadded = processList(ggc, mw, p, ref, refadded, roles);
            } else {
              // Other elements are ignored at the moment
              // like tables, figures, note, etc
            }
          } else {
            console.error('List item contains direct string?', ggc);
          }
        });
      } else {
        console.error('List item contains other elements?', gc);
      }
    } else {
      console.error('List contains direct string?', gc);
    }
  });
  return refadded;
}

function addProvisions(
  statement: string,
  m: ModelWrapper,
  process: MMELProcess,
  ref: MMELReference,
  refAdded: boolean,
  roles: Map<string, number>
): boolean {
  refAdded = addProvision(statement, m, process, ref, refAdded, roles);
  return refAdded;
  // let match = statement.match(/\.\s+[A-Z]/)
  // while (match != null && match.length > 0) {
  //   let index = statement.indexOf(match[0])
  //   let s = statement.substr(0, index).trim()
  //   statement = statement.substr(index+1).trim()
  //   refAdded = addProvision(s, m, process, ref, refAdded, roles)
  //   match = statement.match(/\.\s+[A-Z]/)
  // }
  // if (statement != "") {
  //   refAdded = addProvision(statement, m, process, ref, refAdded, roles)
  // }
  // return refAdded
}

function addProvision(
  statement: string,
  mw: ModelWrapper,
  process: MMELProcess,
  ref: MMELReference,
  refAdded: boolean,
  roles: Map<string, number>
): boolean {
  const m = mw.model;
  const idreg = mw.idman;
  const s = statement.trim();
  if (s !== '') {
    const pro = MMELFactory.createProvision(idreg.findProvisionID('Provision'));
    pro.condition = s;
    // let text = pro.condition.toUpperCase()
    // MODAILITYOPTIONS.forEach((x) => {
    //   let index = text.indexOf(" "+x+" ")
    //   if (x != "" && index != -1) {
    //     pro.modality = x
    //     let r = identifyActor(text.substr(0, index), m)
    //     if (r != "") {
    //       let c = roles.get(r)
    //       if (c == undefined) {
    //         roles.set(r, 1)
    //       } else {
    //         roles.set(r, c+1)
    //       }
    //     }
    //   }
    // })
    m.provisions.push(pro);
    idreg.provisions.set(pro.id, pro);
    process.provision.push(pro);
    pro.ref.push(ref);
    if (!refAdded) {
      m.refs.push(ref);
      idreg.refs.set(ref.id, ref);
      refAdded = true;
    }
  }
  return refAdded;
}

// function identifyActor(name:string, m:Model):string {
//   name = name.replaceAll(/.*[\.:,]/g, "").trim()
//   name = name.replaceAll(/^THEN\s+/g, "")
//   name = name.replaceAll(/^BUT\s+/g, "")
//   name = name.replaceAll(/^BECAUSE\s+/g, "")
//   name = name.replaceAll(/^THE\s+/g, "")
//   name = name.replaceAll(/^SO\s+/g, "")
//   name = name.replaceAll(/^A\s+/g, "")
//   name = name.replaceAll(/^AN\s+/g, "")
//   name = name.replaceAll(/\s+/g, " ").trim()
//   if (name.split(/\s+/).length > 3) {
//     return ""
//   }
//   let badlist = ["IT", "THEY", "THIS", "WHICH", "THESE"]
//   for (let x of badlist) {
//     if (name == x) {
//       return ""
//     }
//   }
//   return name
// }

function similarMatch(x: string, y: string): boolean {
  x = x.toUpperCase();
  y = y.toUpperCase();
  if (x + 'S' === y || y + 'S' === x || x + 'ES' === y || y + 'ES' === x) {
    return true;
  }
  return x === y;
}
