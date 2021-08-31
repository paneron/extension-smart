/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { EditorDataClass, EditorModel } from '../../model/editormodel';
import { SMARTDocumentStore } from '../../model/workspace';
import { MMELDataAttribute } from '../../serialize/interface/datainterface';
import { getModelAllRolesWithEmpty, getRegistryReference } from '../../utils/ModelFunctions';
import { isBasicType, isDCClass, isEnum } from '../../utils/typecheckings';
import { NormalTextField } from '../common/fields';
import BasicTypeAttribute from './BasicTypeAttribute';
import { DocumentEditInterface } from './DocumentEditor';
import EnumAttribute from './EnumAttribute';
import ReferenceAttributes from './ReferenceAttributes';

const DCDocumentAttributes: React.FC<{
  dc: EditorDataClass;
  model: EditorModel;
  doc: DocumentEditInterface;
  setDoc: (doc: DocumentEditInterface) => void;
  isRoot?: boolean;
  workspace: Record<string, SMARTDocumentStore>;
}> = function ({ isRoot = true, dc, model, doc, setDoc, workspace }) {
  const roles = getModelAllRolesWithEmpty(model);
  return (
    <>
      {isRoot && 
        <NormalTextField
          text="Document name"
          value={doc.name}
          onChange={x => setDoc({ ...doc, name: x })}
        />
      }
      {Object.values(dc.attributes).map(a => (
        <DocumentAttribute
          attribute={a}
          model={model}
          doc={doc}
          setDoc={setDoc}
          roles={roles}
          workspace={workspace}
        />
      ))}
    </>
  );
};

const DocumentAttribute: React.FC<{
  attribute: MMELDataAttribute;
  model: EditorModel;
  doc: DocumentEditInterface;
  setDoc: (doc: DocumentEditInterface) => void;
  roles: string[];
  workspace: Record<string, SMARTDocumentStore>;
}> = function ({ attribute, model, doc, setDoc, roles, workspace }) {
  const type = attribute.type;
  const value = doc.attributes[attribute.id] ?? '';

  function onChange(x: string) {
    doc.attributes[attribute.id] = x;
    setDoc({ ...doc });
  }

  if (isBasicType(type)) {
    return (
      <BasicTypeAttribute
        value={value}
        title={attribute.definition}
        onChange={onChange}
        type={type}
        roles={roles}
      />
    );
  } else if (isEnum(type, model.enums)) {
    return (
      <EnumAttribute
        value={value}
        title={attribute.definition}
        onChange={onChange}
        mmelenum={model.enums[type]}
      />
    );
  } else if (isDCClass(type, model.elements)) {
    const dc = model.elements[type] as EditorDataClass;
    return (
      <fieldset>
        <legend>{attribute.definition}</legend>
          <DCDocumentAttributes
            dc={dc}
            model={model}
            doc={doc}
            setDoc={setDoc}
            isRoot={false}
            workspace={workspace}
          />
      </fieldset>
    );
  }  
  const reg = getRegistryReference(type, model.elements);
  if (reg !== null) {
    const regstore:SMARTDocumentStore = workspace[reg.id]??{id:reg.id, docs:{}};
    return (
      <ReferenceAttributes        
        value={value}
        title={attribute.definition}
        onChange={onChange}
        store={regstore}
        regtitle={reg.title}
      />
    );
  }  
  // unknown type (maybe the model has changed), ignore this attribute
  return <></>;
};

export default DCDocumentAttributes;

//     } else {
//       const mw = functionCollection.getStateMan().state.modelWrapper
//       const u = a.type.indexOf('(')
//       const v = a.type.indexOf(')')
//       if (u !== -1 && v !== -1) {
//         const type = a.type.substr(u + 1, v - u - 1)
//         const opts:Array<string> = []
//         const obj = mw.idman.nodes.get(type)
//         if (obj?.datatype === DataType.DATACLASS) {
//           const r = obj as MMELDataClass
//           const mother = mw.dlman.get(r).mother
//           if (mother != null) {
//             this.store.get(mother).docs.forEach((d) => {
//               opts.push(descDocument(d))
//             })
//             elms.push(<ReferenceSelector
//               key={'field#' + prefix + a.id}
//               text={a.definition}
//               filterName={type + ' filter'}
//               value={getAttributeValue(this.data, a.id)}
//               options = {opts}
//               update={
//                 (x: number) => {
//                   if (x !== -1) {
//                     this.data.attributes.set(a.id, opts[x])
//                     this.setData({ ...this.data })
//                   }
//                 }
//               } />)
//           }
//         }