interface MessageBoxProps {
  message: string;
}

/**
 * The message box
 */
function InputBox(props: MessageBoxProps) {
  return (
    <div
      className="messageBox alert alert-primary ms-3"
      role="alert"
      aria-label={props.message}
    >
      <p>
        <b>Message</b>
      </p>
      {props.message}
    </div>
  );
}

export default InputBox;
