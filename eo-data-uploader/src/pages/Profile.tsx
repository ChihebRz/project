import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

// Use the provided direct image URL
const PROFILE_IMAGE = "https://scontent.ftun10-1.fna.fbcdn.net/v/t39.30808-6/441080066_832114805615039_2321238449026727275_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=PleBWf75ZuAQ7kNvwG9rXqo&_nc_oc=AdmrJfT6Ia4haPP0bmEQd3dHDRPvdL87BP5SKUB_EcbnrujlAH-fw7oQIXHG4PipHCnattkAbD2wTO7HQsTvlk_q&_nc_zt=23&_nc_ht=scontent.ftun10-1.fna&_nc_gid=A0-XnU0C58wldgj72qLaXg&oh=00_AfICN_uEhK2OW-Zkv3Ne92iS06mUIAIuuqIzrn3U4TiYZQ&oe=68352B86";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    code: "",
  });

  useEffect(() => {
    // Load from localStorage or use defaults
    setForm({
      username: localStorage.getItem("username") || "admin",
      password: localStorage.getItem("password") || "1234",
      code: localStorage.getItem("code") || "0000",
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("username", form.username);
    localStorage.setItem("password", form.password);
    localStorage.setItem("code", form.code);
    toast({
      title: "Profile updated!",
      description: "Your credentials have been saved.",
    });
    navigate("/home");
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-4xl p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left: Profile Form */}
          <div className="flex-1 w-full">
            <h2 className="text-4xl font-bold mb-8">Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-xs font-semibold mb-2 uppercase tracking-wide">User Name</label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="h-12 text-base"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-semibold mb-2 uppercase tracking-wide">Password</label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="h-12 text-base"
                />
              </div>
              <div>
                <label htmlFor="code" className="block text-xs font-semibold mb-2 uppercase tracking-wide">Code</label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  value={form.code}
                  onChange={handleChange}
                  required
                  className="h-12 text-base"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base font-semibold mt-4">
                Update
              </Button>
            </form>
          </div>
          {/* Right: Profile Image */}
          <div className="flex flex-col items-center justify-center w-full md:w-auto md:mt-12">
            <div className="relative">
              <img
                src={PROFILE_IMAGE}
                alt="Profile"
                className="rounded-full w-48 h-48 object-cover border-4 border-white shadow-md bg-gray-100"
              />
              <span className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md border">
                <User className="w-6 h-6 text-gray-500" />
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile; 