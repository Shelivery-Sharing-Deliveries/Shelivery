// src/components/ui/TermsOfServiceContent.tsx
"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const TermsOfServiceContent: React.FC = () => {
  const [terms, setTerms] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      const { data, error } = await supabase
        .from("terms_of_service")
        .select("content")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching terms:", error);
      } else {
        setTerms(data?.content ?? null);
      }
    };

    fetchTerms();
  }, []);

  if (!terms) return <p>Loading Terms of Service...</p>;

  return (
    <div className="prose prose-sm max-w-none text-left text-gray-700 leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {terms}
      </ReactMarkdown>
    </div>
  );
};

export default TermsOfServiceContent;
