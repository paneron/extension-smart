/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { SMARTDocumentStore } from '../../model/workspace';
import { ReferenceSelector } from '../common/fields';

const ReferenceAttributes: React.FC<{
  value: string;
  title: string;
  onChange: (x: string) => void;
  store: SMARTDocumentStore;
  regtitle: string;
}> = function ({ value, title, onChange, store, regtitle }) {
  const options: string[] = Object.values(store.docs).map(d => d.name);

  function update(x: number) {
    onChange(options[x]);
  }

  return (
    <ReferenceSelector
      filterName={`${regtitle} filter`}
      text={title}
      options={options}
      value={value}
      update={update}
    />
  );
};

export default ReferenceAttributes;
