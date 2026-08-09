// Per-field validator functions, colocated here and imported by ContactForm's
// submit handler (and by its change handler, to re-validate a field that's
// already showing an error). Each returns an error message string, or '' when
// the value is valid.

export function validateName(value: string): string {
  // TODO: required
  return ''
}

export function validateEmail(value: string): string {
  // TODO: required, valid email format
  return ''
}

export function validateMessage(value: string): string {
  // TODO: required, minimum 10 characters
  return ''
}
