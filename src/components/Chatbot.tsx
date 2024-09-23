import { useState, useRef, useEffect } from "react";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getVertexAI, getGenerativeModel } from "firebase/vertexai-preview";
import { app } from "../firebase-config"; // Import the Firebase config

// Initialize App Check with ReCAPTCHA Enterprise (using the same method from your dictionary component)
initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider("6LfsWTYqAAAAAOYEWfzHrA0HuAkfWTBmNqcZV7hK"),
});

// Initialize Vertex AI (similar to how you did for the dictionary component)
const vertexAI = getVertexAI(app);
const model = getGenerativeModel(vertexAI, {
  model: "gemini-1.5-pro",
  systemInstruction:
    "You are a Japanese language teacher (who answers in English) who helps students figure out the answer to the question, and give explanation. You only answer if asked about question. Other than that you do reply generally. Keep you answers short and concise.",
});

// Cache to store previous AI responses
const aiCache: { [key: string]: string } = {};

// Helper function to extract HTML content from the div with id="forai"
const getActiveDivContent = (): string => {
  const div = document.getElementById('forai');
  return div ? div.innerText || "No relevant content found." : "No content available.";
};

const Chatbot = () => {
  const [chatHistory, setChatHistory] = useState<{ role: string; message: string }[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null); // Ref for the chat container

  // Function to fetch AI response
  const getAiResponse = async (query: string) => {
    setIsLoading(true);

    // Check if response is already cached
    if (aiCache[query]) {
      setChatHistory((prev) => [...prev, { role: "ai", message: aiCache[query] }]);
      setIsLoading(false);
      return;
    }

    try {
      // Get the content from the div with id="forai" for context
      const pageContext = getActiveDivContent();

      // Combine all previous chat history (role: user/ai) into a single string
      const previousChatMessages = chatHistory
        .map((chat) => `${chat.role === "ai" ? "AI: " : "User: "} ${chat.message}`)
        .join("\n");

      // Create a single prompt from previous history, page context, and the new query
      const combinedMessage = `
        Previous conversation:
        ${previousChatMessages}

        Context:
        ${pageContext}

        User's new question:
        ${query}
      `;

      // Send this combined message as a single prompt to the AI model
      const chat = model.startChat({
        history: [
          {
            role: "user", // Ensure correct role for the AI model
            parts: [{ text: combinedMessage }],
          },
        ],
        generationConfig: { maxOutputTokens: 500 },
      });

      // Stream the AI response
      const result = await chat.sendMessageStream(combinedMessage);
      let responseText = "";

      for await (const chunk of result.stream) {
        responseText += chunk.text();
      }

      // Cache the response and update chat history with the AI response
      aiCache[query] = responseText;
      setChatHistory((prev) => [...prev, { role: "ai", message: responseText }]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setChatHistory((prev) => [...prev, { role: "ai", message: "There was an error generating the response." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending the message
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user message to chat
    setChatHistory((prev) => [...prev, { role: "user", message: userInput }]);

    // Fetch AI response with div content context
    await getAiResponse(userInput);

    // Reset input field
    setUserInput("");
  };

  // Scroll to the bottom of the chat whenever a new message is added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="drawer drawer-end">
      <input id="chatbot-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
            <label htmlFor="chatbot-drawer" className="btn fixed bottom-5 right-5 btn-accent">
            Chat with Sensei
            </label>
        </div>

       <div className="drawer-side">
        <label htmlFor="chatbot-drawer" className="drawer-overlay"></label>
        <div className="menu bg-base-200 text-base-content h-full w-[30%] p-4">
          <div className="card bg-base-100 shadow-lg h-full">
            <div className="card-body h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-center">JapanoSensei</h2>
              <div className="overflow-y-auto flex-grow mb-4" ref={chatContainerRef}>
                {chatHistory.map((chat, index) => (
                  <div key={index} className={`chat ${chat.role === "ai" ? "chat-start" : "chat-end"}`}>
                    <div className="chat-bubble">{chat.message}</div>
                  </div>
                ))}
              </div>

              {isLoading && <div className="loading loading-spinner">Loading...</div>}

              <div className="flex items-center">
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Type your message here..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button className="btn ml-2" onClick={handleSendMessage}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
