import { createContext, useContext, useState } from 'react';

const RecipesContext = createContext();

export const useRecipes = () => {
  const context = useContext(RecipesContext);
  if (!context) {
    throw new Error('useRecipes must be used within a RecipesProvider');
  }
  return context;
};

export const RecipesProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [dietary, setDietary] = useState('none');
  const [region, setRegion] = useState('all');
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [noMoreRecipes, setNoMoreRecipes] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const clearRecipes = () => {
    setRecipes([]);
    setNoMoreRecipes(false);
    setCanLoadMore(true);
    setHasSearched(false);
  };

  const value = {
    recipes,
    setRecipes,
    ingredients,
    setIngredients,
    dietary,
    setDietary,
    region,
    setRegion,
    canLoadMore,
    setCanLoadMore,
    noMoreRecipes,
    setNoMoreRecipes,
    hasSearched,
    setHasSearched,
    clearRecipes,
  };

  return (
    <RecipesContext.Provider value={value}>
      {children}
    </RecipesContext.Provider>
  );
};
