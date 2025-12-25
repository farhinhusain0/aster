import Typography from "./Typography";

interface ContentProps {
  children: React.ReactNode;
}

interface RootProps {
  children: React.ReactNode;
}

interface FooterProps {
  children: React.ReactNode;
}
interface HeaderProps {
  children: React.ReactNode;
}

function Root({ children }: RootProps) {
  return (
    <div className="rounded-xl bg-primary border border-secondary shadow-xs">
      {children}
    </div>
  );
}

function Content({ children }: ContentProps) {
  return <div className="flex flex-col p-6 gap-6">{children}</div>;
}

function Header({ children }: HeaderProps) {
  return (
    <div className="flex flex-row gap-0 w-full bg-secondary rounded-xl rounded-b-none border-b border-secondary">
      <div className="flex-1 px-6 py-3  border-secondary">
        <Typography variant="xs/semibold" className="text-quaternary">
          {children}
        </Typography>
      </div>
    </div>
  );
}

function Footer({ children }: FooterProps) {
  return (
    <div className="flex flex-row justify-end px-6 py-4 gap-2 border-t border-secondary">
      {children}
    </div>
  );
}

const ContentContainerCard = Root as typeof Root & {
  Header: typeof Header;
  Content: typeof Content;
  Footer: typeof Footer;
};
ContentContainerCard.Content = Content;
ContentContainerCard.Footer = Footer;
ContentContainerCard.Header = Header;

export default ContentContainerCard;
