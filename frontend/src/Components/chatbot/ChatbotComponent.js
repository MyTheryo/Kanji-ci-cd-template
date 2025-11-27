import React, { useRef, useEffect, useState, useCallback } from "react";
import Chatbot, {
  createChatBotMessage,
  createClientMessage,
} from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import config from "./config.js";
import MessageParser from "./MessageParser.js";
import ActionProvider from "./ActionProvider.js";
import { useGetConversationMutation } from "@/Redux/features/AI/AIApi";
// import { FaSpinner } from "react-icons/fa6";
import Loader from "../Loader.jsx";
import "@/app/patient-journey/patient-journey.css";

function formatAndDisplayData(apiResponse) {
  const parts = apiResponse.split("\n");
  return parts.map((part, index) => (
    <React.Fragment key={index}>
      {part}
      {index !== parts.length - 1 && <br />}
    </React.Fragment>
  ));
}

const ChatbotComponent = ({
  journeyCompleted,
  setJourneyCompleted,
  journeyCount,
  setJourneyCount,
}) => {
  const [getConversation, { data, error, isSuccess, isLoading }] =
    useGetConversationMutation();
  const [mappedMessages, setMappedMessages] = useState([]); // Initialize with initial messages
  const actionProviderRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      const response = await getConversation();
      if (response.data) {
        processChatHistory(response.data);
      } else {
        const messages = [
          `Hello, I'm Theryo AI Assistant, here to provide support and resources for your mental well-being. Everything we discuss is confidential and protected.`,
          `While I can offer guidance and coping strategies, I'm not a replacement for professional mental health care. If you're experiencing a crisis, please contact emergency services or a crisis helpline immediately.`,
          `By continuing, you agree to our terms of service.`,
          `You can start the journey by typing or clicking the "Let's Go" button below.`,
          `Once you click, I'll ask about how you're feeling today and what brings you here. Are you ready to begin?`,
        ];

        const botMessages = messages.map((text, index) =>
          createChatBotMessage(text, {
            widget: index === 3 ? "customButton" : null, // Attach the button widget only to the relevant message
            withAvatar: true,
            delay: 500 * index,
          })
        );

        setMappedMessages(botMessages);
      }
    };

    fetch();
  }, []);

  const processChatHistory = async (chatHistory) => {
    const mapped = await mapChatHistory(
      chatHistory,
      createChatBotMessage,
      createClientMessage
    );
    setMappedMessages(mapped);
  };

  const mapChatHistory = async (
    chatHistory,
    createChatBotMessage,
    createClientMessage
  ) => {
    return chatHistory
      .map((message) => {
        const content = message.data.content;
        if (message.type === "ai") {
          return createChatBotMessage(formatAndDisplayData(content));
        } else if (message.type === "human") {
          return createClientMessage(formatAndDisplayData(content));
        } else {
          console.warn("Unknown message type:", message.type);
          return null;
        }
      })
      .filter(Boolean);
  };

  const setRef = useCallback((node) => {
    if (node !== null) {
      actionProviderRef.current = node;
    }
  }, []);

  // useEffect(() => {
  //   if (mappedMessages.length === 0) {
  //     const messages = [
  //       `Hello, I'm Theryo AI Assistant, here to provide support and resources for your mental well-being. Everything we discuss is confidential and protected.`,
  //       `While I can offer guidance and coping strategies, I'm not a replacement for professional mental health care. If you're experiencing a crisis, please contact emergency services or a crisis helpline immediately.`,
  //       `By continuing, you agree to our terms of service.`,
  //       `You can start the journey by typing or clicking the "Let's Go" button below.`,
  //       `Once you click, I'll ask about how you're feeling today and what brings you here. Are you ready to begin?`,
  //     ];

  //     const botMessages = messages.map((text, index) =>
  //       createChatBotMessage(text, {
  //         widget: index === 3 ? "customButton" : null, // Attach the button widget only to the relevant message
  //         withAvatar: true,
  //         delay: 500 * index,
  //       })
  //     );

  //     setMappedMessages(botMessages);
  //   }
  // }, [mappedMessages.length]);

  return isLoading ? (
    <Loader />
  ) : (
    <Chatbot
      config={config}
      messageParser={MessageParser}
      actionProvider={(props) => (
        <ActionProvider
          {...props}
          journeyCompleted={journeyCompleted}
          setJourneyCompleted={setJourneyCompleted}
          journeyCount={journeyCount}
          setJourneyCount={setJourneyCount}
          ref={setRef}
        />
      )}
      messageHistory={mappedMessages}
      disabled={true}
    />
  );
};

export default ChatbotComponent;
