"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { productApi, uploadApi, ApiError, Product } from "@/lib/api";

const categories = [
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
];

// Generate slug from text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Helper function to get or create category
const getOrCreateCategory = async (
  categoryName: string,
): Promise<string | null> => {
  // For now, return a simple ID - in real app this would call API
  const categoryMap: Record<string, string> = {
    Electronics: "electronics",
    Clothing: "clothing",
    "Home & Garden": "home-garden",
    Sports: "sports",
    Books: "books",
    Toys: "toys",
    Beauty: "beauty",
    Health: "health",
    Food: "food",
    Other: "other",
  };
  return categoryMap[categoryName] || null;
};

interface ProductImage {
  id: number;
  url: string;
  name: string;
  alt?: string;
  file?: File; // File object for new images
  isFromDB?: boolean; // Track if image is from database
}

interface ProductState extends Omit<Product, "id" | "createdAt" | "updatedAt"> {
  slug: string; // Add slug explicitly
}

const initialProductState: ProductState = {
  name: "",
  sku: "",
  slug: "", // Add slug field
  description: "",
  price: "",
  comparePrice: "",
  category: "",
  status: "active",
  trackInventory: true,
  stock: "",
  weight: "",
  dimensions: {
    length: "",
    width: "",
    height: "",
  },
  tags: [],
  seo: {
    title: "",
    description: "",
    keywords: "",
  },
  images: [],
};

export default function NewProductPage() {
  const router = useRouter();
  const [product, setProduct] = useState<ProductState>(initialProductState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/categories");
        const data = await response.json();

        if (data.success) {
          setCategories(data.categories);
        } else {
          // Fallback to default categories if API fails
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
        console.error("Error fetching categories:", error);
        // Fallback to default categories
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setProduct((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleDimensionChange = (dimension: string, value: string) => {
    setProduct((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value,
      },
    }));
  };

  const handleSeoChange = (field: string, value: string) => {
    setProduct((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value,
      },
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !product.tags.includes(currentTag.trim())) {
      setProduct((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProduct((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages: ProductImage[] = files.map((file) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      name: file.name,
      file,
    }));

    setProduct((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const handleFilesUpload = (files: File[]) => {
    console.log("handleFilesUpload called with files:", files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    // Create preview images with file objects
    const newImages: ProductImage[] = imageFiles.map((file) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file), // Local preview URL
      name: file.name,
      file: file, // Store file object for later upload
      isFromDB: false, // Mark as new image
    }));

    console.log("Created preview images:", newImages);
    setProduct((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const removeImage = (imageId: number) => {
    const imageToRemove = product.images.find((img) => img.id === imageId);

    // Cleanup object URL if it's a preview
    if (imageToRemove?.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!product.name.trim()) {
      newErrors.name = "Please enter product name";
    }
    if (!product.sku.trim()) {
      newErrors.sku = "Please enter product SKU";
    }
    if (!product.price || parseFloat(product.price) <= 0) {
      newErrors.price = "Please enter a valid price";
    }
    if (!product.category) {
      newErrors.category = "Please select a category";
    }
    if (
      product.trackInventory &&
      (!product.stock || parseInt(product.stock) < 0)
    ) {
      newErrors.stock = "Please enter a valid stock quantity";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create product first without images
      const productData: Record<string, any> = {
        name: product.name,
        sku: product.sku,
        slug: product.slug || generateSlug(product.name),
        price: String(product.price), // Convert to string for backend
        stock: product.trackInventory ? product.stock : 0,
        isActive: product.status === "active",
        tags: product.tags,
        category: product.category, // Add category as string
      };

      // Only add optional fields if they have values
      if (product.description) productData.description = product.description;
      if (product.comparePrice)
        productData.originalPrice = String(product.comparePrice); // Convert to string
      if (product.weight) productData.weight = String(product.weight); // Convert to string
      if (product.seo?.title) productData.seoTitle = product.seo.title;
      if (product.seo?.description)
        productData.seoDescription = product.seo.description;

      // Add dimensions if present (convert to strings)
      if (
        product.dimensions?.length &&
        product.dimensions?.width &&
        product.dimensions?.height
      ) {
        productData.dimensions = {
          length: String(product.dimensions.length), // Convert to string
          width: String(product.dimensions.width), // Convert to string
          height: String(product.dimensions.height), // Convert to string
        };
      }

      console.log("Final productData:", productData);

      // Create product first
      const response = await productApi.create(productData as any);
      console.log("Response:", response.data.product?.id);
      if (!response.success) {
        throw new Error(response.message || "Failed to create product");
      }

      const createdProduct = response.data.product;
      console.log("Product created successfully:", createdProduct);
      console.log("Product ID:", createdProduct?.id);

      if (!createdProduct || !createdProduct.id) {
        throw new Error("Product was created but no ID was returned");
      }

      // Only upload images if product creation succeeded
      if (product.images.length > 0) {
        console.log(
          "Starting to upload images after successful product creation",
        );
        const uploadedImages = await Promise.all(
          product.images.map(async (img: ProductImage, index) => {
            console.log("Processing image:", img.name, "has file:", !!img.file);
            if (img.file && !img.isFromDB) {
              // New image that needs upload
              try {
                console.log("Uploading file:", img.file.name);
                const result = await uploadApi.uploadFile(img.file);

                if (result.success) {
                  console.log("Upload successful for:", img.file.name);
                  return {
                    url: `http://localhost:5000${result.data.url}`, // Real URL from server
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
              // Existing image from database (shouldn't happen in new product)
              return {
                url: img.url,
                alt: img.alt || `${product.name} - Image ${index + 1}`,
                sortOrder: index,
                isMain: index === 0,
              };
            }
          }),
        );

        console.log("Uploaded images:", uploadedImages);

        // Update product with images
        if (uploadedImages && uploadedImages.length > 0) {
          const updateData = {
            images: uploadedImages, // Send images array
          };

          const updateResponse = await productApi.update(
            String(createdProduct.id),
            updateData,
          );
          if (!updateResponse.success) {
            console.error(
              "Failed to update product with images:",
              updateResponse.message,
            );
            // Don't throw error - product was created successfully
          }
        }
      }

      // Cleanup object URLs after successful save
      product.images.forEach((img) => {
        if (img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });

      router.push("/products");
    } catch (error) {
      console.error("Error creating product:", error);

      // Handle API errors
      if (error instanceof ApiError) {
        if (error.status === 400 && error.data?.errors) {
          // Handle validation errors from API
          const apiErrors: Record<string, string> = {};
          error.data.errors.forEach((err: any) => {
            apiErrors[err.path?.[0] || "general"] = err.message;
          });
          setErrors(apiErrors);
        } else {
          setErrors({ general: error.message || "Failed to create product" });
        }
      } else {
        setErrors({ general: "An unexpected error occurred" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);

    try {
      // Prepare product data for API as draft
      const productData = {
        ...product,
        price: product.price,
        stock: product.trackInventory ? product.stock : "0",
        status: "draft" as const,
      };

      // Call API to create draft product
      const response = await productApi.create(productData);

      if (response.success) {
        console.log("Draft saved successfully:", response.data.product);
        router.push("/products");
      } else {
        throw new Error(response.message || "Failed to save draft");
      }
    } catch (error) {
      console.error("Error saving draft:", error);

      // Handle API errors
      if (error instanceof ApiError) {
        setErrors({ general: error.message || "Failed to save draft" });
      } else {
        setErrors({
          general: "An unexpected error occurred while saving draft",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (previewMode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setPreviewMode(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับไปแก้ไข
            </Button>
            <h1 className="text-2xl font-bold">ตัวอย่างสินค้า</h1>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Images */}
              <div>
                {product.images.length > 0 ? (
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={product.images[0].url}
                      alt={product.name || "ตัวอย่างสินค้า"}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}

                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {product.images.slice(1, 5).map((image) => (
                      <div
                        key={image.id}
                        className="aspect-square relative rounded overflow-hidden bg-muted"
                      >
                        <Image
                          src={image.url}
                          alt={product.name || "ตัวอย่างสินค้า"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div>
                <div className="mb-4">
                  <Badge
                    variant={
                      product.status === "active" ? "default" : "secondary"
                    }
                  >
                    {product.status === "active"
                      ? "Active"
                      : product.status === "draft"
                        ? "Draft"
                        : "Archived"}
                  </Badge>
                </div>

                <h2 className="text-3xl font-bold mb-2">
                  {product.name || "Product Name"}
                </h2>

                <p className="text-lg text-muted-foreground mb-4">
                  Product SKU: {product.sku || "Not specified"}
                </p>

                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-bold">
                    {product.price
                      ? `฿${parseFloat(product.price).toFixed(2)}`
                      : "฿0.00"}
                  </span>
                  {product.comparePrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      ฿{parseFloat(product.comparePrice).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Details</h3>
                  <p className="text-muted-foreground">
                    {product.description || "No description"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="font-semibold mb-1">Category</h3>
                    <p className="text-muted-foreground">
                      {product.category || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Stock</h3>
                    <p className="text-muted-foreground">
                      {product.trackInventory
                        ? `${product.stock || 0} pieces`
                        : "Not tracked"}
                    </p>
                  </div>
                </div>

                {product.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold">Add New Product</h1>
                <p className="text-sm text-muted-foreground">
                  Create a new product for your store
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(true)}
                disabled={!product.name}
              >
                <Eye className="h-4 w-4 mr-2" />
                ดูตัวอย่าง
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Product"}
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
                          handleInputChange("price", e.target.value)
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
                        value={product.category}
                        onChange={(e) =>
                          handleInputChange("category", e.target.value)
                        }
                        disabled={isLoadingCategories}
                        className={`w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                          errors.category ? "border-red-500" : ""
                        } ${isLoadingCategories ? "bg-gray-100" : ""}`}
                      >
                        <option value="">
                          {isLoadingCategories
                            ? "Loading categories..."
                            : "Select a category"}
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
                          handleInputChange("stock", e.target.value)
                        }
                        placeholder="0"
                        className={errors.stock ? "border-red-500" : ""}
                        disabled={!product.trackInventory}
                      />
                      {errors.stock && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.stock}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mt-6">
                      <input
                        type="checkbox"
                        id="trackInventory"
                        checked={product.trackInventory}
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
                      value={product.description}
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
                        value={product.weight}
                        onChange={(e) =>
                          handleInputChange("weight", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        value={product.status}
                        onChange={(e) =>
                          handleInputChange("status", e.target.value)
                        }
                        className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
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
                          value={product.dimensions?.length || ""}
                          onChange={(e) =>
                            setProduct((prev) => ({
                              ...prev,
                              dimensions: {
                                ...prev.dimensions,
                                length: e.target.value,
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
                          value={product.dimensions?.width || ""}
                          onChange={(e) =>
                            setProduct((prev) => ({
                              ...prev,
                              dimensions: {
                                ...prev.dimensions,
                                width: e.target.value,
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
                          value={product.dimensions?.height || ""}
                          onChange={(e) =>
                            setProduct((prev) => ({
                              ...prev,
                              dimensions: {
                                ...prev.dimensions,
                                height: e.target.value,
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
                          if (e.key === "Enter" && currentTag.trim()) {
                            e.preventDefault();
                            setProduct((prev) => ({
                              ...prev,
                              tags: [...prev.tags, currentTag.trim()],
                            }));
                            setCurrentTag("");
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (currentTag.trim()) {
                            setProduct((prev) => ({
                              ...prev,
                              tags: [...prev.tags, currentTag.trim()],
                            }));
                            setCurrentTag("");
                          }
                        }}
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
                            onClick={() => {
                              setProduct((prev) => ({
                                ...prev,
                                tags: prev.tags.filter((t) => t !== tag),
                              }));
                            }}
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
                                ...prev,
                                tags: [...prev.tags, suggestion],
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
                      <li>• Keep tags short and descriptive</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Error Messages */}
              {Object.keys(errors).length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-red-800 mb-2">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-semibold">
                        Please fix the following errors:
                      </span>
                    </div>
                    <ul className="space-y-1 text-sm text-red-700">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field}>• {error}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              {/* Product Images - Drag & Drop Upload */}
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
                        {isDragging
                          ? "Drop files here"
                          : "Drag & drop images here"}
                      </p>
                      <p className="text-xs text-gray-500">
                        or click to browse files
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Supports: JPG, PNG, WebP (Max 5MB each)
                      </p>
                    </label>
                  </div>

                  {/* Image Preview Grid */}
                  {product.images.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Uploaded Images ({product.images.length})
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {product.images.map((image, index) => (
                          <div
                            key={image.id}
                            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                          >
                            <Image
                              src={image.url}
                              alt={`Product image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            {/* Main image badge */}
                            {index === 0 && (
                              <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                                Main
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        First image will be the main product image
                      </p>
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
                      value={product.seo?.title || ""}
                      onChange={(e) => handleSeoChange("title", e.target.value)}
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
                            product.seo.title.length > 60
                              ? "text-red-500"
                              : "text-green-500"
                          }
                        >
                          {product.seo?.title?.length || 0}/60
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-colors ${
                            product.seo.title.length > 60
                              ? "bg-red-500"
                              : product.seo?.title?.length || 0 > 50
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min((product.seo.title.length / 60) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="seoDescription">SEO Description</Label>
                    <Textarea
                      id="seoDescription"
                      value={product.seo?.description || ""}
                      onChange={(e) =>
                        handleSeoChange("description", e.target.value)
                      }
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
                            product.seo.description.length > 160
                              ? "text-red-500"
                              : "text-green-500"
                          }
                        >
                          {product.seo.description.length}/160
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-colors ${
                            product.seo.description.length > 160
                              ? "bg-red-500"
                              : product.seo.description.length > 150
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min((product.seo.description.length / 160) * 100, 100)}%`,
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
                        {product.seo.title || product.name || "Product Title"}
                      </div>
                      <div className="text-green-800 text-sm truncate">
                        www.yourstore.com/products/
                        {product.sku || "product-sku"}
                      </div>
                      <div className="text-gray-600 text-sm line-clamp-2">
                        {product.seo.description ||
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
