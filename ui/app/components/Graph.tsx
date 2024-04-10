class GraphNode<T> {
    constructor(public id: T, public name: string, public isTask: boolean) {}
  }
  
class Graph<T> {
  private nodes: Map<T, GraphNode<T>>;
  private edges: Map<GraphNode<T>, Set<GraphNode<T>>>;
  
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
  }
  
  addNode(id: T, name: string, isTask: boolean): void {
    if (!this.nodes.has(id)) {
      const newNode = new GraphNode(id, name, isTask);
      this.nodes.set(id, newNode);
      this.edges.set(newNode, new Set());
    }
  }
  
  addEdge(fromId: T, toId: T): void {
    const fromNode = this.nodes.get(fromId);
    const toNode = this.nodes.get(toId);
  
    if (fromNode && toNode) {
      this.edges.get(fromNode)?.add(toNode);
    } else {
      console.error("Node not found");
    }
  }
  
  getNode(id: T): GraphNode<T> | undefined {
    return this.nodes.get(id);
  }
}
  