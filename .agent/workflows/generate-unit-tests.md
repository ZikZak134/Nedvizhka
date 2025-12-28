---
description: Generate unit tests for a specific file or module.
---
# Generate Unit Tests

1.  **Analyze the Code**: Read the target file(s) to understand the logic, edge cases, and types.
2.  **Plan Tests**: Identify success paths, error cases, and boundary conditions.
3.  **Generate Tests**: Create a test file (e.g., `tests/test_filename.py`) using `pytest` and `unittest.mock`.
    - Use `pytest.fixture` for setup.
    - Mock external dependencies (DB, APIs).
    - Ensure meaningful assertions.
4.  **Run Tests**: Execute `pytest tests/test_filename.py -v`.
5.  **Refine**: If tests fail, analyze the output and fix the test or the code.

// turbo
6.  **Verify**: Run the full test suite `pytest` to ensure no regressions.
