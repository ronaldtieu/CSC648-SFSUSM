import React from 'react';
import './Hashtag.css';

// Single hashtag component renders one clickable hashtag.
const Hashtag = ({ tag, onClick }) => {
  return (
    <span className="hashtag" onClick={() => onClick(tag)}>
      #{tag}
    </span>
  );
};

// HashtagList component accepts a string (text) and extracts hashtags.
// If no text is provided or no hashtags are found, it renders nothing.
const HashtagList = ({ text, onHashtagClick }) => {
  if (!text) return null;

  // Use a regular expression to find hashtags in the text.
  // This regex finds words that start with '#' and contain letters, numbers, or underscores.
  const hashtagRegex = /#(\w+)/g;
  const hashtags = [];
  let match;
  
  // Extract all hashtags from the text.
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1]);
  }

  // If no hashtags are found, render nothing.
  if (hashtags.length === 0) return null;

  return (
    <div className="hashtag-list">
      {hashtags.map((tag, index) => (
        <Hashtag key={index} tag={tag} onClick={onHashtagClick} />
      ))}
    </div>
  );
};

export default HashtagList;