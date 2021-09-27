/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Checkbox } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';
import {
  flow_checkbox,
  flow_percentage_label,
  flow_progress_label,
  flow_progress_label_with_button,
} from '../../../css/visual';
import { ChecklistPackage } from '../../model/checklist';
import {
  EditorNode,
  isEditorEgate,
  isEditorProcess,
  isEditorRegistry,
} from '../../model/editormodel';

const CheckListAddon: React.FC<{
  element: EditorNode;
  data: unknown;
}> = function ({ element, data }) {
  const isEGate = isEditorEgate(element);
  const pack = data as ChecklistPackage;
  const id = element.id;
  const { checklist, egatelist, itemsDone } = pack.result;
  const result = checklist[id];
  const egate = egatelist[id];
  const done = itemsDone[id] ?? 0;
  const progress =
    result !== undefined
      ? result.progress
      : egate !== undefined
      ? egate.progress
      : -1;
  const progressDisplay = parseFloat(progress.toFixed(2));

  const { onProgressChange } = pack.callback;
  const isData = isEditorRegistry(element);

  function onChange() {
    if (result.progress === 100) {
      onProgressChange(id, 0);
    } else {
      onProgressChange(id, 100);
    }
  }

  const taskString =
    result !== undefined && result.tasks.length !== 0
      ? `${done} / ${result.tasks.length}`
      : '';

  return (
    <>
      {!isEGate && (
        <div css={flow_checkbox}>
          <Checkbox checked={progress === 100} onChange={onChange} />
        </div>
      )}
      {!isData && !isEGate && <div css={isEditorProcess(element) && element.page !== '' ? flow_progress_label_with_button : flow_progress_label}>{taskString}</div>}
      <div css={flow_percentage_label}>
        {isData ? taskString : progress !== -1 ? `${progressDisplay}%` : ''}
      </div>
    </>
  );
};

export default CheckListAddon;
