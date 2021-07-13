import { GraphNode } from '../graphnode'

export abstract class EventNode extends GraphNode {    

  constructor(id:string) {
    super(id)    
  }

  abstract toModel():string
  
}