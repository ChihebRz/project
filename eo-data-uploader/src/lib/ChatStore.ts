const CHAT_KEY = "chatbot_conversations";

export const saveChatToHistory = (id: string, messages: any[]) => {
  const history = getChatHistory();
  history[id] = messages;
  localStorage.setItem(CHAT_KEY, JSON.stringify(history));
};

export const getChatHistory = (): Record<string, any[]> => {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(CHAT_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const getChatTitles = (): string[] => {
  return Object.keys(getChatHistory());
};

export const getChatById = (id: string): any[] => {
  return getChatHistory()[id] || [];
};

export const deleteChatById = (id: string) => {
  const history = getChatHistory();
  delete history[id];
  localStorage.setItem(CHAT_KEY, JSON.stringify(history));
};
