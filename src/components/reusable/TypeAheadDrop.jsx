import React, { useState, useEffect, useMemo, useRef } from 'react';
import debounce from 'lodash.debounce';
import { ChevronDown, ChevronUp, X } from 'react-feather';
import { createPortal } from 'react-dom';

const MaterialDropdown = ({
  onSearch,
  value,
  onChange,
  placeholder = "Select...",
  initialOptions = [],
  loadInitialData = false,
  minCharsToSearch = 1,
  disabled = false,
  label = '',
  error = '',
  className = ''
}) => {
  const [inputValue, setInputValue] = useState(value?.label || '');
  const [options, setOptions] = useState(initialOptions);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [minCharsReached, setMinCharsReached] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const initialized = useRef(false);

  // Load default data
  useEffect(() => {
    if (loadInitialData && !initialized.current && initialOptions.length === 0 && !disabled) {
      initialized.current = true;
      fetchData('');
    }
  }, [disabled]);

  // Debounced search
  const debouncedSearch = useMemo(() =>
    debounce(async (term) => {
      setIsTyping(false);
      if (disabled) return;

      if (term.length >= minCharsToSearch || (loadInitialData && term.length === 0)) {
        fetchData(term);
      } else {
        setOptions([]);
        setMinCharsReached(false);
      }
    }, 300), [onSearch, minCharsToSearch, loadInitialData, disabled]
  );

  const fetchData = async (term) => {
    if (disabled) return;

    setIsLoading(true);
    try {
      const res = await onSearch(term);
      const formatted = res.map(item => ({
        label: item.label || item.materialName || item.name,
        value: item.value || item.materialCode || item._id,
        ...item
      }));
      setOptions(formatted);
      setMinCharsReached(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    if (disabled) return;

    const value = e.target.value;
    setInputValue(value);
    setIsTyping(true);

    if (!isOpen) {
      setIsOpen(true);
    }

    debouncedSearch(value);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || disabled) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => Math.min(prev + 1, options.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (options[highlightedIndex]) handleSelect(options[highlightedIndex]);
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    };

    const input = inputRef.current;
    input?.addEventListener('keydown', handleKeyDown);
    return () => input?.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, options, highlightedIndex, disabled]);

  useEffect(() => {
    if (listRef.current && highlightedIndex >= 0) {
      const optionElement = listRef.current.children[highlightedIndex];
      optionElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleSelect = (item) => {
    if (disabled) return;

    setInputValue(item.label);
    onChange(item);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setInputValue('');
    onChange(null);
    if (loadInitialData) fetchData('');
    inputRef.current.focus();
  };

  const handleFocus = () => {
    if (disabled) return;

    setIsOpen(true);
    setHighlightedIndex(-1);
    if (inputValue.length === 0 && loadInitialData) {
      fetchData('');
    } else if (inputValue.length < minCharsToSearch && initialOptions.length > 0) {
      setOptions(initialOptions);
    }
  };

  const handleToggle = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setTimeout(() => {
      setIsOpen(prev => !prev);
      if (!isOpen) {
        handleFocus();
      }
    }, 0);
  };

  const renderOptions = () => {
    if (disabled) return null;

    if (isLoading || isTyping) {
      return (
        <div className="px-4 py-2 text-gray-500 text-sm flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      );
    }

    if (!options.length) {
      return (
        <div className="px-4 py-2 text-gray-500 text-sm">
          {inputValue.length === 0 && loadInitialData
            ? 'No options available'
            : `No results found for "${inputValue}"`}
        </div>
      );
    }

    return (
      <ul ref={listRef} className="max-h-60 overflow-auto py-1" role="listbox">
        {options.map((item, index) => (
          <li
            key={item.value}
            className={`px-4 py-2 cursor-pointer text-sm ${highlightedIndex === index
              ? 'bg-blue-50 text-blue-800'
              : 'hover:bg-gray-50 text-gray-700'
              }`}
            onMouseDown={() => handleSelect(item)}
            onMouseEnter={() => setHighlightedIndex(index)}
            role="option"
            aria-selected={highlightedIndex === index}
          >
            {item.label}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onClick={(e) => {
            e.preventDefault();
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={disabled ? "Disabled" : placeholder}
          className={`w-full pl-3 pr-10 py-2 border ${error ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-1 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'
            } focus:border-blue-500 text-sm ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white text-gray-700'
            }`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls="material-dropdown-options"
          disabled={disabled}
          readOnly={disabled}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {inputValue && !disabled && (
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 mr-1"
              onClick={handleClear}
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            className={`text-gray-400 hover:text-gray-500 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            onMouseDown={handleToggle}
            disabled={disabled}
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* FIXED PORTAL WRAPPER */}
      {isOpen && !disabled && createPortal(
        <div
          onMouseDown={(e) => e.stopPropagation()} // ✅ prevents close on scrollbar interaction
          style={{
            position: 'absolute',
            width: dropdownRef.current?.offsetWidth || 'auto',
            top: (dropdownRef.current?.getBoundingClientRect().bottom ?? 0) + window.scrollY,
            left: (dropdownRef.current?.getBoundingClientRect().left ?? 0) + window.scrollX,
            zIndex: 9999,
          }}
        >
          <div
            id="material-dropdown-options"
            className="w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
          >
            {renderOptions()}
          </div>
        </div>,
        document.body
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default MaterialDropdown;
