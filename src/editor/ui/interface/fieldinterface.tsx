export interface IField {  
  text:string
  value:string
  update: (x:string)=>void
}

export interface IComboField {  
  text:string
  options: Array<string>
  value:string
  update: (x:string)=>void
}

export interface IMultiRefSelectField {  
  filterName:string
  text:string
  options: Array<string>
  values:Array<string>  
  add: (x:Array<string>)=>void
  remove: (x:Array<string>)=>void
}

export interface IRefSelectField {  
  filterName:string
  text:string
  options: Array<string>
  value:string
  editable?:boolean
  onChange?:(x:string)=>void
  update: (x:number)=>void
}

export interface IList {
  filterName:string
  itemName:string
  getItems:()=>Array<IListItem>
  addItemClicked:()=>void
  removeItem:(refs:Array<string>)=>void
  updateItem:(ref:string)=>void
}

export interface IListItem {
  id:string
  text:string
  reference:string
}

export interface IAddItem {
  getAddFields: () => Array<JSX.Element>
  addClicked: () => void
  addCancel:()=>void
}

export interface IUpdateItem {
  getUpdateFields: () => Array<JSX.Element>
  updateClicked: () => void
  updateCancel: () => void
}