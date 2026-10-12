using Microsoft.AspNetCore.Mvc;
using SpendTrack.Api.Services;
using SpendTrack.Api.DTOs;
using SpendTrack.Api.Entities;

namespace SpendTrack.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _service;
        private readonly ICsvParsingService _csvParser;

        public TransactionsController(ITransactionService service, ICsvParsingService csvParser)
        {
            _service = service;
            _csvParser = csvParser;
        }
        [HttpGet]
        public async Task<ActionResult<List<Transaction>>> GetAll()
        {
            var transactions = await _service.GetAllAsync();

            return Ok(transactions);
        }

        [HttpPost]
        public async Task<IActionResult> AddTransaction([FromBody] CreateTransactionRequest request)
        {
            var transaction = await _service.AddTransactionAsync(request.Description);

            return Ok(transaction);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadCsv(IFormFile file, [FromForm] bool confirmImport = false, [FromForm] List<int>? excludedIndexes = null)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            try
            {
                using var stream = file.OpenReadStream();

                var parseResult = _csvParser.ParseBankCsv(stream);
                var transactions = parseResult.Transactions;

                if (transactions.Count == 0)
                    return BadRequest("The CSV file contains no transactions.");

                var result = await _service.ImportTransactionsAsync(transactions, confirmImport, excludedIndexes);

                if (result.RequiresConfirmation)
                    return Conflict(result);

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    Message = "Failed to import CSV."
                });
            }
        }
    }
}
