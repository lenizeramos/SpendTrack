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
    }
}