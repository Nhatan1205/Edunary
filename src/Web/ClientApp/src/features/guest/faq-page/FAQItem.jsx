function FAQItem({ question, answer, isOpen, toggle }) {
  return (
    <div className="group border-b border-gray-200 last:border-0">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between py-6 text-left focus:outline-none"
        aria-expanded={isOpen}
      >
        <span 
          className={`text-lg font-medium transition-colors duration-300 ${
            isOpen ? 'text-indigo-600' : 'text-gray-800 group-hover:text-indigo-600'
          }`}
        >
          {question}
        </span>
        <span
          className={`ml-6 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
            isOpen 
              ? 'border-indigo-600 bg-indigo-600 text-white rotate-180' 
              : 'border-gray-200 text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600'
          }`}
        >
          
        </span>
      </button>
      
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-base leading-relaxed text-gray-600">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default FAQItem