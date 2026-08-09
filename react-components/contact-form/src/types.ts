export interface ContactFormData {
  name: string
  email: string
  message: string
}

// Same keys as ContactFormData — empty/undefined string means the field is valid.
export type ContactFormErrors = Partial<Record<keyof ContactFormData, string>>
