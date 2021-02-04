import React from "react";

const QuestionOption = ({ title, ...props }) => {
  return (
    <button className="Question__button" {...props}>
      {title}
    </button>
  );
};

export default QuestionOption;
