
import { motion } from "framer-motion";
import { ArrowRight, BarChart, Upload, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/Layout/MainLayout";

const FeatureCard = ({ icon, title, description, link, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      duration: 0.5, 
      delay: delay * 0.1, 
      ease: [0.4, 0, 0.2, 1] 
    }}
    className="rounded-xl glass-card overflow-hidden hover:border-primary/30 transition-colors duration-300"
  >
    <div className="p-6 space-y-4">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-medium">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
      <Button asChild variant="link" className="p-0 h-auto flex items-center gap-1">
        <Link to={link}>
          <span>Explore</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </Button>
    </div>
  </motion.div>
);

const Index = () => {
  const features = [
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Upload Process",
      description: "Automated data ingestion system for seamless CSV uploads to PostgreSQL database",
      link: "/upload",
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Data Dashboards",
      description: "Interactive Power BI dashboards to visualize and analyze your data efficiently",
      link: "/dashboard",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "AI Assistant",
      description: "Intelligent chatbot to help you navigate and understand your data",
      link: "/chatbot",
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-12 py-6">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
          >
            Enterprise Data Platform
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight"
          >
            Welcome to EO DATA CENTER
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            An advanced data management platform designed for enterprise analytics and insights
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden glass-card flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
          <div className="relative z-10 p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Enterprise-Grade Data Platform</h2>
            <p className="text-lg max-w-xl mx-auto mb-6">
              Seamlessly integrate, analyze, and visualize your data with our professional tools
            </p>
            <Button asChild>
              <Link to="/dashboard">
                Explore Dashboards
              </Link>
            </Button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} delay={index + 4} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
