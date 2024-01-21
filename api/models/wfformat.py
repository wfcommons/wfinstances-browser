from typing import Literal
from datetime import datetime
from pydantic import BaseModel
from api.models.wms import WMS
from api.models.author import Author
from api.models.workflow import Workflow


class WfFormat(BaseModel):
    name: str
    description: str = None
    createdAt: datetime = None
    schemaVersion: Literal["1.0", "1.1", "1.2", "1.3", "1.4"]
    wms: WMS = None
    author: Author = None
    workflow: Workflow
