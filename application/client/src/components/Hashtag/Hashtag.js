import React from 'react';
import './Hashtag.css';

// Single hashtag component that renders one hashtag as a clickable element.
const Hashtag = ({ tag, onClick }) => {
  return (
    <span className="hashtag" onClick={() => onClick(tag)}>
      #{tag}
    </span>
  );
};

// HashtagList component that accepts an array of hashtags and an onClick handler.
// If no hashtags are provided, it renders nothing.
const HashtagList = ({ hashtags, onHashtagClick }) => {
  if (!hashtags || hashtags.length === 0) {
    return null;
  }

  return (
    <div className="hashtag-list">
      {hashtags.map((tag, index) => (
        <Hashtag key={index} tag={tag} onClick={onHashtagClick} />
      ))}
    </div>
  );
};

export default HashtagList;