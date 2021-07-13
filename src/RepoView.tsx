/** @jsx jsx */
/** @jsxFrag React.Fragment */

import log from 'electron-log';
import type React from 'react';
import { jsx } from '@emotion/react';
import ModelEditor from './editor/ui/maineditor';


Object.assign(console, log);



const RepositoryView: React.FC<Record<never, never>> =
function () {
  return <ModelEditor isVisible={false} />
};


export default RepositoryView;
