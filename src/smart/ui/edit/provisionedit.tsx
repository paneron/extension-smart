import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import { EditorModel } from '../../model/editormodel';
import { MMELProvision } from '../../serialize/interface/supportinterface';
import { getModelAllRefs } from '../../utils/ModelFunctions';
import { MODAILITYOPTIONS } from '../../utils/constants';
import {
  MultiReferenceSelector,
  NormalComboBox,
  NormalTextField,
} from '../common/fields';
import { IObject } from '../common/listmanagement/listPopoverItem';

export function matchProvisionFilter(x: IObject, filter: string): boolean {
  const provision = x as MMELProvision;
  return filter === '' || provision.condition.toLowerCase().includes(filter);
}

export const ProvisonItem: React.FC<{
  object: MMELProvision;
  model?: EditorModel;
  setObject: (obj: MMELProvision) => void;
}> = ({ object: provision, model, setObject: setProvision }) => {
  const refs = getModelAllRefs(model!).map(r => r.id);

  return (
    <FormGroup>
      <NormalTextField
        text="Provision Text"
        value={provision.condition}
        onChange={x => setProvision({ ...provision, condition: x })}
      />
      <NormalComboBox
        text="Provision Modality"
        value={provision.modality}
        options={MODAILITYOPTIONS}
        onChange={x => setProvision({ ...provision, modality: x })}
      />
      <MultiReferenceSelector
        text="Reference"
        options={refs}
        values={provision.ref}
        filterName="Reference filter"
        add={x => {
          provision.ref = new Set([...provision.ref, ...x]);
          setProvision({ ...provision });
        }}
        remove={x => {
          provision.ref = new Set([...provision.ref].filter(s => !x.has(s)));
          setProvision({ ...provision });
        }}
      />
    </FormGroup>
  );
};
