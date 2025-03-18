import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Check, FileText, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

const UploadProcess = () => {
  const [refreshRate, setRefreshRate] = useState(15);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [basePath] = useState("C:\\Users\\rezgu\\OneDrive\\Desktop\\Donnees_EODC"); // Chemin fixe

  const handleUpload = async () => {
    setUploading(true);
    setProgress(0);
    setUploadedFiles([]);

    try {
      toast.info("Upload process started", {
        description: "Scanning directory and uploading files to the database.",
      });

      // Appel API pour lancer le scan et l'upload côté backend
      const response = await fetch("http://localhost:5000/upload-directory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ directory: basePath }), // Envoie le chemin au backend
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const result = await response.json();
      const uploaded = result.uploadedFiles || [];

      let simulatedProgress = 0;
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploading(false);
            setUploadedFiles(uploaded);
            toast.success("Upload completed successfully", {
              description: "All files have been processed and uploaded.",
            });
            return 100;
          }
          simulatedProgress += Math.random() * 10 + 5;
          return Math.min(simulatedProgress, 100);
        });
      }, refreshRate * 100);
    } catch (error) {
      setUploading(false);
      setProgress(0);
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : "An error occurred during upload.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-eodc-green shadow-md">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-eodc-darkgreen">Upload Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Configure the settings for the automatic upload process
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Select defaultValue="csv">
                <SelectTrigger className="w-full sm:w-40 border-eodc-green">
                  <SelectValue placeholder="File Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV Files</SelectItem>
                  <SelectItem value="excel">Excel Files</SelectItem>
                  <SelectItem value="txt">Text Files</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-2 bg-eodc-green hover:bg-eodc-darkgreen"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Start Upload
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-eodc-darkgreen">
                  Refresh Rate: {refreshRate} seconds
                </label>
              </div>
              <Slider
                value={[refreshRate]}
                min={5}
                max={60}
                step={1}
                onValueChange={(value) => setRefreshRate(value[0])}
                className="text-eodc-green"
              />
              <p className="text-xs text-muted-foreground">
                Adjust how frequently the system checks for new files
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-eodc-darkgreen">Base Directory</label>
              <Input
                value={basePath}
                className="border-eodc-green bg-muted/50 text-sm truncate"
                readOnly
              />
            </div>
          </div>

          {uploading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-eodc-darkgreen">Upload Progress</span>
                <span className="text-sm">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-eodc-lightgray [&>div]:bg-eodc-green" />
            </motion.div>
          )}
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-eodc-green shadow-md">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-medium text-eodc-darkgreen">Uploaded Files</h3>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <motion.div
                    key={file}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-eodc-lightgreen/20 transition-colors"
                  >
                    <div className="flex-shrink-0 rounded-md p-2 bg-eodc-green/10">
                      <FileText className="h-4 w-4 text-eodc-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file}</p>
                      <p className="text-xs text-muted-foreground">Uploaded successfully</p>
                    </div>
                    <div className="rounded-full bg-eodc-lightgreen/30 text-eodc-darkgreen p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default UploadProcess;