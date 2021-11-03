import { Text, Button, ControlGroup, Icon } from '@blueprintjs/core';
import { Classes, Popover2, Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import MGDContainer from '../../MGDComponents/MGDContainer';
import MGDSidebar from '../../MGDComponents/MGDSidebar';
import { MMELView } from '../../serialize/interface/supportinterface';

const ProfileControl: React.FC<{
  values: Record<string, string>;
  profile: MMELView | undefined;
  profiles: MMELView[];
  setValues: (v: Record<string, string>) => void;
  setProfile: (x: MMELView | undefined) => void;
}> = function ({ values, profile, profiles, setValues, setProfile }) {
  function onProfileLoad(p: MMELView) {
    for (const x in p.profile) {
      const set = p.profile[x];
      values[x] = set.value;
    }
    setValues({ ...values });
    setProfile({ ...p });
  }

  return (
    <MGDContainer>
      <ControlGroup>
        <Popover2
          content={
            <MGDSidebar>
              {profiles.map(p => (
                <Button
                  fill
                  className={Classes.POPOVER2_DISMISS}
                  onClick={() => onProfileLoad(p)}
                >
                  {p.name}
                </Button>
              ))}
            </MGDSidebar>
          }
          position="bottom"
        >
          <Button>
            {profile !== undefined ? profile.name : 'Load Profile'}
          </Button>
        </Popover2>
        <Button icon="cross" onClick={() => setProfile(undefined)}></Button>
      </ControlGroup>
      <Tooltip2
        content={
          <Text>
            Settings from specific profile are loaded. The concerned settings
            are highlighted.
          </Text>
        }
        position="bottom-right"
        minimal
      >
        <Icon
          style={{
            marginLeft: '2px',
          }}
          icon="help"
        />
      </Tooltip2>
    </MGDContainer>
  );
};

export default ProfileControl;
