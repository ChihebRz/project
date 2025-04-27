import { getChatTitles } from "@/lib/ChatStore";
import { useState, useEffect } from "react";

type Props = {
  onSelect: (id: string) => void;
};

const ChatHistory = ({ onSelect }: Props) => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(getChatTitles());
  }, []);

  return (
    <div className="bg-zinc-900 text-white rounded-lg shadow-md p-2 w-60">
      {history.length === 0 && <p className="text-xs text-muted">No history yet.</p>}
      {history.map((id) => (
        <div
          key={id}
          onClick={() => onSelect(id)}
          className="cursor-pointer px-3 py-2 hover:bg-zinc-700 rounded-md text-sm"
        >
          {id}
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
