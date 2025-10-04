function DietaryFilter({ value, onChange }) {
  const options = [
    { value: 'none', label: 'All Recipes', icon: '🍽️' },
    { value: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
    { value: 'vegan', label: 'Vegan', icon: '🌱' },
    { value: 'keto', label: 'Keto', icon: '🥑' },
    { value: 'paleo', label: 'Paleo', icon: '🍖' },
    { value: 'seafood', label: 'Seafood', icon: '🐟' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
            value === option.value
              ? 'bg-primary-600 text-white shadow-lg scale-105'
              : 'bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-300 hover:border-primary-400'
          }`}
        >
          <span className="mr-1 sm:mr-2">{option.icon}</span>
          <span className="hidden xs:inline sm:inline">{option.label}</span>
          <span className="inline xs:hidden sm:hidden">{option.icon}</span>
        </button>
      ))}
    </div>
  );
}

export default DietaryFilter;

