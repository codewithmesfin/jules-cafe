"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Edit, Trash2, Package, Image as ImageIcon, Filter, X } from "lucide-react";
import { api } from "../../utils/api";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ConfirmationDialog } from "../../components/ui/ConfirmationDialog";
import { Card } from "../../components/ui/Card";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "../../utils/cn";
import type { Product, Category } from "../../types";

const Products = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState({ category: "all", search: "" });

  const canManageProducts = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.products.getAll();
      setProducts(data);
    } catch (error) {
      showNotification("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (error) {}
  };

  const filteredProducts = products.filter((product) => {
    const searchMatch = product.name.toLowerCase().includes(mobileFilters.search.toLowerCase());
    const categoryMatch = mobileFilters.category === "all" || product.category_id === mobileFilters.category;
    return searchMatch && categoryMatch;
  });

  const handleDelete = async () => {
    if (productToDelete) {
      try {
        await api.products.delete(productToDelete.id);
        showNotification("Product deleted successfully", "success");
        fetchProducts();
      } catch (error) {
        showNotification("Failed to delete product", "error");
      } finally {
        setProductToDelete(null);
      }
    }
  };

  const navigateToProduct = (product: Product | null = null) => {
    if (product) {
      router.push(`/dashboard/products/${product.id}`);
    } else {
      router.push('/dashboard/products/new');
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-100 rounded w-32 animate-pulse" />
          <div className="h-10 bg-slate-100 rounded w-28 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="h-40 bg-slate-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 rounded-xl">
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">Products</h1>
            {canManageProducts && (
              <Button
                onClick={() => navigateToProduct()}
                size="sm"
              >
                <Plus size={16} className="mr-1" /> Add
              </Button>
            )}
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              value={mobileFilters.search}
              onChange={(e) => setMobileFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-lg border border-slate-200"
            >
              <Filter size={14} className={cn("text-slate-600", filterOpen && "text-slate-900")} />
            </button>
          </div>
          
          {/* Mobile Filter Panel */}
          {filterOpen && (
            <div className="p-3 bg-slate-50 rounded-xl space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Category</label>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={mobileFilters.category}
                  onChange={(e) => setMobileFilters(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="w-full mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select
                  className="pl-10 pr-10 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 cursor-pointer min-w-[160px]"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {canManageProducts && (
              <Button
                onClick={() => navigateToProduct()}
              >
                <Plus size={18} className="mr-2" /> Add Product
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full mx-auto py-4 lg:py-6">
        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="py-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Package size={40} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No products found</h3>
              <p className="text-slate-500 mb-4">Try adjusting your search or add a new product.</p>
              {canManageProducts && (
                <Button
                  onClick={() => navigateToProduct()}
                  variant="outline"
                >
                  <Plus size={16} className="mr-1" /> Add Product
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group"
                onClick={() => navigateToProduct(product)}
              >
                {/* Product Image */}
                <div className="relative h-32 sm:h-40 bg-slate-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="text-slate-300" size={32} />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-semibold",
                      product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                    )}>
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-slate-900 leading-tight line-clamp-1 text-sm sm:text-base mb-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const cat = categories.find(c => c.id === product.category_id);
                      return cat ? (
                        <Badge className="bg-slate-100 text-slate-600 text-[10px]" size="sm">
                          {cat.name}
                        </Badge>
                      ) : null;
                    })()}
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      ${product.price?.toFixed(2) || '0.00'}
                    </span>
                  </div>

                  {/* Actions */}
                  {canManageProducts && (
                    <div 
                      className="flex items-center gap-2 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => navigateToProduct(product)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Edit size={12} /> Edit
                      </button>
                      <button
                        onClick={() => setProductToDelete(product)}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to remove "${productToDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Products;
