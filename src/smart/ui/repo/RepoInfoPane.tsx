import React from 'react';
import { MMELRepo, RepoIndex } from '../../model/repo';
import { getRepoItemDesc } from '../../utils/repo/CommonFunctions';
import { DescriptionItem } from '../common/description/fields';
import RepoCloseButton from './RepoCloseButton';

const RepoInfoPane: React.FC<{
  repo?: MMELRepo;
  index: RepoIndex;
  onClose: () => void;
}> = function ({ repo, index, onClose }) {
  const item = repo !== undefined ? index[repo.ns] : undefined;
  return (
    <div
      style={{
        margin: 10,
      }}
    >
      <p>
        Viewing:
        {item ? getRepoItemDesc(item) : 'Nil'}
        {repo !== undefined && <RepoCloseButton onClose={onClose} />}
      </p>
      <DescriptionItem
        label="Number of models/documents in repository:"
        value={Object.values(index).length.toString()}
      />
    </div>
  );
};

export default RepoInfoPane;
