from collections import defaultdict


class Graph:
    def __init__(self):
        self.adj_dict = defaultdict(list)

    def add_node(self, node):
        self.adj_dict[node] = []

    def add_edge(self, u, v):
        if v not in self.adj_dict[u]:
            self.adj_dict[u].append(v)
