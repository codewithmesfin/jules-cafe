"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Package, ShoppingCart, Image as ImageIcon, MoreVertical, Filter } from "lucide-react";
import { api } from "../../utils/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { ConfirmationDialog } from "../../components/ui/ConfirmationDialog";
import { useNotification } from "../../context/NotificationContext";
import { cn } from "../../utils/cn";
import type { Product, Category } from "../../types";

const Products = () => {
  const { showNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category_id: "",
    image_url: "",
    is_active: true
  });

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
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showNotification("Product name is required", "error");
      return;
    }
    if (!formData.category_id) {
      showNotification("Please select a category", "error");
      return;
    }

    try {
      if (editingProduct) {
        await api.products.update(editingProduct.id, formData);
        showNotification("Product updated successfully");
      } else {
        await api.products.create(formData);
        showNotification("Product created successfully");
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      showNotification("Failed to save product", "error");
    }
  };

  const handleDelete = async () => {
    if (productToDelete) {
      try {
        await api.products.delete(productToDelete.id);
        showNotification("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        showNotification("Failed to delete product", "error");
      } finally {
        setProductToDelete(null);
      }
    }
  };

  const openModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        category_id: product.category_id,
        image_url: product.image_url || "",
        is_active: product.is_active
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        category_id: "",
        image_url: "",
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              className="pl-10 pr-10 py-3 bg-slate-50 border-none rounded-2xl text-sm appearance-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer min-w-[160px]"
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
        <Button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 py-3 font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Plus size={20} /> Add Product
        </Button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-slate-500 font-medium">Fetching catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Package size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-500">Try adjusting your search or add a new product.</p>
          </div>
        ) : (
          <Table
            data={filteredProducts}
            columns={[
              {
                header: "Product",
                accessor: (p) => (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-slate-100">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-slate-300" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{p.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{p.description || "No description"}</p>
                    </div>
                  </div>
                ),
              },
              {
                header: "Category",
                accessor: (p) => {
                  const cat = categories.find(c => c.id === p.category_id);
                  return <Badge className="bg-slate-100 text-slate-600 font-semibold rounded-lg px-2.5 py-1">{cat?.name || "Uncategorized"}</Badge>;
                },
              },
              {
                header: "Price",
                accessor: (p) => <span className="font-black text-slate-900 tracking-tight">${p.price.toFixed(2)}</span>
              },
              {
                header: "Status",
                accessor: (p) => (
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", p.is_active ? "bg-green-500" : "bg-slate-300")} />
                    <span className={cn("text-xs font-bold uppercase tracking-wider", p.is_active ? "text-green-600" : "text-slate-400")}>
                      {p.is_active ? "Active" : "Disabled"}
                    </span>
                  </div>
                ),
              },
              {
                header: "Actions",
                accessor: (p) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(p)}
                      className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => setProductToDelete(p)}
                      className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product" : "New Product"}
        className="max-w-xl"
      >
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Product Name"
                placeholder="e.g. Classic Burger"
                className="rounded-2xl"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              className="rounded-2xl"
              value={formData.price || ""}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            />

            <div className="md:col-span-2">
              <Input
                label="Image URL"
                placeholder="https://images.unsplash.com/..."
                className="rounded-2xl"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Short description of the product..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
             <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-2xl py-4 font-bold border-slate-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 rounded-2xl py-4 font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
              >
                {editingProduct ? "Save Changes" : "Create Product"}
              </Button>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to remove "${productToDelete?.name}" from your catalog? This cannot be undone.`}
        confirmLabel="Delete Product"
        variant="danger"
      />
    </div>
  );
};

export default Products;
