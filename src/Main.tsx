/** @jsx jsx */
/** @jsxFrag React.Fragment */

// import { Helmet } from 'react-helmet';
import { jsx, css } from '@emotion/react';
import {
  Button,
  NonIdealState,
  Callout
} from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { TabbedWorkspaceContext } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/context';
import React, {
  useContext,
  useMemo,
  useState
} from 'react';
import { warn } from '@/lib/logger';
import { FocusStyleManager } from "@blueprintjs/core";
import { GotoModeHotkeyProvider, gotoModeToHotkeyConfig, gotoGotoMode, availableModesToHotkeyConfig } from '@/ui/Hotkeys';
import type {
  HotkeyConfig,
} from '@blueprintjs/core';

import {
  HotkeysProvider,
  HotkeysTarget2,
} from '@blueprintjs/core';

import type { Some } from '@/lib/fp';

FocusStyleManager.onlyShowFocusOnTabs();

import { getUserRole, getAvailableModes } from '@/ui/accessControl';
import type { UIMode } from '@/ui/modes';
import { modeToMeta } from '@/ui/modes';

const Home: React.VoidFunctionComponent<Record<never, never>> =
function () {
  const { spawnTab } = useContext(TabbedWorkspaceContext);
  // const {
  // } = useContext(DatasetContext);

  const currentUserRole = getUserRole();

  const intro = <>
    SHello there, what would you like to do?
    <Callout intent="primary" css={css`text-align: left; margin: 2em 0;`}>
        You are logged in as <code>{currentUserRole}</code>.
    </Callout>
    Press <kbd>?</kbd> to see a list of available hotkeys.
  </>;

  console.warn('awrn');
  const availableModes = getAvailableModes();
  // const appHotkeys = availableModesToHotkeyConfig(availableModes);
  const appHotkeys = [gotoGotoMode];
  function clickModeButton(mode: UIMode) {
    warn('clickety click', mode);
    alert(mode);
    spawnTab(`${mode}://index`);
  }

  const availableActions = availableModes.map((mode, i) => {
    const modeInfo = modeToMeta(mode);
    // const maybeGotoHotkey = gotoModeToHotkeyConfig(mode);
    return modeInfo.enabled ?
      <li
        key={i}
        css={css`display: block; margin: 1em;`}
      >
        <Button
          key={i}
          onClick={() => clickModeButton(mode)}
          alignText="left"
          fill={true}
          css={css`position: relative; padding: 0 2em;`}
        >
          <h1>{modeInfo.label}</h1>
          <h2
            css={css`position: absolute; top: 0; right: 2em;`}
            className=".bp4-text-muted"
          >
            ({"(maybeGotoHotkey as Some<HotkeyConfig>).value.combo"})
          </h2>
          <p>
            {modeInfo.description}
          </p>
        </Button>
      </li> : <></>;
  });

  const greeting = <>
    <NonIdealState
      title={'i.so.smart'}
      description={<>
        {intro}
      </>}
    >
      <ul
        css={css`padding: 0; width: 30%; min-width: 20em; max-width: 60em; padding: 1em;`}
      >
        {availableActions}
      </ul>
    </NonIdealState>
  </>;

  return <>
    <HotkeysProvider>
      <div>
        <HotkeysTarget2 hotkeys={appHotkeys}>
          {greeting}
        </HotkeysTarget2>
        {/* <GotoModeHotkeyProvider /> */}
      </div>
    </HotkeysProvider>
  </>
  ;

};

export default Home;
