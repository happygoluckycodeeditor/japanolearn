import algoliasearch from 'algoliasearch/lite';
import instantsearch, { InstantSearch } from 'instantsearch.js';
import { hits, configure } from 'instantsearch.js/es/widgets';
import React, { useEffect, useRef, useState } from 'react';
import { app } from '../firebase-config'; // Import initialized Firebase app
import { getVertexAI, getGenerativeModel } from "firebase/vertexai-preview";
import ReactMarkdown from 'react-markdown';
import { toHiragana } from 'wanakana';  // Import wanakana for transliteration

// Initialize Vertex AI
const vertexAI = getVertexAI(app);
const model = getGenerativeModel(vertexAI, {
  model: "gemini-1.5-flash",
  systemInstruction: "You are a Japanese-English dictionary. Provide the Kanji, followed by its explanation or meaning, then readings, Romanization, and 2 example sentences for words."
});

// Algolia search client setup
const searchClient = algoliasearch('ALW8ZKQXQA', '0696c4fe6209cfacfd34dcdb1174d2b2');

// Cache object to store previous AI responses
const aiCache: { [key: string]: string } = {};

const Dictionary = () => {
  const search = useRef<InstantSearch | null>(null);
  const [aiResponse, setAiResponse] = useState<string>("");  // State to store AI response
  const [isLoading, setIsLoading] = useState<boolean>(false);  // Loading state for AI response

  useEffect(() => {
    // Initialize Algolia InstantSearch without the searchBox widget
    search.current = instantsearch({
      indexName: 'jmdictdictionary',
      searchClient,
    });

    search.current?.addWidgets([
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

    search.current?.start();
  }, []);

  // Function to call Vertex AI with the search term and implement caching
  const getGenerativeContent = async (query: string) => {
    setIsLoading(true);

    // Check cache first
    if (aiCache[query]) {
      setAiResponse(aiCache[query]);
      setIsLoading(false);
      return;
    }

    try {
      const result = await model.generateContent(query);
      const responseText = await result.response.text();  // Await response text
      aiCache[query] = responseText;  // Cache the AI response
      setAiResponse(responseText);  // Set AI response to state
    } catch (error) {
      console.error("Error generating content from Vertex AI:", error);
      setAiResponse("There was an error generating the content.");  // Graceful error handling
    } finally {
      setIsLoading(false);  // End loading state
    }
  };

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    let query = (event.target as HTMLFormElement).querySelector('input')?.value;

    if (query) {
      // Convert Romaji to Hiragana
      query = toHiragana(query);

      if (timeoutId) clearTimeout(timeoutId);

      // Set a timeout to delay the execution of the search
      timeoutId = setTimeout(() => {
        if (search.current?.helper) {
          search.current.helper.setQuery(query!).search();
        }

        // Trigger Vertex AI for generating content
        getGenerativeContent(query!);
      }, 3000); // Delay by 1 second to avoid sending too many requests
    }
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

      {/* JapanoAssistant Response (AI-generated content) */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Japanolearn's Response</h2>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <div className="skeleton h-4 w-1/2"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
          </div>
        ) : (
          aiResponse ? (
            <ReactMarkdown className="whitespace-pre-wrap p-4 bg-gray-100 rounded-lg">
              {aiResponse}
            </ReactMarkdown>
          ) : (
            <p className="text-gray-500">
              Put the words you want to search and Japanolearn will give you an AI-assisted explanation of the thing.
            </p>
          )
        )}
      </div>

      {/* Dictionary Search Results */}
      <h2 className="text-2xl font-semibold mb-4">Dictionary search results:</h2>
      <div id="hits"></div>
    </div>
  );
};

export default Dictionary;
