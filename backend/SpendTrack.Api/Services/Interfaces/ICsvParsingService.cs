using SpendTrack.Api.DTOs;

namespace SpendTrack.Api.Services
{
    public interface ICsvParsingService
    {
        ParseResult ParseBankCsv(Stream csvStream);
    }
}