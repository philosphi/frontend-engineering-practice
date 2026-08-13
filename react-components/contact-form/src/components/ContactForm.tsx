import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import FormField from "./FormField";
import { validateName, validateEmail, validateMessage } from "./validators";
import type { ContactFormData, ContactFormErrors } from "../types";

const initialFormData: ContactFormData = {
  name: "",
  email: "",
  message: "",
};

function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function validateField(id, value) {
    switch (id) {
      case "name":
        return validateName(value);
      case "email":
        return validateEmail(value);
      case "message":
        return validateMessage(value);
    }
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    // TODO: update formData for event.target.name
    // TODO: if formErrors already has an error for this field, re-run that
    // field's validator against the new value and update formErrors (clear
    // it once valid) — don't unconditionally clear on first keystroke
    const fieldId = event.target.name;
    const fieldValue = event.target.value;
    setFormData((formData) => {
      return {
        ...formData,
        [fieldId]: fieldValue,
      };
    });

    if (!formErrors[fieldId]) {
      if (validateField(fieldId, fieldValue) === "") {
        setFormErrors((formErrors) => {
          return {
            ...formErrors,
            [fieldId]: "",
          };
        });
      }
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: run validateName/validateEmail/validateMessage against formData,
    // collect into a ContactFormErrors object, setFormErrors
    // TODO: if any errors, stop here (do not submit)
    // TODO: otherwise, setIsSubmitting(true), simulate an async submission
    // (setTimeout), then setIsSubmitting(false) and setIsSubmitted(true)
    const currentformErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      message: validateMessage(formData.message),
    };

    setFormErrors(currentformErrors);

    let isError = false;

    Object.values(currentformErrors).forEach((value) => {
      if (value !== "") {
        isError = true;
      }
    });

    if (!isError) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        setFormData(initialFormData);
      }, 3000);
    }
  }

  if (isSubmitted) {
    // TODO: success message, rendered instead of the form
    return <span>Succesfully submitted form</span>;
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
        {isSubmitting ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}

export default ContactForm;
