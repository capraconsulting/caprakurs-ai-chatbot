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
  const [loadResponse, setLoadResponse] = useState(false);

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
    setLoadResponse(true);
    aiWorker.postMessage({
      action: "chat",
      content: message,
    });
  };

  const download = (modelURL: string) => {
    setLoading(true);

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
        setLoadResponse(false);
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
    <div
      id="container"
      className="flex flex-row justify-center items-center w-full h-full"
    >
      <div id="chat-container">
        <div>
          <div id="chat-header">
            <h2 className="text-2xl">My LLM</h2>
          </div>
          <button
            className="h-10 flex justify-center items-center"
            onClick={() => download(modelName)}
          >
            Load {modelName}
          </button>
        </div>
        <div ref={chatMessages} className="chat-messages">
          {loading && <div className="spinner"></div>}
          {messages.map((message, index) => (
            <div className={clsx(message.role, "chat-message")} key={index}>
              {message.message}
            </div>
          ))}
        </div>
        {loadResponse && (
          <div className="loading">
            Waiting for LLM response...<div className="spinner"></div>
          </div>
        )}
        <div id="chat-input-container">
          {!loading && (
            <div className="w-full p-10 flex flex-row justify-center">
              <input
                className="w-full"
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
