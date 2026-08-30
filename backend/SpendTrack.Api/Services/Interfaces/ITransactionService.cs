using SpendTrack.Api.Entities;

namespace SpendTrack.Api.Services
{
    public interface ITransactionService
    {
        Task<Transaction> AddTransactionAsync(string description);
        Task ImportTransactionsAsync(IEnumerable<Transaction> transactions);
    }
}