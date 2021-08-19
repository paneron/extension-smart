/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { MMELMetadata } from '../../serialize/interface/supportinterface';
import { NormalTextField } from '../common/fields';

const MetaEditPage: React.FC<{
  meta: MMELMetadata;
  setMetadata: (meta: MMELMetadata) => void;
}> = ({ meta, setMetadata }) => {
  return (
    <FormGroup>
      <NormalTextField
        key="field#modelschema"
        text="Data Model Schema"
        value={meta.schema}
        onChange={(x: string) => {
          setMetadata({ ...meta, schema: x });
        }}
      />
      <NormalTextField
        key="field#metaauthor"
        text="Author"
        value={meta.author}
        onChange={(x: string) => {
          setMetadata({ ...meta, author: x });
        }}
      />
      <NormalTextField
        key="field#modeltitle"
        text="Title of the Data Model"
        value={meta.title}
        onChange={(x: string) => {
          setMetadata({ ...meta, title: x });
        }}
      />
      <NormalTextField
        key="field#modeledition"
        text="Edition of the Data Model"
        value={meta.edition}
        onChange={(x: string) => {
          setMetadata({ ...meta, edition: x });
        }}
      />
      <NormalTextField
        key="field#modelnamespace"
        text="Globally unique identifier of the Data Model (Namespace)"
        value={meta.namespace}
        onChange={(x: string) => {
          setMetadata({ ...meta, namespace: x.replaceAll(/\s+/g, '') });
        }}
      />
    </FormGroup>
  );
};

export default MetaEditPage;
