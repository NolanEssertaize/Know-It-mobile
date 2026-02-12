export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigit: boolean;
}

export function validatePassword(password: string): PasswordRequirements {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit: /\d/.test(password),
  };
}

export function isPasswordValid(requirements: PasswordRequirements): boolean {
  return (
    requirements.minLength &&
    requirements.hasUppercase &&
    requirements.hasLowercase &&
    requirements.hasDigit
  );
}
