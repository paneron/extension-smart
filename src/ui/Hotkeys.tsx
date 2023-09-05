/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx, css } from '@emotion/react';

import type {
  HotkeyConfig
} from '@blueprintjs/core';
import {
  HotkeysContext,
  HotkeysProvider,
  HotkeysTarget2
} from '@blueprintjs/core';

import { modes } from '@/ui/modes';
import type { UIMode } from '@/ui/modes';
import type { Option } from '@/lib/fp';
import { none, some } from '@/lib/fp';

/**
 * Map each major mode to the corresponding 'goto' hotkey config, if available.
 */
export function gotoModeToHotkeyConfig(mode: UIMode): Option<HotkeyConfig> {
  switch (mode) {
    case 'manage':
      return some(gotoManageMode);
    case 'audit':
      return some(gotoAuditMode);
    case 'reference':
      return some(gotoReferenceAuthoringMode);
  }
  return none;
}

/**
 * Map each available major mode to a list of accessible hotkey configs.
 */
export function availableModeToHotkeyConfig(mode: UIMode): HotkeyConfig[] {
  switch (mode) {
    case 'manage':
      return [gotoManageMode];
    case 'audit':
      return [gotoAuditMode];
    case 'reference':
      return [gotoReferenceAuthoringMode];
  }
  return [];
}

export function availableModesToHotkeyConfig(modes: UIMode[]): HotkeyConfig[] {
  return modes.reduce<HotkeyConfig[]>((acc, mode) => {
    return acc;
    // return [...acc, ...availableModeToHotkeyConfig(mode)];
  }, [
    gotoGotoMode,

    // escapeGotoMode,
    // gotoHomeScreen,
  ])
}

export const kbdModes = [
  'normal',
  'g',
] as const;
type KbdMode = typeof kbdModes[number];

export const defaultKbdMode: KbdMode  = 'normal';

let currentKbdMode: KbdMode = defaultKbdMode;

export function getCurrentKbdMode(): KbdMode {
  return currentKbdMode;
}

export const gotoGotoMode: HotkeyConfig = {
  combo     : 'g',
  global    : true,
  group     : 'Navigation (global)',
  label     : 'Go to ...',
  onKeyDown : () => {
    alert('goto mode');
    currentKbdMode = 'g';
  },
};

export const escapeGotoMode: HotkeyConfig = {
  combo     : 'esc',
  global    : false,
  group     : 'Navigation (global)',
  label     : 'Cancel goto',
  onKeyDown : () => {
    currentKbdMode = defaultKbdMode;
  },
};

export const gotoHomeScreen: HotkeyConfig = {
  combo     : 'heow',
  global    : false,
  group     : 'Navigation (global)',
  label     : 'Go to Home Screen',
  onKeyDown : () => alert('home screen'),
};

export const gotoManageMode: HotkeyConfig = {
  combo     : 'meow',
  global    : false,
  group     : 'Navigation (global)',
  label     : 'Go to Manage Mode',
  onKeyDown : () => alert('manage mode'),
};

export const gotoAuditMode: HotkeyConfig = {
  combo     : 'aeow',
  global    : false,
  group     : 'Navigation (global)',
  label     : 'Go to Audit Mode',
  onKeyDown : () => alert('audit mode'),
};

export const gotoReferenceAuthoringMode: HotkeyConfig = {
  combo     : 'reow',
  global    : false,
  group     : 'Navigation (global)',
  label     : 'Go to Reference Authoring Mode',
  onKeyDown : () => console.info('reference authoring mode'),
};

export const hotkeyStateTransitionMap: Record<KbdMode, HotkeyConfig[]> = {
  normal : [
    gotoGotoMode,
  ],
  g : [
    escapeGotoMode,
    gotoAuditMode,
    gotoManageMode,
    gotoReferenceAuthoringMode,
    gotoHomeScreen,
  ],
};

export const GotoModeHotkeyProvider: React.VoidFunctionComponent<Record<never, never>> = function() {
  return <div>hi</div>;
  // return <HotkeysProvider>
  //   <HotkeysTarget2 hotkeys={hotkeyStateTransitionMap.g}>
  //     <div></div>
  //   </HotkeysTarget2>
  // </HotkeysProvider>;
}
