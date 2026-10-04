export const handleCopy = () => {};
export const handlePaste = () => {};
export const generateUniqueId = () => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 15);
};
