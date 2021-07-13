import { Elements } from "react-flow-renderer";
import { NodeContainer } from "../nodecontainer";
import { Model } from "../../model/model/model";
import { Subprocess, SubprocessComponent } from "../../model/model/flow/subprocess";
import { EdgeContainer } from "../edgecontainer";
import { Registry } from "../../model/model/data/registry";
import { Dataclass } from "../../model/model/data/dataclass";
import { DataLinkContainer } from "../datalinkcontainer";
import { Process } from "../../model/model/process/process";
import { Approval } from "../../model/model/process/approval";
import { StartEvent } from "../../model/model/event/startevent";
import { ModelType } from "../mapper/model/mapperstate";
import { MappedType } from "../mapper/component/mappinglegend";

export class ModelWrapper {
  model:Model  
  page:Subprocess
    
  documents:Map<string, number> = new Map<string, number>()
  clauses:Array<Set<string>> = []  

  mapped:Map<string, MappedType> = new Map<string, MappedType>()

  lastvisible = true

  constructor(m:Model) {
    this.model = m
    let idreg = m.idreg
    if (m.root == null) {
      let newpage = new Subprocess("root", "")
      m.pages.push(newpage)
      let start = new StartEvent(m.idreg.findUniqueID("Start"), "")
      m.evs.push(start)
      m.idreg.addID(start.id, start)
      newpage.start = new SubprocessComponent(start.id, "")
      newpage.start.element = start
      newpage.childs.push(newpage.start)
      newpage.map.set(start.id, newpage.start)
      idreg.addPage(newpage.id, newpage)
      this.page = newpage
      m.root = newpage
    } else {
      this.page = m.root
    }    
    this.model.reset()
    this.readDocu()
  }

  readDocu() {    
    this.documents.clear()
    this.clauses = []
    for (let r of this.model.refs) {      
      if (!this.documents.has(r.document)) {
        this.documents.set(r.document, this.documents.size)
        this.clauses.push(new Set<string>())
      }
      let x = this.documents.get(r.document)
      if (x != undefined) {
        if (!this.clauses[x].has(r.clause)) {
          this.clauses[x].add(r.clause)
        }
      }
    }    
  }

  getReactFlowElementsFrom(page: Subprocess, dvisible: boolean, clvisible: boolean, type?:ModelType): Elements {
    this.model.reset()    

    const elms: Elements = []
    const datas = new Map<string, Registry|Dataclass>()

    page.childs.forEach((x) => {
      let y = x.element

      if (y != null) {
        const exploreDataNode = (r: Registry, incoming: boolean) => {          
          if (!r.isAdded) {            
            datas.set(r.id, r)
            r.isAdded = true
            this.exploreData(r, datas, elms, dvisible)
          }
          if (y != null) {
            let ne = incoming ? new DataLinkContainer(r, y) : new DataLinkContainer(y, r)
            ne.isHidden = !dvisible
            elms.push(ne)
          }          
        }

        let nn = new NodeContainer(y, { x: x.x, y: x.y })
        if (type != undefined) {
          nn.data.modelType = type
        }
        elms.push(nn)
        y.isAdded = true
        if (dvisible) {
          if (y instanceof Process) {
            y.input.map((r) => exploreDataNode(r, true))
            y.output.map((r) => exploreDataNode(r, false))
          }
          if (y instanceof Approval) {
            y.records.map((r) => exploreDataNode(r, false))
          }
        }
      }
      
    })
    if (dvisible) {
      page.data.forEach((e) => {
        if (e.element != null) {
          let x = datas.get(e.element.id)
          if (x != undefined) {
            let nn = new NodeContainer(x, { x: e.x, y: e.y })
            if (type != undefined) {
              nn.data.modelType = type
            }
            elms.push(nn)
            datas.delete(x.id)
          }
        }
      })
      datas.forEach((e) => {        
        let nn = new NodeContainer(e, { x: 0, y: 0 })
        if (type != undefined) {
          nn.data.modelType = type
        }
        elms.push(nn)        
      })
      datas.forEach((d)=> {
        let sc = page.map.get(d.id)
        if (sc != undefined) {
          let index = page.data.indexOf(sc)
          if (index != -1) {
            page.data.splice(index, 1)
          }
        }
      })
    }
    page.edges.forEach((e) => {
      let ec = new EdgeContainer(e)
      if (clvisible) {
        if (e.isDone) {
          ec.animated = true
          ec.style = {stroke: "green"}
        } else {
          ec.animated = false
          ec.style = {stroke: "black"}
        }
      }
      elms.push(ec)
    })
    return elms;
  }

  exploreData(x: Registry, es: Map<string, Registry|Dataclass>, elms: Elements, dvisible: boolean) {
    if (x.data != null) {
      x.data.rdcs.forEach((e) => {
        if (e.mother != null) {
          let m = e.mother
          if (!m.isAdded) {            
            es.set(m.id, m)
            m.isAdded = true
            this.exploreData(m, es, elms, dvisible)
          }
          let ne = new DataLinkContainer(x, m)          
          elms.push(ne)
        } else {
          if (!e.isAdded) {            
            es.set(e.id, e)
            e.isAdded = true            
          }
          let ne = new DataLinkContainer(x, e)          
          elms.push(ne)
        }
      })
    }
  }

}