import React from "react"
import { DataAttribute } from "../../../model/model/data/dataattribute"
import { Dataclass } from "../../../model/model/data/dataclass"
import { Registry } from "../../../model/model/data/registry"
import { IAttribute, IRegistry } from "../../interface/datainterface"
import { IAddItem, IList, IListItem, IUpdateItem } from "../../interface/fieldinterface"
import { ModelWrapper } from "../../model/modelwrapper"
import { functionCollection } from "../../util/function"
import AttributeEditPage from "../edit/attributeedit"
import NormalTextField from "../unit/textfield"

export class RegistryHandler implements IList, IAddItem, IUpdateItem {

  filterName="Registry filter"
  itemName="Registry"
  private mw: ModelWrapper
  private setAddMode: (b: boolean) => void
  private updating:Registry|null
  private data: IRegistry
  private setData: (x:IRegistry) => void
  private forceUpdate: () => void
  private setUpdateMode: (b: boolean) => void
  private setUpdateRegistry: (x: Registry) => void

  constructor(mw:ModelWrapper, updateObj:Registry|null, setAdd:(b:boolean)=>void, setUpdate:(b:boolean)=>void, setUpdateRegistry:(x:Registry)=>void, forceUpdate:()=>void, data:IRegistry, setRegistry:(x:IRegistry)=>void) {
    this.mw = mw
    this.updating = updateObj
    this.setAddMode = setAdd
    this.setUpdateMode = setUpdate
    this.forceUpdate = forceUpdate
    this.setUpdateRegistry = setUpdateRegistry
    this.data = data
    this.setData = setRegistry
  }   

  getItems = ():Array<RegistryListItem> =>  {
    let out:Array<RegistryListItem> = []
    this.mw.model.regs.forEach((r, index) => {      
      out.push(new RegistryListItem(r.id, r.title, ""+index))
    })    
    return out
  }

  addItemClicked = () => {
    this.data.regid = ""
    this.data.regtitle = ""
    this.data.attributes = []
    this.setData({ ...this.data})
    this.setAddMode(true)
  }
  
  removeItem = (refs:Array<string>) => {
    for (let i = refs.length-1;i>=0;i--) {
      let removed = this.mw.model.regs.splice(parseInt(refs[i]), 1)
      if (removed.length > 0) {
        let r = removed[0]     
        this.mw.model.idreg.ids.delete(r.id)
        // remove data from process input   
        for (let p of this.mw.model.hps) {
          let index = p.input.indexOf(r)
          if (index != -1) {
            p.input.splice(index, 1)
          }
          index = p.output.indexOf(r)
          if (index != -1) {
            p.output.splice(index, 1)
          }          
        }
        // remove data from process output
        for (let p of this.mw.model.aps) {
          let index = p.records.indexOf(r)
          if (index != -1) {
            p.records.splice(index, 1)
          }
        }
        let d = r.data
        if (d != null) {
          let index = this.mw.model.dcs.indexOf(d)
          this.mw.model.dcs.splice(index, 1)
          for (let dc of this.mw.model.dcs) {
            for (let a of dc.attributes) {                            
              index = a.type.indexOf(d.id)
              if (index != -1) {
                a.type = ""
              }
              dc.rdcs.delete(d)
            }
          }
          this.mw.model.idreg.ids.delete(d.id)
          functionCollection.removeLayoutItem(r.id)
        }        
      }
    }
    this.forceUpdate()
  }

  updateItem = (ref: string) => {
    let x = parseInt(ref)
    if (!isNaN(x)) {      
      let r = this.mw.model.regs[x]
      this.data.regid= r.id
      this.data.regtitle = r.title
      this.data.attributes = []
      if (r.data != null) {
        r.data.attributes.map((a) => {
          let rs:Array<string> = []
          a.ref.map((r) => {
            rs.push(r.id)
          })
          let x:IAttribute = {
            id:a.id, 
            definition:a.definition, 
            cardinality:a.cardinality, 
            type: a.type, 
            modality: a.modality, 
            ref:rs
          }
          this.data.attributes.push(x)
        })
      }      
      this.setData({ ...this.data })
      this.setUpdateRegistry(r)
      this.setUpdateMode(true)
    }
  }

  private getFields = (): Array<JSX.Element> => {
    let elms: Array<JSX.Element> = []
    elms.push(<NormalTextField
      key="field#registryid"
      text="Registry ID"
      value={this.data.regid}
      update={
        (x: string) => {
          this.data.regid = x.replaceAll(/\s+/g,"")
          this.setData({ ...this.data })
        }
      } />)
    elms.push(< NormalTextField
      key="field#regtitle"
      text="Registry title"
      value={this.data.regtitle}
      update={
        (x: string) => {
          this.data.regtitle = x
          this.setData({ ...this.data })
        }
      } />)
    elms.push(<AttributeEditPage key={"ui#registry#attributeEditPage"} model={this.mw.model} atts={this.data} setAtts={(x) => this.setData({...x, regid:this.data.regid, regtitle:this.data.regtitle})} />)
    return elms
  }

  getAddFields = (): Array<JSX.Element>  => { return this.getFields() }

  addClicked = () => {
    if (this.data.regid == "") {
      alert("ID is empty")
      return
    }
    let model = this.mw.model
    let idreg = model.idreg
    if (idreg.ids.has(this.data.regid)) {
      alert("ID already exists")
    } else {
      // add registry
      let nr = new Registry(this.data.regid, "")
      nr.title = this.data.regtitle
      nr.data = new Dataclass(this.data.regid+"#data", "")
      nr.data.mother = nr
      for (let a of this.data.attributes) {
        let na = new DataAttribute(a.id, "")
        na.definition = a.definition
        na.cardinality = a.cardinality
        na.type = a.type
        na.reftext = a.ref
        na.modality = a.modality
        nr.data.attributes.push(na)
      }
      nr.data.resolve(idreg)
      idreg.addID(nr.id, nr)
      idreg.addID(nr.data.id, nr.data)
      model.regs.push(nr)            
      model.dcs.push(nr.data)
      this.setAddMode(false)
    }
  }

  addCancel = () => {
    this.data.regid = ""
    this.data.regtitle = ""
    this.data.attributes = []
    this.setAddMode(false)
  }  

  getUpdateFields = (): Array<JSX.Element> => { return this.getFields() }

  updateClicked = () => {
    if (this.updating != null) {
      let idreg = this.mw.model.idreg
      if (this.data.regid != this.updating.id) {       
        if (this.data.regid == "") {
          alert("New ID is empty")
          return
        }
        if (idreg.ids.has(this.data.regid)) {
          alert("New ID already exists")
          return
        }
      }
      functionCollection.renameLayoutItem(this.updating.id, this.data.regid)
      idreg.ids.delete(this.updating.id)
      this.updating.id = this.data.regid
      this.updating.title = this.data.regtitle
      idreg.addID(this.data.regid, this.updating) 
      let olddcname = ""
      if (this.updating.data != null) {
        let dc = this.updating.data
        idreg.ids.delete(dc.id)
        olddcname = dc.id
        dc.id = this.data.regid+"#data"
        idreg.addID(dc.id, dc)
        dc.rdcs.clear()
        dc.attributes = []
        for (let a of this.data.attributes) {
          let na = new DataAttribute(a.id, "")
          na.definition = a.definition
          na.cardinality = a.cardinality
          na.type = a.type
          na.reftext = a.ref
          na.modality = a.modality
          dc.attributes.push(na)
        }
        dc.resolve(idreg)
        for (let alldc of this.mw.model.dcs) {
          for (let a of alldc.attributes) {                            
            let index = a.type.indexOf(olddcname)
            if (index != -1) {
              a.type = a.type.replace(olddcname, dc.id)
            }            
          }
        }     
      }
      this.setUpdateMode(false)
    }
  }

  updateCancel = () => {
    this.data.regid = ""
    this.data.regtitle = ""
    this.data.attributes = []
    this.setUpdateMode(false)
  }
  
}

export class RegistryListItem implements IListItem {
  id:string
  text:string = ""
  reference:string

  constructor(a:string, b:string, c:string) {
    this.id = a
    this.text = b
    this.reference = c
  }
}

