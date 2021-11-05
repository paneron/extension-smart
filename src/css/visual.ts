import { css, SerializedStyles } from '@emotion/react';
import { CSSProperties } from 'react';
import {
  MapCoverType,
  MappingResultStyles,
  MappingSourceStyles,
  MapSourceType,
} from '../smart/utils/map/MappingCalculator';
import {
  MapDiffCoverType,
  MapDiffSourceType,
  MappingDiffResultStyles,
  MappingDiffSourceStyles,
} from '../smart/utils/map/MappingDiff';
import {
  SearchHighlightType,
  SearchResultStyles,
} from '../smart/utils/SearchFunctions';

export const handleCSS: CSSProperties = {
  borderRadius: '5px!important',
  width: '19px!important',
  height: '19px!important',
  background: 'whitesmoke!important',
  border: '1px solid black!important',
};

export const flowCheckbox: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: 30,
  textAlign: 'left',
  fontSize: 12,
};

export const flowProgressLabelWithButton: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: -25,
  width: 140,
  textAlign: 'right',
  fontSize: 12,
};

export const flowProgressLabel: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: -20,
  width: 140,
  textAlign: 'right',
  fontSize: 12,
};

export const flowPercentageLabel: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: -20,
  width: 140,
  textAlign: 'left',
  fontSize: 12,
};

export const no_highlight = css``;

export function map_style__coverage(result: MapCoverType): SerializedStyles {
  return flow_node__highlighed(MappingResultStyles[result].color);
}

export function map_style_diff__coverage(
  result: MapDiffCoverType
): SerializedStyles {
  return flow_node__highlighed(MappingDiffResultStyles[result].color);
}

export function map_style__source(result: MapSourceType): SerializedStyles {
  return flow_node__highlighed(MappingSourceStyles[result].color);
}

export function map_style_diff__source(
  result: MapDiffSourceType
): SerializedStyles {
  return flow_node__highlighed(MappingDiffSourceStyles[result].color);
}

export function search_style__highlight(
  result: SearchHighlightType
): SerializedStyles {
  if (result !== SearchHighlightType.NONE) {
    return flow_node__highlighed(SearchResultStyles[result].color);
  } else {
    return no_highlight;
  }
}

export function flow_node__highlighed(color: string) {
  return css`
    background-color: ${color};
  `;
}
