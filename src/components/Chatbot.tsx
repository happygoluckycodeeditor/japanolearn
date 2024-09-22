import { useState } from "react";
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
  model: "gemini-1.5-flash",
  systemInstruction:
    "You are a Japanese teacher who will help the student figure out the answer to the question, and also, if they ask for an explanation, you give them the explanation. Additionally, you will provide further study resources.",
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
      const combinedMessage = `${query}\n\nContext:\n${pageContext}`;

      // Initialize the chat with user's query and div content combined
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: combinedMessage }],
          },
        ],
        generationConfig: { maxOutputTokens: 500 },
      });

      // Send message to Vertex AI and stream response
      const result = await chat.sendMessageStream(combinedMessage);
      let responseText = "";

      for await (const chunk of result.stream) {
        responseText += chunk.text();
      }

      // Cache and update chat history with AI response
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

  return (
    <div className="drawer drawer-end">
      <input id="chatbot-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label htmlFor="chatbot-drawer" className="btn btn-circle fixed bottom-5 right-5">
          Chat
        </label>
      </div>

      <div className="drawer-side">
        <label htmlFor="chatbot-drawer" className="drawer-overlay"></label>
        <div className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="overflow-y-auto h-96 mb-4">
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
