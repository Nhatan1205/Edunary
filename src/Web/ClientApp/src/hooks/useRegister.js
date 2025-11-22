 import { useMutation } from '@tanstack/react-query';
 import { toast } from 'react-toastify';
 import { AuthClient, AuthenticateModel } from '../web-api-client.ts';
 import { useNavigate } from "react-router";

 const useRegister = () => {
   const authClient = new AuthClient();
   const navigate = useNavigate();
   return useMutation({
     mutationFn: async (userData) => {
       const model = new AuthenticateModel({
         email: userData.email,
         password: userData.password,
         fullName: userData.fullName,
         phoneNumber: userData.phone
       });
      
       return await authClient.register(model);
     },
     onSuccess: () => {
       toast.success('Registration successful!');
       setTimeout(() => {
         navigate('/login');
       }, 2000);
     },
     onError: (error) => {
      const data = JSON.parse(error.response); 
      const msg = data?.message || 'Registration failed. Please try again.'
      toast.error(msg);
     }
   });
 };

 export default useRegister;