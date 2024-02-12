from fastapi import Request, Response
from starlette.responses import JSONResponse


class InvalidWfInstanceException(Exception):
    def __init__(self, detail: str):
        self.detail = detail


def invalid_wf_instance_exception_handler(request: Request, exc: InvalidWfInstanceException) -> Response:
    return JSONResponse(
        status_code=422,
        content={'detail': exc.detail}
    )
