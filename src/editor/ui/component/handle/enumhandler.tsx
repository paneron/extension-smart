import React from "react"
import { Enum, EnumValue } from "../../../model/model/data/enum"
import { IEnum, IEnumValue } from "../../interface/datainterface"
import { IAddItem, IList, IListItem, IUpdateItem } from "../../interface/fieldinterface"
import { ModelWrapper } from "../../model/modelwrapper"
import EnumValueEditPage from "../edit/enumvalueedit"
import NormalTextField from "../unit/textfield"

export class EnumHandler implements IList, IAddItem, IUpdateItem {

  filterName="Enumeration filter"
  itemName="Enumerations"
  private mw: ModelWrapper
  private setAddMode: (b: boolean) => void
  private updating:Enum|null
  private data: IEnum
  private setData: (x:IEnum) => void
  private forceUpdate: () => void
  private setUpdateMode: (b: boolean) => void
  private setUpdateEnum: (x: Enum) => void

  constructor(mw:ModelWrapper, updateObj:Enum|null, setAdd:(b:boolean)=>void, setUpdate:(b:boolean)=>void, setUpdateEnum:(x:Enum)=>void, forceUpdate:()=>void, data:IEnum, setEnum:(x:IEnum)=>void) {
    this.mw = mw
    this.updating = updateObj
    this.setAddMode = setAdd
    this.setUpdateMode = setUpdate
    this.forceUpdate = forceUpdate
    this.setUpdateEnum = setUpdateEnum
    this.data = data
    this.setData = setEnum
  }   

  getItems = ():Array<EnumListItem> =>  {
    let out:Array<EnumListItem> = []
    this.mw.model.enums.forEach((e, index) => {            
      out.push(new EnumListItem(e.id, e.id, ""+index))
    })
    return out
  }

  addItemClicked = () => {
    this.data.id = ""    
    this.data.values = []
    this.setData({ ...this.data})
    this.setAddMode(true)
  }
  
  removeItem = (refs:Array<string>) => {
    for (let i = refs.length-1;i>=0;i--) {
      let removed = this.mw.model.enums.splice(parseInt(refs[i]), 1)
      if (removed.length > 0) {
        let r = removed[0]
        this.mw.model.idreg.ids.delete(r.id)
        for (let dc of this.mw.model.dcs) {
          for (let a of dc.attributes) {
            if (a.type == r.id) {
              a.type = ""
            }
          }
        }
      }
    }
    this.forceUpdate()
  }

  updateItem = (ref: string) => {
    let x = parseInt(ref)
    if (!isNaN(x)) {
      let e = this.mw.model.enums[x]
      this.data.id= e.id
      this.data.values = []
      e.values.map((v) => {        
        let x:IEnumValue = {id:v.id, value:v.value}        
        this.data.values.push(x)
      })           
      this.setData({ ...this.data })
      this.setUpdateEnum(e)
      this.setUpdateMode(true)
    }
  }

  private getFields = (): Array<JSX.Element> => {
    let elms: Array<JSX.Element> = []
    elms.push(<NormalTextField
      key="field#enumid"
      text="Enumeration ID"
      value={this.data.id}
      update={
        (x: string) => {
          this.data.id = x.replaceAll(/\s+/g,"")
          this.setData({ ...this.data })
        }
      } />)
    elms.push(<EnumValueEditPage key={"ui#enum#enumValueEditPage"} en={this.data} setEnum={this.setData} />)
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
      // add Enum
      let nr = new Enum(this.data.id, "")
      for (let a of this.data.values) {
        let na = new EnumValue(a.id, "")
        na.value = a.value        
        nr.values.push(na)
      }         
      idreg.addID(nr.id, nr)
      model.enums.push(nr)
      this.setAddMode(false)
    }
  }

  addCancel = () => {
    this.data.id = ""    
    this.data.values = []
    this.setAddMode(false)
  }  

  getUpdateFields = (): Array<JSX.Element> => { return this.getFields() }

  updateClicked = () => {
    if (this.updating != null) {
      let idreg = this.mw.model.idreg
      let old = this.updating
      if (this.data.id != old.id) {
        if (this.data.id == "") {
          alert("New ID is empty")
          return
        }
        if (idreg.ids.has(this.data.id)) {
          alert("New ID already exists")
          return
        }
      }
      // update enum
      for (let x of this.mw.model.dcs) {
        for (let a of x.attributes) {
          if (a.type == old.id) {
            a.type = this.data.id
          }          
        }
      }
      idreg.ids.delete(old.id)
      old.id = this.data.id
      idreg.addID(old.id, old)
      old.values = []
      for (let a of this.data.values) {
        let na = new EnumValue(a.id, "")
        na.value = a.value
        old.values.push(na)
      }      
      this.setUpdateMode(false)
    }
  }

  updateCancel = () => {
    this.data.id = ""
    this.data.values = []
    this.setUpdateMode(false)
  }
  
}

export class EnumListItem implements IListItem {
  id:string
  text:string = ""
  reference:string

  constructor(a:string, b:string, c:string) {
    this.id = a
    this.text = b
    this.reference = c
  }
}