import React, { useState } from 'react';
import { FAQ_DATA } from '../../data/landingData';
import { Plus, Minus, HelpCircle, MessageSquare } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'General', 'Documentation', 'Timeline & Status', 'Fees & Billing'];

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    return selectedCategory === 'All' || faq.category === selectedCategory;
  });

  return (
    <section id="faq" className="py-20 md:py-28 bg-white relative border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-brand-600" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-700 tracking-tight">
            Clear Answers to Your Documentation Questions
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to know about our document pre-audits, property registration consultancy, and timelines.
          </p>
        </div>

        {/* Category Filter Controls */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion List - Single Open Accordion with +/- Button */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  onClick={() => toggleFaq(faq.id)}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer select-none ${
                    isOpen
                      ? 'bg-white border-brand-300 ring-1 ring-brand-500/20 shadow-sm'
                      : 'bg-slate-50/70 hover:bg-white border-slate-200/80 hover:border-brand-300 hover:shadow-xs'
                  }`}
                >
                  <div className="px-6 py-5 flex items-center justify-between gap-4">
                    <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                      {faq.question}
                    </span>

                    {/* Circular + / - button indicator */}
                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isOpen
                          ? 'bg-brand-600 border-brand-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 animate-fade-in space-y-3">
                      <p>{faq.answer}</p>
                      <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-100/80">
                        Category: {faq.category}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-500 font-medium">No matching questions found in this category.</p>
              <button
                onClick={() => setSelectedCategory('All')}
                className="mt-2 text-xs font-semibold text-brand-700 hover:underline cursor-pointer"
              >
                View all FAQs
              </button>
            </div>
          )}
        </div>

        {/* Ask a Consultant Box */}
        <div className="mt-12 p-6 rounded-2xl bg-brand-50 border border-brand-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-11 h-11 rounded-xl bg-white text-brand-600 border border-brand-200 flex items-center justify-center shrink-0 shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Have a specific document query?</h4>
              <p className="text-xs text-slate-600">Our senior consultants provide direct advisory support.</p>
            </div>
          </div>
          <a
            href="#contact"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm transition-colors shrink-0 shadow-xs"
          >
            Ask a Consultant
          </a>
        </div>
      </div>
    </section>
  );
};

