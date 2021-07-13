/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { IComboField } from "../../interface/fieldinterface"

const NormalComboBox: React.FC<IComboField> = (f: IComboField) => {    
  let elms:Array<JSX.Element> = []
  f.options.map((x, index) => {
    elms.push(<option key={"option"+index} value={x}>{x}</option>)
  })

  return (
    <p> {f.text}
      <select value={f.value} onChange={(e) => f.update(e.target.value)}>
        {elms}
      </select>
    </p>
  )
}

export default NormalComboBox 
