from pydantic import BaseModel


class CPU(BaseModel):
    count: int = None
    speed: int = None
    vendor: str = None

