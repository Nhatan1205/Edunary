import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AuthClient, AuthenticateModel } from "../web-api-client.ts";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router";

const useLogin = () => {
  const authClient = new AuthClient();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: async (userData) => {
      const model = new AuthenticateModel({
        email: userData.email,
        password: userData.password,
      });

      return await authClient.login(model);
    },
    onSuccess: (data) => {
      if (data && data.token) {
        // Store token and extract user info
        login(data.token);
        toast.success("Login successful! Welcome back!");
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    },
    onError: (error) => {
      const msg =
        error?.response ||
        error?.message ||
        "Login failed. Please check your credentials.";
      toast.error(msg);
    },
  });
};

export default useLogin;
