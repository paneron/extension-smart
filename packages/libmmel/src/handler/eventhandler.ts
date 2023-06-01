import { DataType } from '@/interface/baseinterface';
import { MMELremovePackage, MMELtokenizePackage } from '@/util/tokenizer';
import {
  MMELEndEvent,
  MMELSignalCatchEvent,
  MMELStartEvent,
  MMELTimerEvent,
} from '../interface/eventinterface';

export function parseEndEvent(id: string, data: string): MMELEndEvent {
  const end: MMELEndEvent = {
    id       : id,
    datatype : DataType.ENDEVENT,
  };
  if (data !== '') {
    const t: string[] = MMELtokenizePackage(data);
    if (t.length > 0) {
      throw new Error(
        'Parsing error: end_event. ID ' + id + ': Expecting empty body'
      );
    }
  }
  return end;
}

export function parseSignalCatchEvent(
  id: string,
  data: string
): MMELSignalCatchEvent {
  const sc: MMELSignalCatchEvent = {
    id       : id,
    datatype : DataType.SIGNALCATCHEVENT,
    signal   : '',
  };

  if (data !== '') {
    const t: string[] = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'catch') {
          sc.signal = MMELremovePackage(t[i++]);
        } else {
          throw new Error(
            'Parsing error: Signal Catch Event. ID ' +
              id +
              ': Unknown keyword ' +
              command
          );
        }
      } else {
        throw new Error(
          'Parsing error: Signal Catch Event. ID ' +
            id +
            ': Expecting value for ' +
            command
        );
      }
    }
  }
  return sc;
}

export function parseStartEvent(id: string, data: string): MMELStartEvent {
  const start: MMELStartEvent = {
    id       : id,
    datatype : DataType.STARTEVENT,
  };

  if (data !== '') {
    const t: string[] = MMELtokenizePackage(data);
    if (t.length > 0) {
      throw new Error(
        'Parsing error: start_event. ID ' + id + ': Expecting empty body'
      );
    }
  }
  return start;
}

export function parseTimerEvent(id: string, data: string): MMELTimerEvent {
  const te: MMELTimerEvent = {
    id       : id,
    datatype : DataType.TIMEREVENT,
    type     : '',
    para     : '',
  };

  if (data !== '') {
    const t: string[] = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'type') {
          te.type = t[i++];
        } else if (command === 'para') {
          te.para = MMELremovePackage(t[i++]);
        } else {
          throw new Error(
            'Parsing error: Timer Event. ID ' +
              id +
              ': Unknown keyword ' +
              command
          );
        }
      } else {
        throw new Error(
          'Parsing error: Timer Event. ID ' +
            id +
            ': Expecting value for ' +
            command
        );
      }
    }
  }
  return te;
}
