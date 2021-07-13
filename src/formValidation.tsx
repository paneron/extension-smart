/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';
import { css, jsx } from '@emotion/react';
import { FormGroup, FormGroupProps as IFormGroupProps, Intent } from '@blueprintjs/core';


export type Validator<T> = (object: T) => ValidationResult<T>

export type PartialValidator<T> = (object: T) => ValidationResult<Partial<T>>

export const FieldWithErrors: React.FC<{
  errors: ValidationError[]
} & IFormGroupProps> = function ({ errors, helperText, children, ...formGroupProps }) {
  const effectiveHelperText: JSX.Element | undefined = helperText !== undefined || errors.length > 0
    ? <>
        {helperText || null}
        {errors.length > 0 ? <FieldErrors errors={errors} /> : null}
      </>
    : undefined;

  const intent: Intent | undefined = errors.length > 0 ? 'danger' : undefined;

  return <FormGroup
      helperText={effectiveHelperText}
      css={css`margin: 0;`}
      intent={intent}
      {...formGroupProps}>
    {children}
  </FormGroup>;
};


type ValidationResult<T> = [errors: ValidationErrors<T>, isValid: boolean]

type ValidationErrors<T> = { [key in keyof T]: ValidationError[] }

interface ValidationError {
  message: string
}

const FieldErrors: React.FC<{ errors: ValidationError[], className?: string }> = function ({ errors, className }) {
  return <ul css={css`margin: 0; padding-left: 1.25em;`} className={className}>
    {errors.map((e, idx) => <li key={idx}>{e.message}</li>)}
  </ul>;
};
