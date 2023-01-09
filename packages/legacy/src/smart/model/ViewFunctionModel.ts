import { SerializedStyles } from '@emotion/react';
import React from 'react';
import { MMELDataAttribute } from '../serialize/interface/datainterface';
import {
  MMELProvision,
  MMELReference,
} from '../serialize/interface/supportinterface';
import { EditorNode } from './editormodel';
import { LegendInterface } from './States';

/**
 * For model viewer. The common interface for different functions.
 * Functions like checklist, version tracking etc.
 */
export interface ViewFunctionInterface {
  getStyleById: (id: string, pageid: string, data: unknown) => SerializedStyles;
  getSVGColorById: (id: string, pageid: string, data: unknown) => string;
  ComponentToolTip?: React.FC<{ id: string; pageid: string; data: unknown }>;
  StartEndToolTip?: React.FC<{ id: string; pageid: string; data: unknown }>;
  legendList?: Record<string, LegendInterface>;
  NodeAddon?: React.FC<{ element: EditorNode; pageid: string; data: unknown }>;
  CustomAttribute?: React.FC<{
    att: MMELDataAttribute;
    getRefById?: (id: string) => MMELReference | null;
    data: unknown;
    dcid: string;
  }>;
  CustomProvision?: React.FC<{
    provision: MMELProvision;
    getRefById?: (id: string) => MMELReference | null;
    data: unknown;
  }>;
  getEdgeColor?: (id: string, pageid: string, data: unknown) => string;
  isEdgeAnimated?: (id: string, pageid: string, data: unknown) => boolean;
  data: unknown; // will be passed to the functions for handling
  navigationEnabled?: boolean; // control whether drill up and subprocess is allowed
  navigationErrorMsg?: string; // error message shown to user when navigationEnabled is violated
}
