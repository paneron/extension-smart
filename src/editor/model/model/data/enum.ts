import * as tokenizer from '../../util/tokenizer';

export class EnumValue {
  id = '';
  value = '';

  constructor(id: string, data: string) {
    this.id = id;
    if (data != '') {
      const t: Array<string> = tokenizer.tokenizePackage(data);
      let i = 0;
      while (i < t.length) {
        const command: string = t[i++];
        if (i < t.length) {
          if (command == 'definition') {
            this.value = tokenizer.removePackage(t[i++]);
          } else {
            console.error(
              'Parsing error: enum value. ID ' +
                id +
                ': Unknown keyword ' +
                command
            );
          }
        } else {
          console.error(
            'Parsing error: enum value. ID ' +
              id +
              ': Expecting value for ' +
              command
          );
        }
      }
    }
  }

  toModel(): string {
    let out: string = '  ' + this.id + ' {\n';
    out += '    definition "' + this.value + '"\n';
    out += '  }\n';
    return out;
  }
}

export class Enum {
  id = '';
  values: Array<EnumValue> = [];

  constructor(id: string, data: string) {
    this.id = id;
    if (data != '') {
      const t: Array<string> = tokenizer.tokenizePackage(data);
      let i = 0;
      while (i < t.length) {
        const vid: string = t[i++];
        if (i < t.length) {
          const vcontent: string = t[i++];
          this.values.push(new EnumValue(vid, vcontent));
        } else {
          console.error(
            'Parsing error: enum. ID ' +
              id +
              ': Empty definition for value ' +
              vid
          );
        }
      }
    }
  }

  toModel(): string {
    let out: string = 'enum ' + this.id + ' {\n';
    for (const v of this.values) {
      out += v.toModel();
    }
    out += '}\n';
    return out;
  }
}
