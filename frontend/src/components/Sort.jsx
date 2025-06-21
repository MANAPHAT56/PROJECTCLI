import { Filter, ChevronDown } from 'lucide-react';

const Sortv = ({ sortBy, setSortBy, showSortDropdown, setShowSortDropdown, sortOptions, setCurrentPage }) => {
  return (
    <div className="relative flex-1 sm:flex-none sm:min-w-0">
      <button
        onClick={() => setShowSortDropdown(!showSortDropdown)}
        className="flex items-center justify-between w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm"
      >
        <div className="flex items-center min-w-0 flex-1 sm:flex-none">
          <Filter size={16} className="mr-2 text-gray-600 flex-shrink-0" />
          <span className="font-medium text-gray-700 truncate">
            {sortOptions.find(option => option.value === sortBy)?.label}
          </span>
        </div>
        <ChevronDown size={14} className="ml-2 text-gray-400 flex-shrink-0" />
      </button>

      {showSortDropdown && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 sm:hidden"
            onClick={() => setShowSortDropdown(false)}
          />
          <div className="absolute left-0 sm:right-0 mt-2 w-full sm:w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-80 overflow-y-auto">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSortBy(option.value);
                  setShowSortDropdown(false);
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                  sortBy === option.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Sortv;
