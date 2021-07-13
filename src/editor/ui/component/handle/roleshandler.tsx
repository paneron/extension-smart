import React from "react"
import { Model } from "../../../model/model/model"
import { Role } from "../../../model/model/support/role"
import { IRole } from "../../interface/datainterface"
import { IAddItem, IList, IListItem, IUpdateItem } from "../../interface/fieldinterface"
import NormalTextField from "../unit/textfield"

export class RoleHandler implements IList, IAddItem, IUpdateItem {

  filterName="Role filter"
  itemName="Roles"
  private model: Model
  private setAddMode: (b: boolean) => void
  private updating:Role|null
  private data: IRole
  private setData: (x:IRole) => void
  private forceUpdate: () => void
  private setUpdateMode: (b: boolean) => void
  private setUpdateRole: (x: Role) => void

  constructor(model:Model, updateObj:Role|null, setAdd:(b:boolean)=>void, setUpdate:(b:boolean)=>void, setUpdateRole:(x:Role)=>void, forceUpdate:()=>void, data:IRole, setRole:(x:IRole)=>void) {
    this.model = model
    this.updating = updateObj
    this.setAddMode = setAdd
    this.setUpdateMode = setUpdate
    this.forceUpdate = forceUpdate
    this.setUpdateRole = setUpdateRole
    this.data = data
    this.setData = setRole
  }   

  getItems = ():Array<RoleListItem> =>  {
    let out:Array<RoleListItem> = []
    this.model.roles.forEach((r, index) => {      
      out.push(new RoleListItem(r.id, r.name, ""+index))
    })    
    return out
  }

  addItemClicked = () => {
    this.data.roleid = ""
    this.data.rolename = ""
    this.setData({ ...this.data})
    this.setAddMode(true)
  }
  
  removeItem = (refs:Array<string>) => {
    for (let i = refs.length-1;i>=0;i--) {
      let removed = this.model.roles.splice(parseInt(refs[i]), 1)
      if (removed.length > 0) {
        let r = removed[0]
        for (let p of this.model.hps) {
          if (p.actor == r) {
            p.actor = null
          }
        }
        for (let p of this.model.aps) {
          if (p.actor == r) {
            p.actor = null
          }
          if (p.approver == r) {
            p.approver = null
          }
        }
        this.model.idreg.ids.delete(r.id)
      }
    }    
    this.forceUpdate()
  }

  updateItem = (ref: string) => {
    let x = parseInt(ref)
    if (!isNaN(x)) {      
      let r = this.model.roles[x]
      this.data.roleid = r.id
      this.data.rolename = r.name      
      this.setData({ ...this.data })
      this.setUpdateRole(r)
      this.setUpdateMode(true)
    }    
  }    

  private getFields = (): Array<JSX.Element> => {
    let elms: Array<JSX.Element> = []
    elms.push(<NormalTextField
      key="field#roleid"
      text="Role ID"
      value={this.data.roleid}
      update={
        (x: string) => {
          this.data.roleid = x.replaceAll(/\s+/g,"")
          this.setData({ ...this.data })
        }
      } />)
    elms.push(< NormalTextField
      key="field#rolename"
      text="Role Name"
      value={this.data.rolename}
      update={
        (x: string) => {
          this.data.rolename = x
          this.setData({ ...this.data })
        }
      } />)
    return elms
  }

  getAddFields = (): Array<JSX.Element>  => { return this.getFields() }

  addClicked = () => {
    if (this.data.roleid == "") {
      alert("ID is empty")
      return
    }
    let idreg = this.model.idreg
    if (idreg.ids.has(this.data.roleid)) {
      alert("ID already exists")      
    } else {      
      let role = new Role(this.data.roleid, "")
      idreg.addID(role.id, role)
      role.name = this.data.rolename
      this.model.roles.push(role)
      this.setAddMode(false)
    }      
  }

  addCancel = () => {
    this.data.roleid = ""
    this.data.rolename = ""
    this.setAddMode(false)
  }  

  getUpdateFields = (): Array<JSX.Element> => { return this.getFields() }

  updateClicked = () => {    
    if (this.updating != null) {
      let idreg = this.model.idreg      
      if (this.data.roleid != this.updating.id) {        
        if (this.data.roleid == "") {
          alert("New ID is empty")
          return
        }
        if (idreg.ids.has(this.data.roleid)) {
          alert("New ID already exists")
          return
        }
      }
      idreg.ids.delete(this.updating.id)
      idreg.addID(this.data.roleid, this.updating)
      this.updating.id = this.data.roleid
      this.updating.name = this.data.rolename
      this.setUpdateMode(false)    
    }
  }

  updateCancel = () => {
    this.data.roleid = ""
    this.data.rolename = ""
    this.setUpdateMode(false)
  }
}

export class RoleListItem implements IListItem {
  id:string
  text:string = ""
  reference:string

  constructor(a:string, b:string, c:string) {
    this.id = a
    this.text = b
    this.reference = c
  }
}