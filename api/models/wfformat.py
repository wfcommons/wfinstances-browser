from typing import Literal
from datetime import datetime
from pydantic import BaseModel
from models.wms import WMS
from models.author import Author
from models.workflow import Workflow


class WfFormat(BaseModel):
    name: str
    description: str = None
    createdAt: datetime = None
    schemaVersion: Literal["1.0", "1.1", "1.2", "1.3", "1.4"]
    wms: WMS = None
    author: Author = None
    workflow: Workflow


