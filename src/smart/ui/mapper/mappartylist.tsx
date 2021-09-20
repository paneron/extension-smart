/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { mgd_label } from '../../../css/form';
import { popover_panel_container } from '../../../css/layout';
import { ModelType } from '../../model/editormodel';
import { MappingType } from '../../model/mapmodel';
import {
  findImpMapPartners,
  findRefMapPartners,
} from '../../utils/MappingCalculator';
import { EditMappingButton, MapPartnerNavigateButton } from '../common/buttons';

const MappingPartyList: React.FC<{
  id: string;
  type: ModelType;
  mapping: MappingType;
  onMappingEdit: (from: string, to: string) => void;
  issueNavigationRequest?: (id: string) => void;
  getNodeInfoById: (id: string) => string;
}> = function ({
  id,
  type,
  mapping,
  onMappingEdit,
  issueNavigationRequest,
  getNodeInfoById,
}) {
  function onEditClick(partner: string) {
    if (type === ModelType.IMP) {
      onMappingEdit(id, partner);
    } else {
      onMappingEdit(partner, id);
    }
  }

  const method =
    type === ModelType.IMP ? findRefMapPartners : findImpMapPartners;
  const partnersIds = method(id, mapping);
  const partners = partnersIds
    .map(id => ({ id: id, name: getNodeInfoById(id) }))
    .filter(x => x.name !== '');

  return (
    <div css={popover_panel_container}>
      {partners.map(p => (
        <MappingPartnerEntry
          key={`popover#mapping#${p.id}`}
          id={p.id}
          name={p.name}
          onEdit={onEditClick}
          onNavigate={issueNavigationRequest}
        />
      ))}
    </div>
  );
};

export default MappingPartyList;

const MappingPartnerEntry: React.FC<{
  id: string;
  name: string;
  onEdit: (id: string) => void;
  onNavigate?: (id: string) => void;
}> = function ({ id, name, onEdit, onNavigate }) {
  return (
    <div>
      <label css={mgd_label}> {name} </label>
      <EditMappingButton onClick={() => onEdit(id)} />
      {onNavigate !== undefined && (
        <MapPartnerNavigateButton onClick={() => onNavigate(id)} />
      )}
    </div>
  );
};
