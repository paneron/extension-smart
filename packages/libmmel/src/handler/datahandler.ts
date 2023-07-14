import { DataType } from '@/interface/baseinterface';
import {
  MMELDataAttribute,
  MMELDataClass,
  MMELEnum,
  MMELEnumValue,
  MMELRegistry,
} from '@/interface/datainterface';
import {
  MMELremovePackage,
  MMELtokenizeAttributes,
  MMELtokenizePackage,
  MMELtokenizeSet,
} from '@/util/tokenizer';

export function parseDataAttribute(
  basic: string,
  details: string
): MMELDataAttribute {
  const attribute: MMELDataAttribute = {
    id          : '',
    type        : '',
    modality    : '',
    cardinality : '',
    definition  : '',
    ref         : new Set<string>(),
    datatype    : DataType.DATAATTRIBUTE,
  };

  let index = basic.indexOf('[');
  if (index !== -1) {
    attribute.cardinality = basic.substring(index + 1, basic.length - 1).trim();
    basic = basic.substring(0, index);
  }
  index = basic.indexOf(':');
  if (index !== -1) {
    attribute.type = basic.substring(index + 1).trim();
    basic = basic.substring(0, index);
  }
  attribute.id = basic.trim();
  if (details !== '') {
    const t: string[] = MMELtokenizePackage(details);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'modality') {
          attribute.modality = t[i++];
        } else if (command === 'definition') {
          attribute.definition = MMELremovePackage(t[i++]);
        } else if (command === 'reference') {
          attribute.ref = MMELtokenizeSet(t[i++]);
        } else {
          throw new Error(
            'Parsing error: data class attribute. ID ' +
              attribute.id +
              ': Unknown keyword ' +
              command
          );
        }
      } else {
        throw new Error(
          'Parsing error: data class attribute. ID ' +
            attribute.id +
            ': Expecting value for ' +
            command
        );
      }
    }
  }
  return attribute;
}

export function parseDataClass(id: string, data: string): MMELDataClass {
  const dc: MMELDataClass = {
    id         : id,
    attributes : {},
    datatype   : DataType.DATACLASS,
  };

  if (data !== '') {
    const t: string[] = MMELtokenizeAttributes(data);
    let i = 0;
    while (i < t.length) {
      const basic: string = t[i++];
      if (i < t.length) {
        const details: string = t[i++];
        const att = parseDataAttribute(basic.trim(), details);
        dc.attributes[att.id] = att;
      } else {
        throw new Error(
          'Parsing error: class. ID ' + id + ': Expecting { after ' + basic
        );
      }
    }
  }
  return dc;
}

export function parseEnumValue(id: string, data: string): MMELEnumValue {
  const ev: MMELEnumValue = {
    id       : id,
    value    : '',
    datatype : DataType.ENUMVALUE,
  };
  if (data !== '') {
    const t: string[] = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'definition') {
          ev.value = MMELremovePackage(t[i++]);
        } else {
          throw new Error(
            'Parsing error: enum value. ID ' +
              id +
              ': Unknown keyword ' +
              command
          );
        }
      } else {
        throw new Error(
          'Parsing error: enum value. ID ' +
            id +
            ': Expecting value for ' +
            command
        );
      }
    }
  }
  return ev;
}

export function parseEnum(id: string, data: string): MMELEnum {
  const e: MMELEnum = {
    id       : id,
    values   : {},
    datatype : DataType.ENUM,
  };
  if (data !== '') {
    const t: string[] = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const vid: string = t[i++];
      if (i < t.length) {
        const vcontent: string = t[i++];
        const ev = parseEnumValue(vid, vcontent);
        e.values[ev.id] = ev;
      } else {
        throw new Error(
          'Parsing error: enum. ID ' +
            id +
            ': Empty definition for value ' +
            vid
        );
      }
    }
  }
  return e;
}

export function parseRegistry(id: string, data: string): MMELRegistry {
  const reg: MMELRegistry = {
    id       : id,
    title    : '',
    data     : '',
    datatype : DataType.REGISTRY,
  };

  if (data !== '') {
    const t: string[] = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'title') {
          reg.title = MMELremovePackage(t[i++]);
        } else if (command === 'data_class') {
          reg.data = t[i++];
        } else {
          throw new Error(
            'Parsing error: registry. ID ' + id + ': Unknown keyword ' + command
          );
        }
      } else {
        throw new Error(
          'Parsing error: registry. ID ' +
            id +
            ': Expecting value for ' +
            command
        );
      }
    }
  }
  return reg;
}
