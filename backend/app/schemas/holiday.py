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

class HolidayUpdate(BaseModel):
    name: Optional[str] = None
    holiday_date: Optional[date] = None
    description: Optional[str] = None
    is_floating: Optional[bool] = None
    is_restricted: Optional[bool] = None

class HolidayOut(HolidayBase):
    id: int

    class Config:
        from_attributes = True
