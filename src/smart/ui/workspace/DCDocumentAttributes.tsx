import React from 'react';
import type { EditorDataClass, EditorModel } from '@/smart/model/editormodel';
import type { SMARTDocumentStore } from '@/smart/model/workspace';
import type { MMELDataAttribute } from '@paneron/libmmel/interface/datainterface';
import {
  getModelAllRolesWithEmpty,
  getRegistryReference,
} from '@/smart/utils/ModelFunctions';
import { isBasicType, isDCClass, isEnum } from '@/smart/utils/typecheckings';
import { NormalTextField } from '@/smart/ui/common/fields';
import BasicTypeAttribute from '@/smart/ui/workspace/BasicTypeAttribute';
import type { DocumentEditInterface } from '@/smart/ui/workspace/DocumentEditor';
import EnumAttribute from '@/smart/ui/workspace/EnumAttribute';
import ReferenceAttributes from '@/smart/ui/workspace/ReferenceAttributes';

interface DCDocumentAttributesProps {
  dc: EditorDataClass;
  model: EditorModel;
  doc: DocumentEditInterface;
  setDoc: (doc: DocumentEditInterface) => void;
  isRoot?: boolean;
  workspace: Record<string, SMARTDocumentStore>;
  prefix: string;
}

const DCDocumentAttributes: React.FC<DCDocumentAttributesProps> =
function ({ isRoot = true, dc, model, doc, setDoc, workspace, prefix }: DCDocumentAttributesProps) {
  const roles = getModelAllRolesWithEmpty(model);
  return (
    <>
      {isRoot && (
        <NormalTextField
          text="Document name"
          value={doc.name}
          onChange={x => setDoc({ ...doc, name : x })}
        />
      )}
      {Object.values(dc.attributes).map(a => (
        <DocumentAttribute
          key={a.id}
          attribute={a}
          model={model}
          doc={doc}
          setDoc={setDoc}
          roles={roles}
          workspace={workspace}
          prefix={prefix}
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
  prefix: string;
}> = function ({ attribute, model, doc, setDoc, roles, workspace, prefix }) {
  const type = attribute.type;
  const attributeid = prefix + attribute.id;
  const value = doc.attributes[attributeid] ?? '';

  function onChange(x: string) {
    doc.attributes[attributeid] = x;
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
          prefix={prefix + attributeid + '#'}
        />
      </fieldset>
    );
  }
  const reg = getRegistryReference(type, model.elements);
  if (reg !== null) {
    const regstore: SMARTDocumentStore = workspace[reg.id] ?? {
      id   : reg.id,
      docs : {},
    };
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
