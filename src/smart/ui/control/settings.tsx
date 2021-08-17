/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Tab, Tabs } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { useContext, useState } from 'react';
import { EditorModel } from '../../model/editormodel';
import { MMELMetadata } from '../../serialize/interface/supportinterface';
import DataClassEditPage from '../edit/dataclassedit';
import EnumEditPage from '../edit/enumedit';
import MeasurementEditPage from '../edit/measurementedit';
import MetaEditPage from '../edit/metaedit';
import ReferenceEditPage from '../edit/refedit';
import RegistryEditPage from '../edit/registryedit';
import RoleEditPage from '../edit/roleedit';

export enum SETTINGPAGE {
  METAPAGE = 'meta',
  ROLEPAGE = 'role',
  REFPAGE = 'ref',
  REGISTRYPAGE = 'reg',
  DATAPAGE = 'dc',
  ENUMPAGE = 'enum',
  MEASUREMENT = 'measure',
}

interface TabProps {
  title: string;
  Panel: React.FC<{
    model: EditorModel;
    setModel: (m: EditorModel) => void;
  }>;
}

const tabs: Record<SETTINGPAGE, TabProps> = {
  [SETTINGPAGE.METAPAGE]: {
    title: 'Metadata',
    Panel: ({ model, setModel }) => (
      <MetaEditPage
        meta={model.meta}
        setMetadata={(meta: MMELMetadata) => {
          setModel({ ...model, meta: meta });
        }}
      />
    ),
  },
  [SETTINGPAGE.ROLEPAGE]: {
    title: 'Roles',
    Panel: ({ model, setModel }) => (
      <RoleEditPage model={model} setModel={setModel} />
    ),
  },
  [SETTINGPAGE.REFPAGE]: {
    title: 'References',
    Panel: ({ model, setModel }) => (
      <ReferenceEditPage model={model} setModel={setModel} />
    ),
  },
  [SETTINGPAGE.REGISTRYPAGE]: {
    title: 'Data Registry',
    Panel: ({ model, setModel }) => (
      <RegistryEditPage model={model} setModel={setModel} />
    ),
  },
  [SETTINGPAGE.DATAPAGE]: {
    title: 'Data structure',
    Panel: ({ model, setModel }) => (
      <DataClassEditPage model={model} setModel={setModel} />
    ),
  },
  [SETTINGPAGE.ENUMPAGE]: {
    title: 'Enumeration',
    Panel: ({ model, setModel }) => (
      <EnumEditPage model={model} setModel={setModel} />
    ),
  },
  [SETTINGPAGE.MEASUREMENT]: {
    title: 'Measurement',
    Panel: ({ model, setModel }) => (
      <MeasurementEditPage model={model} setModel={setModel} />
    ),
  },
};

const BasicSettingPane: React.FC<{
  model: EditorModel;
  setModel: (m: EditorModel) => void;
}> = ({ model, setModel }) => {
  const { logger } = useContext(DatasetContext);
  const [page, setPage] = useState<SETTINGPAGE>(SETTINGPAGE.METAPAGE);

  logger?.log('Enter setting page: ', page);
  return (
    <Tabs
      id="TabsExample"
      onChange={x => setPage(x as SETTINGPAGE)}
      selectedTabId={page}
    >
      {Object.entries(tabs).map(([key, props]) => (
        <Tab
          id={key}
          title={props.title}
          panel={<props.Panel model={model} setModel={setModel}></props.Panel>}
        />
      ))}
    </Tabs>
  );
};

export default BasicSettingPane;
