namespace Edunary.Domain.Enums;

public enum QuestionType
{
    SingleChoice = 0,   // MCQ: at least 2 choices, exactly 1 correct
    MultipleChoice = 1, // MSQ: at least 2 choices, at least 1 correct
    TrueFalse = 2       // TF: exactly 2 choices ("True"/"False"), exactly 1 correct
}
