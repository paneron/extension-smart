/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup, IToastProps } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { useState } from 'react';
import MGDButton from '../../MGDComponents/MGDButton';
import MGDButtonGroup from '../../MGDComponents/MGDButtonGroup';
import { MMELMetadata } from '../../serialize/interface/supportinterface';
import { DescriptionItem } from '../common/description/fields';
import { NormalTextField } from '../common/fields';

const MetaEditPage: React.FC<{
  meta: MMELMetadata;
  setMetadata: (meta: MMELMetadata) => void;
  showMsg: (msg: IToastProps) => void;
  isRepoMode: boolean;
}> = ({ meta, setMetadata, showMsg, isRepoMode }) => {
  const [editing, setEditing] = useState<MMELMetadata>({ ...meta });

  function save() {
    setMetadata(editing);
    showMsg({
      message: 'Save done',
      intent: 'success',
    });
  }

  function cancel() {
    setEditing({ ...meta });
    showMsg({
      message: 'Reset metadata',
      intent: 'primary',
    });
  }

  return (
    <FormGroup>
      {isRepoMode ? (
        <DescriptionItem label="Namepsace" value={editing.namespace} />
      ) : (
        <NormalTextField
          text="Globally unique identifier of the Data Model (Namespace)"
          value={editing.namespace}
          onChange={(x: string) => {
            setEditing({ ...editing, namespace: x.replaceAll(/\s+/g, '') });
          }}
        />
      )}
      <NormalTextField
        text="Data Model Schema"
        value={editing.schema}
        onChange={x => {
          setEditing({ ...editing, schema: x });
        }}
      />
      <NormalTextField
        text="Author"
        value={editing.author}
        onChange={(x: string) => {
          setEditing({ ...editing, author: x });
        }}
      />
      <NormalTextField
        text="Title of the Data Model"
        value={editing.title}
        onChange={(x: string) => {
          setEditing({ ...editing, title: x });
        }}
      />
      <NormalTextField
        text="Edition of the Data Model"
        value={editing.edition}
        onChange={(x: string) => {
          setEditing({ ...editing, edition: x });
        }}
      />
      <NormalTextField
        text="Short name of the Data Model"
        value={editing.shortname}
        onChange={(x: string) => {
          setEditing({ ...editing, shortname: x });
        }}
      />
      <MGDButtonGroup>
        <MGDButton icon="floppy-disk" onClick={save}>
          Update metadata
        </MGDButton>
        <MGDButton icon="disable" onClick={cancel}>
          Cancel
        </MGDButton>
      </MGDButtonGroup>
    </FormGroup>
  );
};

export default MetaEditPage;
