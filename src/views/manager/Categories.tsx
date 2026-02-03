"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Tag, MoreVertical } from "lucide-react";
import { api } from "../../utils/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { ConfirmationDialog } from "../../components/ui/ConfirmationDialog";
import { useNotification } from "../../context/NotificationContext";
import { cn } from "../../utils/cn";
import type { Category } from "../../types";

const Categories = () => {
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.categories.getAll();
      setCategories(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      showNotification("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showNotification("Category name is required", "error");
      return;
    }

    try {
      if (editingCategory) {
        await api.categories.update((editingCategory.id || (editingCategory as any)._id)!, formData);
        showNotification("Category updated");
      } else {
        await api.categories.create(formData);
        showNotification("Category created");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      showNotification("Failed to save category", "error");
    }
  };

  const handleDelete = async () => {
    if (categoryToDelete) {
      try {
        await api.categories.delete((categoryToDelete.id || (categoryToDelete as any)._id)!);
        showNotification("Category removed", "warning");
        fetchCategories();
      } catch (error) {
        showNotification("Failed to delete category", "error");
      } finally {
        setCategoryToDelete(null);
      }
    }
  };

  const openModal = (cat: Category | null = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        description: cat.description || "",
        is_active: cat.is_active
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", description: "", is_active: true });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Category Hub</h1>
          <p className="text-slate-500 font-medium">Organize your menu offerings into manageable sections</p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 h-12 font-black flex items-center gap-2 shadow-lg shadow-blue-100"
        >
          <Plus size={20} /> New Category
        </Button>
      </div>

      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm border">
        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
          <input
            placeholder="Filter categories..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden border">
        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-24">
             <Tag size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold">No categories defined yet</p>
          </div>
        ) : (
          <Table
            data={filteredCategories}
            columns={[
              {
                header: "Category Identity",
                accessor: (c) => (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                       <Tag size={24} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 leading-tight">{c.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{c.description || "No description provided"}</p>
                    </div>
                  </div>
                ),
              },
              {
                header: "Status",
                accessor: (c) => (
                  <Badge className={cn(
                    "font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg border-none",
                    c.is_active ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"
                  )}>
                    {c.is_active ? "Active" : "Archived"}
                  </Badge>
                ),
              },
              {
                header: "Control",
                accessor: (c) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(c)}
                      className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-slate-100"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => setCategoryToDelete(c)}
                      className="p-2.5 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
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
        title={editingCategory ? "Update Category" : "Establish New Category"}
        className="max-w-md"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl h-12">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 rounded-xl h-12 shadow-lg shadow-blue-100 font-black">
              {editingCategory ? "Sync Changes" : "Create Asset"}
            </Button>
          </div>
        }
      >
        <div className="space-y-5 py-2">
          <Input
            label="Category Name *"
            placeholder="e.g. Hot Beverages"
            className="rounded-xl h-12"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="space-y-1">
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Description</label>
             <textarea
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700"
                rows={3}
                placeholder="Optional internal notes about this group..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
             />
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDelete}
        title="Remove Category"
        description={`Confirm removal of "${categoryToDelete?.name}". This may affect item grouping in your storefront.`}
        confirmLabel="Confirm Removal"
        variant="danger"
      />
    </div>
  );
};

export default Categories;
