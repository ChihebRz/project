import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Upload,
  MessageSquare,
  Home,
  Cpu,
  TrendingUp // ✅ Icon for Forecast
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const sidebarVariants = {
  open: {
    width: "240px",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30
    }
  },
  closed: {
    width: "72px",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30
    }
  }
};

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/upload", label: "Upload Process", icon: Upload },
    { path: "/chatbot", label: "AI Assistant", icon: MessageSquare },
    { path: "/cluster", label: "Cluster", icon: Cpu },
    { path: "/forecast", label: "Forecast", icon: TrendingUp } // ✅ Added Forecast page
  ];

  return (
    <motion.aside
      variants={sidebarVariants}
      initial={isOpen ? "open" : "closed"}
      animate={isOpen ? "open" : "closed"}
      className="relative h-screen bg-sidebar border-r border-border flex flex-col z-20"
    >
      <div className="absolute -right-4 top-6">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-background border border-border text-foreground hover:bg-muted transition-colors duration-200"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <div className="p-4 flex items-center justify-center">
        <motion.div
          initial={false}
          animate={{ opacity: isOpen ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex items-center",
            isOpen ? "justify-start" : "justify-center"
          )}
        >
          <div className="bg-gradient-to-r from-eodc-darkgreen to-eodc-lightgreen h-10 w-10 rounded-md flex items-center justify-center">
            <span className="text-white font-bold">EO</span>
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="ml-3 text-sidebar-foreground font-medium"
            >
              DATA CENTER
            </motion.div>
          )}
        </motion.div>
      </div>

      <nav className="mt-6 flex-1">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded-md transition-colors duration-200",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )
                  }
                >
                  <Icon className="h-5 w-5" />
                  {isOpen && (
                    <AnimatePresence>
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="ml-3 whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    </AnimatePresence>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 flex items-center">
        {isOpen ? (
          <div className="text-xs text-sidebar-foreground/60 italic">
            EO DATA CENTER v1.0
          </div>
        ) : (
          <div className="w-full flex justify-center text-xs text-sidebar-foreground/60 italic">
            v1
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
