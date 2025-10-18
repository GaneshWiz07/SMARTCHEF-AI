import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Plus, Clock, Package, Trash2, X } from 'lucide-react';

function Pantry() {
  const { user } = useAuth();
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    unit: 'piece',
    expiryDate: '',
  });

  const userId = user?.uid || 'default'; // Use Firebase user ID

  useEffect(() => {
    if (user) {
      loadPantry();
    }
  }, [user]);

  const loadPantry = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/.netlify/functions/pantry?userId=${userId}`);
      setPantryItems(response.data.pantry || []);
    } catch (error) {
      console.error('Error loading pantry:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load pantry');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.name || !newItem.quantity) {
      alert('Please fill in item name and quantity');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const item = {
        ...newItem,
        id: Date.now().toString(),
        addedDate: new Date().toISOString(),
      };

      console.log('Adding item to pantry:', item);

      const response = await axios.post(`/.netlify/functions/pantry?userId=${userId}`, {
        items: [item],
      });

      console.log('Item added successfully:', response.data);

      setNewItem({ name: '', quantity: '', unit: 'piece', expiryDate: '' });
      await loadPantry();
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMsg.textContent = '✅ Item added successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
      
    } catch (error) {
      console.error('Error adding item:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to add item. Please check MongoDB connection.';
      setError(errorMsg);
      alert(`Failed to add item:\n${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await axios.delete(`/.netlify/functions/pantry?userId=${userId}`, {
        data: { itemId },
      });
      loadPantry();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center px-4">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Pantry</h1>
        <p className="text-sm sm:text-base text-gray-600">Track your ingredients and reduce food waste</p>
      </div>

      {/* MongoDB Connection Warning */}
      {error && error.includes('MONGO_URI') && (
        <div className="card p-6 bg-yellow-50 border-2 border-yellow-400">
          <h3 className="text-xl font-bold text-yellow-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> MongoDB Not Configured
          </h3>
          <p className="text-yellow-700 mb-3">
            The Pantry feature requires MongoDB to store your items. Please add your MongoDB connection string to use this feature.
          </p>
          <details className="text-sm text-yellow-600">
            <summary className="cursor-pointer font-medium">How to fix this?</summary>
            <ol className="list-decimal ml-5 mt-2 space-y-1">
              <li>Sign up for MongoDB Atlas (free): <a href="https://www.mongodb.com/cloud/atlas" target="_blank" className="underline">mongodb.com/cloud/atlas</a></li>
              <li>Create a free M0 cluster</li>
              <li>Get your connection string</li>
              <li>Add <code className="bg-yellow-100 px-1 rounded">MONGO_URI</code> to your <code className="bg-yellow-100 px-1 rounded">.env</code> file</li>
              <li>Restart the server: <code className="bg-yellow-100 px-1 rounded">npm run dev</code></li>
            </ol>
            <p className="mt-2">See <code className="bg-yellow-100 px-1 rounded">DEPLOYMENT.md</code> for detailed instructions.</p>
          </details>
        </div>
      )}

      {/* Error Message */}
      {error && !error.includes('MONGO_URI') && (
        <div className="card p-4 bg-red-50 border-2 border-red-400">
          <p className="text-red-700">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Add Item Form */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold mb-6">Add New Item</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <label htmlFor="item-name" className="block text-sm font-medium text-gray-700 mb-1">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              id="item-name"
              type="text"
              placeholder="e.g., Chicken Breast, Tomatoes"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="input-field"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="item-quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              id="item-quantity"
              type="number"
              placeholder="e.g., 2, 500"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="input-field"
              required
              aria-required="true"
              min="0"
              step="any"
            />
          </div>
          <div>
            <label htmlFor="item-unit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              id="item-unit"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              className="input-field"
              aria-label="Select unit of measurement"
            >
              <option value="piece">Piece</option>
              <option value="kg">Kilogram (kg)</option>
              <option value="g">Gram (g)</option>
              <option value="l">Liter (L)</option>
              <option value="ml">Milliliter (ml)</option>
              <option value="cup">Cup</option>
              <option value="tbsp">Tablespoon</option>
            </select>
          </div>
          <div>
            <label htmlFor="item-expiry" className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date (Optional)
            </label>
            <input
              id="item-expiry"
              type="date"
              value={newItem.expiryDate}
              onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
              className="input-field"
              aria-label="Select expiry date for the item"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        <button 
          onClick={addItem} 
          disabled={saving || !newItem.name || !newItem.quantity}
          className="btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <Clock className="w-4 h-4 animate-pulse" /> Adding...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Add to Pantry
            </>
          )}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <Package className="w-16 h-16 text-primary-600 animate-pulse" />
          </div>
          <p className="mt-4 text-gray-600">Loading your pantry...</p>
        </div>
      )}

      {/* Pantry Items */}
      {!loading && pantryItems.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {pantryItems.length} Item{pantryItems.length !== 1 ? 's' : ''} in Pantry
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pantryItems.map((item) => (
              <div
                key={item.id}
                className={`glass-card p-4 ${
                  isExpired(item.expiryDate)
                    ? 'border-2 border-red-500/70 bg-red-50/50'
                    : isExpiringSoon(item.expiryDate)
                    ? 'border-2 border-yellow-500/70 bg-yellow-50/50'
                    : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg capitalize">{item.name}</h3>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-colors"
                    aria-label="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-600">
                  {item.quantity} {item.unit}
                </p>
                {item.expiryDate && (
                  <p className={`text-sm mt-2 ${
                    isExpired(item.expiryDate)
                      ? 'text-red-600 font-bold'
                      : isExpiringSoon(item.expiryDate)
                      ? 'text-yellow-600 font-bold'
                      : 'text-gray-500'
                  }`}>
                    {isExpired(item.expiryDate)
                      ? (<><X className="w-4 h-4 inline-block mr-1" /> Expired</>)
                      : isExpiringSoon(item.expiryDate)
                      ? (<><AlertTriangle className="w-4 h-4 inline-block mr-1" /> Expiring soon</>)
                      : `Expires: ${new Date(item.expiryDate).toLocaleDateString()}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && pantryItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="flex justify-center mb-4">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
          <p className="text-xl">Your pantry is empty. Add some items to get started!</p>
        </div>
      )}
    </div>
  );
}

export default Pantry;

