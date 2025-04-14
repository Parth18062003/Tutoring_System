# filepath: d:\ITS\Server\RL\response_validator.py
import json
import re
from typing import Dict, Any, List, Optional, Union, Tuple
import logging
from pydantic import BaseModel, field_validator

logger = logging.getLogger("response_validator")


class ContentSection(BaseModel):
    """Base model for content sections"""
    sectionType: str
    title: str
    contentMarkdown: Optional[str] = None

    # Optional fields for different content types
    questionText: Optional[str] = None
    answerDetail: Optional[str] = None
    questionNumber: Optional[int] = None


class ContentResponse(BaseModel):
    """Base model for content responses"""
    contentType: str
    topic: str
    subject: str
    instructionalPlan: Dict[str, Any]
    sections: List[ContentSection]

    @field_validator('contentType')
    def validate_content_type(cls, v):
        valid_types = ["lesson", "quiz", "flashcard",
                       "cheatsheet", "explanation", "feedback", "assessment"]
        if v not in valid_types:
            logger.warning(f"Unexpected content type: {v}")
        return v

    @field_validator('sections')
    def validate_sections(cls, v, values):
        content_type = values.get('contentType')
        if not content_type:
            return v

        # Validate section structure based on content type
        if content_type == "lesson":
            # Check for required section types
            required_types = ["lesson_introduction",
                              "lesson_core_concept", "lesson_summary"]
            found_types = [s.sectionType for s in v]
            for req_type in required_types:
                if req_type not in found_types:
                    logger.warning(
                        f"Missing required section type for lesson: {req_type}")

        elif content_type in ["quiz", "assessment"]:
            # Ensure all sections have questionText and answerDetail
            for i, section in enumerate(v):
                if not section.questionText or not section.answerDetail:
                    logger.warning(
                        f"Question {i+1} missing questionText or answerDetail")

        return v


class ResponseValidator:
    """Validates and fixes LLM response formats"""

    @staticmethod
    def extract_json(response: str) -> Tuple[str, bool]:
        """Extract JSON from a response that might contain other text"""
        # Look for JSON block
        try:
            # Try simple loads first
            json.loads(response)
            return response, True
        except json.JSONDecodeError:
            # Look for JSON in markdown code blocks
            json_match = re.search(
                r'```(?:json)?\s*([\s\S]*?)\s*```', response)
            if json_match:
                try:
                    json_str = json_match.group(1).strip()
                    json.loads(json_str)  # Validate
                    return json_str, True
                except json.JSONDecodeError:
                    pass

            # Try to find JSON object with regex
            json_match = re.search(r'(\{[\s\S]*\})', response)
            if json_match:
                try:
                    json_str = json_match.group(1).strip()
                    json.loads(json_str)  # Validate
                    return json_str, True
                except json.JSONDecodeError:
                    pass

            return response, False

    @staticmethod
    def validate_content_response(response: str) -> Dict[str, Any]:
        """Validate and fix a content response"""
        json_str, is_valid_json = ResponseValidator.extract_json(response)

        if not is_valid_json:
            logger.error(f"Failed to extract valid JSON from response")
            # Return error response
            return {
                "error": "invalid_json",
                "message": "Failed to parse response as JSON",
                "content": {
                    "contentType": "error",
                    "sections": [{
                        "sectionType": "error",
                        "title": "Error",
                        "contentMarkdown": "There was an error processing this content. Please try again."
                    }]
                }
            }

        try:
            content = json.loads(json_str)

            # Basic structure validation
            if not isinstance(content, dict):
                raise ValueError("Response is not a JSON object")

            # Ensure required top-level fields exist
            required_fields = ["contentType", "topic", "sections"]
            missing = [f for f in required_fields if f not in content]
            if missing:
                logger.warning(f"Missing required fields: {missing}")
                for field in missing:
                    if field == "contentType":
                        content["contentType"] = "unknown"
                    elif field == "topic":
                        content["topic"] = "unknown"
                    elif field == "sections":
                        content["sections"] = []

            # Ensure instructionalPlan exists
            if "instructionalPlan" not in content:
                content["instructionalPlan"] = {}

            # Ensure subject exists
            if "subject" not in content:
                content["subject"] = "unknown"

            # Validate sections
            if "sections" in content and isinstance(content["sections"], list):
                for i, section in enumerate(content["sections"]):
                    # Ensure section has required fields
                    if not isinstance(section, dict):
                        logger.warning(f"Section {i} is not an object")
                        continue

                    if "sectionType" not in section:
                        section["sectionType"] = "unknown"

                    if "title" not in section:
                        section["title"] = f"Section {i+1}"

                    if "contentMarkdown" not in section:
                        section["contentMarkdown"] = ""

            # Try to validate with Pydantic
            try:
                validated = ContentResponse.model_validate(content)
                content = validated.model_dump()
            except Exception as e:
                logger.warning(f"Pydantic validation failed: {e}")

            return {"content": content}

        except Exception as e:
            logger.error(f"Error validating content response: {e}")
            return {
                "error": "validation_error",
                "message": str(e),
                "content": {
                    "contentType": "error",
                    "sections": [{
                        "sectionType": "error",
                        "title": "Error",
                        "contentMarkdown": "There was an error processing this content. Please try again."
                    }]
                }
            }

    @staticmethod
    def validate_assessment_response(response: str) -> Dict[str, Any]:
        """Validate assessment response"""
        json_str, is_valid_json = ResponseValidator.extract_json(response)

        if not is_valid_json:
            logger.error(
                f"Failed to extract valid JSON from assessment response")
            return {
                "error": "invalid_json",
                "score": 0,
                "correct": False,
                "feedback": "Error processing assessment. Please try again.",
                "misconceptions": [],
                "knowledge_gaps": []
            }

        try:
            assessment = json.loads(json_str)

            # Ensure required fields
            required_fields = ["score", "correct", "feedback"]
            missing = [f for f in required_fields if f not in assessment]
            if missing:
                logger.warning(
                    f"Missing required assessment fields: {missing}")
                for field in missing:
                    if field == "score":
                        assessment["score"] = 0
                    elif field == "correct":
                        assessment["correct"] = False
                    elif field == "feedback":
                        assessment["feedback"] = "No feedback available."

            # Ensure array fields
            array_fields = ["misconceptions", "knowledge_gaps", "reasoning_patterns",
                            "improvement_suggestions", "key_concepts_understood", "key_concepts_missed"]
            for field in array_fields:
                if field not in assessment or not isinstance(assessment[field], list):
                    assessment[field] = []

            # Validate score
            if "score" in assessment:
                try:
                    score = float(assessment["score"])
                    assessment["score"] = max(0, min(100, score))
                except (ValueError, TypeError):
                    assessment["score"] = 0

            return assessment

        except Exception as e:
            logger.error(f"Error validating assessment response: {e}")
            return {
                "error": "validation_error",
                "message": str(e),
                "score": 0,
                "correct": False,
                "feedback": "Error processing assessment. Please try again.",
                "misconceptions": [],
                "knowledge_gaps": []
            }
