import uvicorn
from fastapi import FastAPI
from routers.router import router

app = FastAPI()
app.include_router(router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8081, reload=True)
