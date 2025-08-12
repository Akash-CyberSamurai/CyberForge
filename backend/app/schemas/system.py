from pydantic import BaseModel
from typing import Optional

class SystemConfigUpdate(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
