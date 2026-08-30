using SpendTrack.Api.Entities;

namespace SpendTrack.Api.Repositories
{
    public interface ITransactionRepository
    {
        Task<Transaction> AddAsync(Transaction transaction);
        Task AddManyAsync(IEnumerable<Transaction> transactions);
    }
}