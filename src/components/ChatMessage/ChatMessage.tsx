import Button from "../Button/Button";
import type { ChatMessageProps } from "./ChatMessage.types";
import "./ChatMessage.css";

function ChatMessage({
  content,
  size = "medium",
  variant = "other",
  action,
  className = "",
}: Readonly<ChatMessageProps>) {
  return (
    <div
      className={`chat-message chat-message--${size} chat-message--${variant} ${className}`.trim()}
    >
      <p className="chat-message__content">{content}</p>
      {action && (
        <div className="chat-message__action">
          <Button
            title={action.label}
            icon={action.icon}
            variant="primary"
            size="sm"
            onClick={action.onClick}
          />
        </div>
      )}
    </div>
  );
}

export default ChatMessage;
