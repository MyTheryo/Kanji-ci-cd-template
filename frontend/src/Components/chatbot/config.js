import { createChatBotMessage } from "react-chatbot-kit";
import CustomButton from './CustomButton';

const botName = "AI Persona";

const config = {
  initialMessages: [
    createChatBotMessage('Hello, how can I assist you today?', {
      widget: "customButton",
      withAvatar: true,
      delay: 500,
    }),
  ],
  botName: botName,
  customComponents: {
    header: () => (
      <div className="chatbot-header">
        <div className="bot-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48px" height="48px" viewBox="0 0 48 48">
            <path fill="none" stroke="#6ac16b" strokeLinecap="round" strokeLinejoin="round" d="M10.187 16.413c.936-3.419 8.926-8.746 14.288-6.586c0 0 4.787 12.021 5.255 14.756s-.159 6.227-5.028 7.739s-7.28-.252-8.469-3.636s-6.046-12.273-6.046-12.273" />
            <circle cx="7.451" cy="8.999" r="2.951" fill="none" stroke="#6ac16b" strokeLinecap="round" strokeLinejoin="round" />
            <path fill="none" stroke="#6ac16b" strokeLinecap="round" strokeLinejoin="round" d="M15.048 11.379c-1.622-1.444-4.697-1.837-4.697-1.837" />
            <circle cx="36.857" cy="19.005" r="4.031" fill="none" stroke="#6ac16b" strokeLinecap="round" strokeLinejoin="round" />
            <path fill="none" stroke="#6ac16b" strokeLinecap="round" strokeLinejoin="round" d="M34.171 22.008c-.267.986-.098 1.892.67 2.27c1.032.51 1.732.288 2.38-1.26m-4.31-4.841c-.75-.346-1.582-1.292-1.142-2.384s5.088-5.495 8.756-1.321c.797.907.472 3.105.277 3.705" />
            <path fill="none" stroke="#6ac16b" strokeLinecap="round" strokeLinejoin="round" d="m36.762 23.881l1.303.179h0c1.373 3.423 2.314 9.999-1.818 11.623c-.837.33-1.13 1.72-.803 2.642c.387 1.091 1.12 1.594 1.902 1.542c2.51-.164 6.51-5.093 6.129-10.059s-2.177-7.312-2.177-7.312c.106-1.628-.471-2.795-.471-2.795" />
            <path fill="none" stroke="#6ac16b" strokeLinecap="round" strokeLinejoin="round" d="m36.176 35.718l-.22-.965a1.47 1.47 0 0 0-1.72-1.114l-7.74 1.535m-3.217.638l-8.96 1.777a1.47 1.47 0 0 0-1.163 1.692l.462 2.671h23.984l-.476-2.08" />
            <path fill="none" stroke="#6ac16b" strokeLinecap="round" strokeLinejoin="round" d="m22.647 32.867l.621 2.917c.085.469.874.719 1.763.559s1.541-.67 1.457-1.138l-.74-3.265" />
            <ellipse cx="18.261" cy="17.892" fill="none" stroke="#6ac16b" strokeLinecap="round" strokeLinejoin="round" rx="1.583" ry="2.099" transform="rotate(-25.6 18.26 17.892)" />
            <ellipse cx="22.042" cy="16.237" fill="none" stroke="#6ac16b" strokeLinecap="round" strokeLinejoin="round" rx="1.414" ry="1.875" transform="rotate(-25.6 22.042 16.237)" />
            <path fill="none" stroke="#6ac16b" strokeLinecap="round" strokeLinejoin="round" d="M29.007 22.008c-2.372 5.846-7.364 7.136-13.049 5.955c2.303 3.143 4.42 3.95 8.951 2.198c4.531-1.751 4.45-4.662 4.098-8.153M18.41 18.202l-.298-.619m4.043-1.119l-.225-.453" />
          </svg>
        </div>
        <div className="bot-info">
          <h2 className="bot-name">Theryo AI</h2>
          <p className="bot-description">Your Health Guide</p>
        </div>
      </div>
    ),
    botAvatar: () => (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#082C53',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        marginRight: '12.5px',
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
          <path fill="#ffffff" d="M16 19a6.99 6.99 0 0 1-5.833-3.129l1.666-1.107a5 5 0 0 0 8.334 0l1.666 1.107A6.99 6.99 0 0 1 16 19m4-11a2 2 0 1 0 2 2a1.98 1.98 0 0 0-2-2m-8 0a2 2 0 1 0 2 2a1.98 1.98 0 0 0-2-2" />
          <path fill="#ffffff" d="M17.736 30L16 29l4-7h6a1.997 1.997 0 0 0 2-2V6a1.997 1.997 0 0 0-2-2H6a1.997 1.997 0 0 0-2 2v14a1.997 1.997 0 0 0 2 2h9v2H6a4 4 0 0 1-4-4V6a3.999 3.999 0 0 1 4-4h20a3.999 3.999 0 0 1 4 4v14a4 4 0 0 1-4 4h-4.835Z" />
        </svg>
      </div>
    ),
  },
  widgets: [
    {
      widgetName: "customButton",
      widgetFunc: (props) => <CustomButton {...props} />,
      mapStateToProps: ["handleInput"],
    },
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: '#082C53',
    },
    userMessageBox: {
      backgroundColor: '#6AC16B',
    },
    chatButton: {
      backgroundColor: '#6AC16B',
    },
  },
};

export default config;
