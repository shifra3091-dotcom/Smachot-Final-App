namespace SmachotMemories.Services.Interfaces
{
    public interface IGuestAccessService
    {
        Task RegisterSubmissionAsync(int eventId, string deviceId);
        Task<bool> HasGalleryAccessAsync(int eventId, string deviceId);
    }
}
