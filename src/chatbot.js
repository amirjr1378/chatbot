/**
 * chat bot
 */

import PropTypes from "prop-types";
import React, { memo, useEffect, useState } from "react";
import ChatItem from "./Chat/ChatItem";
import QuestionOption from "./Chat/QuestionOption";

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
    type: "text-input",
    Footer: ({
      onSubmit,
      trigger,
      activeKey,
      setActiveKey,
      screen,
      setScreen,
      appHistory,
      setAppHistory,
      setFooter
    }) => {
      const [textInputValue, setTextInputValue] = useState(""); // when input needed

      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (onSubmit) {
              onSubmit({
                activeKey,
                setActiveKey,
                screen,
                setScreen,
                appHistory,
                setAppHistory,
                value: textInputValue,
                setFooter
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
            setFooter(null);
            if (trigger) {
              setActiveKey(trigger);
            }
          }}
        >
          <textarea
            onChange={(e) => setTextInputValue(e.target.value)}
            value={textInputValue}
          />
          <button>send</button>
        </form>
      );
    }
  },
  {
    type: "options",
    Component: ({ title }) =>
      title ? (
        <ChatItem avatar={robotAvatar} isLeftSide content={title} />
      ) : null,
    Footer: ({
      activeKey,
      setActiveKey,
      screen,
      setScreen,
      appHistory,
      setAppHistory,
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
              key={option.text + appHistory.length}
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
        <QuestionOption
          title={option.text}
          key={option.text}
          onClick={() => handleClick(option)}
        />
      ));

      return <div className="option__container">{renderOptions}</div>;
    }
  }
];

const Chatbot = ({ steps, registery, initialStepKey, onEnd }) => {
  const [activeKey, setActiveKey] = useState(
    initialStepKey || Object.keys(steps)[0]
  ); // keep track of current step
  const [screen, setScreen] = useState([]); // all items will be rendered in screen
  const [footer, setFooter] = useState(null); // footer like text area for messaging
  const [appHistory, setAppHistory] = useState([]); // keep track of steps that has been passed
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
    if (activeKey === "END") {
      setFooter(null);
      if (onEnd && typeof onEnd === "function")
        onEnd({
          appHistory,
          setAppHistory,
          screen,
          setScreen
        });
    }

    if (!steps[activeKey]) return;

    // find the correct component to attach on screen
    const newScreenRegistery = allRegistery.find(
      (reg) => reg.type === steps[activeKey].type
    );

    if (newScreenRegistery) {
      let newComponentProps = {
        activeKey,
        setActiveKey,
        screen,
        setScreen,
        appHistory,
        setAppHistory,
        setFooter,
        scrollToBottom
      };

      if (steps[activeKey].mapStateToProps) {
        newComponentProps = Object.assign(
          newComponentProps,
          steps[activeKey].mapStateToProps(
            activeKey,
            setActiveKey,
            screen,
            setScreen,
            appHistory,
            setAppHistory
          )
        );
      } else {
        newComponentProps = Object.assign(newComponentProps, steps[activeKey]);
      }

      if (newScreenRegistery.Footer) {
        setFooter(
          <newScreenRegistery.Footer
            {...newComponentProps}
            key={newComponentProps.key}
          />
        );
      }

      if (newScreenRegistery.Component) {
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
    }
  }, [activeKey]);

  return (
    <div className="chatbot__container">
      <div className="chatbot__inner">
        {screen}
        <div id="bottom-scroll" />
      </div>
      <div>{footer}</div>
    </div>
  );
};

Chatbot.propTypes = {
  registery: PropTypes.array,
  steps: PropTypes.object.isRequired,
  initialStepKey: PropTypes.string,
  onEnd: PropTypes.func
};

Chatbot.defaultProps = {
  // examples
  registery: [],
  onEnd: () => {},
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
      ) => ({ text: "start of triage", trigger: "2", key: 1 })
    },

    "2": {
      type: "options",
      mapStateToProps: () => ({
        title: "do you have crona?",
        options: [
          { text: "re", trigger: "3" },
          { text: "ya chi", trigger: "4" }
        ],
        key: 2
      })
    },
    "3": {
      type: "default",
      mapStateToProps: () => ({
        text: "ooof fasele begir lotfan",
        key: 3,
        trigger: "5"
      })
    },
    "4": {
      type: "default",
      mapStateToProps: () => ({
        text: "khosh be halet",
        key: 4,
        trigger: "5"
      })
    },
    "5": {
      type: "options",
      mapStateToProps: () => ({
        options: [
          { text: "restart", trigger: "2" }
          // { text: "input text showcase", trigger: "6" }
        ],
        key: 5
      })
    },
    "6": {
      type: "text-input",
      mapStateToProps: () => ({
        onSubmit: ({ value }) => console.log("here", value),
        trigger: "5"
      })
    }
  }
};

export default memo(Chatbot);
