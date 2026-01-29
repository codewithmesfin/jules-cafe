import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Star, Clock } from 'lucide-react';
import { MOCK_MENU_ITEMS } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useCart } from '../../context/CartContext';

const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = React.useState(1);

  const item = MOCK_MENU_ITEMS.find(i => i.id === id);

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Item not found</h1>
        <Button onClick={() => navigate('/menu')}>Back to Menu</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-8">
        <ArrowLeft className="mr-2" size={20} /> Back to Menu
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="rounded-2xl overflow-hidden shadow-lg h-[400px] md:h-[600px]">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="info">Category Name</Badge>
            {!item.is_available && <Badge variant="error">Out of Stock</Badge>}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{item.name}</h1>
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center text-orange-400">
              <Star size={18} fill="currentColor" />
              <span className="ml-1 text-gray-900 font-bold">4.9</span>
              <span className="ml-1 text-gray-500 text-sm">(48 reviews)</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock size={18} className="mr-1" /> 15-20 min
            </div>
          </div>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {item.description}
          </p>
          <div className="text-3xl font-bold text-orange-600 mb-8">
            ${item.price.toFixed(2)}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-2 bg-gray-50">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <Minus size={20} />
              </button>
              <span className="w-12 text-center text-xl font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1 text-lg"
              disabled={!item.is_available}
              onClick={() => {
                for (let i = 0; i < quantity; i++) addToCart(item);
                navigate('/cart');
              }}
            >
              Add to Cart - ${(item.price * quantity).toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
