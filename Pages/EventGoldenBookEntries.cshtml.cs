using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SmachotMemories.Models;
using SmachotMemories.Services.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QuestPDF.Drawing;
using Microsoft.AspNetCore.Hosting;

namespace SmachotMemories.Pages
{
    public class EventGoldenBookEntriesModel : PageModel
    {
        private readonly IGoldenBookService _goldenBookService;
        private readonly IEventService _eventService;
        private readonly IWebHostEnvironment _environment;
        private static bool _fontRegistered = false;
        private static readonly object _fontLock = new object();

        public EventGoldenBookEntriesModel(IGoldenBookService goldenBookService, IEventService eventService, IWebHostEnvironment environment)
        {
            _goldenBookService = goldenBookService;
            _eventService = eventService;
            _environment = environment;
            
            QuestPDF.Settings.License = LicenseType.Community;
            
            if (!_fontRegistered)
            {
                lock (_fontLock)
                {
                    if (!_fontRegistered)
                    {
                        try
                        {
                            var fontPath = Path.Combine(_environment.WebRootPath, "fonts", "arial.ttf");
                            if (System.IO.File.Exists(fontPath))
                            {
                                var fontBytes = System.IO.File.ReadAllBytes(fontPath);
                                FontManager.RegisterFont(new MemoryStream(fontBytes));
                                _fontRegistered = true;
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Font registration failed: {ex.Message}");
                        }
                    }
                }
            }
        }

        [BindProperty(SupportsGet = true)]
        public int EventId { get; set; }

        public string EventName { get; set; } = string.Empty;
        public List<GoldenBookEntry> Entries { get; set; } = new();

        public async Task<IActionResult> OnGetAsync()
        {
            var eventDto = await _eventService.GetEventByIdAsync(EventId);
            if (eventDto == null)
            {
                return NotFound();
            }

            EventName = eventDto.EventName;
            Entries = await _goldenBookService.GetEntriesForEventAsync(EventId);

            return Page();
        }

        public async Task<IActionResult> OnPostDeleteAsync(int entryId)
        {
            var result = await _goldenBookService.DeleteEntryAsync(entryId);
            if (!result)
            {
                TempData["Error"] = "Failed to delete the entry.";
            }

            return RedirectToPage(new { EventId });
        }

        public async Task<IActionResult> OnPostDownloadPdfAsync()
        {
            var eventDto = await _eventService.GetEventByIdAsync(EventId);
            if (eventDto == null)
            {
                return NotFound();
            }

            var entries = await _goldenBookService.GetEntriesForEventAsync(EventId);
            
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(40);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontFamily("Arial").FontSize(11));

                    page.Header()
                        .AlignCenter()
                        .Column(column =>
                        {
                            column.Item().PaddingBottom(10).Text("??? ??? - Golden Book")
                                .FontFamily("Arial")
                                .FontSize(24)
                                .Bold()
                                .FontColor("#d4a574");

                            column.Item().Text(eventDto.EventName)
                                .FontFamily("Arial")
                                .FontSize(18)
                                .SemiBold()
                                .FontColor("#333333");

                            column.Item().PaddingTop(5).Text($"??\"? ?????: {entries.Count}")
                                .FontFamily("Arial")
                                .FontSize(12)
                                .FontColor("#666666");

                            column.Item().PaddingTop(10).Text($"???? ??????: {DateTime.Now:dd/MM/yyyy HH:mm}")
                                .FontFamily("Arial")
                                .FontSize(10)
                                .FontColor("#999999");

                            column.Item().PaddingTop(5).BorderBottom(2).BorderColor("#d4a574");
                        });

                    page.Content()
                        .PaddingVertical(20)
                        .Column(column =>
                        {
                            foreach (var entry in entries.OrderByDescending(e => e.CreatedAt))
                            {
                                column.Item().PaddingBottom(20).Element(container => CreateEntryCard(container, entry));
                            }
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(text =>
                        {
                            text.Span("???? ").FontFamily("Arial").FontSize(10).FontColor("#666666");
                            text.CurrentPageNumber().FontFamily("Arial").FontSize(10).FontColor("#666666");
                            text.Span(" ???? ").FontFamily("Arial").FontSize(10).FontColor("#666666");
                            text.TotalPages().FontFamily("Arial").FontSize(10).FontColor("#666666");
                        });
                });
            });

            var pdfBytes = document.GeneratePdf();
            var fileName = $"GoldenBook_{eventDto.EventName?.Replace(" ", "_")}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";

            return File(pdfBytes, "application/pdf", fileName);
        }

        private void CreateEntryCard(IContainer container, GoldenBookEntry entry)
        {
            container.Border(1)
                .BorderColor("#e8dcc8")
                .Background("#fffef9")
                .Padding(15)
                .Column(column =>
                {
                    column.Item().PaddingBottom(8).Row(row =>
                    {
                        if (!string.IsNullOrWhiteSpace(entry.SenderName))
                        {
                            row.RelativeItem().AlignRight().Text($"???: {entry.SenderName}")
                                .FontFamily("Arial")
                                .FontSize(14)
                                .SemiBold()
                                .FontColor("#333333");
                        }
                        else
                        {
                            row.RelativeItem().AlignRight().Text("???: ???????")
                                .FontFamily("Arial")
                                .FontSize(14)
                                .SemiBold()
                                .FontColor("#666666");
                        }

                        row.AutoItem().AlignLeft().Text(entry.CreatedAt.ToString("dd/MM/yyyy HH:mm"))
                            .FontFamily("Arial")
                            .FontSize(10)
                            .FontColor("#8b7355");
                    });

                    column.Item().PaddingVertical(5).BorderTop(1).BorderColor("#f0e6d8");

                    column.Item().PaddingTop(10).AlignRight().Text(entry.Content)
                        .FontFamily("Arial")
                        .FontSize(12)
                        .LineHeight(1.6f)
                        .FontColor("#4a4a4a");

                    column.Item().PaddingTop(10).AlignCenter().Text("*")
                        .FontFamily("Arial")
                        .FontSize(16);
                });
        }
    }
}
