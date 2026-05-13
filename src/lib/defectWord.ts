/** British English: use after a numeric defect count in UI copy. */
export function defectWord(count: number): 'defect' | 'defects' {
  return count === 1 ? 'defect' : 'defects';
}
