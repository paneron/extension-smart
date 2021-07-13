import { RefObject } from 'react';

export class MappingProfile {
  ref: RefObject<HTMLDivElement>;

  constructor(ref: RefObject<HTMLDivElement>) {
    this.ref = ref;
  }
}
