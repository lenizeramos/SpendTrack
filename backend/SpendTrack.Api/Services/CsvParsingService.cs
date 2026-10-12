using CsvHelper;
using CsvHelper.Configuration;
using SpendTrack.Api.DTOs;
using System.Globalization;

namespace SpendTrack.Api.Services
{
    public class CsvParsingService : ICsvParsingService
    {
        private readonly IEnumerable<IBankCsvParser> _parsers;

        public CsvParsingService(IEnumerable<IBankCsvParser> parsers)
        {
            _parsers = parsers;
        }

        public ParseResult ParseBankCsv(Stream csvStream)
        {
            var rows = ReadAllRows(csvStream);

            if (rows.Count == 0)
                throw new ArgumentException("The CSV file is empty.");

            var firstRows = rows.Take(20).ToList();

            var best = _parsers
                .Select(p => new { Parser = p, Score = SafeConfidence(p, firstRows) })
                .OrderByDescending(x => x.Score)
                .FirstOrDefault();

            if (best is null || best.Score < 0.5)
                throw new ArgumentException(
                    "Unrecognized CSV format. Could not match any known bank.");

            var transactions = best.Parser
                .Parse(rows)
                .ToList();

            return new ParseResult
            {
                Transactions = transactions,
                SourceBank = best.Parser.BankId,
                ParserVersion = best.Parser.Version,
                LowConfidence = best.Score < 0.85,
            };
        }

        private static double SafeConfidence(IBankCsvParser parser, IReadOnlyList<string[]> rows)
        {
            try { return parser.Confidence(rows); }
            catch { return 0; }
        }

        private static List<string[]> ReadAllRows(Stream csvStream)
        {
            var rows = new List<string[]>();

            using var reader = new StreamReader(csvStream, leaveOpen: true);
            using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = false,
                BadDataFound = null,
                MissingFieldFound = null,
                DetectColumnCountChanges = false,
                TrimOptions = TrimOptions.Trim,
            });

            while (csv.Read())
            {
                var record = csv.Parser.Record;
                if (record is null) continue;

                if (record.All(string.IsNullOrWhiteSpace)) continue;

                rows.Add(record);
            }

            return rows;
        }
    }
}
