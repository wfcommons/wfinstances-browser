from typing import Literal
from pydantic import BaseModel


class File(BaseModel):
    name: str
    sizeInBytes: int
    link: Literal["input", "output"]
