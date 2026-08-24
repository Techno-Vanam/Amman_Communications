'use client';

import { useState } from 'react';
import styles from './FAQSection.module.css';

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
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First open by default

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="contact" className={styles.section} aria-labelledby="faq-heading">
      <div className={`${styles.inner} container`}>
        <div className={styles.header}>
          <p className="section-label">Common Questions</p>
          <h2 id="faq-heading" className="section-heading">
            Contact & FAQ
          </h2>
          <p className="section-subheading">
            Find answers to common questions about using the Amman Communications
            platform.
          </p>
        </div>

        <div className={styles.faqList}>
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`${styles.faqItem} ${isOpen ? styles.open : ''}`}
              >
                <button
                  type="button"
                  className={styles.questionBtn}
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                >
                  <span className={styles.questionText}>{faq.question}</span>
                  <span className={styles.iconWrap} aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform var(--transition-base)',
                      }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>
                <div
                  className={styles.answerWrap}
                  hidden={!isOpen}
                  style={{
                    display: isOpen ? 'block' : 'none',
                  }}
                >
                  <p className={styles.answerText}>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
