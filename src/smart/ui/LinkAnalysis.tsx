/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { MMELRepo, RepoIndex } from '../model/repo';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import RepoIndexMainView from './mapper/repo/RepoIndexMainView';

const LinkAnalysis: React.FC<{
  isVisible: boolean;
  className?: string;
  repo?: MMELRepo;
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
