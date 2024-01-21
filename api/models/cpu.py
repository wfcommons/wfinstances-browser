from pydantic import BaseModel


class CPU(BaseModel):
    count: int
    speed: int
    vendor: str

