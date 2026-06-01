using System.Threading.Tasks;

namespace Edunary.Application.Common.Interfaces;

public interface IMessagingHubService
{
    Task SendMessageToGroupAsync(int conversationId, string eventName, object messageData);
}
