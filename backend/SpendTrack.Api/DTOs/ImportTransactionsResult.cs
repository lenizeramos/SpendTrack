namespace SpendTrack.Api.DTOs
{
    public class ImportTransactionsResult
    {
        public bool RequiresConfirmation { get; set; }

        public string Message { get; set; } = string.Empty;

        public List<DuplicateTransactionDto> Duplicates { get; set; } = new();

        public int ImportedCount { get; set; }

        public int SkippedCount { get; set; }

        public int TotalCount { get; set; }
    }
}