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

    questionText: Optional[str] = None
    answerDetail: Optional[str] = None
    questionNumber: Optional[int] = None

    frontSide: Optional[str] = None
    backSide: Optional[str] = None
    difficulty: Optional[str] = None
    hint: Optional[str] = None


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

        if content_type == "lesson":
            required_types = ["lesson_introduction",
                              "lesson_core_concept", "lesson_summary"]
            found_types = [s.sectionType for s in v]
            for req_type in required_types:
                if req_type not in found_types:
                    logger.warning(
                        f"Missing required section type for lesson: {req_type}")

        elif content_type in ["quiz", "assessment"]:
            for i, section in enumerate(v):
                if not section.questionText or not section.answerDetail:
                    logger.warning(
                        f"Question {i+1} missing questionText or answerDetail")

        elif content_type == "flashcard":
            for i, section in enumerate(v):
                # Enforce section type is always "flashcard"
                if section.sectionType != "flashcard":
                    logger.warning(
                        f"Fixing incorrect flashcard sectionType: {section.sectionType}")
                    section.sectionType = "flashcard"

                # Validate frontSide exists
                if not section.frontSide:
                    logger.warning(f"Flashcard {i+1} missing frontSide")
                    # Try to extract from contentMarkdown if possible
                    if section.contentMarkdown:
                        # Extract question part if formatted as Q&A
                        question_match = re.search(r'\*\*Question:\*\*(.*?)(?:\*\*Answer:|$)',
                                                   section.contentMarkdown, re.DOTALL)
                        if question_match:
                            section.frontSide = question_match.group(1).strip()
                        else:
                            # Just use first part of contentMarkdown
                            parts = section.contentMarkdown.split('\n\n', 1)
                            section.frontSide = parts[0].strip()
                    else:
                        section.frontSide = section.title

                # Validate backSide exists
                if not section.backSide:
                    logger.warning(f"Flashcard {i+1} missing backSide")
                    # Try to extract from contentMarkdown if possible
                    if section.contentMarkdown:
                        # Extract answer part if formatted as Q&A
                        answer_match = re.search(r'\*\*Answer:\*\*(.*?)$',
                                                 section.contentMarkdown, re.DOTALL)
                        if answer_match:
                            section.backSide = answer_match.group(1).strip()
                        else:
                            # Just use second part of contentMarkdown
                            parts = section.contentMarkdown.split('\n\n', 1)
                            if len(parts) > 1:
                                section.backSide = parts[1].strip()
                            else:
                                section.backSide = "No answer provided."
                    else:
                        section.backSide = "No answer provided."

                # Set default difficulty if missing
                if not section.difficulty:
                    section.difficulty = "medium"

                # Clear contentMarkdown as it's not used for flashcards
                section.contentMarkdown = ""

        elif content_type == "cheatsheet":
            # Validate cheatsheet structure
            required_types = [
                "cheatsheet_introduction",
                "key_concepts",
                "formulas_rules",
                "examples_applications",
                "quick_reference"
            ]
            found_types = [s.sectionType for s in v]

            # Check for missing sections
            for req_type in required_types:
                if req_type not in found_types:
                    logger.warning(
                        f"Missing required section type for cheatsheet: {req_type}")

            # Fix section order if needed
            ordered_sections = []
            for req_type in required_types:
                matching = [s for s in v if s.sectionType == req_type]
                if matching:
                    ordered_sections.append(matching[0])
                    # If multiple sections of same type, keep only first
                    extra_sections = matching[1:] if len(matching) > 1 else []
                    for extra in extra_sections:
                        logger.warning(
                            f"Duplicate section '{req_type}' found, ignoring extras")

            # Add any sections that weren't in required types at the end
            for section in v:
                if section.sectionType not in required_types:
                    logger.warning(
                        f"Unexpected section type in cheatsheet: {section.sectionType}")
                    ordered_sections.append(section)

            # Return reordered sections if we had to fix something
            if len(ordered_sections) > 0 and [s.sectionType for s in ordered_sections] != [s.sectionType for s in v]:
                return ordered_sections

        elif content_type == "scenario":
            # Validate interactive scenario structure
            required_types = [
                "scenario_introduction",
                "scenario_context",
                "challenge_points",
                "guided_exploration",
                "reflection_questions"
            ]
            found_types = [s.sectionType for s in v]

            # Check for missing sections
            for req_type in required_types:
                if req_type not in found_types:
                    logger.warning(
                        f"Missing required section type for scenario: {req_type}")

            # Fix section order if needed
            ordered_sections = []
            for req_type in required_types:
                matching = [s for s in v if s.sectionType == req_type]
                if matching:
                    # For reflection_questions section, ensure it has the required fields
                    if req_type == "reflection_questions":
                        section = matching[0]
                        content_md = section.contentMarkdown or ""

                        # If questions field is missing, try to extract from contentMarkdown
                        if not hasattr(section, "questions") or not section.questions:
                            questions = []
                            # Extract questions that are formatted with numbers, bullets, etc.
                            q_matches = re.findall(
                                r'(?:^|\n)(?:\d+\.|\*|-|•|\?)?\s*(.*?\?)', content_md)
                            if q_matches:
                                questions = [q.strip()
                                             for q in q_matches if len(q.strip()) > 5]

                            # Add questions attribute if extracted
                            if questions:
                                setattr(section, "questions", questions)
                            else:
                                setattr(section, "questions", [
                                        "What did you learn from this scenario?"])

                        # If concepts field is missing, add a default
                        if not hasattr(section, "concepts") or not section.concepts:
                            # Try to extract key terms in caps or with asterisks
                            concepts = []
                            concept_matches = re.findall(
                                r'\*\*(.*?)\*\*|([A-Z][A-Z]+)', content_md)
                            if concept_matches:
                                # Flatten matches and remove duplicates
                                all_matches = [m[0] or m[1]
                                               for m in concept_matches]
                                concepts = list(
                                    set([m for m in all_matches if len(m) > 2]))

                            if concepts:
                                setattr(section, "concepts", concepts)
                            else:
                                setattr(section, "concepts", [
                                        "Topic understanding"])

                    ordered_sections.append(matching[0])

                    # If multiple sections of same type, keep only first
                    extra_sections = matching[1:] if len(matching) > 1 else []
                    for extra in extra_sections:
                        logger.warning(
                            f"Duplicate section '{req_type}' found, ignoring extras")

            # Add any sections that weren't in required types at the end
            for section in v:
                if section.sectionType not in required_types:
                    logger.warning(
                        f"Unexpected section type in scenario: {section.sectionType}")
                    ordered_sections.append(section)

            # Return reordered sections if we had to fix something
            if len(ordered_sections) > 0 and [s.sectionType for s in ordered_sections] != [s.sectionType for s in v]:
                return ordered_sections

        return v


class ResponseValidator:
    """Validates and fixes LLM response formats"""

    @staticmethod
    def extract_json(response: str) -> Tuple[str, bool]:
        """Extract JSON from a response that might contain other text"""
        try:
            json.loads(response)
            return response, True
        except json.JSONDecodeError:
            json_match = re.search(
                r'```(?:json)?\s*([\s\S]*?)\s*```', response)
            if json_match:
                try:
                    json_str = json_match.group(1).strip()
                    json.loads(json_str)
                    return json_str, True
                except json.JSONDecodeError:
                    pass

            json_match = re.search(r'(\{[\s\S]*\})', response)
            if json_match:
                try:
                    json_str = json_match.group(1).strip()
                    json.loads(json_str)
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

            if not isinstance(content, dict):
                raise ValueError("Response is not a JSON object")

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

            if "instructionalPlan" not in content:
                content["instructionalPlan"] = {}

            if "subject" not in content:
                content["subject"] = "unknown"

            if "sections" in content and isinstance(content["sections"], list):
                for i, section in enumerate(content["sections"]):
                    if not isinstance(section, dict):
                        logger.warning(f"Section {i} is not an object")
                        continue

                    if "sectionType" not in section:
                        section["sectionType"] = "unknown"

                    if "title" not in section:
                        section["title"] = f"Section {i+1}"

                    if "contentMarkdown" not in section:
                        section["contentMarkdown"] = ""

            # Apply special handling for flashcards
            if content.get("contentType") == "flashcard":
                content = ResponseValidator.fix_flashcard_formatting(content)
            elif content.get("contentType") == "cheatsheet":
                content = ResponseValidator.fix_cheatsheet_formatting(content)
            elif content.get("contentType") == "scenario":
                content = ResponseValidator.fix_scenario_formatting(content)

            try:
                validated = ContentResponse.model_validate(content)
                content = validated.model_dump()
            except Exception as e:
                logger.warning(f"Pydantic validation failed: {e}")

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

            array_fields = ["misconceptions", "knowledge_gaps", "reasoning_patterns",
                            "improvement_suggestions", "key_concepts_understood", "key_concepts_missed"]
            for field in array_fields:
                if field not in assessment or not isinstance(assessment[field], list):
                    assessment[field] = []

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

    @staticmethod
    def fix_flashcard_formatting(content: Dict[str, Any]) -> Dict[str, Any]:
        """Convert incorrect flashcard formats into the proper structure"""
        if content.get("contentType") != "flashcard" or not isinstance(content.get("sections"), list):
            return content

        fixed_sections = []
        for section in content["sections"]:
            fixed_section = dict(section)

            # Fix section type
            fixed_section["sectionType"] = "flashcard"

            # Handle existing question_answer sections
            if "questionText" in section and section["questionText"]:
                fixed_section["frontSide"] = section["questionText"]
            if "answerDetail" in section and section["answerDetail"]:
                fixed_section["backSide"] = section["answerDetail"]

            # Extract from content markdown if needed
            if "contentMarkdown" in section and section["contentMarkdown"]:
                content_md = section["contentMarkdown"]

                # Handle Q&A format
                q_pattern = re.compile(
                    r'^\s*\*\*Question:?\*\*\s*(.*?)(?=\s*\*\*Answer|\s*$)', re.DOTALL)
                a_pattern = re.compile(
                    r'^\s*\*\*Answer:?\*\*\s*(.*?)$', re.DOTALL)

                # Try to extract frontSide if not already set
                if not fixed_section.get("frontSide"):
                    q_match = q_pattern.search(content_md)
                    if q_match:
                        fixed_section["frontSide"] = q_match.group(1).strip()
                    else:
                        # Use first part before newlines
                        parts = content_md.split('\n\n', 1)
                        fixed_section["frontSide"] = parts[0].strip()

                # Try to extract backSide if not already set
                if not fixed_section.get("backSide"):
                    a_match = a_pattern.search(content_md)
                    if a_match:
                        fixed_section["backSide"] = a_match.group(1).strip()
                    else:
                        # Use second part after newlines
                        parts = content_md.split('\n\n', 1)
                        if len(parts) > 1:
                            fixed_section["backSide"] = parts[1].strip()

            # Ensure required fields exist
            if not fixed_section.get("frontSide"):
                fixed_section["frontSide"] = fixed_section.get(
                    "title", "Unknown concept")

            if not fixed_section.get("backSide"):
                fixed_section["backSide"] = "Information not provided."

            if not fixed_section.get("difficulty"):
                fixed_section["difficulty"] = "medium"

            # Clear contentMarkdown as it's not used
            fixed_section["contentMarkdown"] = ""

            fixed_sections.append(fixed_section)

        content["sections"] = fixed_sections
        return content

    @staticmethod
    def fix_cheatsheet_formatting(content: Dict[str, Any]) -> Dict[str, Any]:
        """Fix cheatsheet formatting issues"""
        if content.get("contentType") != "cheatsheet" or not isinstance(content.get("sections"), list):
            return content

        required_types = [
            "cheatsheet_introduction",
            "key_concepts",
            "formulas_rules",
            "examples_applications",
            "quick_reference"
        ]

        # Add missing sections
        found_types = [s.get("sectionType") for s in content["sections"]]
        for req_type in required_types:
            if req_type not in found_types:
                # Create the missing section
                title_map = {
                    "cheatsheet_introduction": "Overview",
                    "key_concepts": "Key Concepts",
                    "formulas_rules": "Formulas & Rules",
                    "examples_applications": "Examples",
                    "quick_reference": "Quick Reference"
                }

                content["sections"].append({
                    "sectionType": req_type,
                    "title": title_map.get(req_type, req_type.replace("_", " ").title()),
                    "contentMarkdown": f"Content for {req_type} section."
                })

        # Ensure proper ordering
        ordered_sections = []
        for req_type in required_types:
            matching = [s for s in content["sections"]
                        if s.get("sectionType") == req_type]
            if matching:
                ordered_sections.append(matching[0])

        # Add any non-standard sections at the end
        for section in content["sections"]:
            if section.get("sectionType") not in required_types:
                ordered_sections.append(section)

        content["sections"] = ordered_sections
        return content

    @staticmethod
    def fix_scenario_formatting(content: Dict[str, Any]) -> Dict[str, Any]:
        """Fix scenario formatting issues"""
        if content.get("contentType") != "scenario" or not isinstance(content.get("sections"), list):
            return content

        required_types = [
            "scenario_introduction",
            "scenario_context",
            "challenge_points",
            "guided_exploration",
            "reflection_questions"
        ]

        # Add missing sections
        found_types = [s.get("sectionType") for s in content["sections"]]
        for req_type in required_types:
            if req_type not in found_types:
                # Create the missing section
                title_map = {
                    "scenario_introduction": "The Scenario",
                    "scenario_context": "Context",
                    "challenge_points": "Challenges",
                    "guided_exploration": "Exploration",
                    "reflection_questions": "Reflection Questions"
                }

                # Special handling for reflection_questions
                if req_type == "reflection_questions":
                    content["sections"].append({
                        "sectionType": req_type,
                        "title": title_map.get(req_type),
                        "contentMarkdown": "Reflect on what you've learned from this scenario.",
                        "questions": ["What did you learn from this scenario?",
                                      "How can you apply this knowledge?"],
                        "concepts": ["Critical thinking", "Application"]
                    })
                else:
                    content["sections"].append({
                        "sectionType": req_type,
                        "title": title_map.get(req_type, req_type.replace("_", " ").title()),
                        "contentMarkdown": f"Content for {req_type} section."
                    })

        # Ensure reflection_questions has the required fields
        for section in content["sections"]:
            if section.get("sectionType") == "reflection_questions":
                if "questions" not in section:
                    section["questions"] = [
                        "What did you learn from this scenario?"]
                if "concepts" not in section:
                    section["concepts"] = ["Topic understanding"]

        # Ensure proper ordering
        ordered_sections = []
        for req_type in required_types:
            matching = [s for s in content["sections"]
                        if s.get("sectionType") == req_type]
            if matching:
                ordered_sections.append(matching[0])

        # Add any non-standard sections at the end
        for section in content["sections"]:
            if section.get("sectionType") not in required_types:
                ordered_sections.append(section)

        content["sections"] = ordered_sections
        return content
