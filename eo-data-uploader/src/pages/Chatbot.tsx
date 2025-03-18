import MainLayout from "@/components/Layout/MainLayout";
import ChatbotPlaceholder from "@/components/Chatbot/ChatbotPlaceholder";
import { Card, CardContent } from "@/components/ui/card";
import { Info, MessageSquare } from "lucide-react";

const Chatbot = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">
            Interact with your data and get insights through a conversational interface
          </p>
        </div>
        
        <Card className="bg-gradient-to-br from-white to-eodc-lightgray/30 border-eodc-blue/20 p-4 mb-6">
          <CardContent className="p-2">
            <div className="flex gap-4 items-start">
              <div className="bg-eodc-blue/10 p-2 rounded-full">
                <Info className="h-5 w-5 text-eodc-blue" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-eodc-blue mb-1">EO Data Center AI Assistant</h3>
                <p className="text-sm text-gray-600">
                  This AI assistant, powered by Mistral, helps you navigate EO Data Center's services and data. 
                  Ask about server performance, data uploads, storage usage, and more for quick, accurate insights.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <ChatbotPlaceholder />
      </div>
    </MainLayout>
  );
};

export default Chatbot;