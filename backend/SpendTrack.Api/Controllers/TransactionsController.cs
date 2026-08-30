using Microsoft.AspNetCore.Mvc;
using SpendTrack.Api.Services;
using SpendTrack.Api.DTOs;

namespace SpendTrack.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _service;
        private readonly CsvParsingService _csvParser;

        public TransactionsController(ITransactionService service, CsvParsingService csvParser)
        {
            _service = service;
            _csvParser = csvParser;
        }
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("Hello World!");
        }

        [HttpPost]
        public async Task<IActionResult> AddTransaction([FromBody] CreateTransactionRequest request)
        {
            var transaction = await _service.AddTransactionAsync(request.Description);

            return Ok(transaction);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadCsv(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            try
            {
                using var stream = file.OpenReadStream();

                var transactions =
                    _csvParser.ParseBankCsv(stream);

                if (transactions.Count == 0)
                    return BadRequest("The CSV file contains no transactions.");

                await _service.ImportTransactionsAsync(transactions);

                return Ok(new
                {
                    Message = "Transactions successfully imported!",
                    Count = transactions.Count
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = "Failed to import CSV.",
                    Error = ex.Message
                });
            }
        }
    }
}