import React from 'react';
import { MMELRepo, RepoIndex } from '@/smart/model/repo';
import { getRepoItemDesc } from '@/smart/utils/repo/CommonFunctions';
import { DescriptionItem } from '@/smart/ui/common/description/fields';
import RepoCloseButton from '@/smart/ui/repo/RepoCloseButton';

const RepoInfoPane: React.FC<{
  repo?: MMELRepo;
  index: RepoIndex;
  onClose: () => void;
}> = function ({ repo, index, onClose }) {
  const item = repo !== undefined ? index[repo.ns] : undefined;
  return (
    <div
      style={{
        margin : 10,
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
