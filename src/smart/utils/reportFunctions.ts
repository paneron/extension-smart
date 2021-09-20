import {
  EditorModel,
  isEditorApproval,
  isEditorProcess,
} from '../model/editormodel';
import { getNamespace, referenceSorter } from './ModelFunctions';
import { REPORTENDTAG, REPORTSTARTTAG } from './constants';
import { MapProfile } from '../model/mapmodel';

export function genReport(
  text: string,
  mapProfile: MapProfile,
  ref: EditorModel,
  imp: EditorModel
): string {
  const refns = getNamespace(ref)
  const mapSet = mapProfile.mapSet[refns];
  if (mapSet === undefined) {
    alert(
      `Mapping to implementation model (ns: ${refns}) is not defined`
    );
    return text;
  }
  const records: RefRecord[] = Object.values(ref.refs)
    .sort(referenceSorter)
    .map(x => ({
      id: x.id,
      clause: x.clause,
      title: x.title,
      description: '',
      justfication: new Set<string>(),
    }));
  const refMap: Record<string, RefRecord> = {};
  for (const r of records) {
    refMap[r.id] = r;
  }

  for (const from in mapSet.mappings) {
    const maps = mapSet.mappings[from];
    for (const to in maps) {
      const map = maps[to];
      const pto = ref.elements[to];
      const clause = new Set<string>();
      let statement = '';
      if (isEditorProcess(pto)) {
        for (const p of pto.provision) {
          const prov = ref.provisions[p];
          statement = prov.condition;
          for (const r of prov.ref) {
            clause.add(r);
          }
        }
      } else if (isEditorApproval(pto)) {
        for (const r of pto.ref) {
          clause.add(r);
        }
      }
      for (const r of clause) {
        if (map.description !== '') {
          refMap[r].description += statement;
          refMap[r].justfication.add(map.description);
        }
      }
    }
  }

  let remain = text;
  let out = '';
  do {
    const index1 = remain.indexOf(REPORTSTARTTAG);
    const index2 = remain.indexOf(REPORTENDTAG);
    if (index1 !== -1 && index2 > index1) {
      out += remain.substring(0, index1);
      try {
        out += parseCode(
          remain.substring(index1 + REPORTSTARTTAG.length, index2),
          records,
          mapProfile,
          imp,
          ref
        );
      } catch (e) {
        return e as string;
      }
      remain = remain.substring(index2 + REPORTENDTAG.length);
    } else {
      out += remain;
      remain = '';
    }
  } while (remain.trim() !== '');
  return out;
}

function parseCode(
  code: string,
  records: RefRecord[],
  rawMapping: MapProfile,
  imp: EditorModel,
  ref: EditorModel
): string {
  try {
    const program = `
      "use strict";      
      function customFunction(map, raw, imp, ref) {
    	  ${code}
      }
  	  return customFunction;
    `;
    const out = Function(program)()(records, rawMapping, imp, ref);
    return out;
  } catch (e: unknown) {
    if (typeof e === 'object') {
      const error = e as Error;
      throw error.message + '\n' + error.stack;
    }
    throw 'Unknown error';
  }
}

interface RefRecord {
  id: string;
  clause: string;
  title: string;
  description: string;
  justfication: Set<string>;
}
