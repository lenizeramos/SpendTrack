using SpendTrack.Api.Entities;
using SpendTrack.Api.Repositories;
using SpendTrack.Api.DTOs;
using System.Globalization;

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

        public async Task<ImportTransactionsResult> ImportTransactionsAsync(
            IEnumerable<Transaction> transactions, bool confirmImport = false, List<int>? excludedIndexes = null)
        {
            {
                var transactionList = transactions.ToList();
                if (transactionList.Count == 0)
                {
                    return new ImportTransactionsResult
                    {
                        Message = "The CSV file contains no transactions."
                    };
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

                var existingTransactions = await _repository.GetAllAsync();

                static string GetKey(Transaction transaction)
                {
                    return
                        $"{transaction.Date.Date:yyyy-MM-dd}|" +
                        $"{transaction.Description.Trim().ToUpperInvariant()}|" +
                        $"{transaction.Amount.ToString(
                            "G29",
                            CultureInfo.InvariantCulture)}";
                }

                var existingKeys = existingTransactions
                    .Select(GetKey)
                    .ToHashSet();

                var duplicates = new List<DuplicateTransactionDto>();

                for (var i = 0; i < transactionList.Count; i++)
                {
                    var transaction = transactionList[i];

                    if (existingKeys.Contains(GetKey(transaction)))
                    {
                        duplicates.Add(new DuplicateTransactionDto
                        {
                            Index = i,
                            Transaction = transaction,
                            Reason = "This transaction already exists in the database."
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

                if (excluded.Any(index => !duplicateIndexes.Contains(index)))
                {
                    throw new ArgumentException(
                        "Only transactions identified as existing in the database " +
                        "can be excluded.",
                        nameof(excludedIndexes));
                }

                var transactionsToImport = transactionList
                    .Where((transaction, index) => !excluded.Contains(index))
                    .ToList();

                await _repository.AddManyAsync(transactionsToImport);

                return new ImportTransactionsResult
                {
                    RequiresConfirmation = false,
                    ImportedCount = transactionsToImport.Count,
                    SkippedCount = excluded.Count,
                    Message = "Import completed successfully!",
                    TotalCount = transactionList.Count,
                };
            }
        }
    }
}