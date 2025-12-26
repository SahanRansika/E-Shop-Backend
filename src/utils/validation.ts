// Example: Add Joi or custom validation
export const validateEmail = (email: string) => {
  return /\S+@\S+\.\S+/.test(email);
};