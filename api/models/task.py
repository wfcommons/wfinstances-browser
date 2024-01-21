from typing import List, Literal, Union
from pydantic import BaseModel
from models.command import Command
from models.file import File


class Task(BaseModel):
    name: str
    id: str = None
    category: str = None
    type: Literal["compute", "transfer", "auxiliary"]
    command: Command = None
    parents: List[str] = None  # Todo: Apply regex pattern ^[0-9a-zA-Z-_.]*$
    files: List[File] = None
    runtimeInSeconds: Union[int, float] = None
    cores: Union[int, float] = None
    avgCpu: Union[int, float] = None
    readBytes: Union[int, float] = None
    writtenBytes: Union[int, float] = None
    memoryInBytes: Union[int, float] = None
    energy: Union[int, float] = None
    avgPower: Union[int, float] = None
    priority: Union[int, float] = None
    machine: str = None
