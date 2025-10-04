import { useState } from 'react';

function IngredientInput({ ingredients, onChange, onSearch }) {
  const [input, setInput] = useState('');

  const addIngredient = () => {
    if (input.trim()) {
      onChange([...ingredients, input.trim()]);
      setInput('');
    }
  };

  const removeIngredient = (index) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter ingredient (e.g., chicken, tomatoes)"
          className="input-field flex-1 text-sm sm:text-base"
        />
        <div className="flex gap-2">
          <button onClick={addIngredient} className="btn-secondary flex-1 sm:flex-initial text-sm sm:text-base">
            ➕ Add
          </button>
          <button 
            onClick={onSearch} 
            disabled={ingredients.length === 0}
            className="btn-primary flex-1 sm:flex-initial text-sm sm:text-base"
          >
            🔍 Search
          </button>
        </div>
      </div>

      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ingredient, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
            >
              {ingredient}
              <button
                onClick={() => removeIngredient(index)}
                className="hover:text-primary-900 text-lg"
                aria-label={`Remove ${ingredient}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default IngredientInput;

