import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { UserClient, UpdateUserInfoCommand, UserLinksDto } from '../web-api-client.ts';
import queryClient from '../configs/reactQuery.js';

const useUpdateUserInfo = () => {
  const userClient = new UserClient();

  return useMutation({
    mutationFn: async (formData) => {
      const command = new UpdateUserInfoCommand({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        headline: formData.headline,
        description: formData.biography,
        links: new UserLinksDto(formData.links),
      });
      return await userClient.updateUserInfo(command);
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries(['userInfo']);
    },
    onError: (error) => {
      const msg =
        error?.response ||
        error?.message ||
        'Failed to update profile. Please try again.';
      toast.error(msg);
    },
  });
};

export default useUpdateUserInfo;
