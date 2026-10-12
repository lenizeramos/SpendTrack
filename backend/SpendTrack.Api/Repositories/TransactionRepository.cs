using MongoDB.Driver;
using SpendTrack.Api.Data;
using SpendTrack.Api.Entities;

namespace SpendTrack.Api.Repositories
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly IMongoCollection<Transaction> _transactions;

        public TransactionRepository(MongoDbContext context)
        {
            _transactions = context.Transactions;
        }

        public async Task<Transaction> AddAsync(Transaction transaction)
        {
            await _transactions.InsertOneAsync(transaction);
            return transaction;
        }

        public async Task AddManyAsync(IEnumerable<Transaction> transactions)
        {
            var transactionList = transactions.ToList();

            if (transactionList.Count == 0)
                return;

            await _transactions.InsertManyAsync(transactionList);
        }

        public async Task<List<Transaction>> GetAllAsync()
        {
            return await _transactions.Find(FilterDefinition<Transaction>.Empty).ToListAsync();
        }


        public async Task<HashSet<string>> GetExistingSourceRowHashesAsync(
            IEnumerable<string> hashes)
        {
            var hashList = hashes
                .Where(h => !string.IsNullOrWhiteSpace(h))
                .Distinct()
                .ToList();

            if (hashList.Count == 0)
                return new HashSet<string>();

            var filter = Builders<Transaction>.Filter
                .In(t => t.SourceRowHash, hashList);

            var existingHashes = await _transactions
                .Find(filter)
                .Project(t => t.SourceRowHash)
                .ToListAsync();

            return existingHashes
                .Where(h => h != null)
                .Select(h => h!)
                .ToHashSet();
        }
    }
}