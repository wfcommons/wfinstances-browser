from pydantic import BaseModel


class Author(BaseModel):
    name: str
    email: str
    institution: str = None
    country: str = None

