import * as tokenizer from '../../util/tokenizer';

export class Mapping {
  from = '';
  to = '';

  constructor(data: string) {
    if (data != '') {
      const t: Array<string> = tokenizer.tokenizePackage(data);
      let i = 0;
      while (i < t.length) {
        const command: string = t[i++];
        if (i < t.length) {
          if (command == 'from') {
            this.from = t[i++];
          } else if (command == 'to') {
            this.to = t[i++];
          } else {
            console.error('Parsing error: mapping. Unknown keyword ' + command);
          }
        } else {
          console.error(
            'Parsing error: mapping. Expecting value for ' + command
          );
        }
      }
    }
  }

  toModel(): string {
    let out = '  mapping {\n';
    out += '    from ' + this.from + '\n';
    out += '    to ' + this.to + '\n';
    out += '  }\n';
    return out;
  }
}
