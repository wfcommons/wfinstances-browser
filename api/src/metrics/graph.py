from collections import defaultdict


class Graph:
    def __init__(self):
        self.graph = defaultdict(list)

    def add_edge(self, u, v):
        if v not in self.graph[u]:
            self.graph[u].append(v)
