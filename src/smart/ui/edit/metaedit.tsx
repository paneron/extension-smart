import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import { MMELMetadata } from '../../serialize/interface/supportinterface';
import { DescriptionItem } from '../common/description/fields';
import { NormalTextField } from '../common/fields';

const MetaEditPage: React.FC<{
  meta: MMELMetadata;
  setMetadata: (meta: MMELMetadata) => void;
  isRepoMode: boolean;
}> = ({ meta, setMetadata, isRepoMode }) => {
  return (
    <FormGroup>
      {isRepoMode ? (
        <DescriptionItem label="Namespace" value={meta.namespace} />
      ) : (
        <NormalTextField
          text="Globally unique identifier of the Data Model (Namespace)"
          value={meta.namespace}
          onChange={(x: string) => {
            setMetadata({ ...meta, namespace: x.replaceAll(/\s+/g, '') });
          }}
        />
      )}
      <NormalTextField
        text="Data Model Schema"
        value={meta.schema}
        onChange={x => {
          setMetadata({ ...meta, schema: x });
        }}
      />
      <NormalTextField
        text="Author"
        value={meta.author}
        onChange={(x: string) => {
          setMetadata({ ...meta, author: x });
        }}
      />
      <NormalTextField
        text="Title of the Data Model"
        value={meta.title}
        onChange={(x: string) => {
          setMetadata({ ...meta, title: x });
        }}
      />
      <NormalTextField
        text="Edition of the Data Model"
        value={meta.edition}
        onChange={(x: string) => {
          setMetadata({ ...meta, edition: x });
        }}
      />
      <NormalTextField
        text="Short name of the Data Model"
        value={meta.shortname}
        onChange={(x: string) => {
          setMetadata({ ...meta, shortname: x });
        }}
      />
    </FormGroup>
  );
};

export default MetaEditPage;
