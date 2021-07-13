import { StartEvent } from '../model/model/event/startevent';
import { Edge } from '../model/model/flow/edge';
import {
  Subprocess,
  SubprocessComponent,
} from '../model/model/flow/subprocess';
import { Model } from '../model/model/model';
import { Process } from '../model/model/process/process';
import { Provision } from '../model/model/support/provision';
import { Reference } from '../model/model/support/reference';
import { Role } from '../model/model/support/role';
import { IDRegistry } from '../model/util/IDRegistry';
import { XMLParser } from './parser';
import { XMLElement } from './xmlelement';

export class AIAgent {
  static xmlToModel(data: string): Model {
    const xml = XMLParser.parse(data);
    const front = xml.getChildByTagName('front');
    const body = xml.getChildByTagName('body');
    const m = new Model();
    initModel(m);

    if (front.length > 0) {
      setMeta(m, front[0]);
    }
    if (body.length > 0 && m.root != null) {
      const secs = body[0].getChildByTagName('sec');
      secs.forEach(s => {
        if (parseInt(s.getElementValue('label')) >= 4 && m.root != null) {
          readDetails(s, m, m.root);
        }
      });
      postCalChildPos(m.root);
    }
    return m;
  }
}

function postCalChildPos(page: Subprocess) {
  let sx = 50 - 200 * (page.childs.length - 1);
  sx /= 2;
  for (let i = 1; i < page.childs.length; i++) {
    const nc = page.childs[i];
    nc.x = sx;
    nc.y = 100;
    sx += 200;
  }
}

function setMeta(m: Model, xml: XMLElement) {
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

function initModel(m: Model) {
  m.root = initPage(m, 'root');
}

function initPage(m: Model, id: string) {
  const page = new Subprocess(id, '');
  m.pages.push(page);
  const start = new StartEvent(m.idreg.findUniqueID('Start'), '');
  m.evs.push(start);
  m.idreg.addID(start.id, start);
  page.start = new SubprocessComponent(start.id, '');
  page.start.element = start;
  page.childs.push(page.start);
  page.map.set(start.id, page.start);
  m.idreg.addPage(page.id, page);
  return page;
}

function readDetails(sec: XMLElement, m: Model, page: Subprocess) {
  const secno = sec.getElementValue('label');
  const sectitle = sec.getElementValue('title');
  const idreg = m.idreg;

  const p = new Process(findUniqueID('Clause' + secno, idreg), '');
  p.name = sectitle;
  idreg.addID(p.id, p);
  m.hps.push(p);
  const nc = new SubprocessComponent(p.id, '');
  nc.element = p;
  page.map.set(p.id, nc);
  page.childs.push(nc);
  const nedge = new Edge(idreg.findUniqueEdgeID('Edge'), '');
  idreg.addEdge(nedge.id, nedge);
  nedge.from = page.start;
  nedge.to = nc;
  page.start?.child.push(nedge);
  page.edges.push(nedge);

  let refadded = false;
  const ref = new Reference(idreg.findUniqueRefID('Ref'), '');
  ref.document = m.meta.title;
  ref.clause = secno;

  const roles = new Map<string, number>();

  sec.getChilds().forEach(c => {
    if (c instanceof XMLElement) {
      if (c.tag == 'label' || c.tag == 'title') {
        // already obtained their values. Ignore these parts
      } else if (c.tag == 'sec') {
        if (p.page == null) {
          p.page = initPage(m, idreg.findUniquePageID('Page'));
        }
        readDetails(c, m, p.page);
      } else if (c.tag == 'p') {
        refadded = addProvisions(c.toString(), m, p, ref, refadded, roles);
      } else if (c.tag == 'list') {
        refadded = processList(c, m, p, ref, refadded, roles);
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
  if (role != '') {
    let choice: Role | null = null;
    for (const r of m.roles) {
      if (similarMatch(r.name.toLowerCase(), role.toLowerCase())) {
        choice = r;
        break;
      }
    }
    if (choice == null) {
      const idreg = m.idreg;
      choice = new Role(idreg.findUniqueID('Role'), '');
      choice.name = role.toLowerCase();
      m.roles.push(choice);
      idreg.addID(choice.id, choice);
    }
    p.actor = choice;
  }
  if (p.page != null) {
    postCalChildPos(p.page);
  }
}

function processList(
  c: XMLElement,
  m: Model,
  p: Process,
  ref: Reference,
  refadded: boolean,
  roles: Map<string, number>
): boolean {
  c.getChilds().forEach(gc => {
    if (gc instanceof XMLElement) {
      if (gc.tag == 'list-item') {
        gc.getChilds().forEach(ggc => {
          if (ggc instanceof XMLElement) {
            if (ggc.tag == 'label') {
              // no problem
            } else if (ggc.tag == 'p') {
              refadded = addProvisions(
                ggc.toString(),
                m,
                p,
                ref,
                refadded,
                roles
              );
            } else if (ggc.tag == 'list') {
              refadded = processList(ggc, m, p, ref, refadded, roles);
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
  m: Model,
  process: Process,
  ref: Reference,
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
  m: Model,
  process: Process,
  ref: Reference,
  refAdded: boolean,
  roles: Map<string, number>
): boolean {
  const idreg = m.idreg;
  const s = statement.trim();
  if (s != '') {
    const pro = new Provision(idreg.findUniqueProvisionID('Provision'), '');
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
    idreg.addProvision(pro.id, pro);
    process.provision.push(pro);
    pro.ref.push(ref);
    if (!refAdded) {
      m.refs.push(ref);
      idreg.addReference(ref.id, ref);
      refAdded = true;
    }
  }
  return refAdded;
}

function findUniqueID(x: string, idreg: IDRegistry) {
  if (idreg.ids.has(x)) {
    return idreg.findUniqueID(x);
  } else {
    return x;
  }
}

//function identifyActor(name:string, m:Model):string {
//  name = name.replaceAll(/.*[\.:,]/g, "").trim()
//  name = name.replaceAll(/^THEN\s+/g, "")
//  name = name.replaceAll(/^BUT\s+/g, "")
//  name = name.replaceAll(/^BECAUSE\s+/g, "")
//  name = name.replaceAll(/^THE\s+/g, "")
//  name = name.replaceAll(/^SO\s+/g, "")
//  name = name.replaceAll(/^A\s+/g, "")
//  name = name.replaceAll(/^AN\s+/g, "")
//  name = name.replaceAll(/\s+/g, " ").trim()
//  if (name.split(/\s+/).length > 3) {
//    return ""
//  }
//  let badlist = ["IT", "THEY", "THIS", "WHICH", "THESE"]
//  for (let x of badlist) {
//    if (name == x) {
//      return ""
//    }
//  }
//  return name
//}

function similarMatch(x: string, y: string): boolean {
  x = x.toUpperCase();
  y = y.toUpperCase();
  if (x + 'S' == y || y + 'S' == x || x + 'ES' == y || y + 'ES' == x) {
    return true;
  }
  return x == y;
}
