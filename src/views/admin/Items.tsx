"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Edit, Trash2, Package, Image as ImageIcon, Filter, X } from "lucide-react";
import { api } from "../../utils/api";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ConfirmationDialog } from "../../components/ui/ConfirmationDialog";
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
      router.push(`/products/${product.id}`);
    } else {
      router.push('/products/new');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-slate-900">Products</h1>
            {canManageProducts && (
              <Button
                onClick={() => navigateToProduct()}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-sm py-2"
              >
                <Plus size={16} className="mr-1" /> Add
              </Button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              placeholder="Search products..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-100 border-none rounded-xl text-sm"
              value={mobileFilters.search}
              onChange={(e) => setMobileFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-lg border border-slate-200"
            >
              <Filter size={14} className={cn("text-slate-600", filterOpen && "text-blue-600")} />
            </button>
          </div>
          
          {/* Mobile Filter Panel */}
          {filterOpen && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl">
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
          )}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select
                  className="pl-10 pr-10 py-3 bg-slate-50 border-none rounded-2xl text-sm appearance-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer min-w-[160px]"
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
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 py-3 font-bold flex items-center gap-2 shadow-lg shadow-blue-200"
              >
                <Plus size={20} /> Add Product
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Package size={40} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your search or add a new product.</p>
            {canManageProducts && (
              <Button
                onClick={() => navigateToProduct()}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                <Plus size={16} className="mr-1" /> Add Product
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="relative h-40 bg-slate-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="text-slate-300" size={40} />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-semibold",
                      product.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    )}>
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-900 leading-tight line-clamp-1">{product.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {(() => {
                      const cat = categories.find(c => c.id === product.category_id);
                      return cat ? (
                        <Badge className="bg-slate-100 text-slate-600 text-xs">{cat.name}</Badge>
                      ) : null;
                    })()}
                    <span className="font-bold text-blue-600">${product.price.toFixed(2)}</span>
                  </div>

                  {product.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{product.description}</p>
                  )}

                  {/* Actions */}
                  {canManageProducts && (
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => navigateToProduct(product)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-sm font-medium transition-colors"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => setProductToDelete(product)}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden xl:block bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mx-6">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Product</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Category</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Price</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-slate-300" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{product.description || "No description"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {(() => {
                    const cat = categories.find(c => c.id === product.category_id);
                    return cat ? (
                      <Badge className="bg-slate-100 text-slate-600">{cat.name}</Badge>
                    ) : <span className="text-slate-400">—</span>;
                  })()}
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-900">${product.price.toFixed(2)}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", product.is_active ? "bg-green-500" : "bg-slate-300")} />
                    <span className={cn("text-sm font-medium", product.is_active ? "text-green-600" : "text-slate-400")}>
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {canManageProducts && (
                      <>
                        <button
                          onClick={() => navigateToProduct(product)}
                          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
