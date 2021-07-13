import React, { useState } from "react"
import { Dataclass } from "../../../model/model/data/dataclass"
import { IDataclass } from "../../interface/datainterface"
import { ModelWrapper } from "../../model/modelwrapper"
import { DataclassHandler } from "../handle/dataclasshandler"
import ItemAddPane from "../unit/itemadd"
import ItemUpdatePane from "../unit/itemupdate"
import ListManagerPane from "../unit/listmanage"

const DataEditPage: React.FC<{ modelWrapper: ModelWrapper, isVisible: boolean }> = ({ modelWrapper, isVisible }) => {

  const [isAdd, setAddMode] = useState(false)
  const [isUpdate, setUpdateMode] = useState(false)
  const [dataclass, setUpdateDataclass] = useState<Dataclass|null>(null)
  const [dummy, setDummy] = useState<boolean>(false)
  const [data, setData] = useState<IDataclass>({id:"", attributes:[]})

  const forceUpdate = () => {
    setDummy(!dummy)
  }

  let handle = new DataclassHandler(modelWrapper, dataclass, setAddMode, setUpdateMode, setUpdateDataclass, forceUpdate, data, setData)

  return (
    <>
      <div style={{ display: (isVisible && !isAdd && !isUpdate) ? "inline" : "none" }}>
        <ListManagerPane {...handle} />
      </div>
      <div style={{ display: (isVisible && isAdd) ? "inline" : "none" }}>
        <ItemAddPane {...handle} />
      </div>
      <div style={{ display: (isVisible && isUpdate) ? "inline" : "none" }}>
        <ItemUpdatePane {...handle} />
      </div>
    </>
  )
}

export default DataEditPage