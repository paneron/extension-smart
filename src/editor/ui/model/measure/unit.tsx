export class MTreeNode {
  id: string
  childs: Array<MTreeNode>

  constructor(x:string) {
    this.id = x
    this.childs = []
  }
}

export class NodeRef extends MTreeNode {  
  type: NodeType 

  constructor(x:string, type:NodeType) {
    super(x)  
    this.type = type
  }
}

export enum NodeType {
  DATA,
  LISTOP,
  BINOP
}

export class MeasureDataUnit extends MTreeNode {
  value:string

  constructor(x:string, v:string) {
    super(x)
    this.value = v
  }
}

export class MeasureDataList extends MTreeNode {
  values:Array<string>

  constructor(x:string, data:Array<string>) {
    super(x)
    this.values = data
  }
}