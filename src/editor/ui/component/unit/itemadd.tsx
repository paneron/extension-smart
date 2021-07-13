import React from "react"
import { IAddItem } from "../../interface/fieldinterface"

const ItemAddPane: React.FC<IAddItem> = (content : IAddItem) => {      

  let elms: Array<JSX.Element> = content.getAddFields()  
  return (
    <>
      {elms}
      <button key="ui#itemadd#addbutton" onClick={() => content.addClicked()}> Add </button>
      <button key="ui#itemadd#cancelbutton" onClick={() => content.addCancel()}> Cancel </button>
    </>
  )
}

export default ItemAddPane