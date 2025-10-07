import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ShoppingBag } from "lucide-react";
import { FEATURES } from "@/lib/features";
import { 
  listAffiliateProducts, 
  recordAffiliateClick, 
  listPurchases,
  importAffiliatePurchases,
  updatePurchaseStatus 
} from "@/lib/mock/api-extended";
import type { AffiliateProduct, Purchase } from "@/lib/mock/types";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { format } from "date-fns";

export default function Store() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<AffiliateProduct[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const prods = await listAffiliateProducts();
    setProducts(prods);
  };

  const handleProductClick = async (product: AffiliateProduct) => {
    if (user) {
      await recordAffiliateClick({
        productId: product.id,
        userId: user.id,
        utmSource: 'app'
      });
    }
    window.open(product.url, '_blank');
    toast({
      title: "Opening product",
      description: "Redirecting to affiliate store..."
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store</h1>
          <p className="text-muted-foreground">Shop our recommended products and gear</p>
        </div>
      </div>

      {!user?.isMember && (
        <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Unlock Exclusive Discounts</h3>
            <p className="text-muted-foreground">
              Members get special pricing on all store items. Upgrade your membership for access.
            </p>
            <Button className="gap-2">
              Upgrade via Whop
            </Button>
          </div>
        </Card>
      )}

      {products.length === 0 && (
        <EmptyState
          icon={ShoppingBag}
          title="No products available"
          description="Check back soon for our curated product selection"
        />
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map(product => (
          <Card 
            key={product.id} 
            className="overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:scale-105"
            onClick={() => handleProductClick(product)}
          >
            <div className="relative">
              <img 
                src={product.imageUrl} 
                alt={product.title}
                className="w-full h-48 object-cover"
              />
              {user?.isMember && (
                <Badge className="absolute top-2 right-2 bg-purple-500">
                  Member Price
                </Badge>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                <h3 className="font-semibold line-clamp-2">{product.title}</h3>
                <p className="text-sm text-muted-foreground">{product.brand}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-lg font-bold">${product.price}</span>
                <Button size="sm" variant="outline" className="gap-2">
                  Shop
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
