import os
from enum import Enum
from typing import Dict, Optional, Any, Union
from pydantic import BaseModel, Field
import json
import logging

logger = logging.getLogger("prompt_manager")


class PromptCategory(str, Enum):
    CONTENT_GENERATION = "content_generation"
    ASSESSMENT = "assessment"
    RAG = "rag"
    FEEDBACK = "feedback"
    EXERCISE = "exercise"
    METACOGNITIVE = "metacognitive"


class PromptTemplate(BaseModel):
    """Base model for all prompt templates"""
    template_id: str
    category: PromptCategory
    template: str
    description: str
    version: str = "1.0"
    parameters: Dict[str, str] = Field(default_factory=dict)
    example_values: Dict[str, Any] = Field(default_factory=dict)

    def format(self, **kwargs) -> str:
        """Format the template with the provided parameters"""
        try:
            missing_params = [p for p in self.parameters if p not in kwargs]
            if missing_params:
                raise ValueError(
                    f"Missing required parameters: {missing_params}")

            return self.template.format(**kwargs)
        except KeyError as e:
            logger.error(
                f"Missing parameter in prompt template {self.template_id}: {e}")
            raise ValueError(f"Missing parameter: {e}")
        except Exception as e:
            logger.error(f"Error formatting prompt {self.template_id}: {e}")
            raise


class PromptManager:
    """Manages all prompt templates for the ITS"""

    def __init__(self, templates_path: str = None):
        self.templates: Dict[str, PromptTemplate] = {}
        self.templates_path = templates_path or os.path.join(
            os.path.dirname(__file__), "prompt_templates")

        self._init_core_templates()

        if os.path.exists(self.templates_path):
            self._load_templates_from_files()

    def _init_core_templates(self):
        """Initialize core prompt templates"""
        self._register_content_generation_templates()
        self._register_assessment_templates()
        self._register_rag_templates()
        self._register_exercise_templates()

    def _register_content_generation_templates(self):
        """Register content generation prompt templates"""

        self.register_template(PromptTemplate(
            template_id="content_generation_base",
            category=PromptCategory.CONTENT_GENERATION,
            description="Base template for all content generation prompts",
            template="""Act as an expert {grade}th grade NCERT curriculum tutor generating educational content.

            {kg_section}

            **CRITICAL OUTPUT REQUIREMENT:** Respond **ONLY** with a single, valid JSON object conforming EXACTLY to the structure specified below. Do NOT include any text before `{{` or after `}}`.

            **FINAL JSON OUTPUT STRUCTURE:**
            ```json
            {{
              "contentType": "{content_type}",
              "topic": "{specific_topic}",
              "subject": "{subject}",
              "instructionalPlan": {{
                "teachingStrategy": "{strategy_name}",
                "targetDifficulty": "{difficulty_desc}",
                "effectiveDifficultyScore": {effective_difficulty:.2f},
                "contentLength": "{length_desc}",
                "scaffoldingLevel": "{scaffolding_level}",
                "feedbackStyle": "{feedback_style}"
              }},
              "sections": [
                // THIS ARRAY MUST CONTAIN THE GENERATED EDUCATIONAL CONTENT.
                // Each object in this array represents a part of the content.
                // The exact fields required for each object are detailed below.
                {{
                  "sectionType": "example_type_determined_by_content_type",
                  "title": "Example Title Determined by Content Type",
                  "contentMarkdown": "The actual generated markdown content for this section goes here."
                }}
              ]
            }}

            **ABSOLUTE RULES:**
            1. JSON ONLY: Start with `{{`, end with `}}`. No other text.
            2. FOCUS: Content inside JSON MUST be about **{specific_topic}**.
            3. NO META-TEXT: No comments like "Here is the JSON:".
            4. GRADE LEVEL: Content appropriate for Grade {grade}.
            5. VALID JSON: Ensure perfect JSON syntax.

            **STUDENT & INSTRUCTIONAL CONTEXT:**
            *   Student: Grade {grade}, Style: {learning_style}, Mastery: {mastery_desc} ({mastery:.2f}).
            *   Request: '{content_type_cap}' for "{specific_topic}" ({subject}).
            *   Plan: Use {strategy_name}, {difficulty_desc} difficulty, {length_desc} length, {scaffolding_level} scaffolding, {feedback_style} feedback.

            **SPECIFIC CONTENT REQUIREMENTS FOR JSON `sections` ARRAY (contentType='{content_type}'):**
            {content_specific_instructions}

            **FINAL REMINDER:** Generate ONLY the valid JSON object. Use Knowledge Base Context (if provided) for factual accuracy within the JSON content. Strictly adhere to structure and rules.
            """,
            parameters={
                "grade": "Student grade level",
                "kg_section": "Knowledge graph context section",
                "content_type": "Type of content to generate",
                "specific_topic": "Specific topic to create content about",
                "subject": "Subject area",
                "strategy_name": "Teaching strategy name",
                "difficulty_desc": "Difficulty level description",
                "effective_difficulty": "Numerical difficulty value",
                "length_desc": "Content length description",
                "scaffolding_level": "Level of scaffolding",
                "feedback_style": "Style of feedback",
                "content_type_cap": "Capitalized content type",
                "learning_style": "Student's preferred learning style",
                "mastery_desc": "Description of student's mastery level",
                "mastery": "Numerical mastery value",
                "content_specific_instructions": "Instructions specific to content type"
            },
            example_values={
                "grade": "6",
                "kg_section": "",
                "content_type": "lesson",
                "specific_topic": "Water Cycle",
                "subject": "Science",
                "strategy_name": "Explanation",
                "difficulty_desc": "basic",
                "effective_difficulty": 0.35,
                "length_desc": "standard",
                "scaffolding_level": "GUIDANCE",
                "feedback_style": "ELABORATED",
                "content_type_cap": "Lesson",
                "learning_style": "Visual",
                "mastery_desc": "developing",
                "mastery": 0.4,
                "content_specific_instructions": "Create a lesson with introduction, explanation, examples..."
            }
        ))

        self.register_template(PromptTemplate(
            template_id="content_generation_lesson",
            category=PromptCategory.CONTENT_GENERATION,
            description="Template for generating lesson content",
            template="""*   **JSON `sections` for 'lesson'**: Array MUST contain objects with `sectionType` IN ORDER: `lesson_introduction`, `lesson_core_concept`, `lesson_example` (OPTIONAL, include if helpful), `lesson_check_in`, `lesson_summary`.
            *   Section 1 (`lesson_introduction`): Populate `contentMarkdown` with generated introduction stating topic & 1-2 objectives ({length_desc}). Set `title` to "Introduction".
            *   Section 2 (`lesson_core_concept`): Populate `contentMarkdown` with generated explanation using {strategy_name}. Adapt for {learning_style}. Apply {scaffolding_level} scaffolding ({scaffolding_desc}). Length: {length_desc}. Set `title` to "Core Concepts".
            *   Section 3 (`lesson_example`, if included): Populate `contentMarkdown` with 1-2 generated clear, {difficulty_desc} examples/illustrations. Set `title` to "Examples".
            *   Section 4 (`lesson_check_in`): MUST contain `questionText` (String: generated question only) AND `answerDetail` (String: generated answer/explanation formatted EXACTLY like: "{feedback_instr}"). Populate `contentMarkdown` with optional context. Set `title` to "Check Your Understanding".
            *   Section 5 (`lesson_summary`): Populate `contentMarkdown` with generated recap of main points ({length_desc}). Set `title` to "Summary".""",
            parameters={
                "length_desc": "Content length description",
                "strategy_name": "Teaching strategy name",
                "learning_style": "Student's preferred learning style",
                "scaffolding_level": "Level of scaffolding",
                "scaffolding_desc": "Description of scaffolding approach",
                "difficulty_desc": "Difficulty level description",
                "feedback_instr": "Feedback instruction format"
            }
        ))

        # Flashcard template
        self.register_template(PromptTemplate(
            template_id="content_generation_flashcards",
            category=PromptCategory.CONTENT_GENERATION,
            description="Template for generating flashcard content",
            template="""*   **JSON `sections` for 'flashcards'**: Array MUST contain at least 5-8 objects (based on {length_desc}) with `sectionType`: `flashcard`.
            *   Each flashcard object MUST have:
                *   `title`: Brief title for the card concept
                *   `contentMarkdown`: Empty string (not used for flashcards)
                *   `frontSide`: Main concept/question text on front of card
                *   `backSide`: Detailed explanation/answer for back of card
                *   `difficulty`: Difficulty level of this individual card (easy/medium/challenging) based on overall {difficulty_desc}
                *   `hint`: (Optional) A helpful hint for the card
            *   Cards MUST follow {scaffolding_level} approach: {scaffolding_desc}
            *   Create a progressive sequence of cards that build on each other to enhance retention
            *   First card MUST introduce the overall topic
            *   Last card should integrate/synthesize multiple concepts""",
            parameters={
                "length_desc": "Content length description",
                "difficulty_desc": "Difficulty level description",
                "scaffolding_level": "Level of scaffolding",
                "scaffolding_desc": "Description of scaffolding approach",
                "learning_style": "Student's preferred learning style",
            }
        ))

        # Cheatsheet template
        self.register_template(PromptTemplate(
            template_id="content_generation_cheatsheet",
            category=PromptCategory.CONTENT_GENERATION,
            description="Template for generating cheatsheet content",
            template="""*   **JSON `sections` for 'cheatsheet'**: Array MUST contain objects with `sectionType` IN ORDER: `cheatsheet_introduction`, `key_concepts`, `formulas_rules`, `examples_applications`, `quick_reference`.
            *   Section 1 (`cheatsheet_introduction`): Populate `contentMarkdown` with a concise topic overview. Set `title` to "Overview".
            *   Section 2 (`key_concepts`): Populate `contentMarkdown` with essential definitions and concepts using bullet points and{scaffolding_level}-level explanations ({scaffolding_desc}). Length: {length_desc}. Set `title` to "Key Concepts".
            *   Section 3 (`formulas_rules`): Populate `contentMarkdown` with important formulas, rules, or procedures. Set `title` to "Formulas & Rules".
            *   Section 4 (`examples_applications`): Populate `contentMarkdown` with brief {difficulty_desc} example applications. Set `title` to "Examples".
            *   Section 5 (`quick_reference`): Populate `contentMarkdown` with a rapid reference section - extremely concise recall points. Set `title` to "Quick Reference".
            *   The entire cheatsheet MUST use {strategy_name} approach where appropriate, with all content at {difficulty_desc} difficulty level.""",
            parameters={
                "length_desc": "Content length description",
                "strategy_name": "Teaching strategy name",
                "scaffolding_level": "Level of scaffolding",
                "scaffolding_desc": "Description of scaffolding approach",
                "learning_style": "Student's preferred learning style",
                "difficulty_desc": "Difficulty level description"
            }
        ))

        # Mind Map template
        self.register_template(PromptTemplate(
            template_id="content_generation_mindmap",
            category=PromptCategory.CONTENT_GENERATION,
            description="Template for generating mind map content",
            template="""*   **JSON `sections` for 'mindmap'**: Array MUST contain objects with `sectionType` IN ORDER: `mindmap_overview`, `central_concept`, `primary_branches`, `connections`, `study_suggestions`.
            *   Section 1 (`mindmap_overview`): Populate `contentMarkdown` with brief explanation of how to use this mind map. Set `title` to "Mind Map Overview".
            *   Section 2 (`central_concept`): Populate `contentMarkdown` with core concept definition and importance. Set `title` to "Central Concept".
            *   Section 3 (`primary_branches`): Populate `contentMarkdown` with markdown representation of primary branches (main subtopics), each with bullet hierarchies showing relationships. Implement {difficulty_desc} level content with {scaffolding_level} scaffolding. Length: {length_desc}. Set `title` to "Main Branches".
            *   Section 4 (`connections`): Populate `contentMarkdown` with cross-connections between different branches showing relationships. Set `title` to "Concept Connections".
            *   Section 5 (`study_suggestions`): Populate `contentMarkdown` with suggestions for using this mind map for effective {learning_style}-focused study. Set `title` to "Study Suggestions".
            *   Format markdown to convey hierarchical relationships through indentation and symbols (-, *, >)""",
            parameters={
                "length_desc": "Content length description",
                "difficulty_desc": "Difficulty level description",
                "scaffolding_level": "Level of scaffolding",
                "learning_style": "Student's preferred learning style"
            }
        ))

        # Study Guide template
        self.register_template(PromptTemplate(
            template_id="content_generation_studyguide",
            category=PromptCategory.CONTENT_GENERATION,
            description="Template for generating study guide content",
            template="""*   **JSON `sections` for 'studyguide'**: Array MUST contain objects with `sectionType` IN ORDER: `learning_objectives`, `key_vocabulary`, `concept_explanations`, `common_misconceptions`, `practice_questions`, `study_strategies`.
            *   Section 1 (`learning_objectives`): Populate `contentMarkdown` with 3-5 specific learning objectives. Set `title` to "Learning Objectives".
            *   Section 2 (`key_vocabulary`): Populate `contentMarkdown` with essential terms and definitions, formatted as term-definition pairs. Set `title` to "Key Vocabulary".
            *   Section 3 (`concept_explanations`): Populate `contentMarkdown` with {difficulty_desc} explanations using {strategy_name} approach. Length: {length_desc}. Set `title` to "Concept Explanations".
            *   Section 4 (`common_misconceptions`): Populate `contentMarkdown` with common errors and misunderstandings about the topic. Set `title` to "Misconceptions".
            *   Section 5 (`practice_questions`): Populate `contentMarkdown` with 3-5 practice questions and answers at {difficulty_desc} level. Set `title` to "Practice Questions".
            *   Section 6 (`study_strategies`): Populate `contentMarkdown` with specific strategies optimized for {learning_style} learners with {scaffolding_level} support. Set `title` to "Study Strategies".""",
            parameters={
                "length_desc": "Content length description",
                "difficulty_desc": "Difficulty level description",
                "strategy_name": "Teaching strategy name",
                "learning_style": "Student's preferred learning style",
                "scaffolding_level": "Level of scaffolding"
            }
        ))

        # Interactive Scenario template
        self.register_template(PromptTemplate(
            template_id="content_generation_scenario",
            category=PromptCategory.CONTENT_GENERATION,
            description="Template for generating interactive scenario content",
            template="""*   **JSON `sections` for 'scenario'**: Array MUST contain objects with `sectionType` IN ORDER: `scenario_introduction`, `scenario_context`, `challenge_points`, `guided_exploration`, `reflection_questions`.
            *   Section 1 (`scenario_introduction`): Populate `contentMarkdown` with engaging introduction to the real-world scenario. Set `title` to "The Scenario".
            *   Section 2 (`scenario_context`): Populate `contentMarkdown` with detailed background information and initial situation. Set `title` to "Context".
            *   Section 3 (`challenge_points`): Populate `contentMarkdown` with decision points or challenges within the scenario at {difficulty_desc} difficulty. Set `title` to "Challenges".
            *   Section 4 (`guided_exploration`): Populate `contentMarkdown` with {scaffolding_level} guided steps to work through the scenario applying topic concepts.Length: {length_desc}. Set `title` to "Exploration".
            *   Section 5 (`reflection_questions`): MUST contain `questions` (Array of strings: 3-5 thought-provoking questions) AND `concepts` (Array of strings: key concepts applied). Populate `contentMarkdown` with brief context. Set `title` to "Reflection Questions".
            *   The scenario MUST use {strategy_name} teaching approach, be relevant to grade level, and demonstrate practical application of topic.""",
            parameters={
                "length_desc": "Content length description",
                "difficulty_desc": "Difficulty level description",
                "scaffolding_level": "Level of scaffolding",
                "learning_style": "Student's preferred learning style",
                "strategy_name": "Teaching strategy name"
            }
        ))

    def _register_assessment_templates(self):
        """Register assessment prompt templates"""
        self.register_template(PromptTemplate(
            template_id="assessment_evaluation",
            category=PromptCategory.ASSESSMENT,
            description="Template for evaluating student responses",
            template="""As an educational assessment expert, evaluate this student's answer:

            Question: {question}
            Grade Level: {grade} 
            Subject: {subject}
            Topic: {topic}
            Correct Answer: {correct_answer}
            Student Response: {student_response}

            Evaluate the answer for:
            1. Correctness (score 0-100)
            2. Specific misconceptions revealed
            3. Knowledge gaps identified
            4. Reasoning patterns demonstrated
            5. Key concepts understood vs. missed

            Return ONLY a valid JSON object matching this schema:
            {{
              "score": <0-100>,
              "correct": <boolean>,
              "partial_credit": <float or null>,
              "misconceptions": ["specific misconception 1", "specific misconception 2"],
              "knowledge_gaps": ["specific gap 1", "specific gap 2"],
              "reasoning_patterns": ["pattern description"],
              "feedback": "detailed feedback for student",
              "improvement_suggestions": ["suggestion 1", "suggestion 2"],
              "key_concepts_understood": ["concept 1", "concept 2"],
              "key_concepts_missed": ["concept 3", "concept 4"]
            }}

            Your assessment must be fair, objective, and grade-appropriate. The "feedback" should be encouraging while identifying specific areas for improvement.""",
                        parameters={
                            "question": "The question text",
                            "grade": "Student grade level",
                            "subject": "Subject area",
                            "topic": "Topic being assessed",
                            "correct_answer": "The correct answer",
                            "student_response": "The student's submitted answer"
                        }
        ))

    def _register_rag_templates(self):
        """Register RAG-specific prompt templates"""
        self.register_template(PromptTemplate(
            template_id="kg_context_section",
            category=PromptCategory.RAG,
            description="Template for knowledge graph context section",
            template="""--- START CONTEXT FROM KNOWLEDGE BASE ---
            The following text snippets were retrieved from the NCERT curriculum ({topic}) based on query relevance:
            {context}
            --- END CONTEXT FROM KNOWLEDGE BASE ---

            Context Usage Instruction: You MUST use the context provided above to ensure factual accuracy and incorporate relevant details from the NCERT curriculum into the content you generate within the final JSON output. Base your explanations, examples, and answers *primarily* on this retrieved information.
            ---""",
                        parameters={
                            "topic": "Topic for which context was retrieved",
                            "context": "Retrieved context from knowledge graph"
                        }
        ))

    def _register_exercise_templates(self):
        """Register exercise generation templates"""
        self.register_template(PromptTemplate(
            template_id="exercise_generation",
            category=PromptCategory.EXERCISE,
            description="Template for generating exercises",
            template="""Create a {difficulty_desc} level educational exercise about "{topic}" for a middle school student.
            {kg_section}
            {misconception_guidance}
            
            Generate your response as a valid JSON object with the following structure:
            
            ```json
            {{
              "exercise_type": "multiple_choice|short_answer|fill_in_blank|true_false",
              "question": "The full question text here",
              "options": ["Option A", "Option B", "Option C", "Option D"],  // Include for multiple_choice only
              "correct_answer": "The correct answer or option letter for multiple choice",
              "explanation": "Detailed explanation of why this is correct",
              "hint": "A hint to help if the student is stuck",
              "misconception_addressed": "Specific misconception this exercise addresses",
              "difficulty_level": "{difficulty_desc}",
              "topic": "{topic}"
            }}
            Ensure your exercise:
            
            Is appropriate for the {difficulty_desc} difficulty level
            Is factually correct and aligned with NCERT curriculum standards
            Has clear, unambiguous wording
            For multiple choice, includes plausible distractors that target common misconceptions
            Provides a helpful explanation that clarifies concepts
            Respond ONLY with the JSON object. No additional text.""", parameters={"difficulty_desc": "Difficulty level description", "topic": "Exercise topic", "kg_section": "Knowledge graph context section", "misconception_guidance": "Guidance on addressing misconceptions"}))

    def _load_templates_from_files(self):
        """Load templates from JSON files in the templates directory"""
        try:
            for filename in os.listdir(self.templates_path):
                if filename.endswith('.json'):
                    file_path = os.path.join(self.templates_path, filename)
                    with open(file_path, 'r') as f:
                        template_data = json.load(f)
                        template = PromptTemplate.model_validate(template_data)
                        self.templates[template.template_id] = template
                        logger.info(
                            f"Loaded template from file: {template.template_id}")
        except Exception as e:
            logger.error(f"Error loading templates from files: {e}")

    def register_template(self, template: PromptTemplate):
        """Register a new template"""
        self.templates[template.template_id] = template

    def get_template(self, template_id: str) -> Optional[PromptTemplate]:
        """Get a template by ID"""
        return self.templates.get(template_id)

    def format_prompt(self, template_id: str, **kwargs) -> str:
        """Format a prompt template with the provided parameters"""
        template = self.get_template(template_id)
        if not template:
            raise ValueError(f"Template not found: {template_id}")
        return template.format(**kwargs)

    def save_template(self, template_id: str) -> bool:
        """Save a template to a file"""
        template = self.get_template(template_id)
        if not template:
            return False

        if not os.path.exists(self.templates_path):
            os.makedirs(self.templates_path)

        file_path = os.path.join(self.templates_path, f"{template_id}.json")
        with open(file_path, 'w') as f:
            json.dump(template.model_dump(), f, indent=2)
        return True
