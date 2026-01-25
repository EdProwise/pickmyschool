export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireSpecialChar: true,
};

export const PASSWORD_POLICY_MESSAGE = 
  'Password must be at least 8 characters with 1 uppercase letter and 1 special character (!@#$%^&*).';

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < PASSWORD_POLICY.minLength) {
    return { valid: false, error: `Password must be at least ${PASSWORD_POLICY.minLength} characters` };
  }

  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least 1 uppercase letter' };
  }

  if (PASSWORD_POLICY.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password)) {
    return { valid: false, error: 'Password must contain at least 1 special character (!@#$%^&*)' };
  }

  return { valid: true };
}
