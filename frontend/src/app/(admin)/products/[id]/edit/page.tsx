"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  X,
  Plus,
  AlertCircle,
  Package,
  DollarSign,
  Box,
  Tag,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { productApi } from "@/lib/api";

interface ProductImage {
  id: number;
  url: string;
  name: string;
  file?: File;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  sku: string;
  stock: number;
  category: Category;
  categoryId: string;
  isActive: boolean;
  isNew: boolean;
  isOnSale: boolean;
  tags: string[];
  images: ProductImage[];
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTag, setCurrentTag] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/products/${productId}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        if (data.success) {
          setProduct(data.data);
        } else {
          throw new Error(data.message || "Product not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/categories");
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories);
        } else {
          setCategories([
            "Electronics",
            "Clothing",
            "Home & Garden",
            "Sports",
            "Books",
            "Toys",
            "Beauty",
            "Health",
            "Food",
            "Other",
          ]);
        }
      } catch (error) {
        setCategories([
          "Electronics",
          "Clothing",
          "Home & Garden",
          "Sports",
          "Books",
          "Toys",
          "Beauty",
          "Health",
          "Food",
          "Other",
        ]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (
    field: keyof Product,
    value: string | number | boolean,
  ) => {
    if (!product) return;
    setProduct((prev) => ({
      ...prev!,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addTag = () => {
    if (
      currentTag.trim() &&
      product &&
      !product.tags.includes(currentTag.trim())
    ) {
      setProduct((prev) => ({
        ...prev!,
        tags: [...prev!.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (!product) return;
    setProduct((prev) => ({
      ...prev!,
      tags: prev!.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleFilesUpload = (files: File[]) => {
    if (!product) return;
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const newImages: ProductImage[] = imageFiles.map((file) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      name: file.name,
      file,
    }));

    setProduct((prev) => ({
      ...prev!,
      images: [...prev!.images, ...newImages],
    }));
  };

  const removeImage = (imageId: number) => {
    if (!product) return;
    setProduct((prev) => ({
      ...prev!,
      images: prev!.images.filter((img) => img.id !== imageId),
    }));
  };

  const validateForm = () => {
    if (!product) return false;
    const newErrors: Record<string, string> = {};

    if (!product.name.trim()) {
      newErrors.name = "Please enter product name";
    }
    if (!product.sku.trim()) {
      newErrors.sku = "Please enter product SKU";
    }
    if (!product.price || product.price <= 0) {
      newErrors.price = "Please enter a valid price";
    }
    if (!product.categoryId) {
      newErrors.category = "Please select a category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!validateForm()) return;

    setSaving(true);
    try {
      // Map product data to API format
      const productData = {
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: product.price.toString(),
        comparePrice: product.originalPrice?.toString(),
        stock: product.stock.toString(),
        category: product.category?.name || product.categoryId || "",
        status: product.isActive ? ("active" as const) : ("draft" as const),
        trackInventory: true,
        tags: product.tags,
        weight: product.weight?.toString(),
        dimensions: product.dimensions
          ? {
              length: product.dimensions.length?.toString(),
              width: product.dimensions.width?.toString(),
              height: product.dimensions.height?.toString(),
            }
          : undefined,
        seo: {
          title: product.seoTitle,
          description: product.seoDescription,
        },
        images: product.images,
      };
      console.log(productId);
      const result = await productApi.update(parseInt(productId), productData);

      if (result.success) {
        router.push("/products");
      } else {
        setError(result.message || "Failed to update product");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || "Product not found"}</p>
          <Button asChild className="mt-4">
            <Link href="/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const productStatus =
    product.stock === 0
      ? "out-of-stock"
      : !product.isActive
        ? "draft"
        : "active";
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "out-of-stock":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/products">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Edit Product</h1>
                <p className="text-sm text-muted-foreground">
                  Editing: {product.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block px-3 py-1 text-xs rounded-full ${getStatusColor(productStatus)}`}
              >
                {productStatus.replace("-", " ")}
              </span>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={product.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter product name"
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="sku">Product SKU *</Label>
                      <Input
                        id="sku"
                        value={product.sku}
                        onChange={(e) =>
                          handleInputChange("sku", e.target.value)
                        }
                        placeholder="Enter product SKU"
                        className={errors.sku ? "border-red-500" : ""}
                      />
                      {errors.sku && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.sku}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={product.price}
                        onChange={(e) =>
                          handleInputChange("price", parseFloat(e.target.value))
                        }
                        placeholder="0.00"
                        className={errors.price ? "border-red-500" : ""}
                      />
                      {errors.price && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <select
                        id="category"
                        value={product.category?.name || ""}
                        onChange={(e) =>
                          handleInputChange("categoryId", e.target.value)
                        }
                        disabled={isLoadingCategories}
                        className={`w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                          errors.category ? "border-red-500" : ""
                        } ${isLoadingCategories ? "bg-gray-100" : ""}`}
                      >
                        <option value="">
                          {isLoadingCategories
                            ? "Loading..."
                            : "Select category"}
                        </option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.category}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={product.stock}
                        onChange={(e) =>
                          handleInputChange("stock", parseInt(e.target.value))
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="flex items-center space-x-2 mt-6">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={product.isActive}
                        onChange={(e) =>
                          handleInputChange("isActive", e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="isActive" className="text-sm">
                        Product is active
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={product.description || ""}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Enter product description"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      disabled={!currentTag.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer hover:bg-red-100 transition-colors"
                          onClick={() => removeTag(tag)}
                        >
                          {tag}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              {/* Product Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Product Images
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Drag & Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(false);
                      const files = Array.from(e.dataTransfer.files);
                      handleFilesUpload(files);
                    }}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                      isDragging
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        handleFilesUpload(files);
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer block"
                    >
                      <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {isDragging ? "Drop files here" : "Drag & drop images"}
                      </p>
                      <p className="text-xs text-gray-500">
                        or click to browse
                      </p>
                    </label>
                  </div>

                  {/* Image Preview Grid */}
                  {product.images.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Images ({product.images.length})
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {product.images.map((image, index) => (
                          <div
                            key={image.id}
                            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                          >
                            <Image
                              src={image.url}
                              alt={`Product ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            {index === 0 && (
                              <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                                Main
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    SEO Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seoTitle">SEO Title</Label>
                    <Input
                      id="seoTitle"
                      value={product.seoTitle || ""}
                      onChange={(e) =>
                        handleInputChange("seoTitle", e.target.value)
                      }
                      placeholder="SEO title"
                      maxLength={60}
                    />
                  </div>
                  <div>
                    <Label htmlFor="seoDescription">SEO Description</Label>
                    <Textarea
                      id="seoDescription"
                      value={product.seoDescription || ""}
                      onChange={(e) =>
                        handleInputChange("seoDescription", e.target.value)
                      }
                      placeholder="SEO description"
                      rows={4}
                      maxLength={160}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
