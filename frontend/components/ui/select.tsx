"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

// ─── Context ────────────────────────────────────────────────────────────────

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("Select compound components must be used inside <Select>");
  return ctx;
}

// ─── Select Root ─────────────────────────────────────────────────────────────

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

function Select({ value, defaultValue = "", onValueChange, children }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);

  const controlled = value !== undefined;
  const currentValue = controlled ? value : internalValue;

  const handleValueChange = React.useCallback(
    (val: string) => {
      if (!controlled) setInternalValue(val);
      onValueChange?.(val);
      setOpen(false);
    },
    [controlled, onValueChange]
  );

  // Close on outside click
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <SelectContext.Provider
      value={{ value: currentValue, onValueChange: handleValueChange, open, setOpen }}
    >
      <div ref={containerRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

// ─── SelectTrigger ───────────────────────────────────────────────────────────

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
}

function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  const { open, setOpen } = useSelectContext();
  return (
    <button
      type="button"
      aria-expanded={open}
      data-slot="select-trigger"
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground shadow-sm transition-all outline-none",
        "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
        "hover:bg-slate-50",
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
          open && "rotate-180"
        )}
      />
    </button>
  );
}

// ─── SelectValue ─────────────────────────────────────────────────────────────

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

function SelectValue({ placeholder, className }: SelectValueProps) {
  const { value } = useSelectContext();
  return (
    <span className={cn("truncate", !value && "text-muted-foreground", className)}>
      {value || placeholder}
    </span>
  );
}

// ─── SelectContent ───────────────────────────────────────────────────────────

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

function SelectContent({ className, children, ...props }: SelectContentProps) {
  const { open } = useSelectContext();

  if (!open) return null;

  return (
    <div
      data-slot="select-content"
      className={cn(
        "absolute left-0 z-50 mt-1 w-full overflow-hidden rounded-xl border border-border/40 bg-background shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  );
}

// ─── SelectItem ──────────────────────────────────────────────────────────────

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  className?: string;
  children: React.ReactNode;
}

function SelectItem({ value, className, children, ...props }: SelectItemProps) {
  const { value: selectedValue, onValueChange } = useSelectContext();
  const isSelected = selectedValue === value;

  return (
    <div
      data-slot="select-item"
      role="option"
      aria-selected={isSelected}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none",
        "hover:bg-emerald-50 hover:text-emerald-700",
        isSelected && "bg-emerald-50/60 text-emerald-700 font-medium",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
      {isSelected && (
        <Check className="ml-auto h-4 w-4 text-emerald-600 shrink-0" />
      )}
    </div>
  );
}

// ─── SelectLabel ─────────────────────────────────────────────────────────────

interface SelectLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <div
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)}
      {...props}
    />
  );
}

// ─── SelectSeparator ─────────────────────────────────────────────────────────

interface SelectSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <div
      data-slot="select-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
};
