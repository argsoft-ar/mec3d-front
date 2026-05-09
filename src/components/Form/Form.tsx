import type React from "react";
import "./Form.css";

interface FormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  columns?: 1 | 2;
  className?: string;
}

function Form({ children, onSubmit, columns = 1, className = "" }: FormProps) {
  return (
    <form
      className={`form form--cols-${columns} ${className}`.trim()}
      onSubmit={onSubmit}
      noValidate
    >
      {children}
    </form>
  );
}

export default Form;
