/**
 * Parsing is done by tokenizing the text files, and then converting the tokens to the model.
 * Not much error handling is implemented as the MMEL file structure is assumed to be correct.
 */

function isSpace(x: string): boolean {
  return /\s/.test(x);
}

/**
 *  Convert text to an array of tokens
 */
export function MMELtokenize(x: string): string[] {
  const set: string[] = [];
  let t = '';
  let i = 0;
  while (i < x.length) {
    let char: string = x.charAt(i);
    if (!isSpace(char)) {
      t += char;
      i++;
      if (char === '"') {
        while (i < x.length && x.charAt(i) !== '"') {
          t += x.charAt(i);
          i++;
        }
        t += x.charAt(i);
        i++;
      } else if (char === '{') {
        let count = 1;
        while (i < x.length && count > 0) {
          char = x.charAt(i);
          if (char === '{') {
            count++;
          }
          if (char === '}') {
            count--;
          }
          t += char;
          i++;
        }
        i++;
      } else {
        while (i < x.length && !isSpace(x.charAt(i))) {
          t += x.charAt(i);
          i++;
        }
      }
      set.push(t);
      t = '';
    } else {
      i++;
    }
  }
  return set;
}

/**
 * The next item is enclosed by something, say "". Remove the enclosing stuffs and perform tokenization
 */
export function MMELtokenizePackage(x: string): string[] {
  return MMELtokenize(MMELremovePackage(x));
}

/**
 *  The data is a set of IDs enclosed in {}. Remove the {} and put each ID into a set
 */
export function MMELtokenizeSet(x: string): Set<string> {
  const set = new Set<string>();
  MMELtokenizePackage(x).forEach(y => set.add(y));
  return set;
}

/**
 * Remove the enclosing stuffs
 */
export function MMELremovePackage(x: string): string {
  if (x.length >= 2) {
    return x.substring(1, x.length - 1);
  } else {
    return x;
  }
}

/**
 * It is specifically used for parsing attribute definitions
 */
export function MMELtokenizeAttributes(x: string): string[] {
  x = MMELremovePackage(x);
  const set: string[] = [];
  let t = '';
  let i = 0;
  while (i < x.length) {
    let char: string = x.charAt(i);
    if (!isSpace(char)) {
      t += char;
      i++;
      if (char === '{') {
        let count = 1;
        while (i < x.length && count > 0) {
          char = x.charAt(i);
          if (char === '{') {
            count++;
          }
          if (char === '}') {
            count--;
          }
          t += char;
          i++;
        }
        i++;
      } else {
        while (i < x.length && x.charAt(i) !== '{') {
          t += x.charAt(i);
          i++;
        }
      }
      set.push(t);
      t = '';
    } else {
      i++;
    }
  }
  return set;
}
