import type { ComponentPropsWithoutRef } from "react";

const BASE_FIELD_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4";

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

export const formControlClassName = BASE_FIELD_CLASS;
