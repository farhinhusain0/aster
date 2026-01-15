import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/auth";
import logoCat from "@/assets/logo-cat.png";
import * as paths from "@/routes/paths";
import { Tabs } from "@/components/application/tabs/tabs";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { validatePassword } from "@/utils/validators";
import FormHint from "@/components/common/FormHint";
import useDocumentTitle from "@/hooks/documentTitle";

const TABS = [
  { id: "signup", label: "Sign up", href: paths.SIGNUP_PATH },
  { id: "login", label: "Log in", href: paths.LOGIN_PATH },
];

const SignupPage = () => {
  useDocumentTitle('Sign up | Aster');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const data = await register(email, password, name);
      // check if data contains redirect url
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      navigate(paths.REGISTRATION_EMAIL_VERIFICATION_PATH, {
        state: {
          email,
          password,
          name,
        },
      });
    } catch (err: any) {
      console.error(err.response.data);
      if (err?.response?.data?.message === "Organization not found") {
        navigate(paths.REQUEST_ACCESS_PATH, {
          state: {
            email,
          },
        });
        return;
      }
      setError(
        err?.response?.data?.message || "Signup failed. Please try again.",
      );
    }
  };

  const handleInputChange = (
    value: string,
    type: "email" | "password" | "name",
  ) => {
    setError(null);
    if (type === "email") {
      setEmail(value);
    } else if (type === "password") {
      if (value.length > 0) {
        const error = validatePassword(value);
        setError(error.error);
      }
      setPassword(value);
    } else if (type === "name") {
      setName(value);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center w-full flex-col gap-4 p-4">
      <img className="w-20 h-auto" src={logoCat} alt="Logo" />
      <div className="w-full max-w-auth-container">
        <div className="flex flex-col">
          <div className="text-3xl font-semibold text-center">
            Create an account
          </div>

          <Tabs selectedKey={"signup"} className="w-full mt-6">
            <Tabs.List type="button-minimal" items={TABS} className="w-full">
              {(tab) => (
                <Tabs.Item {...tab} className="w-full">
                  {tab.label}
                </Tabs.Item>
              )}
            </Tabs.List>
          </Tabs>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="relative flex flex-col gap-5">
              <Input
                label="Name"
                value={name}
                {...(error && { isInvalid: true })}
                onChange={(value) => handleInputChange(value, "name")}
                placeholder="Enter your name..."
              />

              <Input
                label="Email"
                value={email}
                {...(error && { isInvalid: true })}
                onChange={(value) => handleInputChange(value, "email")}
                placeholder="Enter your email address..."
              />
              <div>
                <Input
                  label="Password"
                  type="password"
                  {...(error && { isInvalid: true })}
                  value={password}
                  onChange={(value) => handleInputChange(value, "password")}
                  placeholder="Create a password..."
                />

                <FormHint
                  open={Boolean(error)}
                  size="sm"
                  color="error"
                  className="mt-2"
                >
                  {error}
                </FormHint>
              </div>
            </div>
            <Button
              type="submit"
              color="primary"
              size="lg"
              className="mt-8 w-full"
              isDisabled={isLoading || !email || !password || Boolean(error)}
            >
              Sign up
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export { SignupPage };
