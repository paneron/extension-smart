import { SerializedStyles } from '@emotion/react';
import { LegendInterface } from './States';

export interface ViewFunctionInterface {
  getStyleById: (id: string, pageid: string, data: unknown) => SerializedStyles;
  getSVGColorById: (id: string, pageid: string, data: unknown) => string;
  legendList: Record<string, LegendInterface>;
  data: unknown; // will be passed to the functions for handling
}
