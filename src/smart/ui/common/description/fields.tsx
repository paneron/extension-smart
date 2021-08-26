/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from "@emotion/react";
import React from "react";
import { mgd_label } from "../../../../css/form";
import { MMELRole } from "../../../serialize/interface/supportinterface";

export const DescriptionItem: React.FC<{
  minimal?: boolean;
  label: string;
  value: string;
}> = function ({ minimal = false, label, value }): JSX.Element {
  return (
    <p>
      <label css={mgd_label}>
        {minimal ? value : `${label}: ${value}`}
      </label>
    </p>
  );
};

export const ActorDescription: React.FC<{
  role: MMELRole | null;
  label: string;
}> = function ({ role, label }): JSX.Element {
  return (
    <>
      {role !== null ? (
        <DescriptionItem label={label} value={role.name} />
      ) : (
        <></>
      )}
    </>
  );
};

export const NonEmptyFieldDescription: React.FC<{  
  label: string;
  value: string;
}> = function ({ label, value }): JSX.Element {
  return (
    <>{value !== '' ? <DescriptionItem label={label} value={value} /> : ''}</>
  );
};