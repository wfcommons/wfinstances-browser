from fastapi import Request, Response
from starlette.responses import JSONResponse


class InvalidWfInstanceException(Exception):
    """Exception to be raised when an WfInstance does not match the expected schema."""

    def __init__(self, detail: str):
        """Raise the exception with a detail message."""
        self.detail = detail


def invalid_wf_instance_exception_handler(request: Request, exc: InvalidWfInstanceException) -> Response:
    """
    Exception handler used with FastAPI (in main.py) to catch a raised InvalidWfInstanceException and return
    the 422 status code with the detail message.

    Args:
        request: Required request parameter that is handled by FastAPI
        exc: Required exception parameter to catch the InvalidWfInstanceException exception that is handled by FastAPI

    Returns: The 422 status code with the detail message
    """
    return JSONResponse(
        status_code=422,
        content={'detail': exc.detail}
    )
