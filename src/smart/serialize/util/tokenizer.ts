import { isSpace } from '../../utils/ModelFunctions';

export function MMELtokenize(x: string): Array<string> {
  const set: Array<string> = [];
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

export function MMELtokenizePackage(x: string): string[] {
  return MMELtokenize(MMELremovePackage(x));
}

export function MMELtokenizeSet(x: string): Set<string> {
  const set = new Set<string>();
  MMELtokenizePackage(x).forEach(y => set.add(y));
  return set;
}

export function MMELremovePackage(x: string): string {
  if (x.length >= 2) {
    return x.substring(1, x.length - 1);
  } else {
    return x;
  }
}

export function MMELtokenizeAttributes(x: string): Array<string> {
  x = MMELremovePackage(x);
  const set: Array<string> = [];
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
