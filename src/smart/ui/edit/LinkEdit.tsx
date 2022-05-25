import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import {
  LINK_TYPE,
  LINK_TYPES,
  MMELLink,
} from '../../serialize/interface/supportinterface';
import { NormalComboBox, NormalTextField } from '../common/fields';
import { IObject } from '../common/listmanagement/listPopoverItem';

export function matchLinkFilter(x: IObject, filter: string): boolean {
  const link = x as MMELLink;
  return filter === '' || link.title.toLowerCase().includes(filter);
}

export const LinkItem: React.FC<{
  object: MMELLink;
  setObject: (obj: MMELLink) => void;
}> = ({ object: link, setObject: setLink }) => {
  return (
    <FormGroup>
      <NormalComboBox
        text="Note type"
        value={link.type}
        options={LINK_TYPES}
        onChange={x => setLink({ ...link, type : x as LINK_TYPE })}
      />
      <NormalTextField
        text="Title"
        value={link.title}
        onChange={x => setLink({ ...link, title : x })}
      />
      <NormalTextField
        text="Description"
        value={link.description}
        onChange={x => setLink({ ...link, description : x })}
      />
      <NormalTextField
        text="Link"
        value={link.link}
        onChange={x => setLink({ ...link, link : x })}
      />
    </FormGroup>
  );
};
