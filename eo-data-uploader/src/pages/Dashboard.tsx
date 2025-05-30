import { useState, useEffect } from "react";
import { BarChart, Database, Server, Cpu, HardDrive, Calendar, Info, Shield, Cloud, HardDrive as StorageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/Layout/MainLayout";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import StatCard from "@/components/Dashboard/StatCard";
import PowerBIEmbed from "@/components/PowerBI/PowerBIEmbed";
import axios from "axios";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    total: 0,
    avgMemory: 0,
    avgCPU: 0,
    storageUsed: 0,
  });

  useEffect(() => {
    axios.get("http://localhost:5001/api/dashboard-stats").then(res => {
      setStats(res.data);
    });
  }, []);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and analyze your infrastructure performance data
          </p>
        </div>

        

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total VMS"
            value={stats.total.toLocaleString()}
            icon={<Database className="h-5 w-5" />}
            delay={1}
          />
          <StatCard
            title="Average Memory per VM"
            value={stats.avgMemory.toLocaleString() + " MB"}
            icon={<Server className="h-5 w-5" />}
            delay={2}
          />
          <StatCard
            title="Average CPU per VM"
            value={stats.avgCPU.toFixed(2)}
            icon={<Cpu className="h-5 w-5" />}
            delay={3}
          />
          <StatCard
            title="Storage Used"
            value={stats.storageUsed.toLocaleString() + " MiB"}
            icon={<HardDrive className="h-5 w-5" />}
            delay={4}
          />
        </div>

        <Tabs defaultValue="overview">
          
          <TabsContent value="overview" className="mt-6">
            <PowerBIEmbed
              embedUrl="https://app.powerbi.com/reportEmbed?reportId=13ebe865-f7ed-4e02-a982-db180edc4085&autoAuth=true"
              height={600}
              title="System Overview Dashboard"
            />
          </TabsContent>
        </Tabs>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardCard title="Recent Data Processing Activity" delay={5}>
            <div className="space-y-4">
              {[
                { 
                  date: "2023-06-08", 
                  files: 18, 
                  status: "Completed",
                  time: "10:24 AM" 
                },
                { 
                  date: "2023-06-07", 
                  files: 24, 
                  status: "Completed",
                  time: "09:12 AM" 
                },
                { 
                  date: "2023-06-06", 
                  files: 12, 
                  status: "Completed",
                  time: "11:55 AM" 
                },
                { 
                  date: "2023-06-05", 
                  files: 30, 
                  status: "Completed",
                  time: "02:18 PM" 
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-2 hover:bg-eodc-lightgray/30 rounded-md transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-md bg-eodc-blue/10 flex items-center justify-center text-eodc-blue">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">{activity.date}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Processed {activity.files} files - {activity.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
          
          <DashboardCard title="EO Data Center Services" delay={6}>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-eodc-blue/5 border border-eodc-blue/10">
                <div className="w-10 h-10 rounded-full bg-eodc-blue/10 flex items-center justify-center text-eodc-blue mb-3">
                  <Server className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-medium mb-1">Virtual Data Centers</h3>
                <p className="text-xs text-muted-foreground">Scalable and secure virtual infrastructure for business needs</p>
              </div>
              
              <div className="p-4 rounded-lg bg-eodc-blue/5 border border-eodc-blue/10">
                <div className="w-10 h-10 rounded-full bg-eodc-blue/10 flex items-center justify-center text-eodc-blue mb-3">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-medium mb-1">Cybersecurity</h3>
                <p className="text-xs text-muted-foreground">Advanced protection solutions for sensitive data</p>
              </div>
              
              <div className="p-4 rounded-lg bg-eodc-blue/5 border border-eodc-blue/10">
                <div className="w-10 h-10 rounded-full bg-eodc-blue/10 flex items-center justify-center text-eodc-blue mb-3">
                  <StorageIcon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-medium mb-1">Storage Solutions</h3>
                <p className="text-xs text-muted-foreground">Reliable data storage and backup services</p>
              </div>
              
              <div className="p-4 rounded-lg bg-eodc-blue/5 border border-eodc-blue/10">
                <div className="w-10 h-10 rounded-full bg-eodc-blue/10 flex items-center justify-center text-eodc-blue mb-3">
                  <Cloud className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-medium mb-1">Cloud Services</h3>
                <p className="text-xs text-muted-foreground">Flexible cloud solutions for business growth</p>
              </div>
            </div>
          </DashboardCard>

          <Card className="p-6 border-eodc-blue/20 bg-gradient-to-br from-white to-eodc-lightgray/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <h2 className="text-xl font-semibold text-eodc-blue mb-2">About EO Data Center</h2>
              <p className="text-sm text-gray-600 mb-4">
                Established in 2011, EO Data Center has consistently provided professional solutions 
                to meet client needs in physical and virtual hosting, cybersecurity, storage, cloud 
                services, consulting, and SaaS solutions with partner support.
              </p>
              <p className="text-sm text-gray-600">
                As a specialized provider of hosting and data management solutions, EO Data Center 
                offers powerful, secure, and scalable cloud infrastructure to meet the needs of 
                businesses of all sizes. Specializing in Virtual Data Centers (VDC), managed cloud 
                servers (VPS), backup solutions (BaaS), and housing services, EO Data Center 
                supports businesses in their digital transformation by ensuring optimal availability, 
                enhanced security, and simplified management of IT resources.
              </p>
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-md font-medium text-eodc-blue mb-2">Contact Information</h3>
                <p className="text-sm text-gray-600">EO Data Center</p>
                <p className="text-sm text-gray-600">15 Av. De Carthage, Tunis 1000</p>
                <p className="text-sm text-gray-600">Customer Relations Center: +216 53 716 633</p>
                <p className="text-sm text-gray-600">
                  <a href="https://www.eodatacenter.com/" className="text-eodc-blue hover:underline" target="_blank" rel="noopener noreferrer">
                    www.eodatacenter.com
                  </a>
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="rounded-full p-2 bg-eodc-blue/10 text-eodc-blue">
                  <Shield size={18} />
                </div>
                <div className="rounded-full p-2 bg-eodc-blue/10 text-eodc-blue">
                  <Cloud size={18} />
                </div>
                <div className="rounded-full p-2 bg-eodc-blue/10 text-eodc-blue">
                  <Server size={18} />
                </div>
                <div className="rounded-full p-2 bg-eodc-blue/10 text-eodc-blue">
                  <StorageIcon size={18} />
                </div>
              </div>
            </div>
          </div>
        </Card>

        
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
