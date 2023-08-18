import type { MMELRepo, RepoIndex } from '@/smart/model/repo';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import RepoIndexMainView from '@/smart/ui/mapper/repo/RepoIndexMainView';
import React from 'react';

const LinkAnalysis: React.FC<{
  isVisible: boolean;
  className?: string;
  repo: MMELRepo;
  index: RepoIndex;
}> = ({ isVisible, className, repo, index }) => {
  if (isVisible) {
    return (
      <Workspace className={className}>
        <RepoIndexMainView index={index} repo={repo} />
      </Workspace>
    );
  }
  return <div></div>;
};

export default LinkAnalysis;
