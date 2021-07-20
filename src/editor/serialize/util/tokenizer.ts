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

export function MMELtokenizePackage(x: string): Array<string> {
  return MMELtokenize(MMELremovePackage(x));
}

export function MMELremovePackage(x: string): string {
  if (x.length >= 2) {
    return x.substr(1, x.length - 2);
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

function isSpace(x: string): boolean {
  return /\s/.test(x);
}
