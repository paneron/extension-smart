import * as tokenizer from '../../util/tokenizer';

export class Metadata {
  schema = '';
  author = '';
  title = '';
  edition = '';
  namespace = '';

  constructor(x: string) {
    if (x != '') {
      const t: Array<string> = tokenizer.tokenizePackage(x);
      let i = 0;
      while (i < t.length) {
        const command: string = t[i++];
        if (i < t.length) {
          if (command == 'title') {
            this.title = tokenizer.removePackage(t[i++]);
          } else if (command == 'schema') {
            this.schema = tokenizer.removePackage(t[i++]);
          } else if (command == 'edition') {
            this.edition = tokenizer.removePackage(t[i++]);
          } else if (command == 'author') {
            this.author = tokenizer.removePackage(t[i++]);
          } else if (command == 'namespace') {
            this.namespace = tokenizer.removePackage(t[i++]);
          } else {
            console.error(
              'Parsing error: metadata. Unknown keyword ' + command
            );
          }
        } else {
          console.error(
            'Parsing error: metadata. Expecting value for ' + command
          );
        }
      }
    }
  }

  toModel(): string {
    let out = 'metadata {\n';
    out += '  title "' + this.title + '"\n';
    out += '  schema "' + this.schema + '"\n';
    out += '  edition "' + this.edition + '"\n';
    out += '  author "' + this.author + '"\n';
    out += '  namespace "' + this.namespace + '"\n';
    out += '}\n';
    return out;
  }
}
