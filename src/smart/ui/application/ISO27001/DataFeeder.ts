import type { SettingRange, StreamReading } from '@/smart/ui/application/ISO27001/model';
import { fixedlocalhost } from '@/smart/ui/application/ISO27001/model';

export function obtainData(url: string, time = 0): StreamReading {
  if (url === fixedlocalhost && time !== undefined) {
    return getStreamReadings(time);
  } else {
    throw `Cannot make connection: ${url}`;
  }
}

interface Bias {
  time: number;
  duration: number;
  cycle: number;
  bias: SettingRange;
}

const numUserSetting: SettingRange = { min : 20, max : 100 };
const failRateSetting: SettingRange = { min : 0.1, max : 0.2 };
const connectionSetting: SettingRange = { min : 1, max : 20 };
const connectionBias: Bias[] = [
  { time : 4, duration : 3, cycle : 11, bias : { min : 1, max : 3 }},
  { time : 10, duration : 2, cycle : 10, bias : { min : 95, max : 120 }},
];
const loginBias: Bias[] = [
  { time : 5, duration : 1, cycle : 10, bias : { min : 0.8, max : 0.9 }},
];

function getStreamReadings(time: number): StreamReading {
  let fr = failRateSetting;
  let cs = connectionSetting;
  for (const x of loginBias) {
    if ((time + x.cycle - x.time) % x.cycle < x.duration) {
      fr = x.bias;
    }
  }
  for (const x of connectionBias) {
    if ((time + x.cycle - x.time) % x.cycle < x.duration) {
      cs = x.bias;
    }
  }
  const numUsers = Math.round(genReading(numUserSetting));
  const failRate = genReading(fr);
  const numFailed = Math.round(numUsers * failRate);
  const connections = [
    Math.round(genReading(cs)),
    Math.round(genReading(cs)),
    Math.round(genReading(cs)),
  ];
  return {
    failed      : numFailed,
    login       : numUsers,
    connections : connections,
  };
}

function genReading(setting: SettingRange): number {
  const { min, max } = setting;
  const range = max - min;
  return Math.random() * range + min;
}
