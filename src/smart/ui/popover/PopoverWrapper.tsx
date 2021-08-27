import { Popover2, Tooltip2 } from "@blueprintjs/popover2";
import React from "react";

const PopoverWrapper: React.FC<{
  children?: React.ReactNode;
  SD?: React.FC<{id:string}>;
  id: string;
}> = function ({ children, SD, id }) {  
  if (SD !== undefined) {
    const content = <SD id={id} />
    return (
      <Popover2 content={content} position='top' hasBackdrop={true}>
        <Tooltip2 content={content} position='top'>
          {children}
        </Tooltip2>
      </Popover2>
    );
  } else {
    return <> {children} </>;
  }
}

export default PopoverWrapper;