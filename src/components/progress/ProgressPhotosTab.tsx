import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useGamification } from "@/hooks/useGamification";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ProgressPhoto = {
  id: string;
  date: string;
  url: string;
  angle: "front" | "side" | "back";
};

export function ProgressPhotosTab() {
  const { grantXP } = useGamification();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([
    { id: "1", date: "2025-10-01", url: "/placeholder.svg", angle: "front" },
    { id: "2", date: "2025-10-01", url: "/placeholder.svg", angle: "side" },
    { id: "3", date: "2025-09-01", url: "/placeholder.svg", angle: "front" },
    { id: "4", date: "2025-09-01", url: "/placeholder.svg", angle: "side" },
    { id: "5", date: "2025-08-01", url: "/placeholder.svg", angle: "front" },
    { id: "6", date: "2025-08-01", url: "/placeholder.svg", angle: "side" },
  ]);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleUpload = async () => {
    await grantXP(40, "Progress Photo Uploaded");
    toast({
      title: "Upload Photo",
      description: "Photo upload functionality will be implemented",
    });
  };

  const handleDelete = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Photo Deleted",
      description: "Progress photo has been removed",
    });
    setDeleteId(null);
  };

  const groupedPhotos = photos.reduce((acc, photo) => {
    if (!acc[photo.date]) {
      acc[photo.date] = [];
    }
    acc[photo.date].push(photo);
    return acc;
  }, {} as Record<string, ProgressPhoto[]>);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Progress Photos</h3>
            <p className="text-sm text-muted-foreground">Upload photos to track visual changes</p>
          </div>
          <Button onClick={handleUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Photos
          </Button>
        </div>

        <div className="grid gap-2 p-4 bg-muted/30 rounded-lg text-sm">
          <p className="font-medium">Tips for best results:</p>
          <ul className="space-y-1 text-muted-foreground ml-4">
            <li>• Take photos in the same lighting conditions</li>
            <li>• Use the same background and distance from camera</li>
            <li>• Take front, side, and back angles</li>
            <li>• Wear similar fitted clothing</li>
          </ul>
        </div>
      </Card>

      {Object.keys(groupedPhotos).length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-12">
            <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No progress photos yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Start documenting your fitness journey with progress photos
            </p>
            <Button onClick={handleUpload}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First Photos
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPhotos).map(([date, datePhotos]) => (
            <Card key={date} className="p-6">
              <h3 className="text-lg font-semibold mb-4">{date}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {datePhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                      <img
                        src={photo.url}
                        alt={`Progress photo - ${photo.angle}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDeleteId(photo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 capitalize text-center">
                      {photo.angle}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Progress Photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this progress photo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
