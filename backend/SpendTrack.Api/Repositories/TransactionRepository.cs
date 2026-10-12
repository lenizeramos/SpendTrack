using MongoDB.Bson;
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

        public async Task<Transaction?> GetByIdAsync(string id)
        {
            if (!ObjectId.TryParse(id, out _))
                return null;

            return await _transactions
                .Find(t => t.Id == id)
                .FirstOrDefaultAsync();
        }

        public async Task<Transaction?> UpdateAsync(string id, Transaction transaction)
        {
            if (!ObjectId.TryParse(id, out _))
                return null;

            var result = await _transactions.ReplaceOneAsync(
                t => t.Id == id,
                transaction);

            if (result.MatchedCount == 0)
                return null;

            return transaction;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            if (!ObjectId.TryParse(id, out _))
                return false;

            var result = await _transactions.DeleteOneAsync(t => t.Id == id);

            return result.DeletedCount > 0;
        }
    }
}