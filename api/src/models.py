from typing import Literal, Union, List
from datetime import datetime
from pydantic import BaseModel, HttpUrl


class WMS(BaseModel):
    name: str
    version: str
    url: HttpUrl = None


class Author(BaseModel):
    name: str
    email: str
    institution: str = None
    country: str = None


class CPU(BaseModel):
    count: int = None
    speed: int = None
    vendor: str = None


class Machine(BaseModel):
    system: Literal["linux", "macos", "windows"] = None
    architecture: str = None
    nodeName: str  # TODO: change type to only allow a hostname
    release: str = None
    memoryInBytes: int = 0
    cpu: CPU = None


class Command(BaseModel):
    program: str = None
    arguments: List[str]


class File(BaseModel):
    name: str
    sizeInBytes: int
    link: Literal["input", "output"]


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


class Workflow(BaseModel):
    makespanInSeconds: Union[int, float]
    executedAt: datetime
    machines: List[Machine] = None
    tasks: List[Task]


class WfFormat(BaseModel):
    name: str
    description: str = None
    createdAt: datetime = None
    schemaVersion: Literal["1.0", "1.1", "1.2", "1.3", "1.4"]
    wms: WMS = None
    author: Author = None
    workflow: Workflow
