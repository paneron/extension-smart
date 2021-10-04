import { MeasureResult } from '../../../model/Measurement';

export interface Application2060Setting {
  source: string;
  emissions: EmissionSource[];
}

export interface EmissionSource {
  name: string;
  box?: BoundingBox;
}

export interface BoundingBox {
  minx: number;
  miny: number;
  minz: number;
  maxx: number;
  maxy: number;
  maxz: number;
}

export interface Dialog2060Interface {
  title: string;
  content: React.FC<{
    onClose: () => void;
    setting: Application2060Setting;
    setSetting: (s: Application2060Setting) => void;
    onError: (s: string) => void;
    onMessage: (s: string) => void;
  }>;
  fullscreen: boolean;
}

export interface SensorReading {
  x: number;
  y: number;
  z: number;
  v_i: number; // value of included emission
  v_e: number; // value of excluded emission
}

export interface ReadingRecord {
  source: EmissionSource;
  count: number;
  include: number[];
  exclude: number[];
  totalinclude: number;
  total: number;
  result?: MeasureResult;
}

export interface LogRecord {
  time: Date;
  data: ReadingRecord;
}

export interface Log2060 {
  hasFail: boolean;
  records: LogRecord[];
}

export const colors2060 = [
  'orange',
  'green',
  'blue',
  'yellow',
  'lightblue',
  'lightcoral',
  'lightgoldenrodyellow',
  'lightsteelblue',
];

export const fixedlocalhost = 'localhost:2060';
