"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Package, UtensilsCrossed, ShoppingCart } from "lucide-react";
import { api } from "../../utils/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { ConfirmationDialog } from "../../components/ui/ConfirmationDialog";
import { useNotification } from "../../context/NotificationContext";
import type { Item, ItemType, MenuCategory } from "../../types";

const Items = () => {
  const { showNotification } = useNotification();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<ItemType | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  // Form state
  const [formItemName, setFormItemName] = useState("");
  const [formItemType, setFormItemType] = useState<ItemType>("ingredient");
  const [formCategory, setFormCategory] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formDefaultPrice, setFormDefaultPrice] = useState(0);
  const [formDescription, setFormDescription] = useState("");

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await api.items.getAll();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      showNotification("Failed to load items", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || item.item_type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: ItemType) => {
    switch (type) {
      case "menu_item":
        return <ShoppingCart size={14} />;
      case "inventory":
        return <Package size={14} />;
      case "ingredient":
        return <UtensilsCrossed size={14} />;
      default:
        return <Package size={14} />;
    }
  };

  const getTypeColor = (type: ItemType) => {
    switch (type) {
      case "menu_item":
        return "bg-blue-100 text-blue-700";
      case "inventory":
        return "bg-green-100 text-green-700";
      case "ingredient":
        return "bg-orange-100 text-[#ad081b]";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleSave = async () => {
    if (!formItemName.trim()) {
      showNotification("Please enter an item name", "error");
      return;
    }

    try {
      const itemData = {
        item_name: formItemName,
        item_type: formItemType,
        category: formCategory,
        unit: formUnit,
        default_price: formDefaultPrice,
        description: formDescription,
        is_active: true,
      };

      if (editingItem) {
        await api.items.update(editingItem.id, itemData);
        showNotification("Item updated successfully");
      } else {
        await api.items.create(itemData);
        showNotification("Item created successfully");
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchItems();
    } catch (error) {
      showNotification("Failed to save item", "error");
    }
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await api.items.delete(itemToDelete.id);
        showNotification("Item deleted successfully", "warning");
        fetchItems();
      } catch (error) {
        showNotification("Failed to delete item", "error");
      } finally {
        setItemToDelete(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search items..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023]"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ItemType | "all")}
          >
            <option value="all">All Types</option>
            <option value="menu_item">Menu Items</option>
            <option value="inventory">Inventory Items</option>
            <option value="ingredient">Ingredients</option>
            <option value="product">Products</option>
            <option value="packaging">Packaging</option>
          </select>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingItem(null);
            setFormItemName("");
            setFormItemType("ingredient");
            setFormCategory("");
            setFormUnit("");
            setFormDefaultPrice(0);
            setFormDescription("");
            setIsModalOpen(true);
          }}
        >
          <Plus size={20} /> Add Item
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading items...</div>
      ) : (
        <Table
          data={filteredItems}
          columns={[
            {
              header: "Item Name",
              accessor: (item) => <span className="font-bold text-gray-900">{item.item_name}</span>,
            },
            {
              header: "Type",
              accessor: (item) => (
                <Badge className={`flex items-center gap-1 w-fit ${getTypeColor(item.item_type)}`}>
                  {getTypeIcon(item.item_type)}
                  <span className="capitalize">{item.item_type.replace("_", " ")}</span>
                </Badge>
              ),
            },
            { header: "Category", accessor: (item) => item.category || "N/A" },
            { header: "Unit", accessor: (item) => item.unit || "N/A" },
            { header: "Default Price", accessor: (item) => `ETB ${item.default_price?.toFixed(2) || "0.00"}` },
            {
              header: "Status",
              accessor: (item) => (
                <Badge variant={item.is_active ? "success" : "neutral"}>{item.is_active ? "Active" : "Inactive"}</Badge>
              ),
            },
            {
              header: "Actions",
              accessor: (item) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingItem(item);
                      setFormItemName(item.item_name);
                      setFormItemType(item.item_type);
                      setFormCategory(item.category || "");
                      setFormUnit(item.unit || "");
                      setFormDefaultPrice(item.default_price || 0);
                      setFormDescription(item.description || "");
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setItemToDelete(item)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? "Edit Item" : "Add New Item"}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingItem(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>{editingItem ? "Save Changes" : "Create Item"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Item Name *" placeholder="e.g. Tomato Sauce" value={formItemName} onChange={(e) => setFormItemName(e.target.value)} />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023]"
              value={formItemType}
              onChange={(e) => setFormItemType(e.target.value as ItemType)}
            >
              <option value="menu_item">Menu Item</option>
              <option value="inventory">Inventory Item</option>
              <option value="ingredient">Ingredient</option>
              <option value="product">Product</option>
              <option value="packaging">Packaging</option>
            </select>
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023]"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Unit" placeholder="e.g. kg, liters, pieces" value={formUnit} onChange={(e) => setFormUnit(e.target.value)} />
            <Input label="Default Price" type="number" step="0.01" placeholder="0.00" value={formDefaultPrice || ""} onChange={(e) => setFormDefaultPrice(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023] min-h-[80px]"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Optional description..."
            />
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Item"
        description={`Are you sure you want to delete "${itemToDelete?.item_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Items;
