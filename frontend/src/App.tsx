import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import clsx from "clsx";

type ChatMessage = {
  message: string;
  role: "user" | "assistant" | "system";
};
const aiWorker = new Worker("worker.js", { type: "module" });

function App() {
  const modelName = "Xenova/Qwen1.5-0.5B-Chat";
  // Alternativ 1: Xenova/Qwen1.5-0.5B-Chat
  // Alternativ 2: Felladrin/onnx-TinyMistral-248M-Chat-v2
  // Alternativ 3: Felladrin/onnx-Pythia-31M-Chat-v1

  const sendButton = useRef<HTMLButtonElement>(null);
  const chatInput = useRef<HTMLInputElement>(null);
  const chatMessages = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addMessage = useCallback(
    (message: string, role: ChatMessage["role"]) => {
      setMessages((messages) => [...messages, { message, role }]);
    },
    [setMessages]
  );

  const chat = (message: string) => {
    aiWorker.postMessage({
      action: "chat",
      content: message,
    });
  };

  const download = (modelURL: string) => {
    setLoading(true);
    addMessage("Downloading model...", "system");

    aiWorker.postMessage({
      action: "download",
      modelURL: modelURL,
    });
  };

  useEffect(() => {
    if (chatMessages.current) {
      chatMessages.current.scrollTop = chatMessages.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const aiResponse = event.data;
      if (aiResponse.status === "ready") {
        addMessage(
          `Model ready! More information here: ${aiResponse.modelURL}`,
          "system"
        );
        setLoading(false);
      } else if (aiResponse.result) {
        addMessage(aiResponse.result, "assistant");
      }
    };

    aiWorker.addEventListener("message", handleMessage);

    return () => {
      aiWorker.removeEventListener("message", handleMessage);
    };
  }, [addMessage]);

  const sendMessage = () => {
    const question = message;

    addMessage(question, "user");
    chat(question);
    setMessage("");
  };

  return (
    <div id="container">
      <div id="chat-container">
        <div id="chat-header">
          <h2>My LLM: {modelName}</h2>
        </div>
        <button onClick={() => download(modelName)}>Download Model</button>
        <div ref={chatMessages} className="chat-messages">
          {loading && <div className="spinner"></div>}
          {messages.map((message, index) => (
            <div className={clsx(message.role, "chat-message")} key={index}>
              {message.message}
            </div>
          ))}
        </div>
        <div id="chat-input-container">
          {!loading && (
            <div>
              <input
                type="text"
                ref={chatInput}
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
              />
              <button ref={sendButton} onClick={sendMessage} disabled={loading}>
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
