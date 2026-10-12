
using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using SpendTrack.Api.Entities;

namespace SpendTrack.Api.Services;

public static class TransactionHash
{
    public static string Compute(Transaction transaction)
    {
        var normalizedDate = transaction.Date
            .ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

        var normalizedDescription = transaction.Description
            .Trim()
            .ToUpperInvariant();

        var normalizedAmount = transaction.Amount
            .ToString("G29", CultureInfo.InvariantCulture);

        var input = string.Join("|",
            normalizedDate,
            normalizedDescription.Length.ToString(CultureInfo.InvariantCulture),
            normalizedDescription,
            normalizedAmount);

        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = SHA256.HashData(bytes);

        return Convert.ToHexString(hash);
    }
}
