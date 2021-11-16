import { BreadcrumbProps, Breadcrumbs } from '@blueprintjs/core';
import React from 'react';
import { RepoHistory } from '../../../model/history';

const RepoBreadcrumb: React.FC<{
  repoHis: RepoHistory;
  setRepoHis: (x: RepoHistory) => void;
}> = function ({ repoHis, setRepoHis }) {
  const items: BreadcrumbProps[] = repoHis.map((x, index) => ({
    text: x.ns,
    onClick: () => setRepoHis(repoHis.slice(0, index + 1)),
  }));
  return (
    <Container>
      <Breadcrumbs items={items} />
    </Container>
  );
};

const Container: React.FC<{ children: React.ReactNode }> = function ({
  children,
}) {
  return (
    <aside
      style={{
        position: 'absolute',
        left: 5,
        right: 5,
        top: 0,
        zIndex: 90,
      }}
    >
      {children}
    </aside>
  );
};

export default RepoBreadcrumb;
