import type { ChangeEventHandler } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  as?: "input" | "textarea";
  type?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

// Colocates a label, its input/textarea, and the inline error message for
// one field. Purely presentational — validation and state live in ContactForm.
function FormField({
  id,
  label,
  error,
  as = "input",
  type = "text",
  value,
  onChange,
}: FormFieldProps) {
  // TODO: render label + (input or textarea, per `as`) + error message
  console.log(value);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span>{label}</span>
      {as === "input" && (
        <input type={type} name={id} value={value} onChange={onChange} />
      )}
      {as === "textarea" && (
        <textarea name={id} value={value} onChange={onChange} />
      )}
      {error && <span>{error}</span>}
    </div>
  );
}

export default FormField;
