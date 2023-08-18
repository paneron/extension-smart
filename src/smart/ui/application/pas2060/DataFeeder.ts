import type { SensorReading } from '@/smart/ui/application/pas2060/model';
import { fixedlocalhost } from '@/smart/ui/application/pas2060/model';

export function obtainData(url: string): SensorReading[] {
  if (url === fixedlocalhost) {
    return getSensorReadings();
  } else {
    throw `Cannot make connection: ${url}`;
  }
}

interface SimulatorParameter {
  min_i: number; // minimum of included emission
  max_i: number; // maximum of included emission
  min_e: number; // minimum of excluded emission
  max_e: number;
}

type LocationPara = [number, number, number, SimulatorParameter];

const locations: LocationPara[] = [
  // for building 1
  [70, 60, 0, { min_i : 950, max_i : 1050, min_e : 1, max_e : 5 }],
  [70, 60, 0, { min_i : 950, max_i : 1050, min_e : 1, max_e : 5 }],
  [70, 60, 0, { min_i : 950, max_i : 1050, min_e : 1, max_e : 5 }],
  [70, 60, 0, { min_i : 1050, max_i : 1150, min_e : 1, max_e : 5 }],

  // for building 2
  [125, 20, 0, { min_i : 970, max_i : 1070, min_e : 5, max_e : 10 }],
  [125, 20, 0, { min_i : 970, max_i : 1070, min_e : 5, max_e : 10 }],
  [125, 20, 0, { min_i : 970, max_i : 1070, min_e : 5, max_e : 10 }],
  [125, 20, 0, { min_i : 970, max_i : 1070, min_e : 5, max_e : 10 }],
  [125, 20, 0, { min_i : 970, max_i : 1070, min_e : 5, max_e : 10 }],
  [125, 20, 0, { min_i : 970, max_i : 1070, min_e : 5, max_e : 10 }],

  // for building 3
  [5, 15, 0, { min_i : 3500, max_i : 4500, min_e : 25, max_e : 30 }],
  [5, 15, 0, { min_i : 95, max_i : 100, min_e : 1, max_e : 2 }],
  [5, 15, 0, { min_i : 95, max_i : 100, min_e : 1, max_e : 2 }],
  [5, 15, 0, { min_i : 95, max_i : 100, min_e : 1, max_e : 2 }],

  // for building 4
  [10, 90, 0, { min_i : 950, max_i : 1050, min_e : 10, max_e : 15 }],
  [10, 90, 0, { min_i : 950, max_i : 1050, min_e : 10, max_e : 15 }],
  [10, 90, 0, { min_i : 950, max_i : 1050, min_e : 10, max_e : 15 }],
  [10, 90, 0, { min_i : 950, max_i : 1050, min_e : 1, max_e : 5 }],
  [10, 90, 0, { min_i : 950, max_i : 1050, min_e : 50, max_e : 70 }],

  // not in any buildings
  [100, 100, 0, { min_i : 950, max_i : 1050, min_e : 5, max_e : 15 }],
  [100, 100, 0, { min_i : 950, max_i : 1050, min_e : 5, max_e : 15 }],
];

function getSensorReadings(): SensorReading[] {
  return locations.map(l => processLocation(l));
}

function processLocation(l: LocationPara): SensorReading {
  const [x, y, z, para] = l;
  const { min_i, max_i, min_e, max_e } = para;
  return {
    x,
    y,
    z,
    v_i : genReading(min_i, max_i),
    v_e : genReading(min_e, max_e),
  };
}

function genReading(low: number, high: number): number {
  const range = high - low + 1;
  return Math.random() * range + low;
}
