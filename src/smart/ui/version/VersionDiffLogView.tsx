/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Text } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';
import { popover_panel_container } from '../../../css/layout';
import { VersionState } from '../../model/versioncompare';

const VersionDiffLogView: React.FC<{
  id: string;
  pageid: string;
  data: unknown;
}> = function ({ id, pageid, data }) {
  const result = data as VersionState;
  const isRef = result.viewOptionRef.current;
  const comments = isRef
    ? result.refcomments[pageid][id]
    : result.oricomments[pageid][id];
  return (
    <div css={popover_panel_container}>
      {comments !== undefined && comments.length > 0 ? (
        comments.map((x, index) => <p key={index}>{x}</p>)
      ) : (
        <Text>No change</Text>
      )}
    </div>
  );
};

export default VersionDiffLogView;
