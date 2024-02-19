from collections import defaultdict


class Graph:
    """Graph data structure represented as an adjacency list using a dictionary."""

    def __init__(self):
        """Initialize the graph."""
        self.adj_dict = defaultdict(list)

    def add_node(self, node):
        """
        Add a node to the graph.

        Args:
            node (any): The node to add to the graph
        """
        self.adj_dict[node] = []

    def add_edge(self, u, v):
        """
        Add a directed edge to the graph. Prevents adding duplicate directed edges.

        Args:
            u (any): The node to start from
            v (any): The node to point to
        """
        if v not in self.adj_dict[u]:
            self.adj_dict[u].append(v)
