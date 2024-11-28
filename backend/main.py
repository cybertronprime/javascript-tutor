from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import anthropic
import os
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from dotenv import load_dotenv
import json


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Get the root directory path (two levels up from this file)
ROOT_DIR = Path(__file__).parent.parent

# Load environment variables from root directory
load_dotenv(ROOT_DIR / '.env')

# Initialize Anthropic client
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_API_KEY:
    raise ValueError("ANTHROPIC_API_KEY not found in environment variables")

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

class QueryRequest(BaseModel):
    prompt: str

class CodeResponse(BaseModel):
    code: Optional[str]
    explanation: Optional[str]
    error: Optional[str]

# System prompt with examples
SYSTEM_PROMPT = """You are a JavaScript coding tutor API that generates TypeScript/JavaScript functions based on user requests. 
Your responses must always follow this JSON format:
{
    "code": "function example() { ... }",
    "explanation": "A brief, two-line explanation on how the function works"
}

Key requirements:
1. Only respond to requests about JavaScript/TypeScript functions
2. Always include type annotations in your code
3. Keep explanations concise and focused
4. Return null for non-coding questions
5. Provide optimized, modern JavaScript solutions
6. Include error handling where appropriate
7. Follow clean code principles

Example valid queries and responses:

Query: "how to add two numbers"
Response: {
    "code": "function add(num1: number, num2: number): number {\n  return num1 + num2;\n}",
    "explanation": "This function takes two parameters and returns their sum."
}

Query: "create a function to check if string is palindrome"
Response: {
    "code": "function isPalindrome(str: string): boolean {\n  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return cleaned === cleaned.split('').reverse().join('');\n}",
    "explanation": "Checks if a string reads the same forwards and backwards, ignoring case and non-alphanumeric characters"
}

Query: "what's your favorite color?"
response: null
{
    "code": "function functionName(param: type): returnType {\\n  // code here\\n}",
    "explanation": "Brief explanation"
}

Note: All code must be properly escaped in the JSON response.

For non-coding questions, respond with exactly: null

Example response format:

response:{
    "code": "function add(a: number, b: number): number {\\n  return a + b;\\n}",
    "explanation": "Adds two numbers and returns their sum"
}

Remember:
- Only provide code for JavaScript/TypeScript functions
- Always include TypeScript types
- Keep explanations brief and clear
- Return null for non-coding questions
- Focus on modern JavaScript practices
- Optimize for readability and maintainability

Your response should only contain the JSON object with code and explanation fields, nothing else."""


@app.post("/api/generate")
async def generate_code(request: QueryRequest):
    try:
        if not request.prompt:
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")

        message = client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=1000,
            messages=[
                {
                    "role": "user",
                    "content": request.prompt
                }
            ],
            system=SYSTEM_PROMPT
        )

        response_text = message.content[0].text

        try:
            # Clean the response text - remove any potential whitespace/invalid chars
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
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")