from typing import List, Union
from pydantic import BaseModel
from datetime import datetime
from api.models.machine import Machine
from api.models.task import Task

class Workflow(BaseModel):
    makespanInSeconds: Union[int, float]
    executedAt: datetime
    machines: List[Machine] = None
    tasks: List[Task]

