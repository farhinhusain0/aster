export function validateEmail(email: string) {
  const emailRegex =
    /^(?!.*\.\.)(?!\.)(?!.*\.$)(?!.*\.\-)(?!.*\-\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function validateDomain(email: string, domains: string[] | undefined) {
  if (!domains) return false;
  const [_, domain] = email.split("@");
  return domains.includes(domain);
}

export function validatePassword(password: string): {
  isValid: boolean;
  isLongEnough: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialCharacter: boolean;
  error: string;
} {
  let isValid = true;
  let isLongEnough = true;
  let hasUppercase = true;
  let hasLowercase = true;
  let hasNumber = true;
  let hasSpecialCharacter = true;
  let error = "";

  if (password.length < 8) {
    isValid = false;
    isLongEnough = false;
    error = "Password must be at least 8 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    isValid = false;
    hasUppercase = false;
    error = "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    isValid = false;
    hasLowercase = false;
    error = "Password must contain at least one lowercase letter";
  }
  if (!/[A-Z]/.test(password)) {
    isValid = false;
    hasUppercase = false;
    error = "Password must contain at least one uppercase letter";
  }

  if (!/[a-z]/.test(password)) {
    isValid = false;
    hasLowercase = false;
    error = "Password must contain at least one lowercase letter";
  }

  if (!/[0-9]/.test(password)) {
    isValid = false;
    hasNumber = false;
    error = "Password must contain at least one number";
  }
  if (!/[!@#$%^&*]/.test(password)) {
    isValid = false;
    hasSpecialCharacter = false;
    error = "Password must contain at least one special character";
  }

  return {
    isValid,
    error,
    isLongEnough,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialCharacter,
  };
}
