import MainLayout from "@/components/Layout/MainLayout";
import ChatbotPlaceholder from "@/components/Chatbot/ChatbotPlaceholder";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

const Chatbot = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI SQL Assistant</h1>
          <p className="text-muted-foreground">
            Ask questions in natural language, and this assistant will generate and run SQL queries on your EO Data Center database.
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
                  This assistant uses Mistral to convert your questions into SQL queries, executes them on your PostgreSQL database, and returns results — instantly.
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
