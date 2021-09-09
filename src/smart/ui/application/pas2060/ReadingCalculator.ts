import { EditorModel } from '../../../model/editormodel';
import { EnviromentValues } from '../../../model/Measurement';
import { checkModelMeasurement } from '../../../utils/measurement/Checker';
import { EmissionSource, ReadingRecord, SensorReading } from './model';

export function propagateReadings(
  readings: SensorReading[],
  source: EmissionSource[]
): [ReadingRecord[], number] {
  const records: ReadingRecord[] = source.map(s => makeRecord(s));
  let count = 0;
  for (const s of readings) {
    let used = false;
    for (const r of records) {
      const box = r.source.box;
      if (
        box !== undefined &&
        matchRange(s.x, box.minx, box.maxx) &&
        matchRange(s.y, box.miny, box.maxy) &&
        matchRange(s.z, box.minz, box.maxz)
      ) {
        r.count++;
        used = true;
        r.include.push(s.v_i);
        r.exclude.push(s.v_e);
        r.totalinclude += s.v_i;
        r.total += s.v_i + s.v_e;
      }
    }
    if (!used) {
      count++;
    }
  }
  return [records, count];
}

export function makeRecord(s: EmissionSource): ReadingRecord {
  return {
    source: s,
    include: [],
    exclude: [],
    count: 0,
    totalinclude: 0,
    total: 0,
  };
}

export function testMeasurement2060(
  model: EditorModel,
  records: ReadingRecord[]
) {
  records.forEach((r, index) => {
    records[index] = {
      ...r,
      result:
        r.include.length > 0
          ? checkModelMeasurement(model, getPAS2060Values(r))
          : undefined,
      source: {
        ...r.source,
        name: r.source.name === '' ? `Source ${index + 1}` : r.source.name,
      },
    };
  });
}

function getPAS2060Values(record: ReadingRecord): EnviromentValues {
  return {
    Included_Emission: record.include,
    Excluded_Emission: record.exclude,
  };
}

function matchRange(x: number, minx: number, maxx: number): boolean {
  return x >= minx && x <= maxx;
}
