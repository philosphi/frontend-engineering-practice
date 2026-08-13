// Per-field validator functions, colocated here and imported by ContactForm's
// submit handler (and by its change handler, to re-validate a field that's
// already showing an error). Each returns an error message string, or '' when
// the value is valid.

export function validateName(value: string): string {
  // TODO: required
  const nameRegex = /^[a-zA-Z\s.'-]{2,50}$/;
  if (!nameRegex.test(value)) {
    return "invalid name format";
  }
  return "";
}

export function validateEmail(value: string): string {
  // TODO: required, valid email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value)) {
    return "invalid email format";
  }

  return "";
}

export function validateMessage(value: string): string {
  // TODO: required, minimum 10 characters
  if (value.length < 10) return "minimum 10 characters";
  return "";
}
