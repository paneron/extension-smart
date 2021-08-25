import {
  EditorModel,
  isEditorApproval,
  isEditorProcess,
} from '../../model/editormodel';
import { referenceSorter } from '../../utils/commonfunctions';
import { MapProfile } from '../mapper/mapmodel';

export function genReport(
  text: string,
  mapProfile: MapProfile,
  ref: EditorModel,
  imp: EditorModel
): string {
  // hardcoded template at the moment
  if (text === 'main' || text === 'annex') {
    const mapSet = mapProfile.mapSet[ref.meta.namespace];
    if (ref.meta.namespace === '' || mapSet === undefined) {
      alert(
        `Mapping to implementation model (ns: ${ref.meta.namespace}) is not defined`
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

    let out =
      '.Statement of applicability\n' +
      '[cols="1,1,1,1"]\n' +
      '|===\n' +
      '|Clause\n' +
      '|Title\n' +
      '|Description\n' +
      '|Justification\n\n';

    for (const r of records) {
      if (
        (r.clause.charAt(0) === 'A' && text === 'annex') ||
        (r.clause.charAt(0) !== 'A' && text === 'main')
      ) {
        if (r.justfication.size === 0) {
          out += `4+|Clause ${r.clause} ${r.title}\n`;
        } else {
          for (const just of r.justfication) {
            out +=
              `|${r.clause}\n` +
              `|${r.title}\n` +
              `|${r.clause.charAt(0) === 'A' ? r.description : ''}\n` +
              `|${just}\n\n`;
          }
        }
      }
    }
    out += '|===\n';
    return out;
  } else {
    return customGenReport(text, mapProfile, ref, imp);
  }
}

function customGenReport(
  text: string,
  mapProfile: MapProfile,
  ref: EditorModel,
  imp: EditorModel
): string {
  const mapSet = mapProfile.mapSet[ref.meta.namespace];
  if (ref.meta.namespace === '' || mapSet === undefined) {
    alert(
      `Mapping to implementation model (ns: ${ref.meta.namespace}) is not defined`
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
  try {
    const program = `
      "use strict";      
      function f(map) {
    	  ${text}
      }
  	  return f;
    `;        
    const out = Function(program)()(records);
    return out;
  } catch (e:any) {
    if (e.messgae && e.stack) {
      return e.message + '\n' + e.stack;
    } else {
      return 'Unknown error';
    }
  }
}

interface RefRecord {
  id: string;
  clause: string;
  title: string;
  description: string;
  justfication: Set<string>;
}
