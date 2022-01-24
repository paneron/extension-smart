/** @jsx jsx */
/** @jsxFrag React.Fragment */

/**
 * It is the UI in the editor, for accessing the model settings
 */

import { jsx } from '@emotion/react';
import { Tab, Tabs } from '@blueprintjs/core';
import React, { useState } from 'react';
import { mgd_label } from '../../../css/form';
import {
  mgd_tabs__item,
  mgd_tabs__item__selected,
  mgd_tabs__item__unselected,
} from '../../../css/MGDTabs';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import { EditorModel } from '../../model/editormodel';
import DataClassEditPage from '../edit/dataclassedit';
import EnumEditPage from '../edit/enumedit';
import FigureEditPage from '../edit/figure/FigureEdit';
import MeasurementEditPage from '../edit/measurementedit';
import MetaEditPage from '../edit/metaedit';
import ReferenceEditPage from '../edit/refedit';
import RegistryEditPage from '../edit/registryedit';
import RoleEditPage from '../edit/roleedit';
import SectionEditPage from '../edit/SectionEditPage';
import TableEditPage from '../edit/table/TableEdit';
import TermsEditPage from '../edit/TermEdit';
import ViewProfileEditPage from '../edit/ViewProfileEdit';
import { EditorAction } from '../../model/editor/state';

export enum SETTINGPAGE {
  METAPAGE = 'meta',
  ROLEPAGE = 'role',
  REFPAGE = 'ref',
  REGISTRYPAGE = 'reg',
  DATAPAGE = 'dc',
  ENUMPAGE = 'enum',
  MEASUREMENT = 'measure',
  PROFILE = 'profile',
  TERMPAGE = 'terms',
  TABLEPAGE = 'table',
  FIGUREPAGE = 'figure',
  SECTION = 'section',
}

interface TabProps {
  title: string;
  Panel: React.FC<{
    model: EditorModel;
    act: (x: EditorAction) => void;
  }>;
}

const tabs: Record<SETTINGPAGE, TabProps> = {
  [SETTINGPAGE.METAPAGE]: {
    title: 'Metadata',
    Panel: ({ model, act }) => <MetaEditPage meta={model.meta} act={act} />,
  },
  [SETTINGPAGE.SECTION]: {
    title: 'Sections',
    Panel: ({ model, act }) => <SectionEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.TERMPAGE]: {
    title: 'Terms',
    Panel: ({ model, act }) => <TermsEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.ROLEPAGE]: {
    title: 'Roles',
    Panel: ({ model, act }) => <RoleEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.REFPAGE]: {
    title: 'References',
    Panel: ({ model, act }) => <ReferenceEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.REGISTRYPAGE]: {
    title: 'Data Registry',
    Panel: ({ model, act }) => <RegistryEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.DATAPAGE]: {
    title: 'Data structure',
    Panel: ({ model, act }) => <DataClassEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.ENUMPAGE]: {
    title: 'Enumeration',
    Panel: ({ model, act }) => <EnumEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.MEASUREMENT]: {
    title: 'Measurement',
    Panel: ({ model, act }) => <MeasurementEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.PROFILE]: {
    title: 'View profiles',
    Panel: ({ model, act }) => <ViewProfileEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.TABLEPAGE]: {
    title: 'Tables',
    Panel: ({ model, act }) => <TableEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.FIGUREPAGE]: {
    title: 'Multimedia',
    Panel: ({ model, act }) => <FigureEditPage model={model} act={act} />,
  },
};

const BasicSettingPane: React.FC<{
  model: EditorModel;
  act: (x: EditorAction) => void;
}> = ({ model, act }) => {
  const [page, setPage] = useState<SETTINGPAGE>(SETTINGPAGE.METAPAGE);

  return (
    <MGDDisplayPane>
      <Tabs
        key={jsx.length}
        onChange={x => setPage(x as SETTINGPAGE)}
        selectedTabId={page}
        animate={false}
      >
        {Object.entries(tabs).map(([key, props]) => (
          <Tab
            id={key}
            title={
              <span
                css={[
                  mgd_tabs__item,
                  key === page
                    ? mgd_tabs__item__selected
                    : mgd_tabs__item__unselected,
                ]}
              >
                <label css={mgd_label}> {props.title} </label>
              </span>
            }
            panel={<props.Panel model={model} act={act} />}
          />
        ))}
      </Tabs>
    </MGDDisplayPane>
  );
};

export default BasicSettingPane;
