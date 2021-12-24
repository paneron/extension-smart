import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import { EditorAction } from '../../model/editor/state';
import { MMELMetadata } from '../../serialize/interface/supportinterface';
import { DescriptionItem } from '../common/description/fields';
import { NormalTextField } from '../common/fields';

const MetaEditPage: React.FC<{
  meta: MMELMetadata;
  act: (x: EditorAction) => void;
}> = ({ meta, act }) => {
  return (
    <FormGroup>
      <DescriptionItem label="Namespace" value={meta.namespace} />
      <NormalTextField
        text="Data Model Schema"
        value={meta.schema}
        onChange={x =>
          act({ type: 'model', act: 'meta', property: 'schema', value: x })
        }
      />
      <NormalTextField
        text="Author"
        value={meta.author}
        onChange={x =>
          act({ type: 'model', act: 'meta', property: 'author', value: x })
        }
      />
      <NormalTextField
        text="Title of the Data Model"
        value={meta.title}
        onChange={x =>
          act({ type: 'model', act: 'meta', property: 'title', value: x })
        }
      />
      <NormalTextField
        text="Edition of the Data Model"
        value={meta.edition}
        onChange={x =>
          act({ type: 'model', act: 'meta', property: 'edition', value: x })
        }
      />
      <NormalTextField
        text="Short name of the Data Model"
        value={meta.shortname}
        onChange={x =>
          act({ type: 'model', act: 'meta', property: 'shortname', value: x })
        }
      />
    </FormGroup>
  );
};

export default MetaEditPage;
