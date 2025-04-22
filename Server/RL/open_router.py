import aiohttp
import logging
import json
import asyncio
from typing import Optional, AsyncGenerator, Dict, Any, List

logger = logging.getLogger("open_router_llm")


class OpenRouterClient:
    """Client for interacting with OpenRouter API using their OpenAI-compatible interface."""

    def __init__(self, api_key: str):
        """Initialize OpenRouter client with API key."""
        self.api_key = api_key
        self.base_url = "https://openrouter.ai/api/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        logger.info("Initialized OpenRouter client")

    async def test_connection(self) -> bool:
        """Test the API connection with a simple request."""
        try:
            url = f"{self.base_url}/credits"

            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, timeout=10) as response:
                    if response.status == 200:
                        logger.info("OpenRouter connection test successful")
                        return True
                    else:
                        error_text = await response.text()
                        logger.error(
                            f"OpenRouter connection test failed: {response.status}, {error_text}")
                        return False
        except Exception as e:
            logger.error(f"OpenRouter connection test error: {e}")
            return False

    async def stream_chat(
        self,
        prompt: str,
        # Default to a popular OpenRouter model
        model: str = "deepseek/deepseek-v3-base:free",
        temperature: float = 0.7,
        max_tokens: Optional[int] = 4000,
        system_prompt: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Stream response from OpenRouter Chat API using the OpenAI-compatible endpoint."""
        try:
            url = f"{self.base_url}/chat/completions"

            messages = []
            if system_prompt:
                messages.append({
                    "role": "system",
                    "content": system_prompt
                })

            messages.append({
                "role": "user",
                "content": prompt
            })

            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": True,
            }

            logger.info(f"Streaming from OpenRouter model '{model}'")

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    headers=self.headers,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=120)
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(
                            f"OpenRouter API Error: Status={response.status}, Error={error_text}")
                        yield json.dumps({"error": "OpenRouter API Error", "message": error_text}) + "\n"
                        return

                    async for line in response.content:
                        line_text = line.decode('utf-8').strip()

                        if not line_text:
                            continue

                        if not line_text.startswith('data: '):
                            continue

                        data_text = line_text[6:]

                        if data_text == "[DONE]":
                            break

                        try:
                            data = json.loads(data_text)

                            if "choices" in data and data["choices"] and len(data["choices"]) > 0:
                                choice = data["choices"][0]
                                if "delta" in choice and "content" in choice["delta"]:
                                    content = choice["delta"]["content"]
                                    if content:
                                        yield content
                        except json.JSONDecodeError:
                            logger.warning(
                                f"Could not parse JSON from stream: {data_text}")
                        except Exception as e:
                            logger.error(
                                f"Error processing stream content: {e}")

        except aiohttp.ClientError as e:
            logger.error(f"OpenRouter connection error: {e}")
            yield json.dumps({"error": "Connection Error", "message": str(e)}) + "\n"
        except asyncio.TimeoutError:
            logger.error("OpenRouter request timed out")
            yield json.dumps({"error": "Request timed out"}) + "\n"
        except Exception as e:
            logger.error(f"OpenRouter streaming error: {e}", exc_info=True)
            yield json.dumps({"error": "Streaming Error", "message": str(e)}) + "\n"

    async def list_models(self) -> List[Dict[str, Any]]:
        """List available models from OpenRouter."""
        try:
            url = f"{self.base_url}/models"

            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, timeout=15) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(
                            f"Failed to list models: {response.status}, {error_text}")
                        return []

                    response_data = await response.json()
                    return response_data.get("data", [])
        except Exception as e:
            logger.error(f"Error listing models: {e}")
            return []
