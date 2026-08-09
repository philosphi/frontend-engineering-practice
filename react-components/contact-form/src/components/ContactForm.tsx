import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import FormField from './FormField'
import { validateName, validateEmail, validateMessage } from './validators'
import type { ContactFormData, ContactFormErrors } from '../types'

const initialFormData: ContactFormData = {
  name: '',
  email: '',
  message: '',
}

function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<ContactFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    // TODO: update formData for event.target.name
    // TODO: if formErrors already has an error for this field, re-run that
    // field's validator against the new value and update formErrors (clear
    // it once valid) — don't unconditionally clear on first keystroke
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // TODO: run validateName/validateEmail/validateMessage against formData,
    // collect into a ContactFormErrors object, setFormErrors
    // TODO: if any errors, stop here (do not submit)
    // TODO: otherwise, setIsSubmitting(true), simulate an async submission
    // (setTimeout), then setIsSubmitting(false) and setIsSubmitted(true)
  }

  if (isSubmitted) {
    // TODO: success message, rendered instead of the form
    return null
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1>Contact Us</h1>

      <FormField
        id="name"
        label="Name"
        value={formData.name}
        error={formErrors.name}
        onChange={handleChange}
      />

      <FormField
        id="email"
        label="Email"
        type="email"
        value={formData.email}
        error={formErrors.email}
        onChange={handleChange}
      />

      <FormField
        id="message"
        label="Message"
        as="textarea"
        value={formData.message}
        error={formErrors.message}
        onChange={handleChange}
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Submit'}
      </button>
    </form>
  )
}

export default ContactForm
