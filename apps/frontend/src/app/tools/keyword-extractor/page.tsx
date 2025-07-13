/**
 * @fileoverview Page route for the Keyword Extractor tool.
 * @description This file serves as the entry point for the /tools/keyword-extractor URL.
 *              It follows the Next.js App Router convention by rendering the feature-specific
 *              component, ensuring a clean separation of concerns.
 * @author Gemini
 * @version 1.0
 */

'use client';

import KeywordExtractor from '@/features/keyword-extractor/components/KeywordExtractor';

export default function KeywordExtractorPage() {
  return (
    // The page itself is just a container.
    // The actual logic and UI are encapsulated in the KeywordExtractor component.
    <KeywordExtractor />
  );
}
