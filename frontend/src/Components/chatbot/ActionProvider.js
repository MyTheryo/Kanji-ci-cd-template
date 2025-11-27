import React, { useImperativeHandle, forwardRef, createContext } from "react";
import { useInitialJourneyMutation } from "@/Redux/features/AI/AIApi";
import ActionProviderContext from "./ActionProviderContext";
import { useSession } from "next-auth/react";

function formatAndDisplayData(apiResponse) {
  const parts = apiResponse.split("\n");
  return parts.map((part, index) => (
    <React.Fragment key={index}>
      {part}
      {index !== parts.length - 1 && <br />}
    </React.Fragment>
  ));
}

const ActionProvider = forwardRef(
  (
    {
      createChatBotMessage,
      setState,
      children,
      journeyCompleted,
      setJourneyCompleted,
      journeyCount,
      setJourneyCount,
    },
    ref
  ) => {
    const [initialJourney, { data, error }] = useInitialJourneyMutation();

    const handleInput = async (message) => {
      const loadingMessage = createChatBotMessage(
        <div className="chatbot-loader-container">
          <svg
            id="dots"
            width="50px"
            height="21px"
            viewBox="0 0 132 58"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g stroke="none" fill="none">
              <g id="chatbot-loader" fill="#fff">
                <circle
                  id="chatbot-loader-dot1"
                  cx="25"
                  cy="30"
                  r="13"
                ></circle>
                <circle
                  id="chatbot-loader-dot2"
                  cx="65"
                  cy="30"
                  r="13"
                ></circle>
                <circle
                  id="chatbot-loader-dot3"
                  cx="105"
                  cy="30"
                  r="13"
                ></circle>
              </g>
            </g>
          </svg>
        </div>,
        { widget: "loadingIndicator" }
      );
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, loadingMessage],
      }));

      let AIMessage = "";
      if (journeyCount < 12) {
        await initialJourney({ message })
          .unwrap()
          .then((response) => {
            AIMessage = createChatBotMessage(
              formatAndDisplayData(response.response.text)
            );
            if (response.response?.completed) {
              setJourneyCompleted(response.response.completed);
            }
            if (response.response?.journeyCount) {
              setJourneyCount(response.response.journeyCount);
            }
          })
          .catch((error) => {
            AIMessage = createChatBotMessage(
              "Something went wrong, try again later!"
            );
            console.log("error error: ", error);
          });
      } else {
        AIMessage = createChatBotMessage(
          "Congratulations! You have already completed your Initial Journey Successfully, Please click on the Dashboard button to explore more."
        );
      }

      setState((prev) => {
        const newMessages = prev.messages.filter(
          (msg) => msg !== loadingMessage
        ); // Remove the loading message
        return {
          ...prev,
          messages: [...newMessages, AIMessage], // Add the AI response
        };
      });
    };

    useImperativeHandle(ref, () => ({
      handleInput,
    }));

    return (
      <ActionProviderContext.Provider value={{ handleInput }}>
        <div>
          {React.Children.map(children, (child) => {
            return React.cloneElement(child, {
              actions: {
                handleInput,
              },
            });
          })}
        </div>
      </ActionProviderContext.Provider>
    );
  }
);

ActionProvider.displayName = "ActionProvider";

export default ActionProvider;
