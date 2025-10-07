import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPICard } from "@/components/KPICard";
import { Button } from "@/components/ui/button";
import { Instagram, Youtube, DollarSign, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Growth() {
  const handleManageSocial = (platform: string) => {
    toast({ title: `Manage ${platform}`, description: "Social media scheduler coming soon!" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Growth & Social</h1>
        <p className="text-muted-foreground mt-1">
          Track your social reach, ads performance, and partnership opportunities.
        </p>
      </div>

      {/* Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Social Reach"
          value="12.4K"
          subtitle="Last 30 days"
          icon={Instagram}
          trend={{ value: 18, positive: true }}
        />
        <KPICard
          title="Clicks → Booked"
          value="8.2%"
          subtitle="Conversion rate"
          icon={Users}
          trend={{ value: 2.4, positive: true }}
        />
        <KPICard
          title="Ad ROAS"
          value="3.2x"
          subtitle="Return on ad spend"
          icon={DollarSign}
          trend={{ value: 12, positive: true }}
        />
        <KPICard
          title="Partner Clicks"
          value="847"
          subtitle="Cross-promos"
          icon={Users}
          trend={{ value: 24, positive: true }}
        />
      </div>

      <Tabs defaultValue="social" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="mt-6">
          <div className="space-y-6">
            <div className="metric-card">
              <h3 className="text-lg font-semibold mb-4">Social Automation</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <div>
                      <p className="font-medium">Instagram</p>
                      <p className="text-sm text-muted-foreground">3 posts queued</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleManageSocial("Instagram")}>Manage</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <Youtube className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">TikTok</p>
                      <p className="text-sm text-muted-foreground">5 posts queued</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleManageSocial("TikTok")}>Manage</Button>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <h3 className="text-lg font-semibold mb-4">Recent Performance</h3>
              <div className="space-y-3">
                {[
                  { platform: "Instagram", post: "Morning workout tips", reach: "2.4K", clicks: 84 },
                  { platform: "TikTok", post: "Client transformation", reach: "8.1K", clicks: 156 },
                  { platform: "Instagram", post: "Nutrition guide", reach: "1.8K", clicks: 62 },
                ].map((post, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div>
                      <p className="font-medium">{post.post}</p>
                      <p className="text-sm text-muted-foreground">{post.platform}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{post.reach} reach</p>
                      <p className="text-xs text-muted-foreground">{post.clicks} clicks</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ads" className="mt-6">
          <div className="metric-card">
            <h3 className="text-lg font-semibold mb-4">Active Campaigns</h3>
            <div className="space-y-4">
              {[
                { name: "New Client Special", spend: "$280", clicks: 142, booked: 8 },
                { name: "Summer Bootcamp", spend: "$420", clicks: 218, booked: 12 },
              ].map((campaign, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-secondary/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{campaign.name}</h4>
                    <span className="text-sm text-muted-foreground">Spend: {campaign.spend}</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">{campaign.clicks} clicks</span>
                    <span className="text-primary font-medium">{campaign.booked} booked</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="partners" className="mt-6">
          <div className="metric-card">
            <h3 className="text-lg font-semibold mb-4">Cross-Promotion Partners</h3>
            <div className="space-y-4">
              {[
                { name: "Yoga Studio Downtown", clicks: 284, booked: 5 },
                { name: "Nutrition Coach Maria", clicks: 156, booked: 3 },
                { name: "Sports Massage Therapy", clicks: 94, booked: 2 },
              ].map((partner, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                >
                  <div>
                    <p className="font-medium">{partner.name}</p>
                    <p className="text-sm text-muted-foreground">{partner.clicks} clicks</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-medium">{partner.booked} booked</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
