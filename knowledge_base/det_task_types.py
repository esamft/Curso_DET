"""
DET Flow - DET Task Types Reference
Comprehensive list of all Duolingo English Test task types and their characteristics.
"""

from typing import Dict, List
from enum import Enum


class TaskType(str, Enum):
    """Enumeration of all DET task types."""

    # Reading & Writing Tasks
    READ_AND_COMPLETE = "read_and_complete"
    READ_AND_SELECT = "read_and_select"
    WRITE_ABOUT_PHOTO = "write_about_photo"
    INTERACTIVE_READING = "interactive_reading"

    # Listening & Writing Tasks
    LISTEN_AND_TYPE = "listen_and_type"
    INTERACTIVE_LISTENING = "interactive_listening"

    # Speaking & Listening Tasks
    READ_ALOUD = "read_aloud"
    SPEAK_ABOUT_PHOTO = "speak_about_photo"
    READ_THEN_SPEAK = "read_then_speak"
    LISTEN_THEN_SPEAK = "listen_then_speak"

    # Writing Sample
    WRITING_SAMPLE = "writing_sample"

    # Speaking Sample
    SPEAKING_SAMPLE = "speaking_sample"


# Task characteristics and subscores mapping
TASK_CHARACTERISTICS: Dict[str, Dict] = {
    TaskType.READ_AND_COMPLETE: {
        "name": "Read and Complete",
        "description": "Fill in missing words in a text",
        "duration_seconds": 180,
        "primary_subscores": ["literacy", "comprehension"],
        "difficulty_levels": ["A2", "B1", "B2", "C1"],
        "scoring_criteria": [
            "Vocabulary accuracy",
            "Contextual understanding",
            "Grammar knowledge"
        ]
    },

    TaskType.WRITE_ABOUT_PHOTO: {
        "name": "Write About the Photo",
        "description": "Write a description of a photo in at least one minute",
        "duration_seconds": 60,
        "primary_subscores": ["literacy", "production"],
        "difficulty_levels": ["A1", "A2", "B1", "B2"],
        "scoring_criteria": [
            "Descriptive vocabulary",
            "Sentence structure",
            "Coherence and detail",
            "Grammar accuracy"
        ]
    },

    TaskType.LISTEN_AND_TYPE: {
        "name": "Listen and Type",
        "description": "Type what you hear",
        "duration_seconds": 60,
        "primary_subscores": ["comprehension", "literacy"],
        "difficulty_levels": ["A1", "A2", "B1", "B2", "C1"],
        "scoring_criteria": [
            "Listening accuracy",
            "Spelling",
            "Word recognition"
        ]
    },

    TaskType.READ_ALOUD: {
        "name": "Read Aloud",
        "description": "Read a sentence or passage aloud",
        "duration_seconds": 20,
        "primary_subscores": ["conversation", "production"],
        "difficulty_levels": ["A1", "A2", "B1"],
        "scoring_criteria": [
            "Pronunciation",
            "Fluency",
            "Intonation",
            "Pace"
        ]
    },

    TaskType.SPEAK_ABOUT_PHOTO: {
        "name": "Speak About the Photo",
        "description": "Speak about a photo for at least 30 seconds",
        "duration_seconds": 90,
        "primary_subscores": ["conversation", "production"],
        "difficulty_levels": ["A2", "B1", "B2", "C1"],
        "scoring_criteria": [
            "Vocabulary range",
            "Fluency",
            "Grammatical accuracy",
            "Content relevance",
            "Coherence"
        ]
    },

    TaskType.INTERACTIVE_READING: {
        "name": "Interactive Reading",
        "description": "Read passages and answer questions",
        "duration_seconds": 480,
        "primary_subscores": ["comprehension", "literacy"],
        "difficulty_levels": ["B1", "B2", "C1", "C2"],
        "scoring_criteria": [
            "Reading comprehension",
            "Critical thinking",
            "Inference ability",
            "Detail recognition"
        ]
    },

    TaskType.INTERACTIVE_LISTENING: {
        "name": "Interactive Listening",
        "description": "Listen to passages and answer questions",
        "duration_seconds": 420,
        "primary_subscores": ["comprehension"],
        "difficulty_levels": ["B1", "B2", "C1", "C2"],
        "scoring_criteria": [
            "Listening comprehension",
            "Main idea identification",
            "Detail recognition",
            "Inference ability"
        ]
    },

    TaskType.WRITING_SAMPLE: {
        "name": "Writing Sample",
        "description": "Write an essay response to a prompt (5 minutes)",
        "duration_seconds": 300,
        "primary_subscores": ["literacy", "production"],
        "difficulty_levels": ["B1", "B2", "C1", "C2"],
        "scoring_criteria": [
            "Task completion",
            "Organization",
            "Vocabulary range and accuracy",
            "Grammatical structures",
            "Coherence and cohesion"
        ]
    },

    TaskType.SPEAKING_SAMPLE: {
        "name": "Speaking Sample",
        "description": "Speak about a topic (3 minutes)",
        "duration_seconds": 180,
        "primary_subscores": ["conversation", "production"],
        "difficulty_levels": ["B1", "B2", "C1", "C2"],
        "scoring_criteria": [
            "Fluency and coherence",
            "Lexical resource",
            "Grammatical range and accuracy",
            "Pronunciation",
            "Task completion"
        ]
    },

    TaskType.READ_THEN_SPEAK: {
        "name": "Read, Then Speak",
        "description": "Read a passage and then speak about it",
        "duration_seconds": 90,
        "primary_subscores": ["comprehension", "conversation", "production"],
        "difficulty_levels": ["B1", "B2", "C1"],
        "scoring_criteria": [
            "Reading comprehension",
            "Speaking fluency",
            "Content accuracy",
            "Pronunciation"
        ]
    },

    TaskType.LISTEN_THEN_SPEAK: {
        "name": "Listen, Then Speak",
        "description": "Listen to audio and then speak about it",
        "duration_seconds": 90,
        "primary_subscores": ["comprehension", "conversation", "production"],
        "difficulty_levels": ["B1", "B2", "C1"],
        "scoring_criteria": [
            "Listening comprehension",
            "Speaking fluency",
            "Content accuracy",
            "Pronunciation"
        ]
    }
}


def get_task_info(task_type: str) -> Dict:
    """
    Get information about a specific task type.

    Args:
        task_type: The task type identifier

    Returns:
        Dictionary with task characteristics
    """
    return TASK_CHARACTERISTICS.get(task_type, {})


def get_all_task_types() -> List[str]:
    """Get a list of all available task types."""
    return list(TASK_CHARACTERISTICS.keys())


def get_tasks_by_subscore(subscore: str) -> List[str]:
    """
    Get all tasks that primarily evaluate a specific subscore.

    Args:
        subscore: literacy, comprehension, conversation, or production

    Returns:
        List of task types
    """
    tasks = []
    for task_type, info in TASK_CHARACTERISTICS.items():
        if subscore.lower() in info.get("primary_subscores", []):
            tasks.append(task_type)
    return tasks
