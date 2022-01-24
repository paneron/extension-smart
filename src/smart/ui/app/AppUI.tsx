import React from 'react';

/**
 * A wrapper of the app to add the mouse listener
 */

const AppUILayout: React.FC<{
  children: React.ReactNode;
  clickListener: (() => void)[];
}> = function ({ children, clickListener }) {
  return (
    <div
      style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexFlow: 'row nowrap',
      }}
      onMouseUp={() => clickListener.forEach(x => x())}
    >
      {children}
    </div>
  );
};

export default AppUILayout;
