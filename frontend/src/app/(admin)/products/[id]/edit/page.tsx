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
import { productApi, uploadApi } from "@/lib/api";

interface ProductImage {
  id: number;
  url: string;
  name: string;
  alt?: string; // Add alt property
  file?: File; // File object for new images
  isFromDB?: boolean; // Track if image is from database
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
  comparePrice?: number;
  sku: string;
  stock: number;
  category: Category;
  categoryId: string;
  isActive: boolean;
  status?: "active" | "draft" | "archived";
  isNew: boolean;
  isOnSale: boolean;
  trackInventory?: boolean;
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
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
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
          // Mark existing images as from database
          const productWithImageFlags = {
            ...data.data,
            images:
              data.data.images?.map((img: any) => ({
                ...img,
                isFromDB: true, // Mark as existing image
              })) || [],
          };
          setProduct(productWithImageFlags);
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
    field: string,
    value: string | number | boolean | undefined,
  ) => {
    if (!product) return;
    setProduct((prev) => ({
      ...prev!,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSeoChange = (field: string, value: string) => {
    if (!product) return;
    setProduct((prev) => ({
      ...prev!,
      seo: {
        ...prev!.seo,
        [field]: value,
      },
    }));
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

  const handleFilesUpload = async (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    // Create preview images with file objects
    const newImages: ProductImage[] = imageFiles.map((file) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file), // Local preview URL
      name: file.name,
      file: file, // Store file object for later upload
      isFromDB: false, // Mark as new image
    }));

    setProduct((prev) => ({
      ...prev!,
      images: [...prev!.images, ...newImages],
    }));
  };

  const removeImage = (imageId: number) => {
    if (!product) return;

    const imageToRemove = product.images.find((img) => img.id === imageId);

    // Cleanup object URL if it's a preview
    if (imageToRemove?.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove.url);
    }

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
      // Upload new images first
      const uploadedImages = await Promise.all(
        product.images.map(async (img, index) => {
          if (img.file && !img.isFromDB) {
            // New image that needs upload
            try {
              const result = await uploadApi.uploadFile(img.file);

              if (result.success) {
                return {
                  id: img.id,
                  url: `http://localhost:5000${result.data.url}`, // Real URL from server
                  name: img.name,
                  alt: `${product.name} - Image ${index + 1}`,
                  sortOrder: index,
                  isMain: index === 0,
                };
              } else {
                throw new Error(
                  `Upload failed: ${(result as any).error || "Unknown error"}`,
                );
              }
            } catch (error) {
              console.error("Upload error:", error);
              throw new Error(
                `Failed to upload ${img.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
              );
            }
          } else {
            // Existing image from database
            return {
              id: img.id,
              url: img.url,
              name: img.name,
              alt: img.alt || `${product.name} - Image ${index + 1}`,
              sortOrder: index,
              isMain: index === 0,
            };
          }
        }),
      );

      // Map product data to API format (numbers for backend)
      const productData: Record<string, any> = {
        name: product.name,
        sku: product.sku,
        slug: product.slug,
        price: Number(product.price), // Convert to number
        stock: product.stock,
        isActive: product.isActive,
        tags: product.tags,
      };

      // Only add optional fields if they have values
      if (product.description) productData.description = product.description;
      if (product.originalPrice !== undefined && product.originalPrice !== null)
        productData.originalPrice = Number(product.originalPrice);
      if (product.category?.id) productData.categoryId = product.category.id; // Use categoryId
      if (product.isNew !== undefined) productData.isNew = product.isNew;
      if (product.isOnSale !== undefined)
        productData.isOnSale = product.isOnSale;
      if (product.weight !== undefined && product.weight !== null)
        productData.weight = Number(product.weight);
      if (product.seoTitle) productData.seoTitle = product.seoTitle; // Separate field
      if (product.seoDescription)
        productData.seoDescription = product.seoDescription; // Separate field

      // Add uploaded images if they exist
      if (uploadedImages && uploadedImages.length > 0) {
        productData.images = uploadedImages.map((img) => ({
          url: img.url,
          alt: img.alt,
          sortOrder: img.sortOrder,
          isMain: img.isMain,
        }));
      }

      // Only include dimensions if all values are present (including 0)
      if (
        product.dimensions &&
        product.dimensions.length !== undefined &&
        product.dimensions.width !== undefined &&
        product.dimensions.height !== undefined
      ) {
        productData.dimensions = {
          length: Number(product.dimensions.length),
          width: Number(product.dimensions.width),
          height: Number(product.dimensions.height),
        };
      }

      console.log("Final productData:", productData);
      console.log("Uploaded images:", uploadedImages);

      const result = await productApi.update(productId, productData);

      if (result.success) {
        // Cleanup object URLs after successful save
        product.images.forEach((img) => {
          if (img.url.startsWith("blob:")) {
            URL.revokeObjectURL(img.url);
          }
        });

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
                      <Label htmlFor="originalPrice">
                        Original Price (Compare Price)
                      </Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={product.originalPrice || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "originalPrice",
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Status *</Label>
                      <select
                        id="status"
                        value={
                          product.status ||
                          (product.isActive ? "active" : "draft")
                        }
                        onChange={(e) =>
                          handleInputChange("status", e.target.value)
                        }
                        className={`w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors.status ? "border-red-500" : ""}`}
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                      {errors.status && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.status}
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
                        disabled={product.trackInventory === false}
                      />
                    </div>

                    <div className="flex items-center space-x-2 mt-6">
                      <input
                        type="checkbox"
                        id="trackInventory"
                        checked={product.trackInventory !== false}
                        onChange={(e) =>
                          handleInputChange("trackInventory", e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="trackInventory" className="text-sm">
                        Track inventory
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

                  <div>
                    <Label htmlFor="seoKeywords">SEO Keywords</Label>
                    <Input
                      id="seoKeywords"
                      value={product.seo?.keywords || ""}
                      onChange={(e) =>
                        handleSeoChange("keywords", e.target.value)
                      }
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping & Dimensions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Box className="h-5 w-5" />
                    Shipping & Dimensions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        min="0"
                        value={product.weight || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "weight",
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">
                      Dimensions (cm)
                    </Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <Label htmlFor="length" className="text-sm">
                          Length
                        </Label>
                        <Input
                          id="length"
                          type="number"
                          step="0.01"
                          min="0"
                          value={product.dimensions?.length || ""}
                          onChange={(e) =>
                            setProduct((prev) => ({
                              ...prev!,
                              dimensions: {
                                ...prev!.dimensions,
                                length: e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined,
                              },
                            }))
                          }
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="width" className="text-sm">
                          Width
                        </Label>
                        <Input
                          id="width"
                          type="number"
                          step="0.01"
                          min="0"
                          value={product.dimensions?.width || ""}
                          onChange={(e) =>
                            setProduct((prev) => ({
                              ...prev!,
                              dimensions: {
                                ...prev!.dimensions,
                                width: e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined,
                              },
                            }))
                          }
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="height" className="text-sm">
                          Height
                        </Label>
                        <Input
                          id="height"
                          type="number"
                          step="0.01"
                          min="0"
                          value={product.dimensions?.height || ""}
                          onChange={(e) =>
                            setProduct((prev) => ({
                              ...prev!,
                              dimensions: {
                                ...prev!.dimensions,
                                height: e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined,
                              },
                            }))
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>
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
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">
                      Add Product Tags
                    </Label>
                    <p className="text-sm text-gray-500 mb-4">
                      Add tags to help customers find your product easily
                    </p>
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
                  </div>

                  {product.tags.length > 0 && (
                    <div>
                      <Label className="text-base font-medium">
                        Current Tags
                      </Label>
                      <p className="text-sm text-gray-500 mb-3">
                        Click on a tag to remove it
                      </p>
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
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Label className="text-base font-medium">
                      Popular Tags
                    </Label>
                    <p className="text-sm text-gray-500 mb-3">
                      Quick add commonly used tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "New",
                        "Best Seller",
                        "Sale",
                        "Limited Edition",
                        "Eco-Friendly",
                        "Premium",
                      ].map((suggestion) => (
                        <Badge
                          key={suggestion}
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => {
                            if (!product.tags.includes(suggestion)) {
                              setProduct((prev) => ({
                                ...prev!,
                                tags: [...prev!.tags, suggestion],
                              }));
                            }
                          }}
                        >
                          + {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">
                      Tag Tips
                    </h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>
                        • Use specific keywords customers might search for
                      </li>
                      <li>• Include brand, material, or style information</li>
                      <li>• Add seasonal or occasion-based tags</li>
                    </ul>
                  </div>
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

                            {/* Upload status indicator */}
                            {image.file && !image.isFromDB && (
                              <div className="absolute top-1 right-1 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                                Pending Upload
                              </div>
                            )}

                            {!image.file && image.isFromDB && (
                              <div className="absolute top-1 right-1 bg-green-500 text-white px-2 py-1 rounded text-xs">
                                Uploaded
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className="absolute top-1 left-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                <CardContent className="space-y-8">
                  <div>
                    <Label htmlFor="seoTitle">SEO Title</Label>
                    <Input
                      id="seoTitle"
                      value={product.seo?.title || product.seoTitle || ""}
                      onChange={(e) => {
                        handleInputChange("seoTitle", e.target.value);
                        handleSeoChange("title", e.target.value);
                      }}
                      placeholder="Product SEO title"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 50-60 characters
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Character count:</span>
                        <span
                          className={
                            (product.seo?.title || product.seoTitle || "")
                              .length > 60
                              ? "text-red-500"
                              : "text-green-500"
                          }
                        >
                          {
                            (product.seo?.title || product.seoTitle || "")
                              .length
                          }
                          /60
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-colors ${
                            (product.seo?.title || product.seoTitle || "")
                              .length > 60
                              ? "bg-red-500"
                              : (product.seo?.title || product.seoTitle || "")
                                    .length > 50
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(((product.seo?.title || product.seoTitle || "").length / 60) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="seoDescription">SEO Description</Label>
                    <Textarea
                      id="seoDescription"
                      value={
                        product.seo?.description || product.seoDescription || ""
                      }
                      onChange={(e) => {
                        handleInputChange("seoDescription", e.target.value);
                        handleSeoChange("description", e.target.value);
                      }}
                      placeholder="SEO description"
                      rows={6}
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 150-160 characters
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Character count:</span>
                        <span
                          className={
                            (
                              product.seo?.description ||
                              product.seoDescription ||
                              ""
                            ).length > 160
                              ? "text-red-500"
                              : "text-green-500"
                          }
                        >
                          {
                            (
                              product.seo?.description ||
                              product.seoDescription ||
                              ""
                            ).length
                          }
                          /160
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-colors ${
                            (
                              product.seo?.description ||
                              product.seoDescription ||
                              ""
                            ).length > 160
                              ? "bg-red-500"
                              : (
                                    product.seo?.description ||
                                    product.seoDescription ||
                                    ""
                                  ).length > 150
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(((product.seo?.description || product.seoDescription || "").length / 160) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="seoKeywords">SEO Keywords</Label>
                    <Input
                      id="seoKeywords"
                      value={product.seo?.keywords || ""}
                      onChange={(e) =>
                        handleSeoChange("keywords", e.target.value)
                      }
                      placeholder="keyword1, keyword2, keyword3"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate keywords with commas
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">SEO Preview</h4>
                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                      <div className="text-blue-800 text-lg font-medium truncate">
                        {product.seo?.title ||
                          product.seoTitle ||
                          product.name ||
                          "Product Title"}
                      </div>
                      <div className="text-green-800 text-sm truncate">
                        www.yourstore.com/products/
                        {product?.sku || "product-sku"}
                      </div>
                      <div className="text-gray-600 text-sm line-clamp-2">
                        {product.seo?.description ||
                          product.seoDescription ||
                          product.description ||
                          "Product description will appear here..."}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">
                      SEO Best Practices
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-green-50 p-3 rounded-md">
                        <h5 className="text-xs font-medium text-green-800 mb-1">
                          ✓ Title Optimization
                        </h5>
                        <p className="text-xs text-green-700">
                          Include main keywords at the beginning
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <h5 className="text-xs font-medium text-blue-800 mb-1">
                          ✓ Description Quality
                        </h5>
                        <p className="text-xs text-blue-700">
                          Write compelling, unique descriptions
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-md">
                        <h5 className="text-xs font-medium text-purple-800 mb-1">
                          ✓ Keyword Strategy
                        </h5>
                        <p className="text-xs text-purple-700">
                          Use 5-8 relevant keywords per product
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-amber-800 mb-2">
                      💡 Pro Tips
                    </h4>
                    <ul className="text-xs text-amber-700 space-y-1">
                      <li>• Use action words like "Buy", "Shop", "Order"</li>
                      <li>• Include brand name for recognition</li>
                      <li>• Add location if targeting local customers</li>
                      <li>
                        • Use numbers and special characters strategically
                      </li>
                      <li>• Avoid keyword stuffing and duplicate content</li>
                    </ul>
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
