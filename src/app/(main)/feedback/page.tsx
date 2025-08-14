"use client";

import Image from "next/image";
import React, { useState } from "react";
import { ChevronDown, Send, AlertCircle } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { PageLayout } from "@/components/ui";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function App() {
  const router = useRouter();

  const headerContent = (
    <div className="flex items-center gap-2 px-4 py-2">
      <button
        onClick={() => router.push("/")}
        className="w-6 h-6 flex items-center justify-center"
      >
        <Image
          src="/icons/back-arrow.svg"
          alt="Back"
          width={24}
          height={24}
        />
      </button>
      <h1 className="text-[16px] text-black font-inter text-base font-bold leading-8 tracking-[-0.017em]">
        Feedback form
      </h1>
    </div>
  );

  return (
    <PageLayout header={headerContent} showNavigation={true}>
      <div className="flex justify-center pt-4">
        <FeedbackForm />
      </div>
    </PageLayout>
  );
}

function FeedbackForm() {
  const { user, loading: authLoading } = useAuth();

  const [feedbackType, setFeedbackType] = useState("Add a Store");
  const [message, setMessage] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Different placeholders for each dropdown option
  const placeholders: Record<string, string> = {
    General: "Write your general feedback here...",
    "Add a Store":
      "Suggest a store you’d like us to add. Please include the store name, link, and any other relevant details.",
    "Dormitory Change": "Explain the dormitory change request here...",
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      setSubmitMessage("You must be logged in to submit feedback.");
      return;
    }

    setIsLoading(true);
    setSubmitMessage("");

    try {
      const { data, error: dbError } = await supabase
        .from("user_feedback")
        .insert([
          {
            user_id: user.id,
            event_type: feedbackType,
            description: message,
          },
        ])
        .select();

      if (dbError) {
        console.error("Supabase Error:", dbError);
        setSubmitMessage(
          "There was an error submitting your feedback. Please try again."
        );
        setIsLoading(false);
        return;
      }

      console.log("Feedback saved to Supabase:", data);

      setSubmitMessage(
        "Thank you for your message! We have received your ticket and will get back to you shortly."
      );

      setFeedbackType("Add a Store");
      setMessage("");
    } catch (error) {
      console.error("Submission Error:", error);
      setSubmitMessage(
        "There was a problem processing your request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="mt-6 p-4 bg-blue-50 rounded-xl text-blue-700 text-center text-sm font-medium flex items-center justify-center">
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 
            0 0 5.373 0 12h4zm2 5.291A7.962 
            7.962 0 014 12H0c0 3.042 1.135 
            5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Loading user session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mt-6 p-4 bg-red-50 rounded-xl text-red-700 text-center text-sm font-medium flex items-center justify-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        You must be logged in to submit feedback.
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-200">
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
        Submit Your Feedback
      </h2>
      <p className="text-center text-gray-500 mb-8">
        We'd love to hear from you. Please select a feedback type and let us
        know your thoughts.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="feedback-type"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Feedback Type
          </label>
          <div className="relative">
            <select
              id="feedback-type"
              name="feedback-type"
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="mt-1 block w-full py-3 px-4 border border-gray-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none pr-10"
              disabled={isLoading || !user}
            >
              <option value="General">General</option>
              <option value="Add a Store">Add a Store</option>
              <option value="Dormitory Change">Dormitory Change</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-xl p-4 resize-none"
            placeholder={placeholders[feedbackType]}
            required
            disabled={isLoading || !user}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || !user}
          className="w-full flex items-center justify-center text-lg font-bold"
        >
          {isLoading ? (
            "Submitting..."
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Submit Feedback
            </>
          )}
        </Button>
      </form>

      {submitMessage && (
        <div
          className={`mt-6 p-4 rounded-xl text-center text-sm font-medium 
          ${
            submitMessage.includes("Thank you")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {submitMessage}
        </div>
      )}
    </div>
  );
}
