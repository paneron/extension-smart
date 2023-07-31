import React from 'react';
import { mgdLabel } from '@/css/form';
import { popoverPanelContainer } from '@/css/layout';
import { ModelType } from '@/smart/model/editormodel';
import { MappingType } from '@/smart/model/mapmodel';
import {
  findImpMapPartners,
  findRefMapPartners,
} from '@/smart/utils/map/MappingCalculator';
import { EditMappingButton, MapPartnerNavigateButton } from '@/smart/ui/common/buttons';

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
  const partners = partnersIds.map(id => ({
    id   : id,
    name : getNodeInfoById(id),
  }));

  return (
    <div style={popoverPanelContainer}>
      {partners.map(p => (
        <MappingPartnerEntry
          key={p.id}
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
      <label style={mgdLabel}> {name} </label>
      <EditMappingButton onClick={() => onEdit(id)} />
      {onNavigate !== undefined && (
        <MapPartnerNavigateButton onClick={() => onNavigate(id)} />
      )}
    </div>
  );
};
