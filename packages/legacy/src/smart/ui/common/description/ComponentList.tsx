import React from 'react';
import { EditorRegistry } from '@/smart/model/editormodel';
import { MMELDataAttribute } from '@paneron/libmmel/interface/datainterface';
import { MMELEdge } from '@paneron/libmmel/interface/flowcontrolinterface';
import {
  MMELNote,
  MMELProvision,
  MMELReference,
} from '@paneron/libmmel/interface/supportinterface';
import { toRefSummary } from '@/smart/utils/ModelFunctions';
import {
  DescribeEdge,
  DescribeNote,
  DescribeProvision,
} from './ComponentDescription';
import { DescribeAttribute } from '@/smart/ui/common/description/data';

export const ApprovalRecordList: React.FC<{
  regs: EditorRegistry[];
}> = function ({ regs }) {
  return (
    <>
      {regs.length > 0 ? (
        <>
          <p>Approval record(s):</p>
          <ul>
            {regs.map(reg => (
              <li key={reg.id}>{reg.title}</li>
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
  CustomAttribute?: React.FC<{
    att: MMELDataAttribute;
    getRefById?: (id: string) => MMELReference | null;
    dcid: string;
  }>;
  dcid: string;
}> = function ({ attributes, getRefById, CustomAttribute, dcid }) {
  return (
    <>
      {Object.keys(attributes).length > 0 ? (
        <>
          {getRefById !== undefined && <p> Attributes: </p>}
          <ul
            style={
              CustomAttribute !== undefined
                ? { listStyleType : 'none', paddingLeft : 5 }
                : {}
            }
          >
            {Object.entries(attributes).map(([v, att]) => (
              <li key={v}>
                {CustomAttribute !== undefined ? (
                  <CustomAttribute
                    att={att}
                    getRefById={getRefById}
                    dcid={dcid}
                  />
                ) : (
                  <DescribeAttribute att={att} getRefById={getRefById} />
                )}
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
  CustomProvision?: React.FC<{
    provision: MMELProvision;
    getRefById?: (id: string) => MMELReference | null;
  }>;
}> = function ({ provisions, getProvisionById, getRefById, CustomProvision }) {
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
          <ul
            style={
              CustomProvision !== undefined
                ? { listStyleType : 'none', paddingLeft : 5 }
                : {}
            }
          >
            {pros.map((provision: MMELProvision) => (
              <li key={provision.id}>
                {CustomProvision !== undefined ? (
                  <CustomProvision
                    provision={provision}
                    getRefById={getRefById}
                  />
                ) : (
                  <DescribeProvision
                    provision={provision}
                    getRefById={getRefById}
                  />
                )}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
};

export const NotesList: React.FC<{
  notes: Set<string>;
  getNoteById: (id: string) => MMELNote | null;
  getRefById?: (id: string) => MMELReference | null;
}> = function ({ notes, getNoteById, getRefById }) {
  const ns: MMELNote[] = [];
  notes.forEach(r => {
    const ret = getNoteById(r);
    if (ret !== null) {
      ns.push(ret);
    }
  });
  return (
    <>
      {ns.length > 0 ? (
        <>
          {getRefById !== undefined && <p>Notes</p>}
          <ul>
            {ns.map(note => (
              <li key={note.id}>
                <DescribeNote note={note} getRefById={getRefById} />
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
              <li key={edge.id}>
                <DescribeEdge key={`edge#${index}`} edge={edge} />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
};
