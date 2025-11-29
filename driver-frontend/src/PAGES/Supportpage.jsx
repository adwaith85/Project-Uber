import React, { useState } from "react";
import {
  CloudArrowDownIcon,
  WrenchScrewdriverIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";
import Navbar from "../Components/Navbar";

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="w-full py-4 flex justify-between items-center text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-base font-medium transition-colors ${isOpen ? "text-blue-600" : "text-gray-800 group-hover:text-blue-600"}`}>
          {question}
        </span>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5 text-blue-600" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"}`}
      >
        <p className="text-gray-600 text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

function Supportpage() {
  const faqs = [
    {
      question: "How do I update my driver profile?",
      answer: "Go to the Profile page and click on the edit icon next to the details you wish to change. Some changes may require admin approval."
    },
    {
      question: "When will I receive my earnings?",
      answer: "Earnings are processed weekly and deposited directly into your registered bank account every Monday."
    },
    {
      question: "What should I do if I have an issue with a ride?",
      answer: "You can report an issue directly from the ride details page or contact our 24/7 support team via the contact options below."
    },
    {
      question: "How is my performance rating calculated?",
      answer: "Your rating is an average of the last 100 ratings received from passengers. Consistent high ratings unlock special bonuses."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />

      {/* HERO SECTION */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            How can we help you?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers, download resources, or get in touch with our dedicated support team.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">

        {/* Support Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Card 1 - Resources */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition group">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition">
              <CloudArrowDownIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Driver Resources</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Download the latest app updates, training manuals, and vehicle safety guidelines.
            </p>
            <a href="#" className="text-blue-600 font-semibold text-sm hover:text-blue-800 flex items-center gap-1">
              View resources <span aria-hidden="true">&rarr;</span>
            </a>
          </div>

          {/* Card 2 - Troubleshooting */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition group">
            <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-100 transition">
              <WrenchScrewdriverIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Troubleshooting</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Step-by-step guides to resolve common app issues, GPS problems, and login errors.
            </p>
            <a href="#" className="text-green-600 font-semibold text-sm hover:text-green-800 flex items-center gap-1">
              Start troubleshooting <span aria-hidden="true">&rarr;</span>
            </a>
          </div>

          {/* Card 3 - Community */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition group">
            <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-100 transition">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Community Forum</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Connect with other drivers, share tips, and discuss best practices in our forum.
            </p>
            <a href="#" className="text-purple-600 font-semibold text-sm hover:text-purple-800 flex items-center gap-1">
              Join discussion <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <QuestionMarkCircleIcon className="h-8 w-8 text-gray-400" />
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <FaqItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Still need help?</h2>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <a href="mailto:support@example.com" className="flex items-center justify-center gap-3 bg-white border border-gray-200 px-8 py-4 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition group">
              <div className="p-2 bg-blue-50 rounded-full group-hover:bg-blue-100 transition">
                <EnvelopeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 font-medium uppercase">Email Support</p>
                <p className="text-gray-900 font-semibold">support@example.com</p>
              </div>
            </a>

            <a href="tel:+18001234567" className="flex items-center justify-center gap-3 bg-white border border-gray-200 px-8 py-4 rounded-xl shadow-sm hover:shadow-md hover:border-green-300 transition group">
              <div className="p-2 bg-green-50 rounded-full group-hover:bg-green-100 transition">
                <PhoneIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 font-medium uppercase">24/7 Hotline</p>
                <p className="text-gray-900 font-semibold">+1 (800) 123-4567</p>
              </div>
            </a>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-gray-900 font-bold text-lg">Driver Support</p>
            <p className="text-gray-500 text-sm mt-1">Empowering drivers with the tools they need.</p>
          </div>
          <div className="flex gap-6 text-gray-500">
            <a href="#" className="hover:text-gray-900 transition">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 transition">Terms of Service</a>
            <a href="#" className="hover:text-gray-900 transition">Cookie Policy</a>
          </div>
          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Driver App.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Supportpage;
