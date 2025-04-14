import aiohttp
import logging
import json
import asyncio
from typing import Optional, AsyncGenerator, Dict, Any, List

logger = logging.getLogger("together_ai_llm")


class TogetherAIClient:
    """Client for interacting with Together AI API using their OpenAI-compatible interface."""

    def __init__(self, api_key: str):
        """Initialize Together AI client with API key."""
        self.api_key = api_key
        self.base_url = "https://api.together.xyz/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        logger.info("Initialized Together AI client")

    async def test_connection(self) -> bool:
        """Test the API connection with a simple request."""
        try:
            url = f"{self.base_url}/models"

            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, timeout=10) as response:
                    if response.status == 200:
                        logger.info("Together AI connection test successful")
                        return True
                    else:
                        error_text = await response.text()
                        logger.error(
                            f"Together AI connection test failed: {response.status}, {error_text}")
                        return False
        except Exception as e:
            logger.error(f"Together AI connection test error: {e}")
            return False

    async def stream_chat(
        self,
        prompt: str,
        model: str = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        temperature: float = 0.7,
        max_tokens: Optional[int] = 4000,
        system_prompt: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Stream response from Together AI Chat API using the OpenAI-compatible endpoint."""
        try:
            # The correct endpoint for chat completions
            url = f"{self.base_url}/chat/completions"

            # Format the messages for chat
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

            # Build request payload according to the OpenAI-compatible format
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": True,
                # Request JSON output
                "response_format": {"type": "json_object"}
            }

            logger.info(f"Streaming from Together AI model '{model}'")

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
                            f"Together AI API Error: Status={response.status}, Error={error_text}")
                        yield json.dumps({"error": "Together AI API Error", "message": error_text}) + "\n"
                        return

                    # Process the streaming response
                    async for line in response.content:
                        line_text = line.decode('utf-8').strip()

                        # Skip empty lines
                        if not line_text:
                            continue

                        # Skip non-data lines
                        if not line_text.startswith('data: '):
                            continue

                        # Extract the data
                        data_text = line_text[6:]  # Remove 'data: ' prefix

                        # Check for stream end
                        if data_text == "[DONE]":
                            break

                        try:
                            data = json.loads(data_text)

                            # Extract content based on OpenAI-compatible format
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
            logger.error(f"Together AI connection error: {e}")
            yield json.dumps({"error": "Connection Error", "message": str(e)}) + "\n"
        except asyncio.TimeoutError:
            logger.error("Together AI request timed out")
            yield json.dumps({"error": "Request timed out"}) + "\n"
        except Exception as e:
            logger.error(f"Together AI streaming error: {e}", exc_info=True)
            yield json.dumps({"error": "Streaming Error", "message": str(e)}) + "\n"

    async def list_models(self) -> List[Dict[str, Any]]:
        """List available models from Together AI."""
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
