
import MainLayout from "@/components/Layout/MainLayout";
import UploadProcess from "@/components/Upload/UploadProcess";

const Upload = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Process</h1>
          <p className="text-muted-foreground">
            Configure and manage the automatic CSV data upload pipeline
          </p>
        </div>
        
        <UploadProcess />
      </div>
    </MainLayout>
  );
};

export default Upload;
