import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css'
import clsx from 'clsx';

type ChatMessage = {
  message: string;
  role: "user" | "assistant" | "system";
}

function App() {
  const sendButton = useRef<HTMLButtonElement>(null);
  const chatInput = useRef<HTMLInputElement>(null);
  const chatMessages = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);



  const addMessage = useCallback((message: string, role: ChatMessage["role"]) => {
    setMessages(messages => [...messages, { message, role }]);
  }, [setMessages]);

  const chat = (text: string) => {
    setTimeout(() => {
      addMessage("Hello world", "assistant");
    }, 1000);
  };


  const download = useCallback((modelURL: string) => {
    setLoading(true);
    setTimeout(() => {
      addMessage(
        'Downloading model...',
        "system"
      );
    }, 1000);

    setTimeout(() => {
      addMessage(
        `Model ready!`,
        "system"
      );
      setLoading(false);
    }, 2000);

  }, [setLoading, addMessage]);


  useEffect(() => {
    if (chatMessages.current) {
      chatMessages.current.scrollTop = chatMessages.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {

    const question = message;

    addMessage(question, "user");
    chat(question);
    setMessage("");
  };

  useEffect(() => {
    download("HF_USER/HF_MODEL");
  }, [])


  return (
    <div id="container">
      <div id="chat-container">
        <div id="chat-header">
          <h2>My first LLM</h2>
        </div>
        <div ref={chatMessages} className="chat-messages">
          {loading && <div id="downloading-message">Downloading model...</div>}
          {messages.map(message => <div className={clsx(message.role, "chat-message")}>{message.message}</div>)}

        </div>
        <div id="chat-input-container">
          <input type="text" ref={chatInput} value={message} onChange={(event) => {
            setMessage(event.target.value);
          }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                sendMessage();
              }
            }} placeholder="Type your message..." />
          <button ref={sendButton} onClick={sendMessage} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  )
}

export default App
