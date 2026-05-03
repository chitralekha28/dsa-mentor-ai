google_questions = [
    {
        "id": "GOO_001",
        "company": "Google",
        "title": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "tags": ["String", "Sliding Window"],
        "description": "Given a string s, find the length of the longest substring without repeating characters.",
        "problemStatement": "Given a string s, find the length of the longest substring without repeating characters.",
        "inputFormat": "A string s.",
        "outputFormat": "Return an integer: the length of the longest substring without repeating characters.",
        "examples": [
            {
                "input": 's = "abcabcbb"',
                "output": "3",
                "explanation": 'The answer is "abc", with length 3.'
            },
            {
                "input": 's = "bbbbb"',
                "output": "1",
                "explanation": 'The answer is "b", with length 1.'
            }
        ],
        "visibleTestCases": [
            {"input": '"abcabcbb"', "output": "3"},
            {"input": '"bbbbb"', "output": "1"}
        ],
        "hiddenTestCases": [
            {"input": ["abcabcbb"], "expected": 3},
            {"input": ["bbbbb"], "expected": 1},
            {"input": ["pwwkew"], "expected": 3},
            {"input": [""], "expected": 0}
        ],
        "functionName": "lengthOfLongestSubstring",
        "constraints": [
            "0 <= s.length <= 5 * 10^4",
            "s consists of English letters, digits, symbols, and spaces."
        ],
        "starterCode": {
            "python": "def lengthOfLongestSubstring(s):\n    pass",
            "javascript": "function lengthOfLongestSubstring(s) {\n  \n}",
            "cpp": "int lengthOfLongestSubstring(string s) {\n    \n}",
            "java": "public int lengthOfLongestSubstring(String s) {\n    \n}"
        }
    }
]
