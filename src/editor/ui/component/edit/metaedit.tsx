/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { useState } from "react"
import { Model } from "../../../model/model/model"
import NormalTextField from "../unit/textfield"

const MetaEditPage: React.FC<{ model: Model, isVisible: boolean }> = ({ model, isVisible }) => {
  let [dummy, setDummy] = useState(false)

  return <div style={{display: isVisible?"inline":"none"}}>
    <NormalTextField
      key="field#modelschema"
      text="Data Model Schema"
      value={model.meta.schema}
      update={
        (x:string) => {
          model.meta.schema = x
          setDummy(!dummy)
        }
      } />
    <NormalTextField
      key="field#metaauthor"
      text="Author"
      value={model.meta.author}
      update={
        (x:string) => {
          model.meta.author = x
          setDummy(!dummy)
        }
      } />
    <NormalTextField
      key="field#modeltitle"
      text="Title of the Data Model"
      value={model.meta.title}
      update={
        (x:string) => {
          model.meta.title = x
          setDummy(!dummy)
        }
      } />
    <NormalTextField
      key="field#modeledition"
      text="Edition of the Data Model"
      value={model.meta.edition}
      update={
        (x:string) => {
          model.meta.edition = x
          setDummy(!dummy)
        }
      } />
    <NormalTextField
      key="field#modelnamespace"
      text="Globally unique identifier of the Data Model (Namespace)"
      value={model.meta.namespace}
      update={
        (x:string) => {
          model.meta.namespace = x.replaceAll(/\s+/g, "")
          setDummy(!dummy)
        }
      } />
  </div>
}

export default MetaEditPage
