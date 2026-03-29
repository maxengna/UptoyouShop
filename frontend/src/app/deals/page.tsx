import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Tag, TrendingUp } from "lucide-react";

export default function DealsPage() {
  const deals = [
    {
      id: 1,
      title: "Summer Sale - 50% Off",
      description: "Get amazing discounts on summer collection",
      discount: "50%",
      category: "Clothing",
      validUntil: "2024-08-31",
      image: "/api/placeholder/300/200",
      featured: true,
    },
    {
      id: 2,
      title: "Flash Sale - Electronics",
      description: "Limited time offer on gadgets and accessories",
      discount: "30%",
      category: "Electronics",
      validUntil: "2024-07-15",
      image: "/api/placeholder/300/200",
      featured: false,
    },
    {
      id: 3,
      title: "Buy 2 Get 1 Free",
      description: "Selected items - buy two get one absolutely free",
      discount: "B2G1",
      category: "Accessories",
      validUntil: "2024-07-30",
      image: "/api/placeholder/300/200",
      featured: true,
    },
    {
      id: 4,
      title: "Weekend Special",
      description: "Extra 20% off on already discounted items",
      discount: "20%",
      category: "All Categories",
      validUntil: "2024-07-14",
      image: "/api/placeholder/300/200",
      featured: false,
    },
  ];

  const featuredDeals = deals.filter((deal) => deal.featured);
  const regularDeals = deals.filter((deal) => !deal.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Hot Deals & Special Offers
            </h1>
            <p className="text-xl mb-8">Save big on your favorite products</p>
            <div className="flex justify-center space-x-4">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                Shop All Deals
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-purple-600"
              >
                View Categories
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Deals */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <TrendingUp className="h-6 w-6 text-orange-500 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Featured Deals</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDeals.map((deal) => (
              <Card
                key={deal.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-500 text-white px-3 py-1">
                      {deal.discount} OFF
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{deal.title}</CardTitle>
                    <Badge variant="secondary">{deal.category}</Badge>
                  </div>
                  <p className="text-gray-600 text-sm">{deal.description}</p>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Valid until{" "}
                      {new Date(deal.validUntil).toLocaleDateString()}
                    </div>
                  </div>
                  <Button className="w-full">Shop Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* All Deals */}
        <section>
          <div className="flex items-center mb-8">
            <Tag className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">All Deals</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regularDeals.map((deal) => (
              <Card
                key={deal.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-orange-500 text-white px-2 py-1 text-xs">
                      {deal.discount}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2">{deal.title}</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    {deal.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(deal.validUntil).toLocaleDateString()}
                    </span>
                    <Button size="sm">Shop</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Get Exclusive Deals</h2>
          <p className="mb-6">
            Subscribe to our newsletter and never miss a deal
          </p>
          <div className="flex justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-l-lg text-gray-900 focus:outline-none"
            />
            <Button className="rounded-l-none bg-white text-blue-600 hover:bg-gray-100">
              Subscribe
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
