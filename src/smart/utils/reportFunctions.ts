import {
  EditorModel,
  isEditorApproval,
  isEditorProcess,
} from '../model/editormodel';
import { getNamespace, Logger, referenceSorter } from './ModelFunctions';
import { MapProfile } from '../model/mapmodel';
import { Liquid } from 'liquidjs';
import { MMELToSerializable } from './repo/io';

export function genReport(
  text: string,
  mapProfile: MapProfile,
  ref: EditorModel,
  imp: EditorModel
): string {
  const refns = getNamespace(ref);
  const mapSet = mapProfile.mapSet[refns];
  if (mapSet === undefined) {
    alert(`Mapping to implementation model (ns: ${refns}) is not defined`);
    return text;
  }
  const records: RefRecord[] = Object.values(ref.refs)
    .sort(referenceSorter)
    .map(x => ({
      id            : x.id,
      clause        : x.clause,
      title         : x.title,
      description   : '',
      justification : new Set<string>(),
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
          refMap[r].justification.add(map.description);
        }
      }
    }
  }

  try {
    const out = parseCode(text, records, mapProfile, imp, ref);
    return out;
  } catch (e) {
    return e as string;
  }
}

function parseCode(
  code: string,
  records: RefRecord[],
  rawMapping: MapProfile,
  imp: EditorModel,
  ref: EditorModel
): string {
  const engine = new Liquid();
  const impjson = MMELToSerializable(imp);
  const refjson = MMELToSerializable(ref);
  const rec: SectionRecord[] = records.map(x => ({
    ...x,
    justification : [...x.justification],
  }));
  Logger.log(rec, rec.length);
  const params = {
    map    : rec,
    raw    : rawMapping,
    imodel : impjson,
    rmodel : refjson,
  };
  try {
    const out = engine.parseAndRenderSync(code, params);
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
  justification: Set<string>;
}

interface SectionRecord {
  id: string;
  clause: string;
  title: string;
  description: string;
  justification: string[];
}
