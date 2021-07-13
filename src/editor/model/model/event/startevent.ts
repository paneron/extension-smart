import { EventNode } from './event';
import * as tokenizer from '../../util/tokenizer';

export class StartEvent extends EventNode {
  constructor(id: string, data: string) {
    super(id);
    if (data != '') {
      const t: Array<string> = tokenizer.tokenizePackage(data);
      if (t.length > 0) {
        console.error(
          'Parsing error: start_event. ID ' + id + ': Expecting empty body'
        );
      }
    }
  }

  toModel(): string {
    return 'start_event ' + this.id + ' {\n}\n';
  }
}
