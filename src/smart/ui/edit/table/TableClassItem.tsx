import React from 'react';
import { DataType } from '@paneron/libmmel/interface/baseinterface';
import { MMELTable } from '@paneron/libmmel/interface/supportinterface';
import { NormalComboBox, NormalTextField } from '@/smart/ui/common/fields';

export interface TableRowClass {
  id: string;
  datatype: DataType;
  data: string[];
}

const TableClassItemEdit: React.FC<{
  object: TableRowClass;
  setObject: (obj: TableRowClass) => void;
  table?: MMELTable;
}> = ({ object: row, setObject: setRow, table }) => {
  const domain = table!.domain;
  const titles = table!.data.length > 0 ? table!.data[0] : [];

  function setRowValue(index: number, x: string) {
    const newData = [...row.data];
    newData[index] = x;
    setRow({ ...row, data : newData });
  }

  return (
    <>
      {row.data.map((x, index) => (
        <EditItem
          key={index}
          label={
            index < titles.length ? titles[index] : `Attribute ${index + 1}`
          }
          value={x}
          domain={index < domain.length ? domain[index] : ''}
          setValue={y => setRowValue(index, y)}
        />
      ))}
    </>
  );
};

const EditItem: React.FC<{
  label: string;
  value: string;
  domain: string;
  setValue: (x: string) => void;
}> = function ({ label, value, domain, setValue }) {
  return domain !== '' ? (
    <NormalComboBox
      text={label}
      value={value}
      options={findDomain(domain.split(','))}
      onChange={setValue}
    />
  ) : (
    <NormalTextField text={label} value={value} onChange={setValue} />
  );
};

function findDomain(dos: string[]): string[] {
  if (!dos.includes('')) {
    return ['', ...dos];
  } else {
    return dos;
  }
}

export default TableClassItemEdit;
