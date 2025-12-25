import { Avatar, Box, Typography } from "@mui/joy";
import { ChatMessage } from "../../types/chat";
import LogoImage from "../../assets/logo-cat.png";
import Markdown from "react-markdown";
import { useMe } from "../../api/queries/auth";

interface Props {
  message: ChatMessage;
}

const getInitials = (text: string) => {
  const words = text.split(" ");
  const firstWord = words[0];
  const lastWord = words[words.length - 1];
  return `${firstWord[0].toUpperCase()}${lastWord[0].toUpperCase()}`;
};

export function Message({ message }: Props) {
  const { data: { profile: { name = "" } = {} } = {} } = useMe();

  const text = message.content as string;
  const role = message.role;
  const isBot = role === "assistant";

  return (
    <Box display="flex" py={4} width="100%">
      <Avatar size="sm" src={isBot ? LogoImage : undefined} sx={{ mr: 2 }}>
        {name ? getInitials(name!) : "You"}
      </Avatar>
      <Box display="flex" flexDirection="column">
        <Typography level="title-md">{isBot ? "Aster" : "You"}</Typography>
        {!isBot ? (
          <Typography level="body-md">{text}</Typography>
        ) : (
          <div style={{ marginTop: "-15px" }}>
            <Markdown
              children={text}
              //   components={{
              //     code(props) {
              //       const { children, className, ...rest } = props;
              //       //   const match = /language-(\w+)/.exec(className || "");

              //       const lines = children?.toString().split("\n");
              //       const code = lines?.slice(1, lines.length - 2).join("\n");
              //       const language = children?.toString().slice(3).split("\n")[0];
              //       return language ? (
              //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //         // @ts-ignore
              //         <SyntaxHighlighter
              //           {...rest}
              //           PreTag="div"
              //           children={code as string}
              //           language={language}
              //           style={dark}
              //         />
              //       ) : (
              //         <code {...rest} className={className}>
              //           {children}
              //         </code>
              //       );
              //     },
              //   }}
            />
          </div>
        )}
      </Box>
    </Box>
  );
}
