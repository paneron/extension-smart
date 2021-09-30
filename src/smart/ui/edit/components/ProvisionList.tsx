/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { useMemo } from 'react';
import { EditorModel } from '../../../model/editormodel';
import {
  MMELProvision,
  MMELReference,
} from '../../../serialize/interface/supportinterface';
import { MODAILITYOPTIONS } from '../../../utils/constants';
import { createProvision } from '../../../utils/EditorFactory';
import { findUniqueID, getModelAllRefs } from '../../../utils/ModelFunctions';
import { NormalComboBox, NormalTextField } from '../../common/fields';
import SimpleReferenceSelector from './ReferenceSelector';

const ProvisionListQuickEdit: React.FC<{
  provisions: Record<string, MMELProvision>;
  setProvisions: (x: Record<string, MMELProvision>) => void;
  model: EditorModel;
}> = function ({ provisions, setProvisions, model }) {
  const refs = useMemo(() => getModelAllRefs(model), [model]);

  function addProvision() {
    const id = findUniqueID('Provision', provisions);
    provisions[id] = createProvision(id);
    setProvisions({ ...provisions });
  }

  return (
    <FormGroup label="Provisions">
      {Object.entries(provisions).map(([index, p]) => (
        <ProvisionQuickEdit
          key={index}
          provision={p}
          refs={refs}
          setProvision={x => {
            provisions[index] = x;
            setProvisions({ ...provisions });
          }}
          onDelete={() => {
            delete provisions[index];
            setProvisions({ ...provisions });
          }}
        />
      ))}
      <Button icon="plus" onClick={addProvision}>
        Add provision
      </Button>
    </FormGroup>
  );
};

const ProvisionQuickEdit: React.FC<{
  provision: MMELProvision;
  setProvision: (x: MMELProvision) => void;
  refs: MMELReference[];
  onDelete: () => void;
}> = function ({ provision, setProvision, refs, onDelete }) {
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <fieldset>
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
        <SimpleReferenceSelector
          selected={provision.ref}
          items={refs}
          onItemSelect={x =>
            setProvision({
              ...provision,
              ref: new Set([...provision.ref, x.id]),
            })
          }
          onTagRemove={x => {
            provision.ref = new Set([...provision.ref].filter(s => x !== s));
            setProvision({ ...provision });
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: -8,
            zIndex: 10,
          }}
        >
          <Button intent="danger" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </fieldset>
    </div>
  );
};

export default ProvisionListQuickEdit;
