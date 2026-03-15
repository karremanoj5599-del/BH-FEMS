from pydantic import BaseModel
from typing import Optional
from datetime import date

class HolidayBase(BaseModel):
    name: str
    holiday_date: date
    description: Optional[str] = None
    is_floating: Optional[bool] = False
    is_restricted: Optional[bool] = False

class HolidayCreate(HolidayBase):
    pass

class HolidayOut(HolidayBase):
    id: int

    class Config:
        from_attributes = True
