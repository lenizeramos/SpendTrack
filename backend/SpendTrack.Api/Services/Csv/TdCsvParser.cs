using System.Globalization;
using SpendTrack.Api.Entities;

namespace SpendTrack.Api.Services.Csv
{
    public class TdCsvParser : IBankCsvParser
    {
        public string BankId => "td";
        public int Version => 1;

        private static readonly string[] DateFormats = { "MM/dd/yyyy", "M/d/yyyy" };

        public double Confidence(IReadOnlyList<string[]> rows)
        {
            if (rows.Count < 2) return 0;

            int checkedRows = 0;
            int dateRows = 0;
            int fiveColRows = 0;

            foreach (var row in rows.Take(5))
            {
                checkedRows++;
                if (row.Length == 5) fiveColRows++;
                if (row.Length > 0 && TryParseDate(row[0], out _)) dateRows++;
            }

            if (checkedRows == 0) return 0;

            double colScore = (double)fiveColRows / checkedRows;
            double dateScore = (double)dateRows / checkedRows;

            if (colScore >= 0.8 && dateScore >= 0.8) return 1.0;
            if (colScore >= 0.6 && dateScore >= 0.6) return 0.7;
            return 0;
        }

        public IEnumerable<Transaction> Parse(IReadOnlyList<string[]> rows)
        {
            foreach (var row in rows)
            {
                if (row.Length < 5) continue;
                if (!TryParseDate(row[0], out var date)) continue;

                decimal? moneyOut = TryParseMoney(row[2]);
                decimal? moneyIn = TryParseMoney(row[3]);

                if (moneyOut is null && moneyIn is null) continue;

                decimal amount = moneyOut is not null ? -moneyOut.Value : moneyIn!.Value;

                var transaction = new Transaction
                {
                    Date = date,
                    Description = row[1].Trim(),
                    Amount = amount,
                    Notes = null,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    SourceBank = BankId,
                    ParserVersion = Version,
                    LowConfidence = false
                };

                transaction.SourceRowHash = TransactionHash.Compute(transaction);

                yield return transaction;
            }
        }

        private static bool TryParseDate(string raw, out DateTime date)
            => DateTime.TryParseExact(raw, DateFormats,
                CultureInfo.InvariantCulture, DateTimeStyles.None, out date);

        private static decimal? TryParseMoney(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            raw = raw.Trim().Replace("$", "").Replace(",", "");
            return decimal.TryParse(raw, NumberStyles.Any, CultureInfo.InvariantCulture, out var d)
                ? d : null;
        }
    }
}