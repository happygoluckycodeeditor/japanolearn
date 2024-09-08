import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { hits, configure } from 'instantsearch.js/es/widgets';
import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getVertexAI, getGenerativeModel } from "firebase/vertexai-preview";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

// Firebase config with ReCAPTCHA Enterprise Site Key
export const firebaseConfig = {
  apiKey: "AIzaSyBLnp5i6VET-aRxafItsIwAyZQYcPoB7MA",
  authDomain: "japanolearn-b696a.firebaseapp.com",
  projectId: "japanolearn-b696a",
  storageBucket: "japanolearn-b696a.appspot.com",
  messagingSenderId: "371685326092",
  appId: "1:371685326092:web:5f6d44da5951209ea9dd29",
  measurementId: "G-1BM1J723N3"
};

export const RECAPTCHA_ENTERPRISE_SITE_KEY = "6LfsWTYqAAAAAOYEWfzHrA0HuAkfWTBmNqcZV7hK";

// Initialize Firebase and Vertex AI
const firebaseApp = initializeApp(firebaseConfig);

// Initialize App Check with ReCAPTCHA Enterprise
initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY),
});

const vertexAI = getVertexAI(firebaseApp);
const model = getGenerativeModel(vertexAI, {
  model: "gemini-1.5-flash",
  systemInstruction: "You are a Japanese-English dictionary. Provide Kanji, readings, Romanization, and 2 example sentences for words."
});

// Algolia search client setup
const searchClient = algoliasearch('ALW8ZKQXQA', '0696c4fe6209cfacfd34dcdb1174d2b2');

const Dictionary = () => {
  const search = useRef(null);
  const [aiResponse, setAiResponse] = useState("");  // State to store AI response
  const [isLoading, setIsLoading] = useState(false);  // Loading state for AI response

  useEffect(() => {
    // Initialize Algolia InstantSearch without the searchBox widget
    search.current = instantsearch({
      indexName: 'jmdictdictionary',
      searchClient,
    });

    search.current.addWidgets([
      // Hits widget to display Algolia results
      hits({
        container: '#hits',
        templates: {
          item: `
            <div class="card bg-base-100 shadow-xl mb-4">
              <div class="card-body">
                <h2 class="card-title">Kanji: {{kanji}}</h2>
                <p>Reading: {{reading}}</p>
                <p>Meanings: {{sense}}</p>
              </div>
            </div>
          `,
        },
      }),

      // Configure widget to manage Algolia search parameters
      configure({
        hitsPerPage: 10,
      }),
    ]);

    search.current.start();
  }, []);
  // Function to call Vertex AI with the search term
  const getGenerativeContent = async (query) => {
    setIsLoading(true);
    try {
      const result = await model.generateContent(query);
      const responseText = await result.response.text();  // Await response text
      setAiResponse(responseText);  // Set AI response to state
    } catch (error) {
      console.error("Error generating content from Vertex AI:", error);
      setAiResponse("There was an error generating the content.");  // Graceful error handling
    } finally {
      setIsLoading(false);  // End loading state
    }
  };

  // Debounce function to limit the number of requests sent to Vertex AI
  let timeoutId;

  const handleSubmit = (event) => {
    event.preventDefault();
    const query = event.target.querySelector('input')?.value;

    // Clear any previously set timeout
    if (timeoutId) clearTimeout(timeoutId);

    // Set a timeout to delay the execution of the search
    timeoutId = setTimeout(() => {
      // Trigger Algolia search
      search.current.helper.setQuery(query).search();

      // Trigger Vertex AI for generating content
      getGenerativeContent(query);
    }, 1000); // Delay by 1 second to avoid sending too many requests
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">Dictionary Search</h1>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="flex space-x-4 mb-6">
        <input
          type="text"
          placeholder="Type kanji or reading here"
          className="input input-bordered input-primary w-full max-w-xs"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {/* Display Loading State */}
      {isLoading && <p>Loading AI content...</p>}

      {/* Display Algolia Search Results */}
      <div id="hits"></div>

      {/* Display AI-Generated Response */}
      {aiResponse && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">AI Generated Info:</h2>
          <pre className="whitespace-pre-wrap">{aiResponse}</pre>
        </div>
      )}
    </div>
  );
};

export default Dictionary;
