function RegionFilter({ value, onChange }) {
  const options = [
    { value: 'all', label: 'All Regions', icon: '🌍' },
    { value: 'Indian', label: 'Indian', icon: '🇮🇳' },
    { value: 'Chinese', label: 'Chinese', icon: '🇨🇳' },
    { value: 'Japanese', label: 'Japanese', icon: '🇯🇵' },
    { value: 'Thai', label: 'Thai', icon: '🇹🇭' },
    { value: 'French', label: 'French', icon: '🇫🇷' },
    { value: 'Italian', label: 'Italian', icon: '🇮🇹' },
    { value: 'Mexican', label: 'Mexican', icon: '🇲🇽' },
    { value: 'American', label: 'American', icon: '🇺🇸' },
    { value: 'British', label: 'British', icon: '🇬🇧' },
    { value: 'Greek', label: 'Greek', icon: '🇬🇷' },
    { value: 'Spanish', label: 'Spanish', icon: '🇪🇸' },
    { value: 'Turkish', label: 'Turkish', icon: '🇹🇷' },
    { value: 'Vietnamese', label: 'Vietnamese', icon: '🇻🇳' },
    { value: 'Moroccan', label: 'Moroccan', icon: '🇲🇦' },
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
            <span className="mr-1">{option.icon}</span>
            <span className="hidden min-[400px]:inline">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default RegionFilter;

