import { Globe } from 'lucide-react';

function RegionFilter({ value, onChange }) {
  const options = [
    { value: 'all', label: 'All Regions', flag: '🌍' },
    { value: 'Indian', label: 'Indian', flag: '🇮🇳' },
    { value: 'Chinese', label: 'Chinese', flag: '🇨🇳' },
    { value: 'Japanese', label: 'Japanese', flag: '🇯🇵' },
    { value: 'Thai', label: 'Thai', flag: '🇹🇭' },
    { value: 'French', label: 'French', flag: '🇫🇷' },
    { value: 'Italian', label: 'Italian', flag: '🇮🇹' },
    { value: 'Mexican', label: 'Mexican', flag: '🇲🇽' },
    { value: 'American', label: 'American', flag: '🇺🇸' },
    { value: 'British', label: 'British', flag: '🇬🇧' },
    { value: 'Greek', label: 'Greek', flag: '🇬🇷' },
    { value: 'Spanish', label: 'Spanish', flag: '🇪🇸' },
    { value: 'Turkish', label: 'Turkish', flag: '🇹🇷' },
    { value: 'Vietnamese', label: 'Vietnamese', flag: '🇻🇳' },
    { value: 'Moroccan', label: 'Moroccan', flag: '🇲🇦' },
  ];

  return (
    <div className="space-y-2">
      <label className="block font-medium text-gray-700 text-sm sm:text-base">Filter by Region/Cuisine</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-2 sm:px-3 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
              value === option.value
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-300 hover:border-blue-400'
            }`}
          >
            {option.value === 'all' ? (
              <Globe className="w-4 h-4 mr-1" />
            ) : (
              <span className="mr-1">{option.flag}</span>
            )}
            <span className="hidden min-[400px]:inline">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default RegionFilter;

