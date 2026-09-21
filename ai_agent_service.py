"""FastAPI diagnostic service backed by LangChain and Qdrant.

Required environment variables: OPENAI_API_KEY, QDRANT_URL, QDRANT_API_KEY.
"""

from __future__ import annotations

import os
from typing import Literal

from fastapi import FastAPI, HTTPException
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from pydantic import BaseModel, Field
from qdrant_client import QdrantClient

app = FastAPI(title="OCP Zone 4 Maintenance Diagnostic Agent")


class Telemetry(BaseModel):
    temp: float = Field(..., description="Engine temperature")
    pressure: float = Field(..., description="Hydraulic pressure")


class DiagnosticRequest(BaseModel):
    equipment_code: str
    current_telemetry: Telemetry
    recent_downtime_codes: list[str] = Field(default_factory=list)


class DiagnosticResponse(BaseModel):
    anomaly_summary: str
    health_score: int = Field(..., ge=0, le=100)
    status: Literal["CRITICAL", "WARNING", "HEALTHY"]
    recommended_action: str


parser = PydanticOutputParser(pydantic_object=DiagnosticResponse)


def build_chain():
    missing = [name for name in ("OPENAI_API_KEY", "QDRANT_URL", "QDRANT_API_KEY") if not os.getenv(name)]
    if missing:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")
    client = QdrantClient(url=os.environ["QDRANT_URL"], api_key=os.environ["QDRANT_API_KEY"])
    vector_store = QdrantVectorStore(
        client=client,
        collection_name=os.getenv("QDRANT_COLLECTION", "historical_breakdowns"),
        embedding=OpenAIEmbeddings(model="text-embedding-3-small"),
    )
    retriever = vector_store.as_retriever(search_kwargs={"k": 4})
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are an Expert OCP Zone 4 Fleet Maintenance Supervisor. "
                "Use only the supplied telemetry and historical context. "
                "Return only valid JSON matching this schema:\n{format_instructions}",
            ),
            (
                "human",
                "Equipment: {equipment_code}\nCurrent telemetry: {telemetry}\n"
                "Recent downtime codes: {downtime_codes}\nHistorical context:\n{context}",
            ),
        ]
    ).partial(format_instructions=parser.get_format_instructions())
    return retriever, prompt | llm | parser


@app.post("/diagnose", response_model=DiagnosticResponse)
def diagnose(request: DiagnosticRequest) -> DiagnosticResponse:
    try:
        retriever, chain = build_chain()
        query = (
            f"{request.equipment_code} engine temperature {request.current_telemetry.temp}; "
            f"hydraulic pressure {request.current_telemetry.pressure}; "
            f"downtime codes {request.recent_downtime_codes}"
        )
        documents = retriever.invoke(query)
        context = "\n\n".join(document.page_content for document in documents)
        result = chain.invoke(
            {
                "equipment_code": request.equipment_code,
                "telemetry": request.current_telemetry.model_dump_json(),
                "downtime_codes": request.recent_downtime_codes,
                "context": context or "No similar historical breakdown found.",
            }
        )
        return result
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Diagnostic provider unavailable") from exc
