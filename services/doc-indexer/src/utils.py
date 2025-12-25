import os


def is_enterprise():
    """
    Returns True if the current environment is an enterprise environment.
    """
    return "ASTER_CLOUD_REGION" in os.environ
