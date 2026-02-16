namespace SmachotMemories.Services.Interfaces
{
    public interface IQRCodeService
    {
        byte[] GenerateQRCode(string url);
        string GenerateEventUrl(string venueId, int eventId);
        string GenerateEventUrl(int eventUniqueCode);
        string GenerateHallUrl(int eventUniqueCode);
    }
}
