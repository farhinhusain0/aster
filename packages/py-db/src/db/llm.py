from db.base import BaseModel
from db.db_types import LLM

llm_model = BaseModel[LLM](collection_name="llm", model_class=LLM)
