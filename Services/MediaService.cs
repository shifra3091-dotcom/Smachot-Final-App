using Microsoft.EntityFrameworkCore;
using SmachotMemories.Data;
using SmachotMemories.DTOs;
using SmachotMemories.Models;
using SmachotMemories.Models.Enums;
using SmachotMemories.Services.Interfaces;
using System.IO.Compression;
using ImageMagick;
using System.Diagnostics;

namespace SmachotMemories.Services
{
    public class MediaService : IMediaService 
    {
        private readonly SmachotContext _context;
        private readonly IWebHostEnvironment _env;

        public MediaService(SmachotContext db, IWebHostEnvironment env)
        {
            _context = db;
            _env = env;
        }

        public async Task<bool> CanUploadAsync(int eventId)
        {
            return await _context.Events
                .Where(e => e.EventId == eventId)
                .Select(e => e.IsActive)
                .FirstOrDefaultAsync();
        }

        public async Task<Media> UploadMediaAsync(UploadMediaDto dto)
        {
            // בדיקה: אירוע קיים ופעיל
            var ev = await _context.Events.FirstOrDefaultAsync(e => e.EventId == dto.EventId);
            if (ev == null)
                throw new InvalidOperationException("Event not found");

            // בדיקה: כל האלבומים שייכים לאאירוע
            if (dto.AlbumIds != null && dto.AlbumIds.Any())
            {
                var validAlbumCount = await _context.Albums
                    .CountAsync(a => dto.AlbumIds.Contains(a.AlbumId) && a.EventId == dto.EventId);
                if (validAlbumCount != dto.AlbumIds.Count)
                    throw new InvalidOperationException("One or more albums do not belong to this event");
            }

            // בדיקה: וידאו
            if (dto.MediaType == MediaTypeEnum.Video)
            {
                if (!dto.DurationSeconds.HasValue)
                    throw new InvalidOperationException("Video duration is required");

                if (dto.DurationSeconds > 30)
                    throw new InvalidOperationException("Video is too long");
            }

            // שמירת הקובץ ל-wwwroot/uploads
            var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");

            // יצירת תיקיית uploads אם לא קיימת
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // יצירת שם קובץ ייחודי
            string uniqueFileName;
            string fileUrl;
            if (dto.MediaType == MediaTypeEnum.Image)
            {
                uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileNameWithoutExtension(dto.File.FileName)}.webp";
                fileUrl = $"uploads/{uniqueFileName}";
            }
            else
            {
                uniqueFileName = $"{Guid.NewGuid()}_{dto.File.FileName}";
                fileUrl = $"uploads/{uniqueFileName}";
            }

            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            if (dto.MediaType == MediaTypeEnum.Video)
            {
                // Save the uploaded file temporarily
                var tempFilePath = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + Path.GetExtension(dto.File.FileName));
                using (var stream = new FileStream(tempFilePath, FileMode.Create, FileAccess.Write, FileShare.None))
                {
                    await dto.File.CopyToAsync(stream);
                }

                // Find FFmpeg executable
                string ffmpegPath = null;
                var possiblePaths = new[]
                {
                    Path.Combine(_env.ContentRootPath, "ffmpeg", "bin", "ffmpeg.exe"),
                    Path.Combine(_env.ContentRootPath, "ffmpeg-2026-01-07-git-af6a1dd0b2-essentials_build", "bin", "ffmpeg.exe"),
                    Path.Combine(_env.ContentRootPath, "ffmpeg", "ffmpeg-2026-01-07-git-af6a1dd0b2-essentials_build", "ffmpeg-2026-01-07-git-af6a1dd0b2-essentials_build", "bin", "ffmpeg.exe"),
                    "ffmpeg.exe" // Check system PATH
                };

                foreach (var path in possiblePaths)
                {
                    if (File.Exists(path) || path == "ffmpeg.exe")
                    {
                        ffmpegPath = path;
                        break;
                    }
                }

                if (string.IsNullOrEmpty(ffmpegPath))
                {
                    // Clean up temp file
                    if (File.Exists(tempFilePath)) File.Delete(tempFilePath);
                    throw new InvalidOperationException($"FFmpeg not found in any of the expected locations: {string.Join(", ", possiblePaths)}");
                }

                string processedFilePath = Path.Combine(_env.WebRootPath, "uploads", Guid.NewGuid() + ".mp4");

                var ffmpegArgs = $"-i \"{tempFilePath}\" " +
                                 $"-c:v libx264 " +
                                 $"-preset ultrafast " +
                                 $"-crf 23 " +
                                 $"-vf \"scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease,fps=30\" " +
                                 $"-b:v 5M " +
                                 $"-maxrate 6M " +
                                 $"-bufsize 12M " +
                                 $"-c:a aac " +
                                 $"-b:a 128k " +
                                 $"-movflags +faststart " +
                                 $"-map_metadata -1 " +
                                 $"-y " +
                                 $"\"{processedFilePath}\"";

                var process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = ffmpegPath,
                        Arguments = ffmpegArgs,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    }
                };

                try
                {
                    process.Start();

                    // Read output and error streams asynchronously
                    var outputTask = process.StandardOutput.ReadToEndAsync();
                    var errorTask = process.StandardError.ReadToEndAsync();

                    // Add timeout to prevent infinite waiting
                    var timeout = TimeSpan.FromMinutes(5);
                    var completedTask = await Task.WhenAny(process.WaitForExitAsync(), Task.Delay(timeout));
                    if (completedTask == Task.Delay(timeout))
                    {
                        process.Kill();
                        throw new TimeoutException("FFmpeg process timed out.");
                    }

                    // Check exit code
                    if (process.ExitCode != 0)
                    {
                        string error = await errorTask;
                        throw new InvalidOperationException($"FFmpeg processing failed: {error}");
                    }

                    // Introduce a small delay to ensure file lock is released
                    await Task.Delay(500);

                    // Update fileUrl to point to processed video
                    fileUrl = $"uploads/{Path.GetFileName(processedFilePath)}";
                    filePath = processedFilePath;
                }
                finally
                {
                    // Clean up temporary file
                    if (File.Exists(tempFilePath))
                    {
                        try { File.Delete(tempFilePath); }
                        catch { /* Log but continue */ }
                    }
                }
            }
            else if (dto.MediaType == MediaTypeEnum.Image)
            {
                // עיבוד התמונה באמצעות Magick.NET
                using (var stream = dto.File.OpenReadStream())
                using (var image = new MagickImage(stream))
                {
                    // המרה לפורמט WebP
                    image.Format = MagickFormat.WebP;

                    // שינוי גודל התמונה (שמור על יחס ההיבטים, רוחב מקסימלי: 2000–2500 פיקסלים)
                    if (image.Width > 2500)
                    {
                        image.Resize(2500, 0);
                    }
                    else if (image.Width > 2000)
                    {
                        image.Resize(2000, 0);
                    }

                    // הגדרת איכות הדחיסה
                    image.Quality = 85;

                    // הסרת מטא-נתונים (EXIF)
                    image.Strip();

                    // שמירת התמונה המעובדת לדיסק
                    image.Write(filePath);
                }
            }
            else
            {
                // שמירת הקובץ ישירות עבור סוגי מדיה שאינם תמונה
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.File.CopyToAsync(stream);
                }
            }

            var media = new Media
            {
                EventId = dto.EventId,
                MediaType = dto.MediaType,
                FileUrl = fileUrl,
                IsPublic = dto.IsPublic,
                GuestName = dto.GuestName,
                DurationSeconds = dto.DurationSeconds,
                UploadedAt = DateTime.Now
            };

            // Add albums if specified
            if (dto.AlbumIds != null && dto.AlbumIds.Any())
            {
                var albums = await _context.Albums
                    .Where(a => dto.AlbumIds.Contains(a.AlbumId))
                    .ToListAsync();

                foreach (var album in albums)
                {
                    media.Albums.Add(album);
                }
            }

            _context.Medias.Add(media);
            await _context.SaveChangesAsync();

            return media;
        }

        public async Task<List<Media>> GetPublicMediaForEventAsync(int eventId)
        {
            return await _context.Medias
                .Include(m => m.Albums)
                .Where(m => m.EventId == eventId && m.IsPublic)
                .OrderByDescending(m => m.UploadedAt)
                .ToListAsync();
        }

        public async Task<List<Media>> GetAllMediaForEventAsync(int eventId)
        {
            return await _context.Medias
                .Include(m => m.Albums)
                .Where(m => m.EventId == eventId)
                .OrderByDescending(m => m.UploadedAt)
                .ToListAsync();
        }
     

public async Task<List<SmachotMemories.DTOs.AlbumMediaGroupDto>> GetMediaGroupedByAlbumAsync(int eventId, bool onlyPublic = false, bool includeUnassigned = true)
        {
            var mediaQuery = _context.Medias
                .Include(m => m.Albums)
                .Where(m => m.EventId == eventId);

            if (onlyPublic)
                mediaQuery = mediaQuery.Where(m => m.IsPublic);

            var mediaList = await mediaQuery
                .OrderByDescending(m => m.UploadedAt)
                .ToListAsync();

            var albums = await _context.Albums
                .Where(a => a.EventId == eventId)
                .OrderBy(a => a.Name)
                .ToListAsync();

            var result = new List<SmachotMemories.DTOs.AlbumMediaGroupDto>();

            // helper to map entity -> DTO
            static MediaDto MapToDto(Media m) => new MediaDto
            {
                MediaId = m.MediaId,
                EventId = m.EventId,
                MediaType = m.MediaType.ToString(),
                FileUrl = m.FileUrl,
                IsPublic = m.IsPublic,
                GuestName = m.GuestName,
                DurationSeconds = m.DurationSeconds,
                UploadedAt = m.UploadedAt
            };

            foreach (var album in albums)
            {
                var items = mediaList
                    .Where(m => m.Albums != null && m.Albums.Any(a => a.AlbumId == album.AlbumId))
                    .Select(MapToDto)
                    .ToList();

                result.Add(new AlbumMediaGroupDto
                {
                    AlbumId = album.AlbumId,
                    AlbumName = album.Name,
                    MediaItems = items
                });
            }


            return result;
        }

        public async Task<bool> AddMediaToAlbumAsync(int mediaId, int albumId)
        {
            var media = await _context.Medias
                .Include(m => m.Albums)
                .FirstOrDefaultAsync(m => m.MediaId == mediaId);
            
            if (media == null)
                return false;

            var album = await _context.Albums
                .FirstOrDefaultAsync(a => a.AlbumId == albumId && a.EventId == media.EventId);

            if (album == null)
                return false;

            // Check if already in album
            if (media.Albums.Any(a => a.AlbumId == albumId))
                return true;

            media.Albums.Add(album);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveMediaFromAlbumAsync(int mediaId, int albumId)
        {
            var media = await _context.Medias
                .Include(m => m.Albums)
                .FirstOrDefaultAsync(m => m.MediaId == mediaId);

            if (media == null)
                return false;

            var album = media.Albums.FirstOrDefault(a => a.AlbumId == albumId);
            if (album == null)
                return true; // Already not in album

            media.Albums.Remove(album);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetMediaAlbumsAsync(int mediaId, List<int> albumIds)
        {
            var media = await _context.Medias
                .Include(m => m.Albums)
                .FirstOrDefaultAsync(m => m.MediaId == mediaId);

            if (media == null)
                return false;

            // Validate all albums belong to the same event
            if (albumIds.Any())
            {
                var validAlbums = await _context.Albums
                    .Where(a => albumIds.Contains(a.AlbumId) && a.EventId == media.EventId)
                    .ToListAsync();

                if (validAlbums.Count != albumIds.Count)
                    return false;

                // Clear existing and add new
                media.Albums.Clear();
                foreach (var album in validAlbums)
                {
                    media.Albums.Add(album);
                }
            }
            else
            {
                // Clear all albums
                media.Albums.Clear();
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<(byte[] zipBytes, string fileName)?> CreateMediaZipAsync(int eventId, int? albumId = null, bool updateDownloadStatus = true)
        {
            // Get the event for naming and status update
            var eventEntity = await _context.Events.FirstOrDefaultAsync(e => e.EventId == eventId);
            if (eventEntity == null)
                return null;

            // Get media items
            List<Media> mediaItems;
            string zipFileName;
            bool isFullDownload;

            if (albumId.HasValue)
            {
                var album = await _context.Albums.FirstOrDefaultAsync(a => a.AlbumId == albumId.Value && a.EventId == eventId);
                if (album == null)
                    return null;

                mediaItems = await _context.Medias
                    .Include(m => m.Albums)
                    .Where(m => m.EventId == eventId && m.Albums.Any(a => a.AlbumId == albumId.Value))
                    .ToListAsync();

                zipFileName = $"{eventEntity.EventName}_{album.Name}_Media.zip";
                isFullDownload = false; // Album download is partial
            }
            else
            {
                mediaItems = await _context.Medias
                    .Where(m => m.EventId == eventId)
                    .ToListAsync();

                zipFileName = $"{eventEntity.EventName}_AllMedia.zip";
                isFullDownload = true; // All media download is full
            }

            if (!mediaItems.Any())
                return null;

            // Sanitize filename
            zipFileName = string.Join("_", zipFileName.Split(Path.GetInvalidFileNameChars()));

            using var memoryStream = new MemoryStream();
            using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
            {
                int fileIndex = 1;
                foreach (var media in mediaItems)
                {
                    var filePath = Path.Combine(_env.WebRootPath, media.FileUrl.Replace("/", Path.DirectorySeparatorChar.ToString()));
                    
                    if (!System.IO.File.Exists(filePath))
                        continue;

                    // Get original extension
                    var extension = Path.GetExtension(filePath);
                    
                    // Create a meaningful name with guest name if available
                    var prefix = media.MediaType == MediaTypeEnum.Image ? "Photo" : "Video";
                    var guestPart = !string.IsNullOrEmpty(media.GuestName) ? $"_{media.GuestName}" : "";
                    var entryName = $"{prefix}_{fileIndex:D4}{guestPart}{extension}";
                    
                    // Sanitize entry name
                    entryName = string.Join("_", entryName.Split(Path.GetInvalidFileNameChars()));

                    var entry = archive.CreateEntry(entryName, CompressionLevel.Optimal);
                    using var entryStream = entry.Open();
                    using var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                    await fileStream.CopyToAsync(entryStream);
                    
                    fileIndex++;
                }
            }

            // Update download status if requested
            if (updateDownloadStatus)
            {
                if (isFullDownload)
                {
                    // Full download - mark as fully downloaded
                    eventEntity.DownloadStatus = DownloadStatusEnum.FullyDownloaded;
                }
                else
                {
                    // Partial download (album) - only update if not already fully downloaded
                    if (eventEntity.DownloadStatus != DownloadStatusEnum.FullyDownloaded)
                    {
                        eventEntity.DownloadStatus = DownloadStatusEnum.PartiallyDownloaded;
                    }
                }
                eventEntity.LastDownloadedAt = DateTime.Now;
                await _context.SaveChangesAsync();
            }

            memoryStream.Position = 0;
            return (memoryStream.ToArray(), zipFileName);
        }

        public async Task<bool> DeleteMediaAsync(int mediaId)
        {
            var media = await _context.Medias
                .Include(m => m.Albums)
                .FirstOrDefaultAsync(m => m.MediaId == mediaId);

            if (media == null)
                return false;

            // Delete the physical file
            if (!string.IsNullOrEmpty(media.FileUrl))
            {
                var filePath = Path.Combine(_env.WebRootPath, media.FileUrl.Replace("/", Path.DirectorySeparatorChar.ToString()));
                if (File.Exists(filePath))
                {
                    try
                    {
                        File.Delete(filePath);
                    }
                    catch
                    {
                        // Log error but continue with database deletion
                    }
                }
            }

            // Remove from all albums
            media.Albums.Clear();

            // Remove from database
            _context.Medias.Remove(media);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
