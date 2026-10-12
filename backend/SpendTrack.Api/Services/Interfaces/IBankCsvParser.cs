using SpendTrack.Api.Entities;

namespace SpendTrack.Api.Services
{
    public interface IBankCsvParser
    {
        string BankId { get; }
        int Version { get; }
        double Confidence(IReadOnlyList<string[]> firstRows);
        IEnumerable<Transaction> Parse(IReadOnlyList<string[]> rows);
    }
}