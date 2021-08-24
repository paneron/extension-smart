import { css, SerializedStyles } from "@emotion/react";
import { MapCoverType, MappingResultStyles, MappingSourceStyles, MapSourceType } from "../smart/ui/mapper/MappingCalculator";

export const handlecss = css`
  border-radius: '5px!important',
  width: '19px!important',
  height: '19px!important',
  background: 'whitesmoke!important',
  border: '1px solid black!important',
`;

export function map_style__coverage (result:MapCoverType):SerializedStyles {
  return css`
    background-color: ${MappingResultStyles[result].color}
  `
}

export function map_style__source (result:MapSourceType):SerializedStyles {
  return css`  
    background-color: ${MappingSourceStyles[result].color}
  `
}