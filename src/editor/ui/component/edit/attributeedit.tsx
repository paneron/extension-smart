/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import { MMELModel } from '../../../serialize/interface/model';
import { IAttribute, IAttributeContainer } from '../../interface/datainterface';
import { AttributeHandler } from '../handle/attributehandler';
import ItemAddPane from '../unit/itemadd';
import ItemUpdatePane from '../unit/itemupdate';
import ListManagerPane from '../unit/listmanage';

const AttributeEditPage: React.FC<{
  model: MMELModel;
  atts: IAttributeContainer;
  setAtts: (x: IAttributeContainer) => void;
}> = ({ model, atts, setAtts }) => {
  const [isAdd, setAddMode] = useState(false);
  const [isUpdate, setUpdateMode] = useState(false);
  const [attribute, setUpdateAttribute] = useState<IAttribute | null>(null);
  const [data, setData] = useState<IAttribute>({
    id: '',
    definition: '',
    type: '',
    modality: '',
    cardinality: '',
    ref: [],
  });

  const forceUpdate = () => {
    setAtts({ ...atts });
  };

  const handle = new AttributeHandler(
    model,
    atts,
    attribute,
    setAddMode,
    setUpdateMode,
    setUpdateAttribute,
    forceUpdate,
    data,
    setData
  );

  return (
    <fieldset>
      <legend>Attributes:</legend>
      <div style={{ display: !isAdd && !isUpdate ? 'inline' : 'none' }}>
        <ListManagerPane {...handle} />
      </div>
      <div style={{ display: isAdd ? 'inline' : 'none' }}>
        <ItemAddPane {...handle} />
      </div>
      <div style={{ display: isUpdate ? 'inline' : 'none' }}>
        <ItemUpdatePane {...handle} />
      </div>
    </fieldset>
  );
};

export default AttributeEditPage;
