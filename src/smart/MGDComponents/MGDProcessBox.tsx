// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx, SerializedStyles } from '@emotion/react';
import { mgd_process_box } from '../../css/MGDProcessBox';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  children: any;
  onDragStart?: (e: any) => void;
  onDrop?: (e: any) => void;
  styleClass?: SerializedStyles;
  draggable?: boolean;
  uiref?: React.RefObject<HTMLDivElement>;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDProcessBox(props: OwnProps) {
  const {
    children,
    onDragStart = undefined,
    onDrop = undefined,
    draggable = false,
    uiref = null,
    styleClass,
  } = props;
  return (
    <div
      css={[mgd_process_box, styleClass]}
      onDragStart={onDragStart}
      onDrop={onDrop}
      draggable={draggable}
      ref={uiref}
    >
      <div
        style={{
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDProcessBox;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
