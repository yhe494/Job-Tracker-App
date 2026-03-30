import type { ComponentPropsWithoutRef } from "react";
import { formControlClassName } from "./formControlClassName";

const BASE_FIELD_CLASS = formControlClassName;

export function FieldLabel(props: ComponentPropsWithoutRef<"label">) {
  return <label {...props} className={`text-sm font-medium text-slate-700 ${props.className ?? ""}`.trim()} />;
}

export function TextInput(props: ComponentPropsWithoutRef<"input">) {
  return <input {...props} className={`${BASE_FIELD_CLASS} ${props.className ?? ""}`.trim()} />;
}

export function TextAreaInput(props: ComponentPropsWithoutRef<"textarea">) {
  return <textarea {...props} className={`${BASE_FIELD_CLASS} ${props.className ?? ""}`.trim()} />;
}

export function SelectInput(props: ComponentPropsWithoutRef<"select">) {
  return <select {...props} className={`${BASE_FIELD_CLASS} ${props.className ?? ""}`.trim()} />;
}
