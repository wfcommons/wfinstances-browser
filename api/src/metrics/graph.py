from collections import defaultdict
from typing import Any


class Graph:
    def __init__(self):
        self.adj_dict = defaultdict(list)

    def add_node(self, node: Any) -> None:
        self.adj_dict[node] = []

    def add_edge(self, u: Any, v: Any) -> None:
        if v not in self.adj_dict[u]:
            self.adj_dict[u].append(v)
