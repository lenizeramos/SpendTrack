using SpendTrack.Api.Entities;
using SpendTrack.Api.DTOs;

namespace SpendTrack.Api.Services
{
    public interface ITransactionService
    {
        Task<Transaction> AddTransactionAsync(CreateTransactionRequest request);
        Task<ImportTransactionsResult> ImportTransactionsAsync(IEnumerable<Transaction> transactions,
            bool confirmImport = false, List<int>? excludedIndexes = null);
        Task<PagedResult<Transaction>> GetAllAsync(TransactionQueryParameters query);
        Task<Transaction?> UpdateTransactionAsync(string id, string description);
        Task<bool> DeleteTransactionAsync(string id);
    }
}