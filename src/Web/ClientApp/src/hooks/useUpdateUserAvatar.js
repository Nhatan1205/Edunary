import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { UserClient, UpdateUserAvatarCommand } from '../web-api-client.ts';
import queryClient from '../configs/reactQuery.js';

const useUpdateUserAvatar = () => {
  const userClient = new UserClient();

  return useMutation({
    mutationFn: async (base64ImageUrl) => {
      const command = new UpdateUserAvatarCommand({
        imageUrl: base64ImageUrl,
      });
      return await userClient.updateUserAvatar(command);
    },
    onSuccess: () => {
      toast.success('Avatar updated successfully!');
      queryClient.invalidateQueries(['userInfo']);
    },
    onError: (error) => {
      const msg =
        error?.response ||
        error?.message ||
        'Failed to update avatar. Please try again.';
      toast.error(msg);
    },
  });
};

export default useUpdateUserAvatar;
