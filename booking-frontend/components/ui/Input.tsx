import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

const baseClass =
  "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition";

type InputProps = InputHTMLAttributes<HTMLInputElement>;
export function Input(props: InputProps) {
  return <input className={baseClass} {...props} />;
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;
export function Textarea(props: TextareaProps) {
  return <textarea className={baseClass} {...props} />;
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;
export function Select(props: SelectProps) {
  return <select className={baseClass} {...props} />;
}
