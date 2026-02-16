using Microsoft.EntityFrameworkCore;

namespace SmachotMemories.Models
{
    public class UIText
    {
        public int UITextID { get; set; }
        public string Key { get; set; }
        public MultiLanguageText Text { get; set; }
    }
    [Owned]
    public class MultiLanguageText
    {
        public string TextEn { get; set; }
        public string TextFr { get; set; }
        public string TextHe { get; set; }
        public string TextAr_XA { get; set; }//ערבית
        public string TextRu { get; set; }
    }
}
