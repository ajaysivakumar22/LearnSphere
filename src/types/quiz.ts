export interface StoredQuizState {
    lessonId: string;
    questions: {
        questionId?: string;
        selectedOption: number;
    }[];
    currentQuestionIndex: number;
    timestamp: number;
}
