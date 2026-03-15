"""
FEMS - Holiday Model
"""
from sqlalchemy import Column, Integer, String, Date, Text, Boolean
from app.core.database import Base


class Holiday(Base):
    __tablename__ = "holidays"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    holiday_date = Column(Date, nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    is_floating = Column(Boolean, default=False)
    is_restricted = Column(Boolean, default=False)
