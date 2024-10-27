import {
  pipeline,
  env,
} from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1";

env.allowLocalModels = false;
let generator;

self.addEventListener("message", (event) => {
  const userRequest = event.data;

  if (userRequest.action === "download") {
    downloadModel(userRequest.modelName);
  } else if (userRequest.action === "chat") {
    generateResponse(userRequest.content);
  }
});

const downloadModel = async (modelName) => {
  generator = await pipeline("text-generation", modelName);
  self.postMessage({
    status: "ready",
  });
};

const generateResponse = async (content) => {
  const messages = [
    {
      role: "system",
      content: "You are a highly knowledgeable and friendly assistant.",
    },
    { role: "user", content: content },
  ];

  const textInput = generator.tokenizer.apply_chat_template(messages, {
    tokenize: false,
    add_generation_prompt: true,
  });

  const output = await generator(textInput, {
    max_new_tokens: 100,
    do_sample: true,
  });

  const conversation = output[0].generated_text;
  const start = conversation.lastIndexOf("assistant\n");
  const lastMessage = conversation.substr(start).replace("assistant\n", "");

  self.postMessage({
    result: lastMessage,
  });
};
