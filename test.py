from typing import List


class Solution:
    def threeSumMulti(self, arr: List[int], target: int) -> int:
        nums = [False] * 100
        for i in arr:
            nums[i] = True
        counter = 0
        for i in range(len(nums)):
            if nums[i]:
                for j in range(i+1, len(nums)):
                    if j and nums[target-(i+1) - (j+1)-1]:
                       counter += 1
        return counter


sol = Solution()
print(sol.threeSumMulti([1,1,2,2,3,3,4,4,5,5], 8))
