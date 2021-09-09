import React from 'react';
import { EditorRegistry } from '../../../model/editormodel';
import { MMELDataAttribute } from '../../../serialize/interface/datainterface';
import { MMELEdge } from '../../../serialize/interface/flowcontrolinterface';
import {
  MMELProvision,
  MMELReference,
} from '../../../serialize/interface/supportinterface';
import { toRefSummary } from '../../../utils/ModelFunctions';
import {
  DescribeAttribute,
  DescribeEdge,
  DescribeProvision,
} from './ComponentDescription';

export const ApprovalRecordList: React.FC<{
  regs: EditorRegistry[];
}> = function ({ regs }) {
  return (
    <>
      {regs.length > 0 ? (
        <>
          <p>Appproval record(s):</p>
          <ul>
            {regs.map(reg => (
              <li>{reg.title}</li>
            ))}
          </ul>
        </>
      ) : (
        ''
      )}
    </>
  );
};

export const ReferenceList: React.FC<{
  refs: Set<string>;
  getRefById: (id: string) => MMELReference | null;
}> = function ({ refs, getRefById }) {
  const ref: MMELReference[] = [];
  refs.forEach(r => {
    const ret = getRefById(r);
    if (ret !== null) {
      ref.push(ret);
    }
  });
  return (
    <>
      {refs.size > 0 ? (
        <>
          <p>Reference:</p>
          <ul>
            {ref.map(r => (
              <li key={r.id}> {toRefSummary(r)} </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
};

export const AttributeList: React.FC<{
  attributes: Record<string, MMELDataAttribute>;
  getRefById?: (id: string) => MMELReference | null;
}> = function ({ attributes, getRefById }) {
  return (
    <>
      {Object.keys(attributes).length > 0 ? (
        <>
          {getRefById !== undefined && <p> Attributes: </p>}
          <ul>
            {Object.entries(attributes).map(([v, att]) => (
              <li key={v}>
                <DescribeAttribute att={att} getRefById={getRefById} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        ''
      )}
    </>
  );
};

export const ProvisionList: React.FC<{
  provisions: Set<string>;
  getProvisionById: (id: string) => MMELProvision | null;
  getRefById?: (id: string) => MMELReference | null;
}> = function ({ provisions, getProvisionById, getRefById }) {
  const pros: MMELProvision[] = [];
  provisions.forEach(r => {
    const ret = getProvisionById(r);
    if (ret !== null) {
      pros.push(ret);
    }
  });
  return (
    <>
      {provisions.size > 0 ? (
        <>
          {getRefById !== undefined && <p>Provisions</p>}
          <ul>
            {pros.map((provision: MMELProvision) => (
              <li key={provision.id}>
                <DescribeProvision
                  provision={provision}
                  getRefById={getRefById}
                />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
};

export const MeasurementList: React.FC<{
  measurements: string[];
}> = function ({ measurements }) {
  return (
    <>
      {measurements.length > 0 ? (
        <>
          <p>Measurement tests</p>
          <ul>
            {measurements.map((mea, index) => (
              <li key={`measurement#${index}`}>{mea}</li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
};

export const EdgeList: React.FC<{
  edges: MMELEdge[];
}> = function ({ edges }) {
  return (
    <>
      {edges.length > 0 ? (
        <>
          <p>Outgoing paths</p>
          <ul>
            {edges.map((edge, index) => (
              <li>
                <DescribeEdge key={`edge#${index}`} edge={edge} />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
};
