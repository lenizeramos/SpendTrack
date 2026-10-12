using SpendTrack.Api.Entities;

namespace SpendTrack.Api.DTOs
{
    public class DuplicateTransactionDto
    {
        public int Index { get; set; }
        public Transaction Transaction { get; set; } = null!;
        public string Reason { get; set; } = string.Empty;
    }
}