import { useCallback, useEffect, useRef, useState } from 'react';

type ChatMessage = {
  message: string;
  role: 'user' | 'assistant' | 'system';
};
const aiWorker = new Worker('worker.js', { type: 'module' });

const MODEL_NAME = 'Xenova/Qwen1.5-0.5B-Chat';
// Alternativ 1: Xenova/Qwen1.5-0.5B-Chat
// Alternativ 2: Felladrin/onnx-TinyMistral-248M-Chat-v2
// Alternativ 3: Felladrin/onnx-Pythia-31M-Chat-v1

export default function App() {
  const chatMessages = useRef<HTMLDivElement>(null);
  const [modelStatus, setModelStatus] = useState<'initial' | 'loading' | 'ready'>('initial');
  const [chatStatus, setChatStatus] = useState<'loading' | 'ready'>('ready');

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const appendMessage = useCallback(
    (message: string, role: ChatMessage['role']) => {
      setMessages((messages) => [...messages, { message, role }]);
    },
    [setMessages]
  );

  const downloadModel = useCallback(() => {
    setModelStatus('loading');
    aiWorker.postMessage({
      action: 'download',
      modelName: MODEL_NAME,
    });
  }, [setModelStatus]);

  const sendMessage = useCallback(() => {
    setChatStatus('loading');
    appendMessage(message, 'user');
    aiWorker.postMessage({
      action: 'chat',
      content: message,
    });
    setMessage('');
  }, [message, appendMessage, setMessage]);

  useEffect(() => {
    if (chatMessages.current) {
      chatMessages.current.scrollTop = chatMessages.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const aiResponse = event.data;
      if (aiResponse.status === 'ready') {
        setModelStatus('ready');
      } else if (aiResponse.result) {
        appendMessage(aiResponse.result, 'assistant');
        setChatStatus('ready');
      }
    };
    aiWorker.addEventListener('message', handleMessage);
    return () => {
      aiWorker.removeEventListener('message', handleMessage);
    };
  }, [appendMessage]);

  return (
    <div className="flex w-screen h-screen justify-center items-center bg-[#333]">
      <div className="flex w-[1000px] max-w-full h-[80%] flex-col bg-white p-4 border-3 border-gray-600 overflow-y-scroll">
        <div className="flex flex-row justify-center">
          <h2 className="text-2xl">AWS AI Workshop: {MODEL_NAME}</h2>
        </div>
        {modelStatus === 'initial' && (
          <div className="flex flex-col justify-center items-center grow">
            <button className="text-white bg-[#ff5c00] text-xl px-4 py-2" onClick={downloadModel}>
              Download model
            </button>
          </div>
        )}
        {modelStatus === 'loading' && (
          <div className="flex flex-col justify-center items-center grow">
            <div className="spinner"></div>
          </div>
        )}
        {modelStatus === 'ready' && (
          <>
            {messages.length === 0 && (
              <div className="flex flex-col justify-center items-center text-[#666] font-mono text-center grow">
                Start chatting with {MODEL_NAME}!
              </div>
            )}
            {messages.length > 0 && (
              <div
                ref={chatMessages}
                className="w-full flex flex-col items-center justify-center h-[50vh] overflow-y-auto grow"
              >
                {messages.map((message, index) => (
                  <div
                    className={`chat-message ${
                      message.role === 'user'
                        ? 'bg-[#faebd7] self-end'
                        : message.role === 'assistant'
                        ? 'bg-[#f9cd93] self-start'
                        : ''
                    } w-[80%] p-4 mb-4 break-words`}
                    key={index}
                  >
                    {message.message}
                  </div>
                ))}
              </div>
            )}
            <div className="flex w-full p-10 flex-row justify-center">
              <input
                className="w-full p-4 text-base border border-[#ff5c00] mr-4"
                type="text"
                value={message}
                disabled={chatStatus === 'loading'}
                onChange={(event) => {
                  setMessage(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
              />
              <div className="flex flex-col items-center justify-center h-full w-16">
                {chatStatus === 'loading' ? (
                  <div className="spinner"></div>
                ) : (
                  <button
                    onClick={sendMessage}
                    className="text-white text-base border border-[#ff5c00] h-full w-full bg-[#ff5c00] cursor-pointer"
                  >
                    Send
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
