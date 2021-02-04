/**
 * chat bot
 */

import PropTypes from "prop-types";
import React, { memo, useEffect, useState } from "react";
import ChatItem from "./Chat/ChatItem";

const robotAvatar = "https://image.ibb.co/eTiXWa/avatarrobot.png";
const secondAvatar = "https://randomuser.me/api/portraits/women/0.jpg";
const defaultRegistery = [
  {
    type: "default",
    Component: ({
      activeKey,
      setActiveKey,
      screen,
      setScreen,
      appHistory,
      setAppHistory,
      text,
      trigger
    }) => {
      useEffect(() => {
        if (trigger) setTimeout(() => setActiveKey(trigger), 300);
      }, [trigger]);

      return <ChatItem isLeftSide content={text} avatar={robotAvatar} />;
    }
  },
  {
    type: "options",
    Component: ({
      activeKey,
      setActiveKey,
      screen,
      setScreen,
      appHistory,
      setAppHistory,
      title,
      options
    }) => {
      const handleClick = (option) => {
        // update app history to collect for answeres
        setAppHistory((state) => [...state, option]);

        setScreen((state) => {
          // remove question from array then push answere to it
          let newState = [...state];
          newState.pop();
          newState.push(
            <ChatItem
              key={title + appHistory.length}
              content={option.text}
              isLeftSide={false}
              avatar={secondAvatar}
            />
          );
          return newState;
        });

        if (option.trigger) setActiveKey(option.trigger);
      };

      const renderOptions = options.map((option) => (
        <button key={option.text} onClick={() => handleClick(option)}>
          {option.text}
        </button>
      ));

      return (
        <div>
          <h2>{title}</h2>
          {renderOptions}
        </div>
      );
    }
  }
];

const Chatbot = ({ steps, registery, initialStepKey }) => {
  const [activeKey, setActiveKey] = useState(
    initialStepKey || Object.keys(steps)[0]
  ); // keep track of current step
  const [screen, setScreen] = useState([]); // all items will be rendered in screen
  const [appHistory, setAppHistory] = useState([]); // keep track of steps that has been passed
  const [textInputValue, setTextInputValue] = useState(""); // when input needed
  const allRegistery = defaultRegistery.concat(registery);

  const scrollToBottom = () => {
    const bottomScrollTag = document.querySelector("#bottom-scroll");
    if (bottomScrollTag)
      bottomScrollTag.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
  };

  useEffect(() => {
    scrollToBottom();
  });

  // when active key change screen should be updated
  useEffect(() => {
    // if active step doesnt exists
    if (!steps[activeKey]) return;

    const newScreenRegistery = allRegistery.find(
      (reg) => reg.type === steps[activeKey].type
    );

    if (newScreenRegistery && newScreenRegistery.Component) {
      const newComponentProps = {
        activeKey,
        setActiveKey,
        screen,
        setScreen,
        appHistory,
        setAppHistory,
        ...steps[activeKey].mapStateToProps(
          activeKey,
          setActiveKey,
          screen,
          setScreen,
          appHistory,
          setAppHistory
        )
      };
      setScreen((state) => {
        return [
          ...state,
          <newScreenRegistery.Component
            {...newComponentProps}
            key={newComponentProps.key + state.length}
          />
        ];
      });
    }
  }, [activeKey]);

  return (
    <div className="chatbot__container">
      <div className="chatbot__inner">
        {screen}
        <div id="bottom-scroll" />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (steps[activeKey] && steps[activeKey].onSubmit) {
            steps[activeKey].onSubmit({
              activeKey,
              setActiveKey,
              screen,
              setScreen,
              appHistory,
              setAppHistory,
              value: textInputValue
            });
          }
          setScreen((state) => [
            ...state,
            <ChatItem
              avatar={secondAvatar}
              isLeftSide={false}
              content={textInputValue}
            />
          ]);
          setTextInputValue("");
          if (steps[activeKey].trigger) {
            setActiveKey(steps[activeKey].trigger);
          }
        }}
      >
        <textarea
          onChange={(e) => setTextInputValue(e.target.value)}
          disabled={steps[activeKey].type !== "text-input"}
          value={textInputValue}
        />
        <button disabled={steps[activeKey].type !== "text-input"}>send</button>
      </form>
    </div>
  );
};

Chatbot.propTypes = {
  registery: PropTypes.array,
  steps: PropTypes.object.isRequired
};

Chatbot.defaultProps = {
  // examples
  registery: [],
  steps: {
    "1": {
      type: "default",
      mapStateToProps: (
        activeKey,
        setActiveKey,
        screen,
        setScreen,
        appHistory,
        setAppHistory
      ) => ({ text: "firstMessage", trigger: "2", key: 1 })
    },

    "2": {
      type: "options",
      mapStateToProps: () => ({
        title: "option show case",
        options: [
          { text: "option 1", trigger: "3" },
          { text: "option 2", trigger: "4" }
        ],
        key: 2
      })
    },
    "3": {
      type: "default",
      mapStateToProps: () => ({
        text: "you choose option 1",
        key: 3,
        trigger: "5"
      })
    },
    "4": {
      type: "default",
      mapStateToProps: () => ({
        text: "you choose option 2",
        key: 4,
        trigger: "5"
      })
    },
    "5": {
      type: "options",
      mapStateToProps: () => ({
        options: [
          { text: "restart", trigger: "2" },
          { text: "input text showcase", trigger: "6" }
        ],
        key: 5
      })
    },
    "6": {
      type: "text-input",
      onSubmit: ({ value }) => console.log("here", value),
      trigger: "5"
    }
  }
};

export default memo(Chatbot);
