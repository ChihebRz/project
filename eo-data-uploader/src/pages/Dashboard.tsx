
import { useState } from "react";
import { BarChart, Database, Server, Cpu, HardDrive, Calendar, Info, Shield, Cloud, HardDrive as StorageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/Layout/MainLayout";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import StatCard from "@/components/Dashboard/StatCard";
import PowerBIEmbed from "@/components/PowerBI/PowerBIEmbed";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

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
            title="Total Records"
            value="1,284,934"
            icon={<Database className="h-5 w-5" />}
            trend={{ value: 12.5, label: "since last month", positive: true }}
            delay={1}
          />
          <StatCard
            title="Servers Monitored"
            value="128"
            icon={<Server className="h-5 w-5" />}
            trend={{ value: 4, label: "since last month", positive: true }}
            delay={2}
          />
          <StatCard
            title="Avg. CPU Usage"
            value="42%"
            icon={<Cpu className="h-5 w-5" />}
            trend={{ value: 3.2, label: "since last week", positive: false }}
            delay={3}
          />
          <StatCard
            title="Storage Used"
            value="4.7 TB"
            icon={<HardDrive className="h-5 w-5" />}
            trend={{ value: 8.3, label: "since last month", positive: true }}
            delay={4}
          />
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cpu">CPU Metrics</TabsTrigger>
            <TabsTrigger value="disk">Disk Metrics</TabsTrigger>
            <TabsTrigger value="info">System Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <PowerBIEmbed
              embedUrl="https://app.powerbi.com/reportEmbed?reportId=13ebe865-f7ed-4e02-a982-db180edc4085&autoAuth=true"
              height={600}
              title="System Overview Dashboard"
            />
          </TabsContent>
          
          <TabsContent value="cpu" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="text-center p-12 text-muted-foreground">
                  <Cpu className="w-12 h-12 mx-auto opacity-50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">CPU Dashboard</h3>
                  <p>Loading CPU metrics dashboard...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="disk" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="text-center p-12 text-muted-foreground">
                  <HardDrive className="w-12 h-12 mx-auto opacity-50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Disk Metrics Dashboard</h3>
                  <p>Loading disk metrics dashboard...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="info" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="text-center p-12 text-muted-foreground">
                  <Server className="w-12 h-12 mx-auto opacity-50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">System Info Dashboard</h3>
                  <p>Loading system information dashboard...</p>
                </div>
              </CardContent>
            </Card>
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
