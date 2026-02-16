namespace SmachotMemories.DTOs.Auth
{
    public class AuthResultDto
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public UserInfoDto? User { get; set; }
    }
}
