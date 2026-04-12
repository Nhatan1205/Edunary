import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  AuthClient,
  AuthenticateModel,
} from "../../web-api-client.ts";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router";
import queryClient from "../../configs/reactQuery.js";
import { tokenService } from "../../utils/tokenService.js";

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
        queryClient.invalidateQueries(["userInfo"]);
        
        // Check if user is admin
        const isAdmin = tokenService.isAdmin();
        if (isAdmin) {
          navigate("/admin/dashboard", { replace: true });
        } else {
          const from = location.state?.from?.pathname || "/";
          navigate(from, { replace: true });
        }
      }
    },
    onError: (error) => {
      const data = JSON.parse(error.response);
      const msg =
        data?.errorMessage ||
        error?.message ||
        "Login failed. Please check your credentials.";
      toast.error(msg);
    },
  });
};

export default useLogin;
