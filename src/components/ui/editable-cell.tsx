import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EditableTextProps {
  value: string;
  onSave: (value: string) => Promise<void> | void;
  placeholder?: string;
  maxLength?: number;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  placeholder = "",
  maxLength,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isHovered, setIsHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (isSaving) return;
    
    if (editValue === value) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      setEditValue(value);
      setIsEditing(false);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="editable-cell-editing relative">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => {
            if (!isSaving) {
              handleSave();
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full px-2 py-1 border-0 focus:outline-none bg-transparent"
        />
      </div>
    );
  }

  return (
    <div
      className="editable-cell relative cursor-pointer py-2 px-2 group"
      onClick={() => setIsEditing(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label="Edit this field"
    >
      <span>{value || placeholder}</span>
      {isHovered && (
        <Pencil className="edit-icon absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
      )}
    </div>
  );
};

interface EditableTextareaProps {
  value: string;
  onSave: (value: string) => Promise<void> | void;
  placeholder?: string;
  rows?: number;
}

export const EditableTextarea: React.FC<EditableTextareaProps> = ({
  value,
  onSave,
  placeholder = "",
  rows = 3,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }
    
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      setEditValue(value);
      setIsEditing(false);
      throw error;
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    } else if (e.ctrlKey && e.key === "Enter") {
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className="editable-cell-editing relative">
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => {
            setTimeout(() => handleSave(), 0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-2 py-1 border-0 focus:outline-none bg-transparent resize-none max-h-40 overflow-y-auto"
        />
      </div>
    );
  }

  return (
    <div
      className="editable-cell relative cursor-pointer py-2 px-2 group"
      onClick={() => setIsEditing(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label="Edit this field"
    >
      <span className="whitespace-pre-wrap">{value || placeholder}</span>
      {isHovered && (
        <Pencil className="edit-icon absolute right-2 top-2 h-3 w-3 text-gray-400" />
      )}
    </div>
  );
};

interface EditableDropdownProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onSave: (value: string) => Promise<void> | void;
}

export const EditableDropdown: React.FC<EditableDropdownProps> = ({
  value,
  options,
  onSave,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = async (newValue: string) => {
    if (newValue !== value) {
      try {
        await onSave(newValue);
      } catch (error) {
        throw error;
      }
    }
    setIsOpen(false);
  };

  return (
    <div
      className="editable-cell relative cursor-pointer py-2 px-2 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Select value={value} onValueChange={handleSave} open={isOpen} onOpenChange={setIsOpen}>
        <SelectTrigger className="w-full border-0 focus:ring-0 bg-transparent hover:bg-transparent">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isHovered && !isOpen && (
        <Pencil className="edit-icon absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
      )}
    </div>
  );
};

interface EditableCheckboxProps {
  value: boolean;
  onSave: (value: boolean) => Promise<void> | void;
}

export const EditableCheckbox: React.FC<EditableCheckboxProps> = ({
  value,
  onSave,
}) => {
  const [isToggling, setIsToggling] = useState(false);
  
  const handleToggle = async () => {
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      await onSave(!value);
    } catch (error) {
      throw error;
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div
      className="editable-cell cursor-pointer py-2 px-2 flex items-center justify-center"
      role="button"
      tabIndex={0}
      aria-label="Toggle this field"
    >
      <Checkbox checked={value} onCheckedChange={handleToggle} disabled={isToggling} />
    </div>
  );
};

interface EditableDateProps {
  value: string;
  onSave: (value: string) => Promise<void> | void;
}

export const EditableDate: React.FC<EditableDateProps> = ({ value, onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [date, setDate] = useState<Date | undefined>(value ? new Date(value) : undefined);

  useEffect(() => {
    setDate(value ? new Date(value) : undefined);
  }, [value]);

  const handleSelect = async (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      try {
        await onSave(formattedDate);
        setDate(selectedDate);
      } catch (error) {
        throw error;
      }
    }
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className="editable-cell relative cursor-pointer py-2 px-2 group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          role="button"
          tabIndex={0}
          aria-label="Edit this date"
        >
          <span>{date ? format(date, "yyyy-MM-dd") : "Select date"}</span>
          {isHovered && (
            <Pencil className="edit-icon absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};

interface EditableNumberProps {
  value: number | string;
  onSave: (value: number) => Promise<void> | void;
  prefix?: string;
  type?: "number" | "currency";
}

export const EditableNumber: React.FC<EditableNumberProps> = ({
  value,
  onSave,
  prefix = "",
  type = "number",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(String(value));
  }, [value]);

  const handleSave = async () => {
    const numValue = parseFloat(editValue);
    if (isNaN(numValue) || numValue === Number(value)) {
      setIsEditing(false);
      return;
    }
    
    try {
      await onSave(numValue);
      setIsEditing(false);
    } catch (error) {
      setEditValue(String(value));
      setIsEditing(false);
      throw error;
    }
  };

  const handleCancel = () => {
    setEditValue(String(value));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const displayValue =
    type === "currency" ? `${prefix}${Number(value).toFixed(2)}` : `${prefix}${value}`;

  if (isEditing) {
    return (
      <div className="editable-cell-editing relative">
        {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2">{prefix}</span>}
        <input
          ref={inputRef}
          type="number"
          step={type === "currency" ? "0.01" : "1"}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => {
            setTimeout(() => handleSave(), 0);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full px-2 py-1 border-0 focus:outline-none bg-transparent",
            prefix && "pl-6"
          )}
        />
      </div>
    );
  }

  return (
    <div
      className="editable-cell relative cursor-pointer py-2 px-2 group"
      onClick={() => setIsEditing(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label="Edit this field"
    >
      <span>{displayValue}</span>
      {isHovered && (
        <Pencil className="edit-icon absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
      )}
    </div>
  );
};
