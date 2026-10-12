using SpendTrack.Api.Entities;

namespace SpendTrack.Api.DTOs
{
    public class ParseResult
    {
        public List<Transaction> Transactions { get; set; } = new();
        public string SourceBank { get; set; } = string.Empty;
        public int ParserVersion { get; set; }
        public bool LowConfidence { get; set; }
    }
}
