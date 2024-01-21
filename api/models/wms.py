from pydantic import BaseModel, HttpUrl


class WMS(BaseModel):
    name: str
    version: str
    url: HttpUrl = None

