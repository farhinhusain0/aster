import { Toaster as ToasterBase, ToastBar } from "react-hot-toast";
import Typography from "./Typography";
import { CloseButton } from "../base/buttons/close-button";
import toast from "react-hot-toast";
import { LoadingIndicator } from "../application/loading-indicator/loading-indicator";
import { FeaturedIcon } from "../foundations/featured-icon/featured-icon";
import { AlertCircle, CheckCircle } from "@untitledui/icons";

function IconWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[35px] w-[35px] flex items-center justify-center">
      {children}
    </div>
  );
}

function SuccessIcon() {
  return (
    <IconWrapper>
      <FeaturedIcon
        theme="outline"
        color="success"
        icon={CheckCircle}
        size="md"
      />
    </IconWrapper>
  );
}

function ErrorIcon() {
  return (
    <IconWrapper>
      <FeaturedIcon
        theme="outline"
        color="error"
        icon={AlertCircle}
        size="md"
      />
    </IconWrapper>
  );
}

function LoadingIcon() {
  return (
    <IconWrapper>
      <LoadingIndicator type="line-simple" size="toast" />
    </IconWrapper>
  );
}

const ICON_VS_TYPE = {
  loading: LoadingIcon,
  success: SuccessIcon,
  error: ErrorIcon,
};

export default function Toaster() {
  return (
    <ToasterBase
      toastOptions={{
        style: {
          maxWidth: 500,
        },
      }}
    >
      {(t) => {
        const Icon = ICON_VS_TYPE[t.type as keyof typeof ICON_VS_TYPE];
        return (
          <ToastBar
            style={{
              border: "none",
              backgroundColor: "transparent",
              boxShadow: "none",
              padding: "0",
            }}
            toast={t}
          >
            {() => (
              <div className="flex flex-row items-center justify-between bg-white pr-2 p-[8.5px] border border-secondary shadow-xs rounded-lg gap-[8.5px]">
                <div className="flex flex-row items-center gap-[8.5px]">
                  <Icon />

                  <Typography variant="sm/semibold">
                    {t.message as string}
                  </Typography>
                </div>
                {t.type !== "loading" && (
                  <CloseButton onClick={() => toast.dismiss(t.id)} size="sm" />
                )}
              </div>
            )}
          </ToastBar>
        );
      }}
    </ToasterBase>
  );
}
