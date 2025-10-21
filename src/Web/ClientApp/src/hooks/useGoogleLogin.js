import { useMutation } from "@tanstack/react-query";
import { AntiforgeryClient, AuthClient } from "../web-api-client.ts";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const useGoogleLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const authClient = new AuthClient();
  const antiforgeryClient = new AntiforgeryClient();
  const googleLoginMutation = useMutation({
    mutationFn: async (credential) => {
      return await authClient.loginWithSocialAccount(credential, "GOOGLE");
    },
    onSuccess: async (response) => {
      if (response && response.token) {
        login(response.token);
        toast.success("Login with Google successful!");

        //get antiforgery token
        await antiforgeryClient.getToken();
        navigate("/");
      } else {
        toast.error("Google login failed");
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      toast.error("Failed to login with Google. Please try again.");
    },
  });

  const handleGoogleLoginSuccess = (credentialResponse) => {
    if (credentialResponse?.credential) {
      googleLoginMutation.mutate(credentialResponse.credential);
    } else {
      toast.error("Google login failed");
    }
  };

  const handleGoogleLoginError = () => {
    toast.error("Google login failed");
  };
  // const handleGoogleLogin = () => {
  //   /* global google */
  //   google.accounts.id.initialize({
  //   client_id: Key.clientIdGoogle,
  //   callback: (response) => {
  //       if (response.credential) {
  //       googleLoginMutation.mutate(response.credential);
  //       } else {
  //       toast.error("Google login failed");
  //       }
  //     },
  //   });
  //   google.accounts.id.prompt();
  // };

  // useEffect(() => {
  //   if (!window.google) {
  //   const script = document.createElement("script");
  //   script.src = "https://accounts.google.com/gsi/client";
  //   script.async = true;
  //   script.defer = true;
  //   document.body.appendChild(script);
  //   }
  // }, []);

  return {
    // handleGoogleLogin,
    handleGoogleLoginSuccess,
    handleGoogleLoginError,
    isLoading: googleLoginMutation.isPending,
  };
};

export default useGoogleLogin;
