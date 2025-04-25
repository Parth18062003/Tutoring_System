from pydantic import BaseModel, Field
from typing import Optional, List
import logging
import os
from enum import Enum

logger = logging.getLogger("config")


class LogLevel(str, Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class DatabaseConfig(BaseModel):
    mongo_url: str = Field(default="", description="MongoDB connection string")
    mongo_db_name: str = Field(default="", description="MongoDB database name")

    neo4j_uri: Optional[str] = Field(None, description="Neo4j connection URI")
    neo4j_username: str = Field("neo4j", description="Neo4j username")
    neo4j_password: Optional[str] = Field(None, description="Neo4j password")
    neo4j_database: str = Field("neo4j", description="Neo4j database name")


class LLMConfig(BaseModel):
    together_api_key: Optional[str] = Field(
        None, description="Together AI API key")
    together_model: str = Field("meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
                                description="Together AI model to use")

    ollama_host: Optional[str] = Field(None, description="Ollama host address")
    ollama_model: str = Field(
        "mistral:latest", description="Ollama model to use")

    open_router_api_key: Optional[str] = Field(
        None, description="OpenRouter API key")
    open_router_model: str = Field("google/gemini-2.0-flash-exp:free",
                                   description="OpenRouter model to use")

    default_temperature: float = Field(0.7, ge=0.0, le=1.0)
    default_max_tokens: int = Field(4000, ge=100)


class EmbeddingConfig(BaseModel):
    mistral_api_key: Optional[str] = Field(
        None, description="Mistral AI API key")
    embedding_model_name: Optional[str] = Field(
        "mistral-embed", description="Embedding model name")
    embedding_dimension: Optional[int] = Field(
        None, description="Embedding dimension")

    mistral_ocr_model: Optional[str] = Field(
        None, description="Mistral OCR model")
    mistral_extract_model: Optional[str] = Field(
        None, description="Mistral extraction model")
    ocr_poll_interval: int = Field(
        10, description="OCR polling interval in seconds")
    ocr_max_wait_time: int = Field(
        600, description="Maximum OCR wait time in seconds")


class RLConfig(BaseModel):
    model_path: Optional[str] = Field(None, description="Path to RL model")
    available: bool = Field(False, description="Whether RL is available")
    sb3_logging_level: str = Field(
        "INFO", description="Stable Baselines3 logging level")


class SecurityConfig(BaseModel):
    internal_api_secret: Optional[str] = Field(
        None, description="Secret for internal API requests")
    cors_origins: List[str] = Field(default=["*", "http://localhost:3000"])


class RAGConfig(BaseModel):
    """Configuration for Retrieval Augmented Generation"""
    vector_index_name: str = Field(
        "chunkVectorIndex", description="Name of the vector index in Neo4j")
    default_top_k: int = Field(
        3, description="Default number of chunks to retrieve", ge=1, le=10)
    minimum_similarity: float = Field(
        0.7, description="Minimum similarity score for retrieval", ge=0, le=1.0)
    context_chars_per_chunk: int = Field(
        600, description="Maximum characters to include per chunk")
    enable_cross_chapter: bool = Field(
        False, description="Whether to search across all chapters")
    max_total_context_length: int = Field(
        3000, description="Maximum total context length in characters")


class APIConfig(BaseModel):
    host: str = Field("0.0.0.0", description="API host")
    port: int = Field(8000, description="API port")
    reload: bool = Field(True, description="Enable auto-reload")
    log_level: str = Field("INFO", description="Logging level")
    version: str = Field("0.7.1", description="API version")


class AppConfig(BaseModel):
    """Application configuration"""
    database: DatabaseConfig
    llm: LLMConfig
    embedding: EmbeddingConfig
    rl: RLConfig
    security: SecurityConfig
    api: APIConfig
    rag: RAGConfig


def load_config() -> AppConfig:
    """Load and validate application configuration."""
    try:
        db_config = DatabaseConfig(
            mongo_url=os.getenv("MONGO_URL", ""),
            mongo_db_name=os.getenv("MONGO_DB_NAME", ""),
            neo4j_uri=os.getenv("NEO4J_URI"),
            neo4j_username=os.getenv("NEO4J_USERNAME", "neo4j"),
            neo4j_password=os.getenv("NEO4J_PASSWORD"),
            neo4j_database=os.getenv("NEO4J_DATABASE", "neo4j")
        )

        llm_config = LLMConfig(
            together_api_key=os.getenv("TOGETHER_API_KEY"),
            together_model=os.getenv(
                "TOGETHER_MODEL", "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"),
            open_router_api_key=os.getenv("OPEN_ROUTER_API_KEY"),
            open_router_model=os.getenv(
                "OPEN_ROUTER_MODEL", "google/gemini-2.0-flash-exp:free"),
            ollama_host=os.getenv("OLLAMA_HOST"),
            ollama_model=os.getenv("OLLAMA_MODEL", "mistral:latest"),
            default_temperature=float(os.getenv("DEFAULT_TEMPERATURE", "0.7")),
            default_max_tokens=int(os.getenv("DEFAULT_MAX_TOKENS", "4000"))
        )

        embedding_config = EmbeddingConfig(
            mistral_api_key=os.getenv("MISTRAL_API_KEY"),
            embedding_model_name=os.getenv(
                "EMBEDDING_MODEL_NAME", "mistral-embed"),
            embedding_dimension=int(os.getenv("EMBEDDING_DIMENSION")) if os.getenv(
                "EMBEDDING_DIMENSION") else None,
            mistral_ocr_model=os.getenv("MISTRAL_OCR_MODEL"),
            mistral_extract_model=os.getenv("MISTRAL_EXTRACT_MODEL"),
            ocr_poll_interval=int(os.getenv("OCR_POLL_INTERVAL", "10")),
            ocr_max_wait_time=int(os.getenv("OCR_MAX_WAIT_TIME", "600"))
        )

        rl_path = os.getenv("RL_MODEL_PATH")
        rl_config = RLConfig(
            model_path=rl_path,
            available=bool(rl_path and os.path.exists(rl_path)),
            sb3_logging_level=os.getenv("SB3_LOGGING_LEVEL", "INFO")
        )

        security_config = SecurityConfig(
            internal_api_secret=os.getenv("INTERNAL_API_SECRET")
        )

        api_config = APIConfig(
            host=os.getenv("HOST", "0.0.0.0"),
            port=int(os.getenv("PORT", "8000")),
            reload=os.getenv("RELOAD", "True").lower() == "true",
            log_level=os.getenv("LOG_LEVEL", "INFO"),
            version=os.getenv("API_VERSION", "0.7.1")
        )

        rag_config = RAGConfig(
            vector_index_name=os.getenv(
                "VECTOR_INDEX_NAME", "chunkVectorIndex"),
            default_top_k=int(os.getenv("DEFAULT_TOP_K", "3")),
            minimum_similarity=float(os.getenv("MINIMUM_SIMILARITY", "0.7")),
            context_chars_per_chunk=int(
                os.getenv("CONTEXT_CHARS_PER_CHUNK", "600")),
            enable_cross_chapter=os.getenv(
                "ENABLE_CROSS_CHAPTER", "False").lower() == "true",
            max_total_context_length=int(
                os.getenv("MAX_TOTAL_CONTEXT_LENGTH", "3000"))
        )

        config = AppConfig(
            database=db_config,
            llm=llm_config,
            embedding=embedding_config,
            rl=rl_config,
            security=security_config,
            api=api_config,
            rag=rag_config
        )

        if not config.database.mongo_url or not config.database.mongo_db_name:
            logger.warning("MongoDB configuration incomplete")

        if not config.embedding.mistral_api_key or not config.embedding.embedding_model_name:
            logger.warning(
                "Mistral API configuration incomplete. Embeddings may be unavailable.")

        if not config.llm.together_api_key and not config.llm.open_router_api_key and not config.llm.ollama_host:
            logger.warning(
                "No LLM providers configured (Together AI, Open Router or Ollama)")

        return config
    except Exception as e:
        logger.critical(f"Configuration error: {e}")
        raise
