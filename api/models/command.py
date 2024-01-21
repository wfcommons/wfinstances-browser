from typing import List
from pydantic import BaseModel

class Command(BaseModel):
    program: str = None
    arguments: List[str]

