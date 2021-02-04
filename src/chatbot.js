/**
 * chat bot
 */

import PropTypes from "prop-types";
import React, { memo, useEffect, useState } from "react";

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

      return <div>{text}</div>;
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
            <div key={title + appHistory.length}>{option.text}</div>
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
    <div>
      {screen}
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
          setScreen((state) => [...state, <div>{textInputValue}</div>]);
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
