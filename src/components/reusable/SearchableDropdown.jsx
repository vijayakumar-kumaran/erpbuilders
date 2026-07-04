import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

const SearchableDropdown = ({ options, label = 'Select', onChange  }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const scrollRef = useRef(null);

  const filteredOptions = options.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const visibleOptions = filteredOptions.slice(0, visibleCount);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    setSearch('');
    if (onChange) onChange(option); // <-- changed from onSelect
    };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    if (nearBottom && visibleCount < filteredOptions.length) {
      setVisibleCount((prev) => prev + 10);
    }
  };

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleCount(10);
  }, [search]);

  return (
    <div className="relative w-full max-w-sm text-sm">
      <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</label>
      <div
        className="flex items-center justify-between border rounded-lg px-4 py-2 bg-white dark:bg-gray-900 dark:text-white shadow-sm hover:shadow-md transition-all cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`truncate ${!selected ? 'text-gray-400' : ''}`}>
          {selected?.label || 'Select an option'}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center px-3 py-2 border-b dark:border-gray-600">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-300 mr-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent focus:outline-none text-gray-800 dark:text-white"
            />
          </div>
          <ul
            ref={scrollRef}
            onScroll={handleScroll}
            className="max-h-60 overflow-y-auto py-1"
          >
            {visibleOptions.length > 0 ? (
              visibleOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className="px-4 py-2 hover:bg-indigo-100 dark:hover:bg-indigo-600 dark:hover:text-white transition-all cursor-pointer"
                >
                  {option.label}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-400">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
