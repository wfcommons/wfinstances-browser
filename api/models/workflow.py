from typing import List, Union
from pydantic import BaseModel
from datetime import datetime
from models.machine import Machine
from models.task import Task

class Workflow(BaseModel):
    makespanInSeconds: Union[int, float]
    executedAt: datetime
    machines: List[Machine] = None
    tasks: List[Task]

