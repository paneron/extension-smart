/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { IField } from "../../interface/fieldinterface"

const DataTimeTextField: React.FC<IField> = (f: IField) => {

  return (
    <p> {f.text}
      <input type="datetime-local" value={f.value} onChange={(e) => f.update(e.target.value)} />      
    </p>
  )
}

export default DataTimeTextField
