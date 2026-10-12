using SpendTrack.Api.Entities;
using SpendTrack.Api.DTOs;

namespace SpendTrack.Api.Services
{
    public interface ITransactionService
    {
        Task<Transaction> AddTransactionAsync(string description);
        Task<ImportTransactionsResult> ImportTransactionsAsync(IEnumerable<Transaction> transactions,
            bool confirmImport = false, List<int>? excludedIndexes = null);
        Task<List<Transaction>> GetAllAsync();
    }
}