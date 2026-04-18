from pydantic import BaseModel, Field

class DomainIntelRequest(BaseModel):
    domain: str = Field(..., example="example.com")

class DomainIntelResponse(BaseModel):
    domain: str
    status: str
    message: str


class DomainRequest(BaseModel):
    domain: str = Field(..., example="instagram.com")
