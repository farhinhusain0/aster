export function replaceSuccessiveQuotes(input: string): string {
  return input.replace(/''+/g, "'").replace(/""+/g, '"');
}

export function isURL(input: string) {
  try {
    new URL(input);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Calculates the length of the Longest Common Substring between two strings.
 * This implementation is space-optimized (O(n) space complexity).
 * @param str1 The first string.
 * @param str2 The second string.
 * @returns The length of the LCS.
 */
export function calculateLCSLength(str1: string, str2: string): number {
  // Ensure str2 is the shorter string to optimize memory usage
  if (str1.length < str2.length) {
    [str1, str2] = [str2, str1]; // Swap strings
  }

  let prevRow = Array(str2.length + 1).fill(0);
  const currentRow = Array(str2.length + 1).fill(0);
  let maxLength = 0;

  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        currentRow[j] = prevRow[j - 1] + 1;
        if (currentRow[j] > maxLength) {
          maxLength = currentRow[j];
        }
      } else {
        currentRow[j] = 0;
      }
    }
    // The current row becomes the previous row for the next iteration
    prevRow = [...currentRow];
  }

  return maxLength;
}
