/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { MMELMetadata } from '../../serialize/interface/supportinterface';
import { NormalTextField } from '../common/fields';

const MetaEditPage: React.FC<{
  meta: MMELMetadata;
  setMetadata: (meta: MMELMetadata) => void;
}> = ({ meta, setMetadata }) => {
  return (
    <div>
      <NormalTextField
        key="field#modelschema"
        text="Data Model Schema"
        value={meta.schema}
        update={(x: string) => {
          setMetadata({ ...meta, schema: x });
        }}
      />
      <NormalTextField
        key="field#metaauthor"
        text="Author"
        value={meta.author}
        update={(x: string) => {
          setMetadata({ ...meta, author: x });
        }}
      />
      <NormalTextField
        key="field#modeltitle"
        text="Title of the Data Model"
        value={meta.title}
        update={(x: string) => {
          setMetadata({ ...meta, title: x });
        }}
      />
      <NormalTextField
        key="field#modeledition"
        text="Edition of the Data Model"
        value={meta.edition}
        update={(x: string) => {
          setMetadata({ ...meta, edition: x });
        }}
      />
      <NormalTextField
        key="field#modelnamespace"
        text="Globally unique identifier of the Data Model (Namespace)"
        value={meta.namespace}
        update={(x: string) => {
          setMetadata({ ...meta, namespace: x.replaceAll(/\s+/g, '') });
        }}
      />
    </div>
  );
};

export default MetaEditPage;
