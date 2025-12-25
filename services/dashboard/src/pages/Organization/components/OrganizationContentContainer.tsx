import Typography from "@/components/common/Typography";

interface OrganizationContentContainerProps {
  children: React.ReactNode;
  title: string | React.ReactNode;
}

export default function OrganizationContentContainer({
  children,
  title,
}: OrganizationContentContainerProps) {
  return (
    <div className="px-4">
      <div className="flex flex-col gap-6 max-w-organization-content w-192 gap-5 mx-auto">
        {typeof title === "string" ? (
          <Typography variant="xl/semibold" className="text-primary">
            {title}
          </Typography>
        ) : (
          title
        )}
        {children}
      </div>
    </div>
  );
}
