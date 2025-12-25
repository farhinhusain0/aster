import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/auth";
import logoCat from "../../assets/logo-cat.png";
import * as paths from "../../routes/paths";
import { Tabs } from "@/components/application/tabs/tabs";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import FormHint from "@/components/common/FormHint";
import useDocumentTitle from "@/hooks/documentTitle";

const TABS = [
  { id: "signup", label: "Sign up", href: paths.SIGNUP_PATH },
  { id: "login", label: "Log in", href: paths.LOGIN_PATH },
];

const LoginPage = () => {
  useDocumentTitle('Log in | Aster');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);
      navigate(paths.HOME_PATH, { replace: true });
    } catch (err: any) {
      console.error(err.response.data);
      setError(
        err?.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    }
  };

  const handleInputChange = (value: string, type: "email" | "password") => {
    setError(null);
    if (type === "email") {
      setEmail(value);
    } else {
      setPassword(value);
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center w-full flex-col gap-4 p-4">
        <img className="w-20 h-auto" src={logoCat} alt="Logo" />
        <div className="w-full max-w-auth-container">
          <div className="flex flex-col">
            <div className="text-3xl font-semibold text-center">
              Log in to Aster
            </div>

            <Tabs selectedKey={"login"} className="w-full mt-6">
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
                    placeholder="Enter your password..."
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
                isDisabled={isLoading || !email || !password}
              >
                Log in
              </Button>
            </form>
            <div className="flex justify-center items-center mt-4">
              <Button color="link-color" href={paths.FORGOT_PASSWORD_PATH}>
                Forgot password?
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { LoginPage };
