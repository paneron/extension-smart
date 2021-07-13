import React from "react"
import { DataAttribute } from "../../../model/model/data/dataattribute"
import { Dataclass } from "../../../model/model/data/dataclass"
import { IAttribute, IDataclass } from "../../interface/datainterface"
import { IAddItem, IList, IListItem, IUpdateItem } from "../../interface/fieldinterface"
import { ModelWrapper } from "../../model/modelwrapper"
import { functionCollection } from "../../util/function"
import AttributeEditPage from "../edit/attributeedit"
import NormalTextField from "../unit/textfield"

export class DataclassHandler implements IList, IAddItem, IUpdateItem {

  filterName="Data structure filter"
  itemName="Data structure"
  private mw: ModelWrapper
  private setAddMode: (b: boolean) => void
  private updating:Dataclass|null
  private data: IDataclass
  private setData: (x:IDataclass) => void
  private forceUpdate: () => void
  private setUpdateMode: (b: boolean) => void
  private setUpdateDataclass: (x: Dataclass) => void

  constructor(mw:ModelWrapper, updateObj:Dataclass|null, setAdd:(b:boolean)=>void, setUpdate:(b:boolean)=>void, setUpdateRegistry:(x:Dataclass)=>void, forceUpdate:()=>void, data:IDataclass, setRegistry:(x:IDataclass)=>void) {
    this.mw = mw
    this.updating = updateObj
    this.setAddMode = setAdd
    this.setUpdateMode = setUpdate
    this.forceUpdate = forceUpdate
    this.setUpdateDataclass = setUpdateRegistry
    this.data = data
    this.setData = setRegistry
  }   

  getItems = ():Array<DataclassListItem> =>  {
    let out:Array<DataclassListItem> = []
    this.mw.model.dcs.forEach((d, index) => {      
      if (d.mother == null) {
        out.push(new DataclassListItem(d.id, d.id, ""+index))
      }
    })    
    return out
  }

  addItemClicked = () => {
    this.data.id = ""    
    this.data.attributes = []
    this.setData({ ...this.data})
    this.setAddMode(true)
  }
  
  removeItem = (refs:Array<string>) => {
    for (let i = refs.length-1;i>=0;i--) {
      let removed = this.mw.model.dcs.splice(parseInt(refs[i]), 1)
      if (removed.length > 0) {
        let r = removed[0]
        this.mw.model.idreg.ids.delete(r.id)        
                  
        for (let dc of this.mw.model.dcs) {
          for (let a of dc.attributes) {
            let index = a.type.indexOf(r.id)
            if (index != -1) {
              a.type = ""
            }
            dc.rdcs.delete(r)
          }
        }
        functionCollection.removeLayoutItem(r.id)        
      }
    }
    this.forceUpdate()
  }

  updateItem = (ref: string) => {
    let x = parseInt(ref)
    if (!isNaN(x)) {      
      let r = this.mw.model.dcs[x]
      this.data.id= r.id
      this.data.attributes = []      
      r.attributes.map((a) => {
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
      this.setData({ ...this.data })
      this.setUpdateDataclass(r)
      this.setUpdateMode(true)
    }
  }

  private getFields = (): Array<JSX.Element> => {
    let elms: Array<JSX.Element> = []
    elms.push(<NormalTextField
      key="field#dataclassid"
      text="Dataclass ID"
      value={this.data.id}
      update={
        (x: string) => {
          this.data.id = x.replaceAll(/\s+/g,"")
          this.setData({ ...this.data })
        }
      } />)    
    elms.push(<AttributeEditPage key={"ui#dataclass#attributeEditPage"} model={this.mw.model} atts={this.data} setAtts={(x) => this.setData({...x, id:this.data.id})} />)
    return elms
  }

  getAddFields = (): Array<JSX.Element>  => { return this.getFields() }

  addClicked = () => {
    if (this.data.id == "") {
      alert("ID is empty")
      return
    }
    let model = this.mw.model
    let idreg = model.idreg
    if (idreg.ids.has(this.data.id)) {
      alert("ID already exists")
    } else {
      // add data class
      let nr = new Dataclass(this.data.id, "")      
      for (let a of this.data.attributes) {
        let na = new DataAttribute(a.id, "")
        na.definition = a.definition
        na.cardinality = a.cardinality
        na.type = a.type
        na.reftext = a.ref
        na.modality = a.modality
        nr.attributes.push(na)
      }
      nr.resolve(idreg)      
      idreg.addID(nr.id, nr)
      model.dcs.push(nr)
      this.setAddMode(false)
    }
  }

  addCancel = () => {
    this.data.id = ""    
    this.data.attributes = []
    this.setAddMode(false)
  }  

  getUpdateFields = (): Array<JSX.Element> => { return this.getFields() }

  updateClicked = () => {
    if (this.updating != null) {
      let idreg = this.mw.model.idreg
      let dc = this.updating
      if (this.data.id != dc.id) {
        if (this.data.id == "") {
          alert("New ID is empty")
          return
        }
        if (idreg.ids.has(this.data.id)) {
          alert("New ID already exists")
          return
        }
      }
      for (let x of this.mw.model.dcs) {
        for (let a of x.attributes) {
          if (a.type == dc.id) {
            a.type = this.data.id
          }          
        }
      }
      functionCollection.renameLayoutItem(this.updating.id, this.data.id)
      idreg.ids.delete(dc.id)
      dc.id = this.data.id
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
      this.setUpdateMode(false)
    }
  }

  updateCancel = () => {
    this.data.id = ""    
    this.data.attributes = []
    this.setUpdateMode(false)
  }
  
}

export class DataclassListItem implements IListItem {
  id:string
  text:string = ""
  reference:string

  constructor(a:string, b:string, c:string) {
    this.id = a
    this.text = b
    this.reference = c
  }
}