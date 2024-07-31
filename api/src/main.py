import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.exceptions import GithubResourceNotFoundException, github_resource_not_found_exception_handler
from src.wfinstances.router import router as wf_instances_router
from src.metrics.router import router as metrics_router

app = FastAPI(swagger_ui_parameters={"displayRequestDuration": True})
app.include_router(wf_instances_router, prefix='/wf-instances')
app.include_router(metrics_router, prefix='/metrics')
app.add_exception_handler(GithubResourceNotFoundException, github_resource_not_found_exception_handler)

# origins=['http://localhost:8080']  # Original code
origins = ["http://wfinstances-browser-ui:8080", "http://localhost:8080", "http://wfinstances-browser-nginx:80", "http://wfinstances-browser-nginx"]
# origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

if __name__ == '__main__':
    import sys
    uvicorn.run('main:app', host='localhost', port=8081, reload=True)
