from fastapi import Request, Response
from starlette.responses import JSONResponse


class InvalidWfInstanceException(Exception):
    """Exception to be raised when an WfInstance does not match the expected schema."""

    def __init__(self, detail: str):
        """Raise the exception with a detail message."""
        self.detail = detail


class GithubResourceNotFoundException(Exception):
    def __init__(self, resource_type: str):
        self.detail = f'Github {resource_type} resource not found'


def github_resource_not_found_exception_handler(request: Request, exc: GithubResourceNotFoundException) -> Response:
    """
    Exception handler used with FastAPI (in main.py) to catch a raised GithubResourceNotFoundException and return
    the 404 status code with the detail message at an endpoint.

    Args:
        request: Required request parameter that is handled by FastAPI
        exc: Required exception parameter to catch the GithubResourceNotFoundException exception that is handled by FastAPI

    Returns: The 404 status code with the detail message
    """
    return JSONResponse(
        status_code=404,
        content={'detail': exc.detail}
    )
