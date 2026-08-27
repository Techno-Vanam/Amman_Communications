'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'How do I start a new application?',
    answer:
      'Log into your customer portal, navigate to the Services section, select the service you require, and click "Start Application". The system will guide you through the required steps.',
  },
  {
    question: 'What happens if a document is rejected?',
    answer:
      'You will receive a notification in your portal explaining why the document was rejected. You can then upload a corrected version directly to the same application without having to start over.',
  },
  {
    question: 'How long does the review process take?',
    answer:
      'Processing times vary depending on the type of service requested. You can view the estimated processing time for your specific application within your customer portal.',
  },
  {
    question: 'Can I track my application status?',
    answer:
      'Yes. The customer portal provides real-time status updates for all your active applications. You can see exactly which stage of the process your application is in.',
  },
  {
    question: 'Is my information secure?',
    answer:
      'We take data security seriously. All documents and personal information are encrypted and securely stored. Only authorised personnel involved in processing your application have access to your data.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="contact" className="bg-white py-24" aria-labelledby="faq-heading">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold tracking-widest uppercase text-brand-500 mb-3">Common Questions</p>
          <h2 id="faq-heading" className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Contact &amp; FAQ
          </h2>
          <p className="text-gray-500 leading-relaxed">
            Find answers to common questions about using the Amman Communications platform.
          </p>
        </div>

        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`border rounded-2xl overflow-hidden transition-colors duration-200 ${
                  isOpen ? 'border-brand-700' : 'border-gray-200'
                }`}
              >
                <button
                  type="button"
                  className="flex items-center justify-between w-full px-5 py-4 text-left"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-gray-900">{faq.question}</span>
                  <span className="ml-4 flex-shrink-0 text-brand-700" aria-hidden="true">
                    <ChevronDown
                      size={18}
                      strokeWidth={2}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 250ms ease',
                      }}
                    />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
