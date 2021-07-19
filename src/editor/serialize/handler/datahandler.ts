import { DataType } from '../interface/baseinterface';
import {
  MMELDataAttribute,
  MMELDataClass,
  MMELEnum,
  MMELEnumValue,
  MMELRegistry,
  ParsingDataAttribute,
  ParsingDataClass,
  ParsingRegistry,
} from '../interface/datainterface';
import { MMELReference } from '../interface/supportinterface';
import {
  MMELremovePackage,
  MMELtokenizeAttributes,
  MMELtokenizePackage,
} from '../util/tokenizer';

export function parseDataAttribute(
  basic: string,
  details: string
): ParsingDataAttribute {
  const attribute: MMELDataAttribute = {
    id: '',
    type: '',
    modality: '',
    cardinality: '',
    definition: '',
    ref: [],
    satisfy: [],
    datatype: DataType.DATAATTRIBUTE,
  };
  const container: ParsingDataAttribute = {
    content: attribute,
    p_ref: [],
  };
  let index = basic.indexOf('[');
  if (index !== -1) {
    attribute.cardinality = basic
      .substr(index + 1, basic.length - index - 2)
      .trim();
    basic = basic.substr(0, index);
  }
  index = basic.indexOf(':');
  if (index !== -1) {
    attribute.type = basic.substr(index + 1, basic.length - index - 1).trim();
    basic = basic.substr(0, index);
  }
  attribute.id = basic.trim();
  if (details !== '') {
    const t: Array<string> = MMELtokenizePackage(details);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'modality') {
          attribute.modality = t[i++];
        } else if (command === 'definition') {
          attribute.definition = MMELremovePackage(t[i++]);
        } else if (command === 'reference') {
          container.p_ref = MMELtokenizePackage(t[i++]);
        } else if (command === 'satisfy') {
          attribute.satisfy = MMELtokenizePackage(t[i++]);
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
  return container;
}

export function resolveAttribute(
  a: ParsingDataAttribute,
  idreg: Map<string, MMELReference>
): MMELDataAttribute {
  const attribute = a.content;
  for (const x of a.p_ref) {
    const y = idreg.get(x);
    if (y !== undefined) {
      attribute.ref.push(y);
    } else {
      throw new Error(
        'Error in resolving IDs in reference for data attributes ' +
          attribute.id
      );
    }
  }
  return attribute;
}

export function parseDataClass(id: string, data: string): ParsingDataClass {
  const dc: MMELDataClass = {
    id: id,
    attributes: [],
    datatype: DataType.DATACLASS,
  };
  const container: ParsingDataClass = {
    content: dc,
    p_attribute: [],
  };

  if (data !== '') {
    const t: Array<string> = MMELtokenizeAttributes(data);
    let i = 0;
    while (i < t.length) {
      const basic: string = t[i++];
      if (i < t.length) {
        const details: string = t[i++];
        container.p_attribute.push(parseDataAttribute(basic.trim(), details));
      } else {
        throw new Error(
          'Parsing error: class. ID ' + id + ': Expecting { after ' + basic
        );
      }
    }
  }
  return container;
}

export function resolveDataClass(
  container: ParsingDataClass,
  idreg: Map<string, MMELReference>
): MMELDataClass {
  const dc = container.content;
  for (const x of container.p_attribute) {
    dc.attributes.push(resolveAttribute(x, idreg));
  }
  return dc;
}

export function parseEnumValue(id: string, data: string): MMELEnumValue {
  const ev: MMELEnumValue = {
    id: id,
    value: '',
    datatype: DataType.ENUMVALUE,
  };
  if (data !== '') {
    const t: Array<string> = MMELtokenizePackage(data);
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
    id: id,
    values: [],
    datatype: DataType.ENUM,
  };
  if (data !== '') {
    const t: Array<string> = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const vid: string = t[i++];
      if (i < t.length) {
        const vcontent: string = t[i++];
        e.values.push(parseEnumValue(vid, vcontent));
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

export function parseRegistry(id: string, data: string): ParsingRegistry {
  const reg: MMELRegistry = {
    id: id,
    title: '',
    data: null,
    datatype: DataType.REGISTRY,
  };
  const container: ParsingRegistry = {
    content: reg,
    p_dataclass: '',
  };

  if (data !== '') {
    const t: Array<string> = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'title') {
          reg.title = MMELremovePackage(t[i++]);
        } else if (command === 'data_class') {
          container.p_dataclass = t[i++];
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
  return container;
}

export function resolveRegistry(
  container: ParsingRegistry,
  idreg: Map<string, MMELDataClass>
): MMELRegistry {
  const reg = container.content;
  const y = idreg.get(container.p_dataclass);
  if (y !== undefined) {
    reg.data = y;
  } else {
    throw new Error(
      'Error in resolving IDs in data class for registry ' + reg.id
    );
  }
  return reg;
}
