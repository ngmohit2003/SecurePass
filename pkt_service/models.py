from pydantic import BaseModel

class CaptureStartResponse(BaseModel):
    capture_id: str
    message: str
