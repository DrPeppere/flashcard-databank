import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, RotateCw, BookOpen, Layers } from 'lucide-react';

interface CatalogEntry {
  name: string;
  subject: string;
  doc: string;
  file: string;
  folder: string;
}

interface Flashcard {
  q: string;
  a: string;
  sec: string;
}

export default function App() {
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<CatalogEntry | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/catalog.json?t=' + new Date().getTime())
      .then((res) => res.json())
      .then((data) => {
        setCatalog(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load catalog:', err);
        setLoading(false);
      });
  }, []);

  const loadDeck = (deck: CatalogEntry) => {
    setLoading(true);
    fetch('/' + deck.file + '?t=' + new Date().getTime())
      .then((res) => res.json())
      .then((data: Flashcard[]) => {
        // Filter out END markers if they exist
        const filtered = data.filter((card) => card.q !== 'END' && card.a !== 'END');
        setCards(filtered);
        setSelectedDeck(deck);
        setCurrentIndex(0);
        setIsFlipped(false);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load deck:', err);
        setLoading(false);
      });
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  if (loading && catalog.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="text-zinc-500 animate-pulse flex items-center gap-2 text-lg">
          <BookOpen className="w-5 h-5" /> Loading catalog...
        </div>
      </div>
    );
  }

  if (!selectedDeck) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 text-center space-y-4">
            <h1 className="text-4xl font-serif text-zinc-900 flex items-center justify-center gap-3">
              <Layers className="w-8 h-8 text-zinc-600" />
              Flashcard Databank
            </h1>
            <p className="text-zinc-500 text-lg">Select a deck to begin your review session.</p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalog.map((deck) => (
              <button
                key={deck.name}
                onClick={() => loadDeck(deck)}
                className="group relative flex flex-col items-start p-6 bg-white rounded-2xl shadow-sm border border-zinc-200 hover:shadow-md hover:border-zinc-300 transition-all text-left"
              >
                <div className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-zinc-100 text-zinc-600 rounded-full">
                  {deck.subject} &bull; {deck.folder}
                </div>
                <h2 className="text-xl font-medium text-zinc-900 group-hover:text-black transition-colors mb-2">
                  {deck.name}
                </h2>
                <div className="mt-auto pt-4 flex items-center text-sm font-medium text-zinc-500 group-hover:text-zinc-800 transition-colors">
                  Open Deck <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl">
        <button
          onClick={() => setSelectedDeck(null)}
          className="mb-8 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back to library
        </button>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif text-zinc-900">{selectedDeck.name}</h2>
            <p className="text-sm text-zinc-500 mt-1">{selectedDeck.subject} &bull; {selectedDeck.folder}</p>
          </div>
          <div className="text-sm font-medium px-4 py-2 bg-zinc-200/50 text-zinc-600 rounded-full">
            {currentIndex + 1} / {cards.length}
          </div>
        </div>

        {/* Flashcard */}
        <div 
          className="relative w-full aspect-[4/3] sm:aspect-video cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            {/* Front */}
            <div className={`absolute inset-0 w-full h-full bg-white rounded-3xl shadow-lg border border-zinc-100 p-8 md:p-12 flex flex-col justify-center items-center text-center backface-hidden ${isFlipped ? 'hidden' : ''}`}>
              {currentCard?.sec && (
                <div className="absolute top-6 left-6 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                  {currentCard.sec}
                </div>
              )}
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium text-zinc-800 leading-tight">
                {currentCard?.q}
              </h3>
              <div className="absolute bottom-6 flex items-center gap-2 text-zinc-400 text-sm font-medium">
                <RotateCw className="w-4 h-4" /> Click to reveal
              </div>
            </div>

            {/* Back */}
            <div className={`absolute inset-0 w-full h-full bg-zinc-900 rounded-3xl shadow-lg border border-zinc-800 p-8 md:p-12 flex flex-col justify-center items-center text-center backface-hidden rotate-y-180 overflow-y-auto overflow-x-hidden ${!isFlipped ? 'hidden' : ''}`}>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-medium text-zinc-50 leading-relaxed my-auto">
                {currentCard?.a}
              </h3>
            </div>
            
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
          <button 
            onClick={prevCard}
            className="p-4 rounded-full bg-white shadow-sm border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50 transition-all active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextCard}
            className="p-4 rounded-full bg-white shadow-sm border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50 transition-all active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
