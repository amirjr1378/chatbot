import React from "react";

const ChatItem = ({ avatar, content, isLeftSide }) => {
  return (
    <div
      className={`ChatItem ${
        !isLeftSide ? "ChatItem--expert" : "ChatItem--customer"
      }`}
    >
      <div className="ChatItem-meta">
        <div className="ChatItem-avatar">
          <img className="ChatItem-avatarImage" src={avatar} />
        </div>
      </div>
      <div className="ChatItem-chatContent">
        <div className="ChatItem-chatText">{content}</div>
        <div className="ChatItem-timeStamp">
          <strong>Chat Bot</strong> • Today 05:49
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
