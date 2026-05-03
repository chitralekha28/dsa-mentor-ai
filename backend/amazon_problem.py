amazon_questions = [
    {
        "id": "AMZ_001",
        "company": "Amazon",
        "title": "Two Sum",
        "difficulty": "Easy",
        "tags": ["Array", "HashMap"],
        "description": "Given an array of integers nums and a target, return indices of the two numbers that add up to target.",
        "problemStatement": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Each input has exactly one solution, and you may not use the same element twice.",
        "inputFormat": "An integer array nums and an integer target.",
        "outputFormat": "Return a list containing the two indices.",
        "examples": [
            {
                "input": "nums = [2,7,11,15], target = 9",
                "output": "[0,1]",
                "explanation": "nums[0] + nums[1] = 9."
            },
            {
                "input": "nums = [3,2,4], target = 6",
                "output": "[1,2]",
                "explanation": "nums[1] + nums[2] = 6."
            }
        ],
        "visibleTestCases": [
            {"input": "[2,7,11,15], 9", "output": "[0,1]"},
            {"input": "[3,2,4], 6", "output": "[1,2]"}
        ],
        "hiddenTestCases": [
            {"input": [[2, 7, 11, 15], 9], "expected": [0, 1]},
            {"input": [[3, 2, 4], 6], "expected": [1, 2]},
            {"input": [[3, 3], 6], "expected": [0, 1]}
        ],
        "functionName": "twoSum",
        "constraints": [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Exactly one valid answer exists."
        ],
        "starterCode": {
            "python": "def twoSum(nums, target):\n    pass",
            "cpp": "vector<int> twoSum(vector<int>& nums, int target) {\n    \n}",
            "java": "public int[] twoSum(int[] nums, int target) {\n    \n}",
            "javascript": "function twoSum(nums, target) {\n  \n}"
        }
    }
]
