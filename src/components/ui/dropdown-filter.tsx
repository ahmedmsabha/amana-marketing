"use client";
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface DropdownFilterProps {
  title: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function DropdownFilter({
  title,
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
  className = ""
}: DropdownFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionToggle = (option: string) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];
    onChange(newValues);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const displayText = selectedValues.length === 0
    ? placeholder
    : selectedValues.length === 1
      ? selectedValues[0]
      : `${selectedValues.length} selected`;

  return (
    <div className={`bg-gray-800 rounded-lg p-4 border border-gray-700 ${className}`} ref={dropdownRef}>
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
        {title}
      </h3>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <span className={selectedValues.length === 0 ? 'text-gray-400' : 'text-white'}>
            {displayText}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {selectedValues.length > 0 && (
          <button
            onClick={handleClearAll}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            aria-label="Clear all selections"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center px-3 py-2 hover:bg-gray-600 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => handleOptionToggle(option)}
                  className="mr-2 text-blue-500 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-white text-sm">{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {selectedValues.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedValues.map((value) => (
            <span
              key={value}
              className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
            >
              {value}
              <button
                onClick={() => handleOptionToggle(value)}
                className="ml-1 text-blue-200 hover:text-white"
                aria-label={`Remove ${value}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

