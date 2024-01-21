from pydantic import BaseModel, AnyUrl
from typing import Literal
from api.models.cpu import CPU

class Machine(BaseModel):
    system: Literal["linux", "macos", "windows"] = None
    architecture: str = None
    nodeName: str # TODO: change type to only allow a hostname
    release: str = None
    memoryInBytes: int = 0
    cpu: CPU = None


