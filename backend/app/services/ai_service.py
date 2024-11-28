import json
import anthropic
from app.core.config import ANTHROPIC_API_KEY
from app.core.constants import SYSTEM_PROMPT

class AIService:
    """
    Service for handling AI code generation requests
    """
    def __init__(self):
        """Initialize Anthropic client"""
        self.client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    async def generate_code(self, prompt: str):
        """
        Generate code based on user prompt
        """
        try:
            # Create message using Anthropic API
            message = self.client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=1000,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                system=SYSTEM_PROMPT
            )

            response_text = message.content[0].text

            try:
                # Clean response text
                response_text = response_text.strip()
                
                # Handle non-coding questions
                if response_text.lower() == "null":
                    return {"error": "Cannot process non-coding questions"}

                # Parse JSON while preserving newlines
                response_data = json.loads(response_text)
                
                # Validate response structure
                if not isinstance(response_data, dict) or 'code' not in response_data or 'explanation' not in response_data:
                    return {"error": "Invalid response format"}
                    
                return {
                    "code": response_data["code"],
                    "explanation": response_data["explanation"]
                }
                
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {e}")
                print(f"Raw response: {response_text}")
                return {"error": "Invalid response format"}

        except Exception as e:
            print(f"Error in generate_code: {str(e)}")
            raise Exception(str(e))