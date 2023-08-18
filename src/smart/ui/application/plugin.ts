import type { IToastProps } from '@blueprintjs/core';
import type { EditorModel } from '@/smart/model/editormodel';
import type { ViewFunctionInterface } from '@/smart/model/ViewFunctionModel';
import Application27001 from '@/smart/ui/application/ISO27001/Main';
import Application2060 from '@/smart/ui/application/pas2060/Main';

export interface PluginInterface {
  model: EditorModel;
  showMsg: (msg: IToastProps) => void;
  setView: (view: ViewFunctionInterface) => void;
}

export interface PluginSettingInterface {
  key: string;
  title: string;
  Content: React.FC<PluginInterface>;
}

const pluginNS = ['PAS2060Application', 'RiboseISO27001'] as const;

const pluginSet = new Set<string>(pluginNS);
type pluginTypes = typeof pluginNS[number];

const Plugins: Record<pluginTypes, PluginSettingInterface> = {
  PAS2060Application : {
    key     : 'pas2060',
    title   : 'PAS 2060 application',
    Content : Application2060,
  },
  RiboseISO27001 : {
    key     : 'iso27001',
    title   : 'Ribose ISO 27001 application',
    Content : Application27001,
  },
};

function onPlugInList(ns: string): ns is pluginTypes {
  return pluginSet.has(ns);
}

export function loadPlugin(ns: string): PluginSettingInterface | undefined {
  return onPlugInList(ns) ? Plugins[ns] : undefined;
}
