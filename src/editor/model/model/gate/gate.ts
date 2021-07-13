import { GraphNode } from '../graphnode'

export abstract class Gateway extends GraphNode {    

  constructor(id:string) {
    super(id)    
  }

  abstract toModel():string
}