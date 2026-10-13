using System.Globalization;
using SpendTrack.Api.Entities;

namespace SpendTrack.Api.Services.Csv
{
    public class PcCsvParser : IBankCsvParser
    {
        public string BankId => "pc";
        public int Version => 1;

        private static readonly string[] ExpectedHeaders =
            { "description", "type", "cardholdername", "date", "time", "amount" };

        private static readonly string[] DateFormats =
            { "MM/dd/yyyy", "M/d/yyyy" };

        public double Confidence(IReadOnlyList<string[]> rows)
        {
            if (rows.Count < 2) return 0;

            for (int i = 0; i < Math.Min(5, rows.Count); i++)
            {
                var norm = rows[i].Select(Normalize).ToArray();
                if (norm.Length != ExpectedHeaders.Length) continue;

                int hits = ExpectedHeaders.Count(h => norm.Contains(h));
                double headerScore = (double)hits / ExpectedHeaders.Length;

                if (i + 1 < rows.Count && LooksLikeDataRow(rows[i + 1]))
                    headerScore += 0.15;

                if (headerScore > 0.9) return 1.0;
                if (headerScore > 0.7) return 0.8;
            }
            return 0;
        }

        public IEnumerable<Transaction> Parse(IReadOnlyList<string[]> rows)
        {
            if (rows.Count == 0) yield break;

            int headerIndex = FindHeaderRow(rows);
            if (headerIndex < 0) yield break;

            var header = rows[headerIndex].Select(Normalize).ToArray();

            int descCol = Array.IndexOf(header, "description");
            int typeCol = Array.IndexOf(header, "type");
            int holderCol = Array.IndexOf(header, "cardholdername");
            int dateCol = Array.IndexOf(header, "date");
            int timeCol = Array.IndexOf(header, "time");
            int amountCol = Array.IndexOf(header, "amount");

            if (descCol < 0 || dateCol < 0 || amountCol < 0)
                yield break;

            for (int r = headerIndex + 1; r < rows.Count; r++)
            {
                var row = rows[r];
                if (row.Length <= Math.Max(amountCol, dateCol)) continue;

                if (!TryParseDate(row[dateCol], out var date)) continue;

                var amount = TryParseMoney(row[amountCol]);
                if (amount is null) continue;

                var description = row[descCol].Trim();

                var type = typeCol >= 0 && typeCol < row.Length
                    ? row[typeCol].Trim() : null;
                var holder = holderCol >= 0 && holderCol < row.Length
                    ? row[holderCol].Trim() : null;
                var time = timeCol >= 0 && timeCol < row.Length
                    ? row[timeCol].Trim() : null;

                var transaction = new Transaction
                {
                    Date = date,
                    Description = description,
                    Amount = amount.Value,
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

        private static int FindHeaderRow(IReadOnlyList<string[]> rows)
        {
            for (int i = 0; i < Math.Min(5, rows.Count); i++)
            {
                var norm = rows[i].Select(Normalize).ToArray();
                if (norm.Length != ExpectedHeaders.Length) continue;

                int hits = ExpectedHeaders.Count(h => norm.Contains(h));
                if (hits >= 4) return i;
            }
            return -1;
        }

        private static string Normalize(string? s) =>
            (s ?? string.Empty).Trim().Replace(" ", "").ToLowerInvariant();

        private static bool LooksLikeDataRow(string[] row)
        {
            if (row.Length < 6) return false;
            return TryParseMoney(row[5]) is not null;
        }

        private static bool TryParseDate(string raw, out DateTime date)
            => DateTime.TryParseExact(raw, DateFormats,
                CultureInfo.InvariantCulture, DateTimeStyles.None, out date);

        private static decimal? TryParseMoney(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            raw = raw.Trim().Replace("$", "").Replace(",", "");
            return decimal.TryParse(raw, NumberStyles.Any,
                CultureInfo.InvariantCulture, out var d) ? d : null;
        }
    }
}