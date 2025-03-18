
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Search, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = (value: string) => {
    setSearch("");
    
    // Search logic - handling navigation based on search terms
    const searchTerm = value.toLowerCase();
    
    if (searchTerm.includes("dashboard")) {
      navigate("/dashboard");
    } else if (searchTerm.includes("upload") || searchTerm.includes("process")) {
      navigate("/upload");
    } else if (searchTerm.includes("chat") || searchTerm.includes("assistant") || searchTerm.includes("ai")) {
      navigate("/chatbot");
    } else if (searchTerm.includes("home") || searchTerm.includes("main")) {
      navigate("/");
    }
    
    setOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-0 z-10 w-full transition-all duration-200 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-lg font-medium text-foreground">
            EO DATA CENTER
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-x-3 max-w-md flex-1 mx-8">
          <div 
            className="relative w-full max-w-sm cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search... (Ctrl+K)"
              className="w-full pl-9 bg-muted/50 border-muted focus-visible:bg-background focus-visible:ring-ring transition-colors duration-200 cursor-pointer"
              readOnly
            />
            <kbd className="absolute right-2.5 top-2.5 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-70">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    You have 3 unread notifications
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <DropdownMenuItem className="flex items-start py-2 px-4 cursor-pointer">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Upload Complete</p>
                    <p className="text-xs text-muted-foreground">
                      The latest data upload has been completed successfully
                    </p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start py-2 px-4 cursor-pointer">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">New Dashboard Available</p>
                    <p className="text-xs text-muted-foreground">
                      A new Power BI dashboard has been published
                    </p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start py-2 px-4 cursor-pointer">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">System Update</p>
                    <p className="text-xs text-muted-foreground">
                      The system will be updated tomorrow at 2:00 AM
                    </p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Help</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search across the platform..." 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => handleSearch("dashboard")}>
              <Search className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSearch("upload")}>
              <Search className="mr-2 h-4 w-4" />
              <span>Upload Process</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSearch("chatbot")}>
              <Search className="mr-2 h-4 w-4" />
              <span>AI Assistant</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Pages">
            <CommandItem onSelect={() => handleSearch("home")}>
              Home
            </CommandItem>
            <CommandItem onSelect={() => handleSearch("dashboard")}>
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => handleSearch("upload")}>
              Upload Process
            </CommandItem>
            <CommandItem onSelect={() => handleSearch("chatbot")}>
              AI Assistant
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </motion.header>
  );
};

export default Header;
