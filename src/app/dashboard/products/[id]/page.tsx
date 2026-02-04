"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, X, Image as ImageIcon, Package, DollarSign, Tag, Hash, Eye, CheckCircle2, Menu } from "lucide-react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RoleGuard } from "@/components/RoleGuard";
import { useNotification } from "@/context/NotificationContext";
import { cn } from "@/utils/cn";
import type { Product, Category } from "@/types";

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const isEditing = params.id && params.id !== "new";
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    cost: 0,
    category_id: "",
    image_url: "",
    sku: "",
    status: "published" as 'draft' | 'published' | 'out_of_stock',
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchCategories = async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setImageLoading(true);
      const product = await api.products.getOne(params.id as string);
      if (product) {
        setFormData({
          name: product.name,
          description: product.description || "",
          price: product.price,
          cost: (product as any).cost || 0,
          category_id: product.category_id,
          image_url: product.image_url || "",
          sku: (product as any).sku || "",
          status: (product as any).status || "published",
          is_active: product.is_active
        });
        setImageLoading(!!product.image_url);
      }
    } catch (error) {
      showNotification("Failed to load product", "error");
      router.push("/dashboard/products");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotification("Please upload an image file", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification("Image size should be less than 5MB", "error");
      return;
    }

    setUploading(true);
    setImageLoading(true);
    try {
      const result = await api.upload.uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: result.data.url }));
      showNotification("Image uploaded successfully", "success");
    } catch (error) {
      showNotification("Failed to upload image", "error");
      setImageLoading(false);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image_url: "" }));
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showNotification("Product name is required", "error");
      return;
    }
    if (!formData.category_id) {
      showNotification("Please select a category", "error");
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await api.products.update(params.id as string, formData);
        showNotification("Product updated successfully", "success");
      } else {
        await api.products.create(formData);
        showNotification("Product created successfully", "success");
      }
      router.push("/dashboard/products");
    } catch (error) {
      showNotification("Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <div className="min-h-screen bg-slate-50">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard/products")}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="font-bold text-slate-900">
                {isEditing ? "Edit Product" : "New Product"}
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/dashboard/products")}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {isEditing ? "Edit Product" : "New Product"}
                  </h1>
                  <p className="text-sm text-slate-500">
                    {isEditing ? "Update product details" : "Add a new product"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/products")}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-[#e60023] hover:bg-[#ad081b] shadow-lg shadow-red-200 disabled:opacity-50"
                >
                  {saving ? "Saving..." : isEditing ? "Save Changes" : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 lg:px-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 z-50 bg-black/50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar - Mobile Slide-in, Desktop Fixed */}
            <div className={cn(
              "fixed lg:sticky lg:top-24 z-50 lg:z-auto",
              "w-80 lg:w-full max-w-xs lg:max-w-none",
              "h-screen lg:h-auto overflow-y-auto lg:overflow-visible",
              "bg-white lg:bg-transparent",
              "p-6 lg:p-0",
              "transition-transform duration-300 ease-in-out",
              sidebarOpen ? "left-0" : "-left-full lg:left-0",
              "lg:col-span-4 xl:col-span-3"
            )}>
              <div className="lg:hidden flex justify-between items-center mb-6">
                <h2 className="font-bold text-slate-900">Settings</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 lg:space-y-6">
                {/* Image Upload Card */}
                <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200 shadow-sm p-5 lg:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 lg:w-10 lg:h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <ImageIcon className="text-orange-600" size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Product Image</h3>
                      <p className="text-xs text-slate-500">Upload a photo</p>
                    </div>
                  </div>

                  {formData.image_url ? (
                    <div className="relative group">
                      {imageLoading && (
                        <div className="absolute inset-0 bg-slate-100 rounded-2xl flex items-center justify-center z-10">
                          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      <img
                        src={formData.image_url}
                        alt="Product"
                        className={cn(
                          "w-full h-48 object-cover rounded-2xl transition-opacity",
                          imageLoading ? "opacity-0" : "opacity-100"
                        )}
                        onLoad={() => setImageLoading(false)}
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 bg-white rounded-xl hover:bg-slate-100 transition-colors"
                        >
                          <Upload size={16} className="text-slate-600" />
                        </button>
                        <button
                          onClick={removeImage}
                          className="p-2 bg-white rounded-xl hover:bg-red-50 transition-colors"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer",
                        dragActive
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm text-slate-500">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Upload className="text-slate-400" size={24} />
                          </div>
                          <p className="text-sm font-medium text-slate-700 mb-1">
                            Drop image here
                          </p>
                          <p className="text-xs text-slate-500">
                            or tap to browse (max 5MB)
                          </p>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200 shadow-sm p-5 lg:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 lg:w-10 lg:h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Eye className="text-teal-600" size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Status</h3>
                      <p className="text-xs text-slate-500">Visibility</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'out_of_stock' })}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                      className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                        formData.is_active ? "bg-green-100" : "bg-slate-200"
                      )}>
                        <CheckCircle2 className={cn(
                          "size-5",
                          formData.is_active ? "text-green-600" : "text-slate-400"
                        )} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-slate-700">Active</p>
                        <p className="text-xs text-slate-500">Product visible</p>
                      </div>
                      <div className={cn(
                        "w-10 h-6 rounded-full transition-colors relative",
                        formData.is_active ? "bg-green-500" : "bg-slate-300"
                      )}>
                        <span
                          className={cn(
                            "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                            formData.is_active ? "translate-x-5" : "translate-x-0.5"
                          )}
                        />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="lg:hidden grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/products")}
                    className="rounded-xl py-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl py-3 bg-[#e60023] hover:bg-[#ad081b]"
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-4 lg:space-y-6">
              {/* Basic Info Card */}
              <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200 shadow-sm p-5 lg:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="text-blue-600" size={18} />
                  </div>
                  <div>
                    <h2 className="font-semibold lg:font-bold text-slate-900">Basic Information</h2>
                    <p className="text-xs text-slate-500 hidden lg:block">Core product details</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Product Name"
                    placeholder="e.g. Classic Burger"
                    className="rounded-xl"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    <textarea
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px] lg:min-h-[120px] resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your product..."
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Card */}
              <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200 shadow-sm p-5 lg:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="text-green-600" size={18} />
                  </div>
                  <div>
                    <h2 className="font-semibold lg:font-bold text-slate-900">Pricing</h2>
                    <p className="text-xs text-slate-500 hidden lg:block">Set your prices</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                      label="Selling Price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="rounded-xl pl-11"
                      value={formData.price || ""}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                      label="Cost Price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="rounded-xl pl-11"
                      value={formData.cost || ""}
                      onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* Category Card */}
              <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200 shadow-sm p-5 lg:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Tag className="text-amber-600" size={18} />
                  </div>
                  <div>
                    <h2 className="font-semibold lg:font-bold text-slate-900">Category</h2>
                    <p className="text-xs text-slate-500 hidden lg:block">Organize your product</p>
                  </div>
                </div>

                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Inventory Card */}
              <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200 shadow-sm p-5 lg:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Hash className="text-purple-600" size={18} />
                  </div>
                  <div>
                    <h2 className="font-semibold lg:font-bold text-slate-900">Inventory</h2>
                    <p className="text-xs text-slate-500 hidden lg:block">SKU and tracking</p>
                  </div>
                </div>

                <Input
                  label="SKU (Stock Keeping Unit)"
                  placeholder="e.g. BURGER-001"
                  className="rounded-xl"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
