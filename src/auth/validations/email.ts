const emailRegex = new RegExp('[a-z0-9]+@[a-z]+\\.[a-z]');

export const validateEmail = (email: string): boolean => emailRegex.test(email);
