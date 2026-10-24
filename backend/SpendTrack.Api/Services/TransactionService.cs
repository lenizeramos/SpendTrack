
using SpendTrack.Api.Entities;
using SpendTrack.Api.Repositories;
using SpendTrack.Api.DTOs;

namespace SpendTrack.Api.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ITransactionRepository _repository;

        public TransactionService(ITransactionRepository repository)
        {
            _repository = repository;
        }

        public async Task<Transaction> AddTransactionAsync(CreateTransactionRequest request)
        {
            var transaction = new Transaction
            {
                Description = request.Description,
                Date = request.Date!.Value,
                Amount = request.Amount!.Value,
                Notes = request.Notes
            };

            return await _repository.AddAsync(transaction);
        }

        public async Task<ImportTransactionsResult> ImportTransactionsAsync(
            IEnumerable<Transaction> transactions,
            bool confirmImport = false,
            List<int>? excludedIndexes = null)
        {
            var transactionList = transactions.ToList();

            if (transactionList.Count == 0)
            {
                return new ImportTransactionsResult
                {
                    Message = "The CSV file contains no transactions."
                };
            }

            foreach (var transaction in transactionList)
            {
                transaction.SourceRowHash =
                    TransactionHash.Compute(transaction);
            }

            var excluded = (excludedIndexes ?? new List<int>())
                .ToHashSet();

            if (excluded.Any(index =>
                index < 0 || index >= transactionList.Count))
            {
                throw new ArgumentException(
                    "One or more excluded transaction indexes are invalid.",
                    nameof(excludedIndexes));
            }

            var hashesToCheck = transactionList
                .Select(transaction => transaction.SourceRowHash!)
                .Distinct()
                .ToList();

            var existingHashes =
                await _repository.GetExistingSourceRowHashesAsync(
                    hashesToCheck);

            var existingHashSet = existingHashes.ToHashSet();

            var duplicates = new List<DuplicateTransactionDto>();

            for (var i = 0; i < transactionList.Count; i++)
            {
                var transaction = transactionList[i];

                if (existingHashSet.Contains(
                    transaction.SourceRowHash!))
                {
                    duplicates.Add(new DuplicateTransactionDto
                    {
                        Index = i,
                        Transaction = transaction,
                        Reason =
                            "This transaction already exists in the database."
                    });
                }
            }

            if (!confirmImport && duplicates.Count > 0)
            {
                return new ImportTransactionsResult
                {
                    RequiresConfirmation = true,
                    Message = "Possible duplicate transactions were found.",
                    Duplicates = duplicates,
                    ImportedCount = 0,
                    SkippedCount = 0,
                    TotalCount = transactionList.Count
                };
            }

            var duplicateIndexes = duplicates
                .Select(duplicate => duplicate.Index)
                .ToHashSet();

            if (excluded.Any(index =>
                !duplicateIndexes.Contains(index)))
            {
                throw new ArgumentException(
                    "Only transactions identified as existing in the database " +
                    "can be excluded.",
                    nameof(excludedIndexes));
            }

            var transactionsToImport = transactionList
                .Where((transaction, index) =>
                    !excluded.Contains(index))
                .ToList();

            await _repository.AddManyAsync(transactionsToImport);

            return new ImportTransactionsResult
            {
                RequiresConfirmation = false,
                ImportedCount = transactionsToImport.Count,
                SkippedCount = excluded.Count,
                Message = "Import completed successfully!",
                TotalCount = transactionList.Count
            };
        }

        public Task<PagedResult<Transaction>> GetAllAsync(TransactionQueryParameters query)
        {
            return _repository.GetAllAsync(query);
        }

        public async Task<Transaction?> UpdateTransactionAsync(string id, string description)
        {
            var existing = await _repository.GetByIdAsync(id);

            if (existing is null)
                return null;

            existing.Description = description;
            existing.UpdatedAt = DateTime.UtcNow;

            return await _repository.UpdateAsync(id, existing);
        }

        public Task<bool> DeleteTransactionAsync(string id)
        {
            return _repository.DeleteAsync(id);
        }
    }
}
