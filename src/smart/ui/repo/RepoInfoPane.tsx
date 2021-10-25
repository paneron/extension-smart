/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { RepoIndex } from '../../model/repo';
import { DescriptionItem } from '../common/description/fields';

const RepoInfoPane: React.FC<{
  repo?: string;
  index: RepoIndex;
}> = function ({repo, index}) {
  const item = repo !== undefined ? index[repo] : undefined;
  return (
    <div style={{
      margin: 10
    }}>
      <DescriptionItem label='Viewing:' value={item!==undefined ? item.shortname : 'Nil'} />
      <DescriptionItem label='Number of models in repository:' value={Object.values(index).length.toString()} />
    </div>
  )
}

export default RepoInfoPane;