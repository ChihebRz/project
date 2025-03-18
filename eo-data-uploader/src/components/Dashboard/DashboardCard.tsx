
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  delay?: number;
}

const DashboardCard = ({ title, children, className, delay = 0 }: DashboardCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: delay * 0.1, 
        ease: [0.4, 0, 0.2, 1] 
      }}
      className={cn(
        "glass-card rounded-xl overflow-hidden",
        className
      )}
    >
      <div className="px-5 py-3 border-b border-border flex items-center">
        <h3 className="font-medium text-sm text-foreground/90">{title}</h3>
      </div>
      <div className="p-5">
        {children}
      </div>
    </motion.div>
  );
};

export default DashboardCard;
