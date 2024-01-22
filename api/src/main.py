import uvicorn
from fastapi import FastAPI
from src.router import router
from src.metrics.router import router as metrics_router

app = FastAPI()
app.include_router(router)
app.include_router(metrics_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8081, reload=True)
