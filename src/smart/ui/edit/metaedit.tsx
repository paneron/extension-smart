import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import { EditorAction } from '@/smart/model/editor/state';
import { MMELMetadata } from '@paneron/libmmel/interface/supportinterface';
import { DescriptionItem } from '@/smart/ui/common/description/fields';
import { NormalTextField } from '@/smart/ui/common/fields';

const MetaEditPage: React.FC<{
  meta: MMELMetadata;
  act: (x: EditorAction) => void;
}> = ({ meta, act }) => {
  function action(property: keyof MMELMetadata, value: string) {
    act({ type : 'model', act : 'meta', property, value });
  }

  return (
    <FormGroup>
      <DescriptionItem label="Namespace" value={meta.namespace} />
      <NormalTextField
        text="Data Model Schema"
        value={meta.schema}
        onChange={x => action('schema', x)}
      />
      <NormalTextField
        text="Author"
        value={meta.author}
        onChange={x => action('author', x)}
      />
      <NormalTextField
        text="Title of the Data Model"
        value={meta.title}
        onChange={x => action('title', x)}
      />
      <NormalTextField
        text="Edition of the Data Model"
        value={meta.edition}
        onChange={x => action('edition', x)}
      />
      <NormalTextField
        text="Short name of the Data Model"
        value={meta.shortname}
        onChange={x => action('shortname', x)}
      />
    </FormGroup>
  );
};

export default MetaEditPage;
