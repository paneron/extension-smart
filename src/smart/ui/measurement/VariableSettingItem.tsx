import React from 'react';
import { CSSROOTVARIABLES } from '@/css/root.css';
import { InputableVarType, VarInputInterface } from '@/smart/model/Measurement';
import { VarType } from '@paneron/libmmel/interface/supportinterface';
import BooleanMeasureEdit from '@/smart/ui/measurement/fields/boolean';
import TableComboBox from '@/smart/ui/measurement/fields/TableComboBox';
import TextMeasureEdit from '@/smart/ui/measurement/fields/text';

const VarInputs: Record<InputableVarType, React.FC<VarInputInterface>> = {
  [VarType.BOOLEAN]   : BooleanMeasureEdit,
  [VarType.DATA]      : TextMeasureEdit,
  [VarType.LISTDATA]  : TextMeasureEdit,
  [VarType.TEXT]      : TextMeasureEdit,
  [VarType.TABLEITEM] : TableComboBox,
};

const VariableSettingItem: React.FC<VarInputInterface> = function (props) {
  const { variable, profile } = props;
  const Input = VarInputs[variable.type as InputableVarType];
  return (
    <VarItemContainer
      required={
        profile !== undefined && profile.profile[variable.id] !== undefined
      }
    >
      <Input {...props} />
      {profile !== undefined &&
        profile.profile[variable.id] !== undefined &&
        profile.profile[variable.id].isConst && <FixedLabel />}
    </VarItemContainer>
  );
};

function FixedLabel() {
  return (
    <div
      style={{
        position        : 'absolute',
        right           : 0,
        top             : -8,
        zIndex          : 10,
        backgroundColor : CSSROOTVARIABLES['--colour--bsi-pale-teal'],
        color           : 'red',
      }}
    >
      fixed
    </div>
  );
}

function VarItemContainer({
  children,
  required,
}: {
  children: React.ReactNode;
  required: boolean;
}) {
  return (
    <div style={required ? { position : 'relative', borderStyle : 'solid' } : {}}>
      {children}
    </div>
  );
}

export default VariableSettingItem;
