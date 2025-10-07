import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Upload, ShoppingBag, DollarSign } from "lucide-react";
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
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [csvContent, setCsvContent] = useState("");

  const isOwner = user?.role === 'owner';

  useEffect(() => {
    loadProducts();
    if (isOwner) loadPurchases();
  }, [isOwner]);

  const loadProducts = async () => {
    const prods = await listAffiliateProducts();
    setProducts(prods);
  };

  const loadPurchases = async () => {
    const purch = await listPurchases();
    setPurchases(purch.filter(p => p.source === 'affiliate'));
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

  const handleCsvImport = async () => {
    const rows = csvContent.trim().split('\n').slice(1); // Skip header
    const purchases = rows.map(row => {
      const [externalId, productName, amount, status, userEmail] = row.split(',');
      return {
        externalId: externalId?.trim(),
        productName: productName?.trim(),
        amount: parseFloat(amount?.trim() || '0'),
        status: (status?.trim() || 'pending') as 'pending' | 'paid',
        userEmail: userEmail?.trim(),
        source: 'affiliate' as const
      };
    });

    await importAffiliatePurchases(purchases);
    setCsvContent("");
    setShowImport(false);
    loadPurchases();
    toast({
      title: "Import successful",
      description: `Imported ${purchases.length} purchase records`
    });
  };

  const togglePurchaseStatus = async (purchase: Purchase) => {
    const newStatus = purchase.status === 'paid' ? 'pending' : 'paid';
    await updatePurchaseStatus(purchase.id, newStatus);
    loadPurchases();
    toast({
      title: "Status updated",
      description: `Purchase marked as ${newStatus}`
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Store</h1>
          <p className="text-muted-foreground">Shop our recommended products and gear</p>
        </div>
        {isOwner && (
          <Dialog open={showImport} onOpenChange={setShowImport}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Import Purchases
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import CSV Purchases</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  CSV format: external_id, product_name, amount, status, user_email
                </p>
                <textarea
                  className="w-full min-h-[200px] p-3 rounded-md border bg-background"
                  placeholder="external_id,product_name,amount,status,user_email&#10;123,Protein Powder,49.99,paid,user@example.com"
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                />
                <Button onClick={handleCsvImport} className="w-full">
                  Import
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

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
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleProductClick(product)}
          >
            <img 
              src={product.imageUrl} 
              alt={product.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                <h3 className="font-semibold line-clamp-2">{product.title}</h3>
                <p className="text-sm text-muted-foreground">{product.brand}</p>
              </div>
              <div className="flex items-center justify-between pt-2">
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

      {isOwner && purchases.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <h2 className="text-2xl font-bold">Affiliate Purchases</h2>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map(purchase => (
                  <TableRow key={purchase.id}>
                    <TableCell className="text-sm">
                      {format(new Date(purchase.purchasedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{purchase.productName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {purchase.userEmail || 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">${purchase.amount}</TableCell>
                    <TableCell>
                      <Badge variant={purchase.status === 'paid' ? 'default' : 'secondary'}>
                        {purchase.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => togglePurchaseStatus(purchase)}
                      >
                        Mark as {purchase.status === 'paid' ? 'Pending' : 'Paid'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
