
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PowerBIEmbedProps {
  embedUrl: string;
  height?: number | string;
  title?: string;
}

const PowerBIEmbed = ({ embedUrl, height = 600, title = "Power BI Dashboard" }: PowerBIEmbedProps) => {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const handleLoad = () => {
      setLoading(false);
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener("load", handleLoad);
    }

    return () => {
      clearTimeout(timer);
      if (iframe) {
        iframe.removeEventListener("load", handleLoad);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="overflow-hidden border-border/50">
        <CardContent className="p-0 relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-card">
              <div className="space-y-3 w-full max-w-md px-8">
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-5/6 mx-auto" />
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            title={title}
            width="100%"
            height={height}
            src={embedUrl}
            frameBorder="0"
            allowFullScreen
            className="transition-opacity duration-300"
            style={{ opacity: loading ? 0.3 : 1 }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PowerBIEmbed;
