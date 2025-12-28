"""Parsers package for external data sources."""
from app.parsers.cian_parser import CianParser, CianProperty
from app.parsers.avito_parser import AvitoParser, AvitoProperty

__all__ = [
    "CianParser",
    "CianProperty",
    "AvitoParser",
    "AvitoProperty",
]
