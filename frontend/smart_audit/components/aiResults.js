import React from "react";
const AIResults = ({ text_content }) => {
  if (text_content === "") {
    return;
  }

  return (
    <section class="text_result_ai">
      <h2>AI Generated Audit</h2>

      <p>{text_content}</p>
    </section>
  );
};

export default AIResults;
