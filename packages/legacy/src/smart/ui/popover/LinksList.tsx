import { Intent, Menu, MenuItem } from '@blueprintjs/core';
import React from 'react';
import { MMELRepo, RepoIndex } from '../../model/repo';
import { MMELLink } from '@paneron/libmmel/interface/supportinterface';

const LinksList: React.FC<{
  links: Set<string>;
  index: RepoIndex;
  getLinkById: (x: string) => MMELLink | undefined;
  goToNextModel?: (x: MMELRepo) => void;
}> = function ({ links, index, getLinkById, goToNextModel }) {
  const resolved = [...links].map(l => getLinkById(l));

  function onClick(link: MMELLink) {
    if (goToNextModel) {
      if (link.type === 'URL') {
        const url = link.link;
        if (!url.includes('://')) {
          const w = window.open(`https://${url}`);
          w?.focus();
        } else {
          const w = window.open(link.link);
          w?.focus();
        }
      } else if (link.type === 'REPO') {
        const repo = link.link;
        const record = index[repo];
        if (record === undefined) {
          const w = window.open('https://shop.bsigroup.com');
          w?.focus();
        } else {
          goToNextModel({ ns : repo, type : record.type });
        }
      }
    }
  }

  return (
    <Menu
      style={{
        maxWidth  : '30vw',
        maxHeight : '45vh',
      }}
    >
      {resolved.map(
        l =>
          l !== undefined && (
            <MenuItem
              intent={getIntent(l, index)}
              text={getName(l, index)}
              key={l.id}
              onClick={goToNextModel ? () => onClick(l) : undefined}
            />
          )
      )}
    </Menu>
  );
};

function getName(link: MMELLink, index: RepoIndex): string {
  if (link.type === 'URL') {
    return `URL: ${link.description}`;
  } else if (index[link.link] !== undefined) {
    return `In repository: ${link.description}`;
  } else {
    return `Not in repository: ${link.description}`;
  }
}

function getIntent(link: MMELLink, index: RepoIndex): Intent | undefined {
  if (link.type === 'URL') {
    return undefined;
  } else if (index[link.link] !== undefined) {
    return 'success';
  } else {
    return 'warning';
  }
}

export default LinksList;
