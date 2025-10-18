import { Utensils, Leaf, Sprout, Apple, Beef, Fish } from 'lucide-react';

function DietaryFilter({ value, onChange }) {
  const options = [
    { value: 'none', label: 'All Recipes', icon: <Utensils className="w-4 h-4" /> },
    { value: 'vegetarian', label: 'Vegetarian', icon: <Leaf className="w-4 h-4" /> },
    { value: 'vegan', label: 'Vegan', icon: <Sprout className="w-4 h-4" /> },
    { value: 'keto', label: 'Keto', icon: <Apple className="w-4 h-4" /> },
    { value: 'paleo', label: 'Paleo', icon: <Beef className="w-4 h-4" /> },
    { value: 'seafood', label: 'Seafood', icon: <Fish className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base flex items-center gap-2 ${
            value === option.value
              ? 'bg-primary-600 text-white shadow-lg scale-105'
              : 'bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-300 hover:border-primary-400'
          }`}
        >
          <span className="flex items-center">{option.icon}</span>
          <span className="hidden xs:inline sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

export default DietaryFilter;

