import { Button } from '@blueprintjs/core';
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';
import React, { useState } from 'react';
import { flownodeTopRightButtonLayout } from '../../../css/layout';
import { ModelType } from '../../model/editormodel';
import { MapViewButtonToolTip } from '../../utils/map/MappingCalculator';

interface MouseState {
  isHover: boolean;
  isClicked: boolean;
}

const ViewMappingbutton: React.FC<{
  modelType: ModelType;
  id: string;
  setSelectedId: (id: string) => void;
  MappingList: React.FC<{ id: string }>;
}> = function ({ modelType, id, setSelectedId, MappingList }) {
  const [state, setState] = useState<MouseState>({
    isHover: false,
    isClicked: false,
  });

  function action(s: MouseState) {
    const old = state.isClicked || state.isHover;
    const proposed = s.isClicked || s.isHover;
    if (old !== proposed) {
      setSelectedId(proposed ? id : '');
    }
    setState(s);
  }

  if (modelType === ModelType.IMP || modelType === ModelType.REF) {
    return (
      <div style={flownodeTopRightButtonLayout}>
        <Popover2
          content={<MappingList id={id} />}
          onOpening={() => action({ ...state, isClicked: true })}
          onClosed={() => action({ ...state, isClicked: false })}
          hasBackdrop={true}
          position="top"
        >
          <Tooltip2 content={MapViewButtonToolTip[modelType]} position="top">
            <Button
              onMouseEnter={() => action({ ...state, isHover: true })}
              onMouseLeave={() => action({ ...state, isHover: false })}
              icon="exchange"
            />
          </Tooltip2>
        </Popover2>
      </div>
    );
  }
  return <></>;
};

export default ViewMappingbutton;
