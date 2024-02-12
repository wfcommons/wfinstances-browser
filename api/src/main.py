import uvicorn
from fastapi import FastAPI
from src.wfinstances.exceptions import InvalidWfInstanceException, invalid_wf_instance_exception_handler
from src.wfinstances.router import router as wf_instances_router
from src.metrics.router import router as metrics_router

app = FastAPI(swagger_ui_parameters={"displayRequestDuration": True})
app.include_router(wf_instances_router, prefix='/wf-instances')
app.include_router(metrics_router, prefix='/metrics')
app.add_exception_handler(InvalidWfInstanceException, invalid_wf_instance_exception_handler)

if __name__ == '__main__':
    uvicorn.run('main:app', host='localhost', port=8081, reload=True)
