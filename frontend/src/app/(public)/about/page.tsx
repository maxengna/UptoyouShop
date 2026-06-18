import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Award, Heart, Globe, Zap } from "lucide-react";

export default function AboutPage() {
  const stats = [
    { label: "Happy Customers", value: "50K+", icon: Users },
    { label: "Products Available", value: "10K+", icon: Target },
    { label: "Years in Business", value: "5+", icon: Award },
    { label: "Countries Served", value: "25+", icon: Globe },
  ];

  const values = [
    {
      title: "Customer First",
      description: "We put our customers at the heart of everything we do",
      icon: Heart,
      color: "text-red-500",
    },
    {
      title: "Quality Products",
      description:
        "Curated selection of high-quality products from trusted brands",
      icon: Award,
      color: "text-blue-500",
    },
    {
      title: "Fast Delivery",
      description:
        "Quick and reliable delivery to get your products when you need them",
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      title: "Global Reach",
      description: "Serving customers worldwide with localized experiences",
      icon: Globe,
      color: "text-green-500",
    },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      description: "Visionary leader with 15+ years in e-commerce",
      image: "/placeholder/200/200",
    },
    {
      name: "Mike Chen",
      role: "CTO",
      description: "Tech expert focused on innovative shopping experiences",
      image: "/placeholder/200/200",
    },
    {
      name: "Emily Davis",
      role: "Head of Marketing",
      description: "Creative mind behind our brand and campaigns",
      image: "/placeholder/200/200",
    },
    {
      name: "Alex Thompson",
      role: "Customer Success Lead",
      description: "Ensuring every customer has an amazing experience",
      image: "/placeholder/200/200",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">About UpToYouShop</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Your trusted online shopping destination for quality products,
              great prices, and exceptional service since 2019.
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="/contact"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </a>
              <a
                href="/deals"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                View Deals
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Story</h2>
          <div className="prose prose-lg text-gray-600 mx-auto">
            <p className="mb-6">
              UpToYouShop started with a simple mission: to make online shopping
              easier, more enjoyable, and more accessible for everyone. What
              began as a small startup in 2019 has grown into a trusted
              marketplace serving thousands of customers worldwide.
            </p>
            <p className="mb-6">
              We believe that shopping should be a delightful experience, not a
              chore. That's why we've carefully curated our product selection,
              streamlined our checkout process, and built a customer service
              team that's always ready to help.
            </p>
            <p>
              Today, we're proud to be your go-to destination for quality
              products at great prices, with a commitment to excellence that
              drives everything we do.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${value.color} bg-opacity-10`}
                    >
                      <Icon className={`h-6 w-6 ${value.color}`} />
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto"
                    />
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <Badge variant="secondary">{member.role}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Journey</h2>
          <p className="text-xl mb-8">
            Be part of our growing community and enjoy exclusive deals, early
            access, and personalized recommendations.
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="/auth/signup"
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Sign Up Now
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
