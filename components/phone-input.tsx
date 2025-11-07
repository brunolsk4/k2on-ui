"use client"

import PhoneNumberInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

type Props = {
  value?: string;
  onChange?: (value?: string) => void;
  className?: string;
};

export function PhoneInput({ className, value, onChange }: Props) {
  return (
    <PhoneNumberInput
      value={value as any}
      onChange={(v) => onChange && onChange(v as any)}
      flags={flags}
      defaultCountry="BR"
      international
      countryCallingCodeEditable={false}
      className={cn(
        "flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  );
}

export default PhoneInput;

