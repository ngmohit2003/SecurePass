from fastapi import FastAPI
from auth_routes import auth_router
from password_routes import password_router

app = FastAPI(title="ToolKit Api Gateway")

app.include_router(auth_router, prefix="/auth")
app.include_router(password_router, prefix="/password")
