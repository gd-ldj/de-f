export const isValidNumberInput = (value: string): boolean => {
  if (!value) return true;

  // number and dot
  if (!/^\d*\.?\d*$/.test(value)) {
    return false;
  }

  // ensure only one dot
  if ((value.match(/\./g) || []).length > 1) {
    return false;
  }

  return true;
};
