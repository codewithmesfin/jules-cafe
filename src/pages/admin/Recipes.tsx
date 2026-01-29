import React, { useState } from 'react';
import { Search, Plus, Utensils, Info } from 'lucide-react';
import { MOCK_MENU_ITEMS, MOCK_RECIPES, MOCK_INGREDIENTS } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

const Recipes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const recipeData = MOCK_MENU_ITEMS.map(item => {
    const recipe = MOCK_RECIPES.find(r => r.menu_item_id === item.id);
    return {
      ...item,
      hasRecipe: !!recipe,
      ingredientsCount: recipe?.ingredients.length || 0,
      recipe: recipe
    };
  }).filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search menu items..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Table
        data={recipeData}
        columns={[
          {
            header: 'Menu Item',
            accessor: (item) => (
              <div className="flex items-center gap-3">
                <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                <span className="font-bold text-gray-900">{item.name}</span>
              </div>
            )
          },
          {
            header: 'Status',
            accessor: (item) => (
              <Badge variant={item.hasRecipe ? 'success' : 'neutral'}>
                {item.hasRecipe ? 'Recipe Defined' : 'No Recipe'}
              </Badge>
            )
          },
          { header: 'Ingredients', accessor: (item) => `${item.ingredientsCount} items` },
          {
            header: 'Actions',
            accessor: (item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                  {item.hasRecipe ? 'Edit Recipe' : 'Add Recipe'}
                </Button>
                {item.hasRecipe && (
                  <Button variant="ghost" size="sm" title="View Details"><Info size={16} /></Button>
                )}
              </div>
            )
          }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Manage Recipe"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsModalOpen(false)}>Save Recipe</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Utensils className="text-orange-500" />
            <div>
              <p className="font-bold">Garlic Bread</p>
              <p className="text-sm text-gray-500">Define the ingredients and quantities for this dish.</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Ingredients</h4>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Ingredient</label>
                  <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                    {MOCK_INGREDIENTS.map(ing => (
                      <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <Input label="Quantity" type="number" step="0.01" />
                </div>
                <Button variant="ghost" size="sm" className="text-red-500 mb-1">Remove</Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
              <Plus size={16} /> Add Ingredient
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Recipes;
