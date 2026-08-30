using SpendTrack.Api.Entities;
using SpendTrack.Api.Repositories;

namespace SpendTrack.Api.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ITransactionRepository _repository;

        public TransactionService(ITransactionRepository repository)
        {
            _repository = repository;
        }

        public async Task<Transaction> AddTransactionAsync(string description)
        {
            var transaction = new Transaction
            {
                Description = description
            };

            return await _repository.AddAsync(transaction);
        }

        public async Task ImportTransactionsAsync(
            IEnumerable<Transaction> transactions)
        {
            await _repository.AddManyAsync(transactions);
        }
    }
}