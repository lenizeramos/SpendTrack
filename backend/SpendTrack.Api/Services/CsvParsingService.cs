using CsvHelper;
using SpendTrack.Api.Entities;
using System.Globalization;

namespace SpendTrack.Api.Services
{
    public class CsvParsingService
    {
        public List<Transaction> ParseBankCsv(Stream csvStream)
        {
            using var reader = new StreamReader(csvStream);
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

            var records = new List<Transaction>();

            foreach (var row in csv.GetRecords<dynamic>())
            {
                if (!DateTime.TryParse(
                        row.Date?.ToString(),
                        CultureInfo.InvariantCulture,
                        DateTimeStyles.None,
                        out DateTime date))
                {
                    continue;
                }

                if (!decimal.TryParse(
                        row.Amount?.ToString(),
                        NumberStyles.Any,
                        CultureInfo.InvariantCulture,
                        out decimal amount))
                {
                    continue;
                }

                records.Add(new Transaction
                {
                    Date = date,
                    Description = row.Description?.ToString() ?? "",
                    Amount = amount
                });
            }

            return records;
        }
    }
}
