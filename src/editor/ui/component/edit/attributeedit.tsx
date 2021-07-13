import React, { useState } from "react"
import { Model } from "../../../model/model/model"
import { IAttribute, IAttributeContainer } from "../../interface/datainterface"
import { AttributeHandler } from "../handle/attributehandler"
import ItemAddPane from "../unit/itemadd"
import ItemUpdatePane from "../unit/itemupdate"
import ListManagerPane from "../unit/listmanage"

const AttributeEditPage: React.FC<{ model: Model, atts: IAttributeContainer, setAtts: (x:IAttributeContainer)=>void}> = ({ model, atts, setAtts }) => {

  const [isAdd, setAddMode] = useState(false)
  const [isUpdate, setUpdateMode] = useState(false)
  const [attribute, setUpdateAttribute] = useState<IAttribute|null>(null)  
  const [data, setData] = useState<IAttribute>({id: "", definition: "", type: "", modality: "", cardinality: "", ref: []})

  const forceUpdate = () => {
    setAtts({...atts})
  }

  let handle = new AttributeHandler(model, atts, attribute, setAddMode, setUpdateMode, setUpdateAttribute, forceUpdate, data, setData)  

  return (
    <div style={{border: '1px solid black', width: "90%"}}>
      <div style={{ display: (!isAdd && !isUpdate) ? "inline" : "none" }}>
        <ListManagerPane {...handle} />
      </div>
      <div style={{ display: (isAdd) ? "inline" : "none" }}>
        <ItemAddPane {...handle} />
      </div>
      <div style={{ display: (isUpdate) ? "inline" : "none" }}>
        <ItemUpdatePane {...handle} />
      </div>
    </div>
  )
}

export default AttributeEditPage