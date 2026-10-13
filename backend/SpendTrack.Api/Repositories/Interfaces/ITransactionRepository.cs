using SpendTrack.Api.Entities;
using SpendTrack.Api.DTOs;

namespace SpendTrack.Api.Repositories
{
    public interface ITransactionRepository
    {
        Task<Transaction> AddAsync(Transaction transaction);
        Task AddManyAsync(IEnumerable<Transaction> transactions);
        Task<PagedResult<Transaction>> GetAllAsync(TransactionQueryParameters query);

        Task<HashSet<string>> GetExistingSourceRowHashesAsync(
       IEnumerable<string> hashes);
        Task<Transaction?> GetByIdAsync(string id);
        Task<Transaction?> UpdateAsync(string id, Transaction transaction);
        Task<bool> DeleteAsync(string id);
    }
}
