import { Gateway } from './gate';
import * as tokenizer from '../../util/tokenizer';

export class EGate extends Gateway {
  label = '';

  required: boolean | null = null;
  met: boolean | null = null;

  constructor(id: string, data: string) {
    super(id);
    if (data != '') {
      const t: Array<string> = tokenizer.tokenizePackage(data);
      let i = 0;
      while (i < t.length) {
        const command: string = t[i++];
        if (i < t.length) {
          if (command == 'label') {
            this.label = tokenizer.removePackage(t[i++]);
          } else {
            console.error(
              'Parsing error: Exclusive gateway. ID ' +
                id +
                ': Unknown keyword ' +
                command
            );
          }
        } else {
          console.error(
            'Parsing error: Exclusive gateway. ID ' +
              id +
              ': Expecting value for ' +
              command
          );
        }
      }
    }
  }

  toModel(): string {
    let out: string = 'exclusive_gateway ' + this.id + ' {\n';
    if (this.label != '') {
      out += '  label "' + this.label + '"\n';
    }
    out += '}\n';
    return out;
  }
}
