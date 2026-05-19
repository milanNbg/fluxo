import { useGetSuggestionsQuery } from '@/app/api';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  const { data, isLoading } = useGetSuggestionsQuery();

  if (isLoading || !data) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
        Try asking
      </p>
      <div className="flex flex-col gap-2">
        {data.questions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onSelect(question)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}