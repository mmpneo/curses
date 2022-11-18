import { useId } from "@floating-ui/react-dom-interactions";
import { ChangeEventHandler, FC, InputHTMLAttributes, PropsWithChildren, SelectHTMLAttributes } from "react";


interface InputBaseProps {
  label: string
}

interface InputTextProps extends InputBaseProps, InputHTMLAttributes<HTMLInputElement> { }
const Text: FC<InputTextProps> = ({ label, ...rest }) => {
  const id = useId();
  return (
    <fieldset>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" {...rest} className="field-width" />
    </fieldset>
  )
}

interface SelectTextProps extends InputBaseProps, SelectHTMLAttributes<HTMLSelectElement> { }
const Select: FC<PropsWithChildren<SelectTextProps>> = ({ label, children, ...rest }) => {
  const id = useId();
  return (
    <fieldset>
      <label htmlFor={id}>{label}</label>
      <select id={id} {...rest} className="field-width">
        {children}
      </select>
    </fieldset>
  )
}

interface CheckboxTextProps extends InputBaseProps {
  onChange?: (value: boolean) => void,
  value?: boolean
}
const Checkbox: FC<CheckboxTextProps> = ({ label, value, onChange}) => {
  const id = useId();
  return (
    <fieldset>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="checkbox" onChange={e => onChange?.(e.target.checked)} checked={value} />
    </fieldset>
  )
}

export default { Text, Select, Checkbox };