'use client';

import { createContext, forwardRef, useContext, useState } from 'react';
import {
  Input as BaseInput,
  Textarea as BaseTextarea,
  type InputProps,
  type TextareaProps,
} from 'rizzui';
import cn from '@/utils/class-names';
import styles from './outlined-text-field.module.css';

export const OutlinedFieldsContext = createContext(false);

const hasValue = (value: unknown) =>
  value !== undefined && value !== null && String(value).length > 0;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, labelClassName, inputClassName, onChange, ...props },
  ref
) {
  const outlined = useContext(OutlinedFieldsContext);
  const [filled, setFilled] = useState(hasValue(props.defaultValue));
  if (!outlined)
    return (
      <BaseInput
        ref={ref}
        {...props}
        className={className}
        labelClassName={labelClassName}
        inputClassName={inputClassName}
        onChange={onChange}
      />
    );

  const floating =
    (props.value !== undefined ? hasValue(props.value) : filled) ||
    Boolean(props.prefix) ||
    ['date', 'time', 'datetime-local', 'month', 'week'].includes(
      props.type || ''
    );
  return (
    <div
      data-filled={floating || undefined}
      data-error={Boolean(props.error) || undefined}
      data-disabled={props.disabled || undefined}
      data-labelled={Boolean(props.label) || undefined}
      className={cn(styles.field, className)}
    >
      <BaseInput
        ref={ref}
        {...props}
        labelClassName={cn(styles.label, labelClassName)}
        inputClassName={cn(styles.input, inputClassName)}
        onChange={(event) => {
          setFilled(hasValue(event.target.value));
          onChange?.(event);
        }}
      />
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { className, labelClassName, textareaClassName, onChange, ...props },
    ref
  ) {
    const outlined = useContext(OutlinedFieldsContext);
    const [filled, setFilled] = useState(hasValue(props.defaultValue));
    if (!outlined)
      return (
        <BaseTextarea
          ref={ref}
          {...props}
          className={className}
          labelClassName={labelClassName}
          textareaClassName={textareaClassName}
          onChange={onChange}
        />
      );

    return (
      <div
        data-filled={
          (props.value !== undefined ? hasValue(props.value) : filled) ||
          undefined
        }
        data-error={Boolean(props.error) || undefined}
        data-disabled={props.disabled || undefined}
        data-labelled={Boolean(props.label) || undefined}
        className={cn(styles.field, className)}
      >
        <BaseTextarea
          ref={ref}
          {...props}
          labelClassName={cn(styles.label, labelClassName)}
          textareaClassName={cn(styles.textarea, textareaClassName)}
          onChange={(event) => {
            setFilled(hasValue(event.target.value));
            onChange?.(event);
          }}
        />
      </div>
    );
  }
);
