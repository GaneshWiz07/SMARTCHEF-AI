function RecipeCard({ recipe, onClick }) {
  return (
    <div
      onClick={onClick}
      className="glass-card cursor-pointer transform hover:scale-105 transition-all duration-300 overflow-hidden"
    >
      <img
        src={recipe.image}
        alt={recipe.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{recipe.name}</h3>
        <div className="flex gap-2 mb-3 flex-wrap">
          {recipe.ingredientMatchCount > 0 && recipe.totalUserIngredients > 0 && (
            <span className="px-2 py-1 bg-green-600/90 backdrop-blur-sm text-white text-xs rounded-full font-bold shadow-md">
              ✓ {recipe.ingredientMatchCount}/{recipe.totalUserIngredients} matches
            </span>
          )}
          {recipe.category && (
            <span className="px-2 py-1 bg-primary-100/80 backdrop-blur-sm text-primary-700 text-xs rounded-full">
              {recipe.category}
            </span>
          )}
          {recipe.area && (
            <span className="px-2 py-1 bg-blue-100/80 backdrop-blur-sm text-blue-700 text-xs rounded-full">
              {recipe.area}
            </span>
          )}
          {recipe.source === 'Edamam' && (
            <span className="px-2 py-1 bg-green-100/80 backdrop-blur-sm text-green-700 text-xs rounded-full">
              ✨ Premium
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {recipe.ingredients?.length || 0} ingredients
        </p>
        {recipe.matchedUserIngredients && recipe.matchedUserIngredients.length > 0 && (
          <p className="text-xs text-green-700 mt-1 font-medium">
            Contains: {recipe.matchedUserIngredients.join(', ')}
          </p>
        )}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-xs text-gray-500">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeCard;

