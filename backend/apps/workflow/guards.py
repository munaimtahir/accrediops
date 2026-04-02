from contextlib import contextmanager
from contextvars import ContextVar


_workflow_transition_allowed = ContextVar(
    "workflow_transition_allowed",
    default=False,
)


@contextmanager
def allow_workflow_transition():
    token = _workflow_transition_allowed.set(True)
    try:
        yield
    finally:
        _workflow_transition_allowed.reset(token)


def workflow_transition_is_allowed() -> bool:
    return _workflow_transition_allowed.get()
