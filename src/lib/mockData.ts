// MOCK DATA — used while the Excelsoft API is unreachable from this environment.

export const mockGrades = [
  { classid: 1, classname: 'Grade 6' },
  { classid: 2, classname: 'Grade 7' },
  { classid: 3, classname: 'Grade 8' },
  { classid: 4, classname: 'Grade 9' },
  { classid: 5, classname: 'Grade 10' },
];

export const mockSubjectsByGrade: Record<string, { subjectid: number; subjectname: string }[]> = {
  default: [
    { subjectid: 1, subjectname: 'Mathematics' },
    { subjectid: 2, subjectname: 'Science' },
    { subjectid: 3, subjectname: 'English' },
    { subjectid: 4, subjectname: 'Social Studies' },
  ],
};

export const mockChaptersBySubject: Record<
  string,
  { chapterid: number; chaptername: string; chaptercode: string; classid: number; subjectid: number }[]
> = {
  default: [
    { chapterid: 101, chaptername: 'Introduction', chaptercode: 'CH01', classid: 1, subjectid: 1 },
    { chapterid: 102, chaptername: 'Fundamentals', chaptercode: 'CH02', classid: 1, subjectid: 1 },
    { chapterid: 103, chaptername: 'Advanced Concepts', chaptercode: 'CH03', classid: 1, subjectid: 1 },
  ],
};

export const mockELOsByChapter: Record<string, { elo: string; chapterid: number }[]> = {
  default: [
    { elo: 'Understand the core principles of the topic.', chapterid: 101 },
    { elo: 'Apply formulas to solve real-world problems.', chapterid: 101 },
    { elo: 'Analyse relationships between key concepts.', chapterid: 101 },
    { elo: 'Evaluate different approaches to problem-solving.', chapterid: 101 },
    { elo: 'Create original examples to demonstrate understanding.', chapterid: 101 },
  ],
};

export const generateMockQuestions = (
  count: number,
  subject: string,
  chapter: string,
  elos: string[]
) => {
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const taxonomies = ['remember', 'understand', 'apply', 'analyse'];
  const questions = [];
  for (let i = 0; i < count; i++) {
    const elo = elos[i % elos.length] || 'General';
    const correctIndex = i % 4;
    const options = [
      `Option A for question ${i + 1}`,
      `Option B for question ${i + 1}`,
      `Option C for question ${i + 1}`,
      `Option D for question ${i + 1}`,
    ];
    questions.push({
      id: `q-${i + 1}`,
      text: `Sample ${subject} question ${i + 1} on "${chapter}" — assesses: ${elo}`,
      type: 'mcq',
      options,
      correctAnswer: options[correctIndex],
      difficulty: difficulties[i % difficulties.length],
      elo,
      taxonomy: taxonomies[i % taxonomies.length],
      explanation: 'This is a mock explanation generated for development purposes.',
    });
  }
  return questions;
};