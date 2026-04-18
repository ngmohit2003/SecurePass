from pydantic import BaseModel


class PasswordCreate(BaseModel):
    service_name: str
    username: str
    password: str


class PasswordUpdate(BaseModel):
    service_name: str
    username: str
    password: str
