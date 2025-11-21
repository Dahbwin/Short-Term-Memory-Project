"""Core game logic for the short-term memory training mini-game.

This module contains pure logic (no I/O) so it can be reused by different
interfaces (terminal, GUI, web). It is intentionally small and well-typed
so neuroscientists or researchers can script experiments over it.
"""

from dataclasses import dataclass, asdict
import random
from typing import List, Tuple, Sequence, Dict, Any


# Default vocabulary used by the game. Can be overridden by a caller.
WORDS: List[str] = [
    "apple", "banana", "cherry", "date", "fig", "grape", "kiwi", "lemon", "mango",
    "nectarine", "orange", "papaya", "quince", "raspberry", "strawberry",
    "tangerine", "ugli fruit", "voavanga", "watermelon", "xigua", "yellow passion fruit",
    "zucchini"
]


@dataclass
class RoundResult:
    """Structured result of a single round.

    Attributes:
        items: the presented mixed sequence (numbers and words)
        answer: the user's parsed answer list
        correct: whether the answer exactly matched the key
        errors: number of mismatches
        details: per-item comparison tuples (user_value, correct_value, is_correct)
        metadata: optional dict with extra info (timings, difficulty, etc.)
    """
    items: List[Any]
    answer: List[Any]
    correct: bool
    errors: int
    details: List[Tuple[Any, Any, bool]]
    metadata: Dict[str, Any]


def _validate_bounds(minimum: int, maximum: int) -> None:
    if minimum < 1:
        raise ValueError("minimum must be >= 1")
    if maximum < minimum:
        raise ValueError("maximum must be >= minimum")


def generate_sequence(minimum: int, maximum: int, words: Sequence[str], word_interval: int) -> Tuple[List[Any], List[Any]]:
    """Generate a mixed sequence of single-digit numbers with occasional words.

    The function returns a tuple (sequence, answer_key). The sequence contains
    integers from 0..9 and, at every ``word_interval``-th numeric item, a word
    selected without repetition until the vocabulary is exhausted.

    This function is deterministic in type but non-deterministic in values
    because it uses random sampling; callers should set the random seed if
    reproducibility is required for experiments.
    """
    _validate_bounds(minimum, maximum)
    if word_interval < 1:
        raise ValueError("word_interval must be >= 1")

    length = random.randint(minimum, maximum)
    digits = [random.randint(0, 9) for _ in range(length)]

    sequence: List[Any] = []
    key: List[Any] = []
    used_words: List[str] = []

    for idx, num in enumerate(digits):
        sequence.append(num)
        key.append(num)
        if (idx + 1) % word_interval == 0:
            choices = [w for w in words if w not in used_words]
            if choices:
                word = random.choice(choices)
                used_words.append(word)
                sequence.append(word)
                key.append(word)

    return sequence, key


def convert_user_input(raw: str) -> List[Any]:
    """Parse a user-provided CSV-like string into a list of ints/strings.

    Example: "1, 2, apple" -> [1, 2, 'apple']
    """
    parts = [p.strip() for p in raw.split(",") if p.strip()]
    parsed: List[Any] = [int(p) if p.isdigit() else p for p in parts]
    return parsed


def check_answer(user: List[Any], key: List[Any]) -> Tuple[bool, int, List[Tuple[Any, Any, bool]]]:
    """Compare `user` against `key` and return (correct, errors, details).

    - `correct` is True only if lengths match and there are no mismatches.
    - `errors` is the count of mismatches.
    - `details` is a list of tuples (user_value, key_value, is_correct) for each position.
    """
    errors = 0
    details: List[Tuple[Any, Any, bool]] = []
    for i in range(len(key)):
        u = user[i] if i < len(user) else None
        is_ok = (u == key[i])
        details.append((u if u is not None else "----", key[i], is_ok))
        if not is_ok:
            errors += 1

    correct = (errors == 0 and len(user) == len(key))
    return correct, errors, details


def difficulty_presets() -> Dict[str, Dict[str, int]]:
    """Return a mapping of difficulty presets used by the CLI.

    Keys are '1'..'4'. Each value contains 'min', 'max', and 'word_interval'.
    """
    return {
        '1': {'min': 4, 'max': 6, 'word_interval': 2},
        '2': {'min': 7, 'max': 10, 'word_interval': 2},
        '3': {'min': 11, 'max': 15, 'word_interval': 3},
        '4': {'min': 16, 'max': 20, 'word_interval': 4},
    }


__all__ = ["WORDS", "generate_sequence", "convert_user_input", "check_answer", "RoundResult", "difficulty_presets"]
