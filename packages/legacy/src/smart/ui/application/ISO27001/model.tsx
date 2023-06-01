import { MeasureResult } from '@/smart/model/Measurement';

export interface Application27001Setting {
  source: string;
  failMonitor: SettingRange;
  connectionRefLine: number;
}

export interface SettingRange {
  min: number;
  max: number;
}

export interface Dialog27001Interface {
  title: string;
  content: React.FC<{
    onClose: () => void;
    setting: Application27001Setting;
    setSetting: (s: Application27001Setting) => void;
    onError: (s: string) => void;
    onMessage: (s: string) => void;
  }>;
  fullscreen: boolean;
}

export interface StreamReading {
  failed: number;
  login: number;
  connections: number[];
}

export interface Log27001Record {
  time: Date;
  result: MeasureResult;
  data: StreamReading;
}

export interface Log27001 {
  hasFail: boolean;
  records: Log27001Record[];
}

export const fixedlocalhost = 'localhost:27001';
